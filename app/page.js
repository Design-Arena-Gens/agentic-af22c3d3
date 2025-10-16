"use client";

import { useEffect, useMemo, useState } from "react";
import "./globals.css";

const PINK = "#ffc0cb";

export default function Page() {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    consent: false,
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    ref: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const offerUrl = useMemo(() => process.env.NEXT_PUBLIC_OFFER_WALL_URL || "", []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    setFormData((prev) => ({
      ...prev,
      utm_source: params.utm_source || prev.utm_source,
      utm_medium: params.utm_medium || prev.utm_medium,
      utm_campaign: params.utm_campaign || prev.utm_campaign,
      utm_term: params.utm_term || prev.utm_term,
      utm_content: params.utm_content || prev.utm_content,
      ref: document.referrer || prev.ref,
    }));
  }, []);

  function validate() {
    if (!formData.firstName.trim()) return "Please enter your first name.";
    const email = formData.email.trim();
    if (!email) return "Please enter your email address.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return "Please enter a valid email address.";
    if (!formData.consent) return "You must consent to be contacted.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      if (!data.ok) throw new Error("Submission error");
      setSuccess(true);
      if (offerUrl) {
        setTimeout(() => {
          window.location.href = offerUrl;
        }, 800);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="logo">
            <span className="logo-pill">Crumbl</span>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <span className="badge" aria-label="$100 reward">
              <span>🍪</span> $100 Gift Card Opportunity
            </span>
            <h1 className="headline">Get a $100 Crumbl Gift Card</h1>
            <p className="subhead">
              Complete a short survey and finish several sponsored offers to qualify. Limited-time
              reward for new participants. 18+ only.
            </p>
            <div className="actions" style={{ marginBottom: 16 }}>
              <a className="cta" href="#start">Start Now</a>
              <a className="cta secondary" href="#faq">How it works</a>
            </div>

            <div className="hero-card">
              <div className="hero-grid">
                <div className="hero-item">
                  <div>✅</div>
                  <div>
                    <strong>Fast qualification</strong>
                    <div>Most users complete in under 10 minutes.</div>
                  </div>
                </div>
                <div className="hero-item">
                  <div>🛡️</div>
                  <div>
                    <strong>Secure & private</strong>
                    <div>Your info is encrypted and never sold.</div>
                  </div>
                </div>
                <div className="hero-item">
                  <div>🎯</div>
                  <div>
                    <strong>Mobile-first</strong>
                    <div>Designed for TikTok and social traffic.</div>
                  </div>
                </div>
                <div className="hero-item">
                  <div>💬</div>
                  <div>
                    <strong>US only</strong>
                    <div>Offer valid for U.S. residents, 18+.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section" id="trust">
              <div className="trust">
                <div className="trust-item">256-bit SSL</div>
                <div className="trust-item">No spam guarantee</div>
                <div className="trust-item">Unsubscribe anytime</div>
                <div className="trust-item">Privacy-first</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <h2 className="section-title">How it works</h2>
            <ol className="list-steps">
              <li className="step"><span className="step-num">1</span><strong>Sign up</strong> with your email and consent to contact.</li>
              <li className="step"><span className="step-num">2</span><strong>Complete a brief survey</strong> to match relevant offers.</li>
              <li className="step"><span className="step-num">3</span><strong>Finish several sponsored offers</strong> to qualify for your reward.</li>
              <li className="step"><span className="step-num">4</span><strong>Claim</strong> your $100 Crumbl gift card after verification.</li>
            </ol>
          </div>
        </section>

        <section className="section" id="start">
          <div className="container">
            <div className="form-card">
              <h2 style={{ marginTop: 0 }}>Start your claim</h2>
              <form onSubmit={onSubmit}>
                <div className="form-row">
                  <div>
                    <label className="label" htmlFor="firstName">First name</label>
                    <input className="input" id="firstName" name="firstName" placeholder="Taylor" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                </div>
                <div className="form-row split" style={{ marginTop: 10 }}>
                  <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input className="input" id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <div className="help">We'll send status updates and reward instructions.</div>
                  </div>
                  <div>
                    <label className="label" htmlFor="phone">Phone (optional)</label>
                    <input className="input" id="phone" name="phone" type="tel" placeholder="(555) 000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="checkbox" style={{ marginTop: 10 }}>
                  <input id="consent" type="checkbox" checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })} />
                  <label htmlFor="consent" className="help">
                    I agree to be contacted via email and, if provided, SMS about this offer. Message and data rates may apply. Consent is not a condition of purchase.
                  </label>
                </div>

                {error && <div className="error" role="alert">{error}</div>}
                {success && <div className="success">Success! Redirecting…</div>}

                <input type="hidden" name="utm_source" value={formData.utm_source} />
                <input type="hidden" name="utm_medium" value={formData.utm_medium} />
                <input type="hidden" name="utm_campaign" value={formData.utm_campaign} />
                <input type="hidden" name="utm_term" value={formData.utm_term} />
                <input type="hidden" name="utm_content" value={formData.utm_content} />
                <input type="hidden" name="ref" value={formData.ref} />

                <div className="actions" style={{ marginTop: 14 }}>
                  <button className="btn" type="submit" disabled={submitting}>
                    {submitting ? "Submitting…" : "Start Survey & Qualify"}
                  </button>
                </div>
              </form>
            </div>

            <p className="help" style={{ marginTop: 10 }}>
              By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>. This promotion is independent and not affiliated with Crumbl Franchising LLC.
            </p>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container">
            <h2 className="section-title">FAQ</h2>
            <div className="faq">
              <div className="faq-item">
                <h3>Is this legit?</h3>
                <div>Yes. Sponsors fund rewards when users complete qualifying offers. We only contact you about this reward.</div>
              </div>
              <div className="faq-item">
                <h3>When will I receive the gift card?</h3>
                <div>After completing the required offers and verification, delivery is typically within 7-14 days.</div>
              </div>
              <div className="faq-item">
                <h3>Do I need to buy anything?</h3>
                <div>Some sponsored offers may involve purchases or trials. Always review terms before proceeding.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} Crumbl Reward Offer. Not associated with Crumbl Franchising LLC.
        </div>
      </footer>
    </>
  );
}
