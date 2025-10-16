export const runtime = "nodejs";

function getIp(headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "";
}

function sanitize(input) {
  if (typeof input !== "string") return "";
  return input.substring(0, 2000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const firstName = sanitize(body.firstName || "");
    const email = sanitize(body.email || "");
    const phone = sanitize(body.phone || "");
    const consent = Boolean(body.consent);

    if (!firstName) {
      return new Response(JSON.stringify({ ok: false, error: "firstName_required" }), { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "email_invalid" }), { status: 400 });
    }
    if (!consent) {
      return new Response(JSON.stringify({ ok: false, error: "consent_required" }), { status: 400 });
    }

    const headers = request.headers;
    const ip = getIp(headers);
    const userAgent = headers.get("user-agent") || "";
    const referer = sanitize(headers.get("referer") || body.ref || "");

    const utm = {
      utm_source: sanitize(body.utm_source || ""),
      utm_medium: sanitize(body.utm_medium || ""),
      utm_campaign: sanitize(body.utm_campaign || ""),
      utm_term: sanitize(body.utm_term || ""),
      utm_content: sanitize(body.utm_content || ""),
    };

    const lead = {
      firstName,
      email,
      phone,
      consent,
      ...utm,
      ref: referer,
      ip,
      userAgent,
      ts: new Date().toISOString(),
    };

    // Optional webhook forward
    const webhook = process.env.LEAD_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        });
      } catch (e) {
        console.warn("Failed to forward lead to webhook", e);
      }
    }

    console.log("Lead submitted", { email, ip });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "bad_request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
