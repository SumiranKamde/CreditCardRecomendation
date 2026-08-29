"use client";

import { useState } from "react";
import { trackEvent } from "../lib/analytics";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How is the Net Annual Benefit calculated?",
    a: "We multiply your monthly spend by the card's specific category reward rate, apply any monthly caps, multiply by 12 to annualize, and then subtract the card's base annual fee. The result is your true estimated profit in rupees.",
  },
  {
    q: "Why is CCR strictly Zero-PII?",
    a: "We believe you shouldn't have to surrender your phone number, email, or PAN card just to compare cards. Our recommendation engine runs purely on anonymous spend math without storing or selling your identity.",
  },
  {
    q: "Will using this tool affect my CIBIL or Experian credit score?",
    a: "Not at all. CCR performs no credit bureau inquiries. When you choose to apply for a card on the official bank site, that bank may perform their standard credit evaluation.",
  },
  {
    q: "How do the 'High chance' and 'Eligible to apply' indicators work?",
    a: "We compare your annual income against the card's minimum income threshold. If your income exceeds the minimum requirement with healthy headroom (>=1.2×), we mark it as 'High chance of approval'.",
  },
  {
    q: "How does CCR make money?",
    a: "We maintain affiliate relationships with banks and partner networks. If you apply for and receive an approved card through our secure links, we may receive a commission at zero extra cost to you. Rankings are 100% objective math.",
  },
  {
    q: "What if my spending is split across several categories?",
    a: "Select your single highest spending category for the initial calculation. The engine automatically checks both specific multiplier rules and general fallback ('Other') rates across cards.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    const nextState = openIndex === index ? null : index;
    setOpenIndex(nextState);
    trackEvent({
      name: "faq_toggle",
      properties: {
        question: FAQS[index].q,
        isOpen: nextState !== null,
      },
    });
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-header">
        <p className="eyebrow">Clear Answers</p>
        <h2 id="faq-title">
          Frequently Asked <em>Questions</em>
        </h2>
        <p className="faq-subtitle">
          Everything you need to know about our card scoring, privacy, and affiliate transparency.
        </p>
      </div>

      <div className="faq-list" role="region" aria-label="FAQ items">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`faq-item ${isOpen ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span>{faq.q}</span>
                <span className="faq-chevron" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className="faq-answer"
                hidden={!isOpen}
              >
                <p>{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
