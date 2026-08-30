import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "../components/ThemeToggle";
import { ShieldLockIcon } from "../components/Icons";

export const metadata: Metadata = {
  title: "Terms of Service | CCR - Indian Credit Card Recommender",
  description:
    "Review CCR's Terms of Service, affiliate disclosures, calculation methodology, and financial disclaimers.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
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
            <span>Transparency &amp; Disclosures</span>
          </div>
          <h1>Terms of Service</h1>
          <p className="legal-subtitle">
            Terms governing the use of CCR, our mathematical simulation engine, and affiliate partnership disclosures.
          </p>
          <div className="legal-meta-row">
            <span className="legal-meta-item">
              <strong>Effective Date:</strong> August 2026
            </span>
            <span>&bull;</span>
            <span className="legal-meta-item">
              <strong>Version:</strong> 2.4
            </span>
            <span>&bull;</span>
            <span className="legal-meta-item">
              <strong>Scope:</strong> Public Free Access Engine
            </span>
          </div>
        </header>

        {/* Table of Contents Quick Nav */}
        <nav className="legal-toc-nav" aria-label="Table of contents">
          <a href="#non-advisory" className="legal-toc-link">1. Non-Advisory Notice</a>
          <a href="#affiliate-disclosure" className="legal-toc-link">2. Affiliate Transparency</a>
          <a href="#methodology" className="legal-toc-link">3. Calculation Model</a>
          <a href="#approval-signals" className="legal-toc-link">4. Approval Signals</a>
          <a href="#trademarks" className="legal-toc-link">5. Trademark Disclaimers</a>
          <a href="#liability" className="legal-toc-link">6. Limitation of Liability</a>
        </nav>

        <div className="legal-content">
          {/* Section 1: Non-Advisory Status */}
          <section id="non-advisory" className="legal-section highlight-box">
            <div className="legal-section-header">
              <span className="legal-section-num">1</span>
              <h2>Informational Simulation Engine (Not Financial Advice)</h2>
            </div>
            <p>
              The calculations, reward simulations, multipliers, and estimated net returns displayed on CCR are provided strictly for <strong>informational, educational, and comparison purposes</strong>.
            </p>
            <p>
              CCR is not a registered investment advisor (SEBI), banking institution (RBI), or credit rating bureau (CIBIL/Experian). We do not provide personalized financial, credit, or tax advice. You should always review the official Most Important Terms and Conditions (MITC) and Schedule of Charges directly on the bank&apos;s portal before submitting a credit application.
            </p>
            <div className="legal-callout-pill">
              <ShieldLockIcon size={20} className="cookie-shield-svg" />
              <p>
                <strong>Independent Math:</strong> Rankings and score sorts are determined algorithmically based solely on net simulated monetary yield and your spend inputs.
              </p>
            </div>
          </section>

          {/* Section 2: Affiliate Disclosure */}
          <section id="affiliate-disclosure" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">2</span>
              <h2>Affiliate Program Disclosures</h2>
            </div>
            <p>
              CCR maintains affiliate relationships with banks, card issuers, and authorized financial affiliate networks in India. When you click an external <strong>&ldquo;Apply Now&rdquo;</strong> link and are approved for a credit product, CCR may receive an affiliate referral commission.
            </p>
            <p>
              This referral payment occurs at <strong>zero additional cost to you</strong>. Importantly:
            </p>
            <ul>
              <li>Affiliate partnerships never alter or inflate card reward multipliers in our calculation engine.</li>
              <li>Unsponsored or non-affiliate cards are ranked alongside affiliate cards using the exact same mathematical formula.</li>
              <li>Cards with higher affiliate payouts do not receive preferential sorting or top-rank boosts.</li>
            </ul>
          </section>

          {/* Section 3: Calculation Methodology */}
          <section id="methodology" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">3</span>
              <h2>Calculation Methodology &amp; Reward Limits</h2>
            </div>
            <p>
              Net annual benefits are computed using the formula:
            </p>
            <ul>
              <li><code>Gross Annual Reward = (Monthly Spend &times; 12) &times; Applied Reward Rate</code></li>
              <li><code>Net Annual Benefit = Gross Annual Reward &minus; Annual Renewal Fee</code></li>
            </ul>
            <p>
              Published bank reward caps (e.g. monthly cashback maximums on specific merchant categories), exclusion lists (e.g. fuel surcharge waivers, wallet loads, rent payments, government utility payments), and GST rates (18% on annual fees) may alter realized returns. Bank issuers reserve the right to revise reward structures and devalue points at their discretion.
            </p>
          </section>

          {/* Section 4: Approval Odds */}
          <section id="approval-signals" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">4</span>
              <h2>Approval Odds &amp; Issuer Discretion</h2>
            </div>
            <p>
              Labels such as <em>&ldquo;High chance of approval&rdquo;</em> and <em>&ldquo;Eligible to apply&rdquo;</em> denote baseline income eligibility thresholds published by issuers.
            </p>
            <p>
              Actual credit card approval is strictly at the sole discretion of the issuing bank, contingent upon your official credit report (CIBIL score), repayment history, existing credit limits, debt-to-income ratio, and internal underwriting algorithms. CCR cannot guarantee card approval or credit limit allocations.
            </p>
          </section>

          {/* Section 5: Trademarks */}
          <section id="trademarks" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">5</span>
              <h2>Nominative Trademark Fair Use</h2>
            </div>
            <p>
              All bank names, brand trademarks, card product names, and associated card artwork (including HDFC Bank, Axis Bank, SBI Card, ICICI Bank, American Express, Standard Chartered, Kotak Mahindra Bank) belong to their respective trademark holders.
            </p>
            <p>
              Their display on CCR is purely nominative to identify financial products and does not signify direct sponsorship, endorsement, or co-branding by the card issuers.
            </p>
          </section>

          {/* Section 6: Liability */}
          <section id="liability" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">6</span>
              <h2>Limitation of Liability</h2>
            </div>
            <p>
              CCR and its maintainers provide the platform on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. Under no circumstances shall CCR be liable for any direct, indirect, incidental, or consequential damages resulting from discrepancies in card terms, application rejections, fee revisions, or credit decisions made based on this website.
            </p>
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
                <span>Objective Algorithmic Scoring</span>
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
                <span className="footer-verified-tag">MITC Compliant</span>
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

