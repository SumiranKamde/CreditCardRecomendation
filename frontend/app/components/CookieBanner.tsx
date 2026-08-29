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
      role="region"
      aria-label="Privacy and data protection notice"
    >
      <div className="cookie-banner-content">
        <span className="cookie-icon" aria-hidden="true">
          <ShieldLockIcon size={20} />
        </span>
        <p>
          <strong>Zero-PII Architecture:</strong> CCR processes calculations entirely in-memory
          without tracking cookies or data storage. Review our{" "}
          <Link href="/privacy" className="underline-link">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="cookie-btn"
        type="button"
        aria-label="Acknowledge and dismiss notice"
      >
        Acknowledge
      </button>
    </aside>
  );
}
