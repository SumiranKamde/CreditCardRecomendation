"use client";

import { useState } from "react";

interface CardImageProps {
  src: string;
  alt: string;
  cardName: string;
  bankName: string;
}

export default function CardImage({ src, alt, cardName, bankName }: CardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    // Generate a sleek fallback badge card
    return (
      <div
        className="card-fallback-badge"
        role="img"
        aria-label={`${cardName} - ${bankName}`}
      >
        <div className="card-chip-sim" aria-hidden="true" />
        <span className="card-fallback-bank">{bankName}</span>
        <span className="card-fallback-name">{cardName}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="card-img-element"
    />
  );
}
