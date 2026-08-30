import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "./components/ThemeToggle";

export const metadata: Metadata = {
  title: "404 - Page Not Found | CCR Credit Card Recommender",
  description: "The page you are looking for does not exist on CCR.",
};

export default function NotFound() {
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
          <span className="privacy-note">
            <span className="status-dot" /> No accounts. No PII.
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <section className="legal-container" style={{ textAlign: "center", padding: "100px 24px" }}>
        <p className="eyebrow" style={{ marginBottom: "16px" }}>
          Error 404
        </p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", marginBottom: "20px" }}>
          Page <em>Not Found</em>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "0 auto 36px", fontSize: "16px", lineHeight: "1.6" }}>
          The card or page you are looking for might have been moved or doesn&apos;t exist. Let&apos;s get you back to finding your best credit card.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            className="primary-button"
            style={{ display: "inline-flex", width: "auto", padding: "14px 28px" }}
          >
            Return to Calculator <span>→</span>
          </Link>
        </div>
      </section>

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
