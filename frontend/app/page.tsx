"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ApiError, fetchRecommendations } from "./lib/api";
import { formatINR } from "./lib/format";
import type { ScoredCard } from "./lib/types";
import { trackEvent } from "./lib/analytics";
import CardImage from "./components/CardImage";
import CardDetailModal from "./components/CardDetailModal";
import CategoryMultiSelect from "./components/CategoryMultiSelect";
import FaqSection from "./components/FaqSection";
import SocialShare from "./components/SocialShare";
import ThemeToggle from "./components/ThemeToggle";
import {
  TrophyIcon,
  PercentIcon,
  TagIcon,
  CoinsIcon,
  ShieldLockIcon,
} from "./components/Icons";

const API_DISPLAY_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

interface PresetProfile {
  name: string;
  monthlySpend: number;
  annualIncome: number;
  categories: string[];
  tag: string;
}

const PRESETS: PresetProfile[] = [
  {
    name: "Starter & Digital",
    monthlySpend: 15000,
    annualIncome: 350000,
    categories: ["Online"],
    tag: "₹15k/mo — Online",
  },
  {
    name: "Salaried Professional",
    monthlySpend: 40000,
    annualIncome: 900000,
    categories: ["Dining", "Shopping"],
    tag: "₹40k/mo — Dining+Shop",
  },
  {
    name: "Commuter & Shopping",
    monthlySpend: 35000,
    annualIncome: 800000,
    categories: ["Fuel", "Shopping"],
    tag: "₹35k/mo — Fuel+Shop",
  },
  {
    name: "Travel & Lifestyle",
    monthlySpend: 75000,
    annualIncome: 1600000,
    categories: ["Travel", "Dining"],
    tag: "₹75k/mo — Travel+Dining",
  },
];

type SortOption = "netBenefit" | "rewardRate" | "annualFee" | "annualReward";

function formatRupees(value: number) {
  return formatINR(value);
}

