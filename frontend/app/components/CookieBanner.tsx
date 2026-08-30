"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldLockIcon } from "./Icons";

export default function CookieBanner() {
  const [acknowledged, setAcknowledged] = useState<boolean>(true);

  useEffect(() => {
    const isConsentGiven = localStorage.getItem("ccr_privacy_ack");
    if (!isConsentGiven) {
      setAcknowledged(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ccr_privacy_ack", "true");
    setAcknowledged(true);
  };

  if (acknowledged) return null;

  return (
    <aside
      className="cookie-banner"
      role="status"
      aria-live="polite"
      aria-label="Privacy and data protection notice"
    >
      <div className="cookie-banner-inner">
        <div className="cookie-banner-left">
          <div className="cookie-icon-wrapper" aria-hidden="true">
            <ShieldLockIcon size={18} className="cookie-shield-svg" />
          </div>
          <div className="cookie-banner-text">
            <p className="cookie-title">Zero-PII Architecture</p>
            <p className="cookie-desc">
              All calculations run 100% in your browser. We never collect personal data or use tracking cookies.{" "}
              <Link href="/privacy" className="cookie-link">
                Privacy Policy ↗
              </Link>
            </p>
          </div>
        </div>
        <div className="cookie-banner-actions">
          <button
            onClick={handleDismiss}
            className="cookie-btn"
            type="button"
            aria-label="Acknowledge and dismiss notice"
          >
            Got it
          </button>
        </div>
      </div>
    </aside>
  );
}

