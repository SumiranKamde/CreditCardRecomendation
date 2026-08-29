"use client";

import { useEffect, useState } from "react";
import type { ScoredCard } from "../lib/types";
import { formatINR } from "../lib/format";
import { getCardFullDetails } from "../lib/cardDetails";
import CardImage from "./CardImage";
import { trackEvent } from "../lib/analytics";
import {
  TrophyIcon,
  PercentIcon,
  TagIcon,
  CoinsIcon,
  ShieldLockIcon,
} from "./Icons";

interface CardDetailModalProps {
  card: ScoredCard | null;
  monthlySpend: number;
  selectedCategories: string[];
  onClose: () => void;
}

export default function CardDetailModal({
  card,
  monthlySpend,
  selectedCategories,
  onClose,
}: CardDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"benefits" | "eligibility" | "apply">("benefits");

  // Close modal when pressing 'Escape'
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (card) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [card, onClose]);

  if (!card) return null;

  const details = getCardFullDetails(card.cardName, card.bankName, card.id);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-card-title"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Mobile Bottom Sheet Handle */}
        <div className="modal-sheet-handle-bar" aria-hidden="true">
          <span className="modal-sheet-handle-pill" />
        </div>

        {/* Modal Header */}
        <div className="modal-header">

          <div className="modal-card-identity">
            <div className="modal-card-image">
              <CardImage
                src={card.imageUrl}
                alt={`${card.bankName} ${card.cardName}`}
                cardName={card.cardName}
                bankName={card.bankName}
              />
            </div>
            <div>
              <span className="modal-bank-name">{card.bankName}</span>
              <h2 id="modal-card-title" className="modal-card-name">
                {card.cardName}
              </h2>
              <div className="modal-tags">
                <span className="modal-tag approval">
                  {card.approvalSignal === "high" ? "High Approval Chance" : "Eligible to Apply"}
                </span>
                <span className="modal-tag income">
                  Min Income: {formatINR(card.minIncome)}/yr
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close card details modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Quick Net Summary Banner */}
        <div className="modal-net-banner">
          <div className="net-banner-left">
            <span className="net-banner-label">Your Projected Net Annual Benefit</span>
            <strong className="net-banner-value">{formatINR(card.netBenefit)}</strong>
            <span className="net-banner-sub">
              Based on {formatINR(monthlySpend)}/mo across {selectedCategories.join(" + ")}
            </span>
          </div>
          <div className="net-banner-math">
            <div className="math-row">
              <span>Gross Rewards:</span>
              <strong>+{formatINR(card.annualReward)}/yr</strong>
            </div>
            <div className="math-row">
              <span>Annual Fee:</span>
              <strong>-{formatINR(card.annualFee)}/yr</strong>
            </div>
          </div>
        </div>

        {/* Modal Tab Navigation */}
        <div className="modal-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "benefits"}
            className={`modal-tab-btn ${activeTab === "benefits" ? "active" : ""}`}
            onClick={() => setActiveTab("benefits")}
          >
            <TrophyIcon size={14} />
            <span>Overall Benefits</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "eligibility"}
            className={`modal-tab-btn ${activeTab === "eligibility" ? "active" : ""}`}
            onClick={() => setActiveTab("eligibility")}
          >
            <ShieldLockIcon size={14} />
            <span>Eligibility &amp; Docs</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "apply"}
            className={`modal-tab-btn ${activeTab === "apply" ? "active" : ""}`}
            onClick={() => setActiveTab("apply")}
          >
            <TagIcon size={14} />
            <span>How to Apply</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="modal-body-content">
          {/* TAB 1: Benefits & Perks */}
          {activeTab === "benefits" && (
            <div className="modal-tab-pane" role="tabpanel">
              {/* Highlight Perks Grid */}
              <div className="perks-grid">
                {details.keyBenefits.map((benefit, i) => (
                  <div key={i} className="perk-card">
                    <div className="perk-header">
                      <h4>{benefit.title}</h4>
                      {benefit.badge && <span className="perk-badge">{benefit.badge}</span>}
                    </div>
                    <p>{benefit.description}</p>
                  </div>
                ))}
              </div>

              {/* Essential Card Attributes Table */}
              <div className="essential-specs-box">
                <h4 className="specs-title">Essential Card Information</h4>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Joining / Annual Fee</span>
                    <strong className="spec-value">
                      {formatINR(card.annualFee)} <small>(+18% GST)</small>
                    </strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Fee Waiver Milestone</span>
                    <strong className="spec-value">{details.feeWaiverSpend}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Airport Lounge Access</span>
                    <strong className="spec-value">{details.loungeAccess}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Fuel Surcharge Waiver</span>
                    <strong className="spec-value">{details.fuelSurcharge}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Welcome Bonus</span>
                    <strong className="spec-value">{details.welcomeBonus}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Reward Redemption</span>
                    <strong className="spec-value">{details.rewardRedemption}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Eligibility & Requirements */}
          {activeTab === "eligibility" && (
            <div className="modal-tab-pane" role="tabpanel">
              <div className="eligibility-container">
                <div className="eligibility-card">
                  <div className="card-sec-header">
                    <ShieldLockIcon size={16} />
                    <h4>Applicant Eligibility Criteria</h4>
                  </div>
                  <ul className="criteria-list">
                    {details.eligibilityRequirements.map((req, i) => (
                      <li key={i}>
                        <span className="check-bullet">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                    <li>
                      <span className="check-bullet">✓</span>
                      <span>
                        Credit Bureau Health: <strong>{details.cibilRecommendation}</strong>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="documents-card">
                  <div className="card-sec-header">
                    <TagIcon size={16} />
                    <h4>Required Documents Checklist</h4>
                  </div>
                  <ul className="criteria-list">
                    {details.documentsRequired.map((doc, i) => (
                      <li key={i}>
                        <span className="check-bullet">✓</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="paperless-note">
                    ⚡ <strong>100% Paperless Application:</strong> Complete instant e-KYC using your Aadhaar-linked mobile number.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Step-by-Step How to Apply */}
          {activeTab === "apply" && (
            <div className="modal-tab-pane" role="tabpanel">
              <div className="steps-flow">
                {details.howToApplySteps.map((stepItem) => (
                  <div key={stepItem.step} className="step-row">
                    <div className="step-number-badge">0{stepItem.step}</div>
                    <div className="step-content">
                      <h4>{stepItem.title}</h4>
                      <p>{stepItem.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="apply-trust-callout">
                <ShieldLockIcon size={18} />
                <p>
                  You will be safely redirected to <strong>{card.bankName}&apos;s official portal</strong>. CCR never asks for or stores your personal data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Direct Apply CTA */}
        <div className="modal-footer">
          <button
            type="button"
            className="secondary-btn modal-cancel-btn"
            onClick={onClose}
          >
            Back to Results
          </button>

          <a
            href={card.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button modal-apply-cta"
            onClick={() =>
              trackEvent({
                name: "click_apply_link",
                properties: {
                  cardName: card.cardName,
                  bankName: card.bankName,
                  url: card.applyUrl,
                },
              })
            }
          >
            <span>Apply on Official {card.bankName} Portal</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
