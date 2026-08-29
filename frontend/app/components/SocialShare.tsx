"use client";

import { useState } from "react";
import { trackEvent } from "../lib/analytics";

export default function SocialShare() {
  const [copied, setCopied] = useState(false);

  const shareText = "Find the best Indian credit card tailored to your spending with zero personal data on CCR!";
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://ccr-recommender.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      trackEvent({ name: "share_click", properties: { platform: "clipboard" } });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const shareTwitter = () => {
    trackEvent({ name: "share_click", properties: { platform: "twitter" } });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareWhatsApp = () => {
    trackEvent({ name: "share_click", properties: { platform: "whatsapp" } });
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareLinkedIn = () => {
    trackEvent({ name: "share_click", properties: { platform: "linkedin" } });
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="social-share-strip" aria-label="Share tool">
      <span className="share-label">Share with friends:</span>
      <div className="share-buttons">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="share-btn whatsapp"
          aria-label="Share on WhatsApp"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={shareTwitter}
          className="share-btn x-twitter"
          aria-label="Share on X / Twitter"
        >
          X (Twitter)
        </button>
        <button
          type="button"
          onClick={shareLinkedIn}
          className="share-btn linkedin"
          aria-label="Share on LinkedIn"
        >
          LinkedIn
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="share-btn copy"
          aria-label="Copy link to clipboard"
        >
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
