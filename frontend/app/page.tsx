"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ApiError, fetchRecommendations } from "./lib/api";
import { formatINR } from "./lib/format";
import type { ScoredCard } from "./lib/types";

const API_DISPLAY_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";
const categories = ["Online", "Shopping", "Dining", "Travel", "Fuel", "Other"];

// Kept as a thin wrapper so existing call sites below read the same as before.
function formatRupees(value: number) {
  return formatINR(value);
}

export default function Home() {
  const [monthlySpend, setMonthlySpend] = useState(25000);
  const [annualIncome, setAnnualIncome] = useState(800000);
  const [topCategory, setTopCategory] = useState("Online");
  const [recommendations, setRecommendations] = useState<ScoredCard[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight request if the component unmounts mid-fetch.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const data = await fetchRecommendations(
        { monthlySpend, topCategory, annualIncome },
        controller.signal,
      );
      setRecommendations(data.recommendations ?? []);
      setSubmitted(true);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to reach the recommendation engine.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="wordmark" href="#top" aria-label="CCR home">
          <span className="wordmark-mark">C</span>
          <span>CCR <small>Credit Card Recommender</small></span>
        </a>
        <span className="privacy-note"><span className="status-dot" /> No accounts. No PII.</span>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">India&apos;s zero-data card calculator <span>↗</span></p>
          <h1>Find the card that <em>pays you back.</em></h1>
          <p className="hero-intro">Tell us where your money goes. We&apos;ll rank cards by your estimated net annual benefit, after fees.</p>
          <div className="trust-strip"><span>01 / Anonymous inputs</span><span>02 / Math, not marketing</span><span>03 / Independent results</span></div>
        </div>

        <form className="calculator-panel" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="panel-heading">
            <div><p className="panel-kicker">Your spending profile</p><h2>Run the numbers</h2></div>
            <span className="step-count">01 — 03</span>
          </div>

          <label className="control-block">
            <span className="control-label"><span>Monthly spend</span><strong>{formatRupees(monthlySpend)}</strong></span>
            <input aria-label={`Monthly spend ${formatRupees(monthlySpend)}`} type="range" min="0" max="100000" step="1000" value={monthlySpend} onChange={(event) => setMonthlySpend(Number(event.target.value))} />
            <span className="range-hint"><span>₹0</span><span>₹1,00,000</span></span>
          </label>

          <label className="control-block">
            <span className="control-label"><span>Annual income</span><strong>{formatRupees(annualIncome)}</strong></span>
            <input aria-label={`Annual income ${formatRupees(annualIncome)}`} type="range" min="200000" max="2000000" step="10000" value={annualIncome} onChange={(event) => setAnnualIncome(Number(event.target.value))} />
            <span className="range-hint"><span>₹2L</span><span>₹20L</span></span>
          </label>

          <label className="select-block">
            <span className="control-label"><span>Top spending category</span></span>
            <select aria-label="Top spending category" value={topCategory} onChange={(event) => setTopCategory(event.target.value)}>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Calculating..." : "Show my best cards"}<span>→</span>
          </button>
          <p className="form-footnote">We use only these three numbers. Nothing is saved.</p>
        </form>
      </section>

      <section className={`results-section ${submitted ? "is-visible" : ""}`} aria-live="polite">
        {error && <div className="error-message" role="alert">{error} Check that the backend is running on {API_DISPLAY_URL}.</div>}
        {submitted && !error && recommendations.length === 0 && <div className="empty-state"><span className="empty-number">00</span><div><h2>No eligible cards yet.</h2><p>Try increasing your annual income to see cards that match your profile.</p></div></div>}
        {submitted && !error && recommendations.length > 0 && (
          <>
            <div className="results-heading"><div><p className="eyebrow">Your shortlist / {recommendations.length} matches</p><h2>Cards ranked for <em>your wallet.</em></h2></div><p className="results-context">{formatRupees(monthlySpend)} / month<br />{topCategory} spend</p></div>
            <div className="card-grid">
              {recommendations.map((card, index) => (
                <article className={`recommendation-card ${index === 0 ? "featured-card" : ""}`} key={card.id}>
                  <div className="card-topline"><span className="rank">0{index + 1}</span><span className={card.approvalSignal === "high" ? "approval high" : "approval"}>{card.approvalSignal === "high" ? "High chance of approval" : "Eligible to apply"}</span></div>
                  <div className="card-identity"><div className="card-image-wrap"><img src={card.imageUrl} alt={`${card.cardName} card`} /></div><div><p className="bank-name">{card.bankName}</p><h3>{card.cardName}</h3></div></div>
                  <div className="benefit"><span>Estimated net benefit / year</span><strong>{formatRupees(card.netBenefit)}</strong></div>
                  <div className="card-details"><span><small>Annual fee</small>{formatRupees(card.annualFee)}</span><span><small>Est. reward</small>{formatRupees(card.annualReward)}</span><span><small>Rate applied</small>{(card.rewardRateApplied * 100).toFixed(1)}%</span></div>
                  <a className="apply-link" href={card.applyUrl} target="_blank" rel="noopener noreferrer">View card &amp; apply <span>↗</span></a>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="site-footer"><span>CCR / Independent recommendation engine</span><span>Affiliate disclosure: we may earn a commission if you apply through our links. Card terms can change; verify details with the issuer.</span></footer>
    </main>
  );
}
