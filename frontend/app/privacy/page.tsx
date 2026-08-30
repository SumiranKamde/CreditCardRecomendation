import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "../components/ThemeToggle";

export const metadata: Metadata = {
  title: "Privacy Policy | CCR - Zero-PII Credit Card Recommender",
  description:
    "Learn about CCR's strict Zero-PII commitment. We do not ask for, collect, or store your personal or financial data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <Link className="wordmark" href="/" aria-label="CCR home">
          <span className="wordmark-mark">C</span>
          <span>
            CCR <small>Credit Card Recommender</small>
          </span>
        </Link>
        <div className="topbar-right">
          <Link href="/" className="back-link">
            ← Back to Recommender
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <article className="legal-container">
        <div className="legal-header">
          <p className="eyebrow">Zero-PII Commitment</p>
          <h1>Privacy Policy</h1>
          <p className="legal-date">Last Updated: August 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section highlight-box">
            <h2>1. Our Zero-PII Guarantee</h2>
            <p>
              At <strong>CCR (Credit Card Recommender)</strong>, our core architectural principle is{" "}
              <strong>zero Personally Identifiable Information (PII)</strong>. You do not create an
              account, you do not sign in, and you never provide your name, phone number, email address,
              PAN card, Aadhaar, or banking credentials.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. What Information We Process</h2>
            <p>To compute card rewards, we temporarily process 3 anonymous behavioral inputs:</p>
            <ul>
              <li><strong>Estimated Monthly Spend:</strong> e.g., ₹25,000</li>
              <li><strong>Top Spending Category:</strong> e.g., Dining, Online, Travel</li>
              <li><strong>Approximate Annual Income:</strong> e.g., ₹8,00,000 (used solely to filter eligibility requirements)</li>
            </ul>
            <p>
              These inputs are evaluated in-memory to calculate reward returns. They are{" "}
              <strong>never written to a database</strong>, never linked to your identity, and never sold or shared with any third party.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Cookies &amp; Local Storage</h2>
            <p>
              We believe in an uncluttered web. CCR does not use tracking cookies, behavioral tracking pixels, or cross-site fingerprinting.
              We may use minimal, standard browser local storage solely to remember user interface preferences (such as dismissing informative banners).
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Affiliate Links &amp; Third-Party Issuers</h2>
            <p>
              When you click on an <strong>&ldquo;Apply Now&rdquo;</strong> link, you will be redirected directly to the respective
              bank or affiliate partner portal. Any data you provide on the issuing bank&apos;s site is governed by their respective privacy policies.
              CCR never receives your application status, personal details, or credit score results from external issuers.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Analytics &amp; Performance</h2>
            <p>
              We may collect aggregated, non-identifying telemetry (such as page view counts and general browser capabilities)
              to optimize speed and ensure mobile responsiveness. No IP addresses are mapped to identities.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Contact &amp; Inquiries</h2>
            <p>
              For security disclosures or questions regarding this policy, please reach out via our open repository or contact our team at{" "}
              <a href="mailto:privacy@ccr-recommender.com">privacy@ccr-recommender.com</a>.
            </p>
          </section>
        </div>
      </article>

      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-inner">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <div className="footer-brand-header">
                <div className="footer-logo-badge">CCR</div>
                <div>
                  <span className="footer-title">CCR Recommendation Engine</span>
                  <span className="footer-tagline">Zero-PII Credit Card Optimizer for India</span>
                </div>
              </div>
              <p className="footer-disclaimer">
                100% anonymous &amp; client-side calculation model. No personal identifying information is ever stored or transmitted.
              </p>
            </div>
            <div className="footer-nav-groups">
              <div className="footer-nav-col">
                <h4 className="footer-nav-heading">Platform</h4>
                <Link href="/">Recommender Home</Link>
                <Link href="/#faq">FAQs</Link>
              </div>
              <div className="footer-nav-col">
                <h4 className="footer-nav-heading">Legal</h4>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom-bar">
            <p className="footer-copyright">&copy; 2026 CCR. Zero tracking &amp; client-side simulated.</p>
            <Link href="/" className="footer-back-to-top">Back to Recommender &uarr;</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