export default function Home() {
  const [monthlySpend, setMonthlySpend] = useState<number>(25000);
  const [annualIncome, setAnnualIncome] = useState<number>(800000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Fuel", "Shopping"]);
  const [sortBy, setSortBy] = useState<SortOption>("netBenefit");
  const [recommendations, setRecommendations] = useState<ScoredCard[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false); // Don't show empty state until first API response
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState<boolean>(false);
  const [selectedModalCard, setSelectedModalCard] = useState<ScoredCard | null>(null);


  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Show floating action bar on mobile when scrolled past the calculator
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 350) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-calculate initial recommendations on mount so mobile & desktop show results immediately
  useEffect(() => {
    executeCalculation(25000, 800000, ["Fuel", "Shopping"], false);
    return () => abortRef.current?.abort();
  }, []);

  const applyPreset = (preset: PresetProfile) => {
    setMonthlySpend(preset.monthlySpend);
    setAnnualIncome(preset.annualIncome);
    setSelectedCategories(preset.categories);
    setActivePreset(preset.name);
    trackEvent({ name: "click_preset", properties: { presetName: preset.name } });
    executeCalculation(preset.monthlySpend, preset.annualIncome, preset.categories, false);
  };

  async function executeCalculation(
    spend: number,
    income: number,
    categories: string[],
    shouldScroll: boolean = true,
  ) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const data = await fetchRecommendations(
        { monthlySpend: spend, selectedCategories: categories, annualIncome: income },
        controller.signal,
      );
      const recs = data.recommendations ?? [];
      setRecommendations(recs);
      setSubmitted(true);
      trackEvent({
        name: "calculate_recommendations",
        properties: {
          monthlySpend: spend,
          annualIncome: income,
          topCategory: categories.join(", "),
          resultCount: recs.length,
        },
      });

      if (shouldScroll) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : `Unable to connect to the recommendation engine on ${API_DISPLAY_URL}. Please verify the backend service is running.`,
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await executeCalculation(monthlySpend, annualIncome, selectedCategories, true);
  }

  // Adjust spend by increment
  const adjustSpend = (amount: number) => {
    const next = Math.max(0, Math.min(200000, monthlySpend + amount));
    setMonthlySpend(next);
    setActivePreset(null);
  };

  // Adjust income by increment
  const adjustIncome = (amount: number) => {
    const next = Math.max(200000, Math.min(3000000, annualIncome + amount));
    setAnnualIncome(next);
    setActivePreset(null);
  };

  // Sorted recommendations
  const sortedRecommendations = useMemo(() => {
    const list = [...recommendations];
    switch (sortBy) {
      case "netBenefit":
        return list.sort((a, b) => b.netBenefit - a.netBenefit);
      case "rewardRate":
        return list.sort((a, b) => b.rewardRateApplied - a.rewardRateApplied);
      case "annualFee":
        return list.sort((a, b) => a.annualFee - b.annualFee);
      case "annualReward":
        return list.sort((a, b) => b.annualReward - a.annualReward);
      default:
        return list;
    }
  }, [recommendations, sortBy]);

  return (
    <main className="site-shell" id="main-content">
      {/* Top Header Navigation */}
      <header className="topbar" role="banner">
        <Link className="wordmark" href="/" aria-label="CCR home">
          <span className="wordmark-mark" aria-hidden="true">C</span>
          <span>
            CCR <small>Credit Card Recommender</small>
          </span>
        </Link>
        <div className="topbar-right">
          <span className="privacy-note desktop-only">
            <span className="status-dot" aria-hidden="true" /> Zero PII &bull; Live Scoring
          </span>
          <a href="#faq" className="nav-link desktop-only">
            FAQs
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Calculator & Recommender Section */}
      <section className="recommender-hero-section" id="top" aria-label="Card Recommendation Tool">
        {/* Desktop Side Header & Context (Streamlined for Mobile) */}
        <div className="hero-side-summary">
          <div className="hero-badge-pill">
            <span>Live Card Scoring</span>
            <span className="badge-sep">/</span>
            <span>Zero PII</span>
          </div>
          <h1 className="hero-heading">
            Find the Indian card that <em>pays you back.</em>
          </h1>
          <p className="hero-subtext">
            Instant mathematical rankings based on your combined monthly spend and income tier.
          </p>

          {/* Quick Profile Presets */}
          <div className="preset-selector" aria-label="Quick test profiles">
            <span className="preset-label">Quick Profile Presets:</span>
            <div className="preset-buttons">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`preset-btn ${activePreset === preset.name ? "active" : ""}`}
                  aria-pressed={activePreset === preset.name}
                >
                  <span>{preset.name}</span>
                  <small>{preset.tag}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compact Ergonomic Calculator Panel */}
        <form
          className="calculator-panel"
          onSubmit={handleSubmit}
          aria-busy={loading}
          aria-label="Credit card calculator form"
        >
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Custom Profile</p>
              <h2>Adjust Your Numbers</h2>
            </div>
            <span className="panel-live-indicator">
              <span className="live-pulse-dot" /> Live
            </span>
          </div>

          {/* Monthly Spend Control */}
          <div className="control-block">
            <div className="control-label">
              <label htmlFor="monthly-spend-slider">Monthly spend</label>
              <strong>{formatRupees(monthlySpend)}</strong>
            </div>
            <div className="slider-with-quick-actions">
              <input
                id="monthly-spend-slider"
                aria-label={`Monthly spend: ${formatRupees(monthlySpend)}`}
                type="range"
                min="0"
                max="200000"
                step="1000"
                value={monthlySpend}
                onChange={(event) => {
                  setMonthlySpend(Number(event.target.value));
                  setActivePreset(null);
                }}
              />
              <div className="quick-step-buttons" aria-label="Quick adjust monthly spend">
                <button
                  type="button"
                  onClick={() => adjustSpend(-5000)}
                  className="step-btn"
                  aria-label="Decrease spend by 5,000"
                  disabled={monthlySpend <= 0}
                >
                  -5k
                </button>
                <button
                  type="button"
                  onClick={() => adjustSpend(5000)}
                  className="step-btn"
                  aria-label="Increase spend by 5,000"
                  disabled={monthlySpend >= 200000}
                >
                  +5k
                </button>
              </div>
            </div>
            <div className="range-hint">
              <span>₹0</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          {/* Annual Income Control */}
          <div className="control-block">
            <div className="control-label">
              <label htmlFor="annual-income-slider">Annual income</label>
              <strong>{formatRupees(annualIncome)}</strong>
            </div>
            <div className="slider-with-quick-actions">
              <input
                id="annual-income-slider"
                aria-label={`Annual income: ${formatRupees(annualIncome)}`}
                type="range"
                min="200000"
                max="3000000"
                step="25000"
                value={annualIncome}
                onChange={(event) => {
                  setAnnualIncome(Number(event.target.value));
                  setActivePreset(null);
                }}
              />
              <div className="quick-step-buttons" aria-label="Quick adjust income">
                <button
                  type="button"
                  onClick={() => adjustIncome(-50000)}
                  className="step-btn"
                  aria-label="Decrease income by 50,000"
                  disabled={annualIncome <= 200000}
                >
                  -50k
                </button>
                <button
                  type="button"
                  onClick={() => adjustIncome(50000)}
                  className="step-btn"
                  aria-label="Increase income by 50,000"
                  disabled={annualIncome >= 3000000}
                >
                  +50k
                </button>
              </div>
            </div>
            <div className="range-hint">
              <span>₹2L</span>
              <span>₹30L+</span>
            </div>
          </div>

          {/* Prominent Multi-Category Selection with Dropdown Arrow */}
          <div className="select-block">
            <CategoryMultiSelect
              selectedCategories={selectedCategories}
              onChange={(cats) => {
                setSelectedCategories(cats);
                setActivePreset(null);
              }}
            />
          </div>

          {/* CTA Submit Button */}
          <button className="primary-button" type="submit" disabled={loading} id="calculate-btn">
            {loading ? "Computing optimal cards..." : "Update Recommendations"}
            <span aria-hidden="true">→</span>
          </button>

          <p className="form-footnote">
            <ShieldLockIcon size={12} className="inline-lock-icon" /> Anonymous in-memory calculation. Zero PII stored.
          </p>
        </form>
      </section>

      {/* Immediate Results Section */}
      <section
        ref={resultsRef}
        className={`results-section ${submitted ? "is-visible" : ""}`}
        aria-live="polite"
        id="results"
      >
        {error && (
          <div className="error-message" role="alert">
            <strong>Engine Notice:</strong> {error}
          </div>
        )}

        {submitted && !error && sortedRecommendations.length === 0 && (
          <div className="empty-state">
            <span className="empty-number" aria-hidden="true">00</span>
            <div>
              <h2>No eligible cards matched this profile.</h2>
              <p>
                Try increasing your annual income or adjusting your selected categories to see cards that match your criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAnnualIncome(1200000);
                  executeCalculation(monthlySpend, 1200000, selectedCategories, true);
                }}
                className="secondary-btn"
                style={{ marginTop: "14px" }}
              >
                Try with ₹12L Annual Income
              </button>
            </div>
          </div>
        )}

        {submitted && !error && sortedRecommendations.length > 0 && (
          <>
            <div className="results-heading">
              <div>
                <p className="eyebrow">Top Recommendations / {sortedRecommendations.length} Matches</p>
                <h2>
                  Ranked for <em>Your Wallet</em>
                </h2>
              </div>
              <div className="results-context">
                <strong>{formatRupees(monthlySpend)} / month</strong>
                <span className="categories-tagline">
                  {selectedCategories.join(" + ")}
                </span>
              </div>
            </div>

            {/* Sorting Toolbar */}
            <div className="results-toolbar">
              <div className="toolbar-left">
                <span className="toolbar-label">Sort:</span>
                <div className="sort-buttons-group">
                  <button
                    type="button"
                    className={`sort-pill ${sortBy === "netBenefit" ? "active" : ""}`}
                    onClick={() => setSortBy("netBenefit")}
                  >
                    <TrophyIcon size={13} />
                    <span>Net Profit</span>
                  </button>
                  <button
                    type="button"
                    className={`sort-pill ${sortBy === "rewardRate" ? "active" : ""}`}
                    onClick={() => setSortBy("rewardRate")}
                  >
                    <PercentIcon size={13} />
                    <span>Reward Rate</span>
                  </button>
                  <button
                    type="button"
                    className={`sort-pill ${sortBy === "annualFee" ? "active" : ""}`}
                    onClick={() => setSortBy("annualFee")}
                  >
                    <TagIcon size={13} />
                    <span>Lowest Fee</span>
                  </button>
                  <button
                    type="button"
                    className={`sort-pill ${sortBy === "annualReward" ? "active" : ""}`}
                    onClick={() => setSortBy("annualReward")}
                  >
                    <CoinsIcon size={13} />
                    <span>Gross Value</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="card-grid" role="list">
              {sortedRecommendations.map((card, index) => (
                <article
                  role="listitem"
                  className={`recommendation-card ${index === 0 ? "featured-card" : ""} is-clickable`}
                  key={card.id}
                  onClick={() => setSelectedModalCard(card)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedModalCard(card);
                    }
                  }}
                  aria-label={`View full benefits and how to apply for ${card.cardName}`}
                >
                  <div className="card-topline">
                    <span className={`rank ${index === 0 ? "rank-first" : ""}`}>
                      {index === 0 ? "★ #1 Best Match" : `Rank #${index + 1}`}
                    </span>
                    <span
                      className={
                        card.approvalSignal === "high" ? "approval high" : "approval"
                      }
                      title="Based on minimum income requirement"
                    >
                      {card.approvalSignal === "high"
                        ? "High Approval Chance"
                        : "Eligible"}
                    </span>
                  </div>


                  <div className="card-identity">
                    <div className="card-image-wrap">
                      <CardImage
                        src={card.imageUrl}
                        alt={`${card.bankName} ${card.cardName} card artwork`}
                        cardName={card.cardName}
                        bankName={card.bankName}
                      />
                    </div>
                    <div className="card-identity-text">
                      <p className="bank-name">{card.bankName}</p>
                      <h3>{card.cardName}</h3>
                    </div>
                  </div>

                  {/* Highlight which categories matched */}
                  <div className="card-matched-categories">
                    <span className="matched-tag">
                      Matched: <strong>{card.categoryMatched}</strong>
                    </span>
                  </div>

                  {/* Net Annual Profit Highlight Banner */}
                  <div className="benefit">
                    <span className="benefit-label">Estimated Net Benefit / Year</span>
                    <strong className="benefit-value">
                      {card.netBenefit >= 0 ? `+${formatRupees(card.netBenefit)}` : formatRupees(card.netBenefit)}
                    </strong>
                    <span className="benefit-subtext">after subtracting annual fee</span>
                  </div>

                  {/* 3-Column Micro-Stats Grid */}
                  <div className="card-details-grid">
                    <div className="stat-box">
                      <span className="stat-label">Annual Fee</span>
                      <strong className="stat-value">{card.annualFee === 0 ? "Free (₹0)" : formatRupees(card.annualFee)}</strong>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Est. Rewards</span>
                      <strong className="stat-value">{formatRupees(card.annualReward)}</strong>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Avg. Rate</span>
                      <strong className="stat-value highlight">{(card.rewardRateApplied * 100).toFixed(1)}%</strong>
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="card-actions-row">
                    <button
                      type="button"
                      className="card-details-trigger-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalCard(card);
                      }}
                    >
                      <span>View Benefits &amp; Specs</span>
                    </button>
                    <a
                      className="apply-link"
                      href={card.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackEvent({
                          name: "click_apply_link",
                          properties: {
                            cardName: card.cardName,
                            bankName: card.bankName,
                            url: card.applyUrl,
                          },
                        });
                      }}
                    >
                      <span>Apply Now</span>
                      <span className="arrow-icon" aria-hidden="true">↗</span>
                    </a>
                  </div>

                </article>
              ))}
            </div>

            {/* Recalculate CTA Banner */}
            <div className="recalculate-banner">
              <div>
                <h3>Need to compare another spend scenario?</h3>
                <p>Adjust categories or monthly spend above to see real-time updates.</p>
              </div>
              <a href="#top" className="secondary-btn">
                Adjust Profile ↑
              </a>
            </div>

            {/* Social Share Strip */}
            <SocialShare />
          </>
        )}
      </section>

      {/* Comprehensive FAQ Section */}
      <FaqSection />

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
                <strong>Affiliate Transparency:</strong> CCR may earn an affiliate commission when you apply and get approved through our partner links, at zero extra cost to you. All reward calculations and rankings are 100% algorithmic, objective, and calculated locally in your browser.
              </p>
              <div className="footer-trust-pill">
                <span className="trust-dot"></span>
                <span>100% Client-Side Calculations &bull; Zero Server Storage</span>
              </div>
            </div>

            <div className="footer-nav-groups">
              <div className="footer-nav-col">
                <h4 className="footer-nav-heading">Platform</h4>
                <a href="#top">Recommender Top ↑</a>
                <a href="#faq">Methodology &amp; FAQs</a>
                <a href="#results" onClick={(e) => {
                  const el = document.getElementById("results");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}>Card Results</a>
              </div>

              <div className="footer-nav-col">
                <h4 className="footer-nav-heading">Legal &amp; Trust</h4>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
                <span className="footer-verified-tag">Zero-PII Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p className="footer-copyright">
              &copy; 2026 CCR. Bank terms, welcome bonuses &amp; reward structures are subject to issuer revisions. Verify on bank portal before applying.
            </p>
            <a href="#top" className="footer-back-to-top" aria-label="Scroll back to top">
              <span>Back to Top</span>
              <span aria-hidden="true">&uarr;</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Action & Spend Tweak Bar */}
      {showFloatingBar && submitted && sortedRecommendations.length > 0 && (
        <div className="mobile-floating-bar" aria-label="Quick adjust spend" role="region">
          <div className="mobile-floating-info">
            <span className="mobile-floating-spend">{formatRupees(monthlySpend)}/mo</span>
            <span className="mobile-floating-matches">{sortedRecommendations.length} Cards Found</span>
          </div>
          <button
            type="button"
            className="mobile-floating-action-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span>Tweak Numbers</span>
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      )}

      {/* Animated Pop-Up Card Detail Modal */}
      <CardDetailModal
        card={selectedModalCard}
        monthlySpend={monthlySpend}
        selectedCategories={selectedCategories}
        onClose={() => setSelectedModalCard(null)}
      />
    </main>
  );
}

