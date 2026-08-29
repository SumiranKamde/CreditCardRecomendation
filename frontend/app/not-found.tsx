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

      <footer className="site-footer">
        <span>CCR / Independent recommendation engine</span>
        <div className="footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/#faq">FAQs</Link>
        </div>
      </footer>
    </main>
  );
}
