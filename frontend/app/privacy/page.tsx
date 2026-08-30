import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "../components/ThemeToggle";
import { ShieldLockIcon } from "../components/Icons";

export const metadata: Metadata = {
  title: "Privacy Policy | Zero-PII Indian Credit Card Recommender",
  description:
    "Learn about CCR's strict Zero-PII architecture. We process calculations 100% in your browser without collecting, tracking, or storing your personal data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="site-shell legal-page-wrapper">
      {/* Navigation Topbar */}
      <nav className="topbar" aria-label="Main navigation">
        <Link className="wordmark" href="/" aria-label="CCR home">
          <span className="wordmark-mark">C</span>
          <span>
            CCR <small>Credit Card Recommender</small>
          </span>
        </Link>
        <div className="topbar-right">
          <Link href="/" className="back-link">
            <span>&larr;</span>
            <span>Back to Recommender</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Legal Content Container */}
      <article className="legal-container">
        <header className="legal-header">
          <div className="legal-badge">
            <span className="trust-dot" />
            <span>Zero-PII Architecture Guarantee</span>
          </div>
          <h1>Privacy Policy</h1>
          <p className="legal-subtitle">
            How CCR protects your anonymity by executing 100% of financial computations locally in your browser memory.
          </p>
          <div className="legal-meta-row">
            <span className="legal-meta-item">
              <strong>Effective Date:</strong> August 2026
            </span>
            <span>&bull;</span>
            <span className="legal-meta-item">
              <strong>Version:</strong> 2.4 (Stateless In-Memory)
            </span>
            <span>&bull;</span>
            <span className="legal-meta-item">
              <strong>Jurisdiction:</strong> India (DPDP Act Aligned)
            </span>
          </div>
        </header>

        {/* Table of Contents Quick Nav */}
        <nav className="legal-toc-nav" aria-label="Table of contents">
          <a href="#zero-pii" className="legal-toc-link">1. Zero-PII Guarantee</a>
          <a href="#data-processed" className="legal-toc-link">2. Processed Inputs</a>
          <a href="#cookies" className="legal-toc-link">3. Zero-Cookie Policy</a>
          <a href="#affiliates" className="legal-toc-link">4. Outbound Affiliate Links</a>
          <a href="#telemetry" className="legal-toc-link">5. Telemetry &amp; Performance</a>
          <a href="#rights" className="legal-toc-link">6. Privacy Rights &amp; Contact</a>
        </nav>

        <div className="legal-content">
          {/* Section 1: Core Guarantee */}
          <section id="zero-pii" className="legal-section highlight-box">
            <div className="legal-section-header">
              <span className="legal-section-num">1</span>
              <h2>Our Strict Zero-PII Architecture</h2>
            </div>
            <p>
              At <strong>CCR (Credit Card Recommender)</strong>, privacy is not a setting—it is the core architectural foundation.
              We operate on a <strong>Zero Personally Identifiable Information (Zero-PII)</strong> framework.
            </p>
            <p>
              You are never asked to create an account, register an email, provide your mobile number, verify OTPs,
              or submit sensitive financial identifiers such as PAN, Aadhaar, bank account numbers, or CIBIL credentials.
            </p>
            <div className="legal-callout-pill">
              <ShieldLockIcon size={20} className="cookie-shield-svg" />
              <p>
                <strong>Architectural Guarantee:</strong> Because CCR does not maintain user databases or authentication backends,
                there is zero personal data to breach, monetize, leak, or subpoena.
              </p>
            </div>
          </section>

          {/* Section 2: Anonymous Inputs */}
          <section id="data-processed" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">2</span>
              <h2>What Information We Process In-Memory</h2>
            </div>
            <p>
              To simulate credit card reward returns and rank cards mathematically, our client-side application evaluates three non-identifying parameters:
            </p>
            <ul>
              <li>
                <strong>Estimated Monthly Spend:</strong> e.g., ₹25,000 — used to scale reward calculation multipliers.
              </li>
              <li>
                <strong>Target Spending Categories:</strong> e.g., Dining, Online Shopping, Fuel, Grocery — used to match specific card category reward multipliers.
              </li>
              <li>
                <strong>Approximate Annual Income:</strong> e.g., ₹8,00,000 — used exclusively on your device to filter out cards whose eligibility criteria exceed your salary bracket.
              </li>
            </ul>
            <p>
              These values are calculated purely in-memory in your client browser session. They are <strong>never stored on remote servers</strong>, never logged to server disks, and vanish when you close or reload the browser tab.
            </p>
          </section>

          {/* Section 3: Cookies & Local Storage */}
          <section id="cookies" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">3</span>
              <h2>Zero-Tracking &amp; Local Storage Policy</h2>
            </div>
            <p>
              CCR does not utilize tracking cookies, marketing pixels (e.g. Meta Pixel, TikTok Pixel), cross-site fingerprinting scripts, or third-party ad retargeting trackers.
            </p>
            <p>
              We utilize minimal, browser-native <code>localStorage</code> solely for functional UI state management:
            </p>
            <ul>
              <li><code>ccr_privacy_ack</code>: Remembers when you have acknowledged our informative privacy banner so it does not distract you on subsequent visits.</li>
              <li><code>ccr_theme_preference</code>: Remembers your preferred display theme (Light or Dark mode).</li>
            </ul>
            <p>You can clear these values at any time through your browser settings without affecting site performance.</p>
          </section>

          {/* Section 4: External Bank Redirection */}
          <section id="affiliates" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">4</span>
              <h2>Outbound Links &amp; Bank Portal Redirection</h2>
            </div>
            <p>
              When you choose to click an external <strong>&ldquo;Apply Now&rdquo;</strong> button, you leave CCR and are redirected securely to the respective bank or verified affiliate partner application portal (e.g. HDFC Bank, Axis Bank, SBI Card, ICICI Bank).
            </p>
            <p>
              Any personal data, documentation, or credit bureau consent you provide on the issuing bank&apos;s site is governed entirely by that bank&apos;s privacy policy and RBI regulatory standards. CCR <strong>never</strong> receives your application status, approval outcome, or credit score results.
            </p>
          </section>

          {/* Section 5: Telemetry */}
          <section id="telemetry" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">5</span>
              <h2>Aggregated Anonymous Telemetry</h2>
            </div>
            <p>
              To maintain system uptime, diagnose JavaScript runtime errors, and optimize mobile responsiveness, we may log anonymous, aggregated operational telemetry (such as card filter interactions or HTTP status response codes). No IP addresses or device identities are mapped to individual users.
            </p>
          </section>

          {/* Section 6: Rights & Inquiries */}
          <section id="rights" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">6</span>
              <h2>Data Rights &amp; Security Contact</h2>
            </div>
            <p>
              Under the Digital Personal Data Protection (DPDP) Act and global privacy best practices, you maintain full control over your footprint. Because CCR stores zero personal data, there are no records to delete, modify, or export.
            </p>
            <p>
              For security disclosures, architectural questions, or privacy feedback, please contact our engineering team at:
            </p>
            <div className="legal-callout-pill">
              <p>
                <strong>Security &amp; Privacy Contact:</strong>{" "}
                <a href="mailto:privacy@ccr-recommender.com" className="cookie-link">
                  privacy@ccr-recommender.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </article>

      {/* Global High-Trust Footer */}
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
              <div className="footer-trust-pill">
                <span className="trust-dot" />
                <span>Zero Database Storage &bull; Fully Ephemeral</span>
              </div>
            </div>
            <div className="footer-nav-groups">
              <div className="footer-nav-col">
                <h4 className="footer-nav-heading">Platform</h4>
                <Link href="/">Recommender Home</Link>
                <Link href="/#faq">FAQs</Link>
                <Link href="/#top">Top of Page &uarr;</Link>
              </div>
              <div className="footer-nav-col">
                <h4 className="footer-nav-heading">Legal</h4>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
                <span className="footer-verified-tag">DPDP Aligned</span>
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

