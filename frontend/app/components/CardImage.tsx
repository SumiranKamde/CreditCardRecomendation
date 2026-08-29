"use client";

import { useState } from "react";

interface CardImageProps {
  src?: string;
  alt: string;
  cardName: string;
  bankName: string;
  className?: string;
}

function getCardTheme(bank: string, name: string) {
  const b = bank.toLowerCase();
  const n = name.toLowerCase();

  if (n.includes("swiggy")) return { bg: "linear-gradient(135deg, #fc8019 0%, #282c3f 100%)", network: "Mastercard", text: "#ffffff" };
  if (n.includes("scapia") || n.includes("travel")) return { bg: "linear-gradient(135deg, #0d3b36 0%, #157367 100%)", network: "Visa", text: "#ffffff" };
  if (n.includes("marriott") || n.includes("taj")) return { bg: "linear-gradient(135deg, #1c1c1c 0%, #3a3a3a 100%)", network: "Diners", text: "#f0f0f0" };
  if (n.includes("amex") || b.includes("american")) return { bg: "linear-gradient(135deg, #2a3439 0%, #4f606a 100%)", network: "AMEX", text: "#ffffff" };
  if (b.includes("axis")) return { bg: "linear-gradient(135deg, #871938 0%, #b8234e 100%)", network: "Visa", text: "#ffffff" };
  if (b.includes("hdfc")) return { bg: "linear-gradient(135deg, #002e6e 0%, #004c97 100%)", network: "Visa", text: "#ffffff" };
  if (b.includes("icici")) return { bg: "linear-gradient(135deg, #992915 0%, #d84315 100%)", network: "Mastercard", text: "#ffffff" };
  if (b.includes("sbi")) return { bg: "linear-gradient(135deg, #0c3372 0%, #1a56b4 100%)", network: "Visa", text: "#ffffff" };
  if (b.includes("idfc")) return { bg: "linear-gradient(135deg, #8a1523 0%, #3d0a11 100%)", network: "Visa", text: "#ffffff" };
  if (b.includes("kotak")) return { bg: "linear-gradient(135deg, #d32f2f 0%, #1a237e 100%)", network: "RuPay", text: "#ffffff" };
  if (b.includes("indusind")) return { bg: "linear-gradient(135deg, #60141e 0%, #912232 100%)", network: "Mastercard", text: "#ffffff" };
  if (b.includes("standard")) return { bg: "linear-gradient(135deg, #004b38 0%, #028f6b 100%)", network: "Visa", text: "#ffffff" };
  if (b.includes("hsbc")) return { bg: "linear-gradient(135deg, #801010 0%, #1c1c1c 100%)", network: "Visa", text: "#ffffff" };
  if (b.includes("yes")) return { bg: "linear-gradient(135deg, #0e3d7a 0%, #d32f2f 100%)", network: "RuPay", text: "#ffffff" };
  if (b.includes("rbl")) return { bg: "linear-gradient(135deg, #1b3570 0%, #2952a3 100%)", network: "Mastercard", text: "#ffffff" };
  if (b.includes("au small")) return { bg: "linear-gradient(135deg, #5b1d75 0%, #8e24aa 100%)", network: "Visa", text: "#ffffff" };

  return { bg: "linear-gradient(135deg, #1f2d2b 0%, #304743 100%)", network: "Visa", text: "#ffffff" };
}

export default function CardImage({
  src,
  alt,
  cardName,
  bankName,
  className = "",
}: CardImageProps) {
  const [hasError, setHasError] = useState(false);
  const theme = getCardTheme(bankName, cardName);

  if (hasError || !src || src.includes("placeholder") || src.length < 5) {
    return (
      <div
        className={`fintech-card-graphic ${className}`}
        style={{ background: theme.bg, color: theme.text }}
        role="img"
        aria-label={`${cardName} by ${bankName}`}
      >
        {/* Holographic Sheen Overlay */}
        <div className="card-hologram-layer" aria-hidden="true" />

        {/* Top Header: Bank + Contactless */}
        <div className="card-art-top">
          <span className="card-art-bank">{bankName}</span>
          <svg
            className="card-contactless-icon"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M8.5 16.5a5 5 0 0 1 0-9" />
            <path d="M12 19a8.5 8.5 0 0 1 0-14" />
            <path d="M15.5 21.5a12 12 0 0 1 0-19" />
          </svg>
        </div>

        {/* Metallic EMV Chip */}
        <div className="card-emv-chip" aria-hidden="true">
          <div className="emv-line" />
        </div>

        {/* Card Name */}
        <div className="card-art-title" title={cardName}>
          {cardName}
        </div>

        {/* Bottom Network Logo */}
        <div className="card-art-bottom">
          <span className="card-network-badge">{theme.network}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`card-img-element ${className}`}
    />
  );
}

