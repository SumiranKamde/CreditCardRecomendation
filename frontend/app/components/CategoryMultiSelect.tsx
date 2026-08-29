"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FuelIcon,
  ShoppingIcon,
  DiningIcon,
  TravelIcon,
  OnlineIcon,
  GroceryIcon,
  UtilitiesIcon,
  OtherIcon,
} from "./Icons";

export interface CategoryOption {
  id: string;
  label: string;
  description: string;
  renderIcon: (size?: number) => React.ReactNode;
}

export const AVAILABLE_CATEGORIES: CategoryOption[] = [
  {
    id: "Fuel",
    label: "Fuel",
    description: "Petrol, diesel, CNG & EV charging stations",
    renderIcon: (size = 15) => <FuelIcon size={size} />,
  },
  {
    id: "Shopping",
    label: "Shopping",
    description: "Amazon, Flipkart, retail malls & apparel",
    renderIcon: (size = 15) => <ShoppingIcon size={size} />,
  },
  {
    id: "Dining",
    label: "Dining",
    description: "Restaurants, cafes, food delivery & lounges",
    renderIcon: (size = 15) => <DiningIcon size={size} />,
  },
  {
    id: "Travel",
    label: "Travel",
    description: "Flights, hotel bookings, railways & cabs",
    renderIcon: (size = 15) => <TravelIcon size={size} />,
  },
  {
    id: "Online",
    label: "Online",
    description: "All online transactions & digital subscriptions",
    renderIcon: (size = 15) => <OnlineIcon size={size} />,
  },
  {
    id: "Grocery",
    label: "Grocery",
    description: "Supermarkets & quick-commerce deliveries",
    renderIcon: (size = 15) => <GroceryIcon size={size} />,
  },
  {
    id: "Utilities",
    label: "Utilities",
    description: "Electricity, mobile recharges & broadband",
    renderIcon: (size = 15) => <UtilitiesIcon size={size} />,
  },
  {
    id: "Other",
    label: "Other",
    description: "General retail spends & offline point-of-sale",
    renderIcon: (size = 15) => <OtherIcon size={size} />,
  },
];

export const CATEGORY_COMBOS = [
  { label: "Fuel + Shopping", categories: ["Fuel", "Shopping"] },
  { label: "Dining + Travel", categories: ["Dining", "Travel"] },
  { label: "Online + Grocery", categories: ["Online", "Grocery"] },
  { label: "Daily Essentials", categories: ["Fuel", "Grocery", "Utilities"] },
];

interface CategoryMultiSelectProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export default function CategoryMultiSelect({
  selectedCategories,
  onChange,
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      if (selectedCategories.length > 1) {
        onChange(selectedCategories.filter((id) => id !== categoryId));
      }
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const removeCategory = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedCategories.length > 1) {
      onChange(selectedCategories.filter((id) => id !== categoryId));
    }
  };

  const applyCombo = (comboCategories: string[]) => {
    onChange(comboCategories);
  };

  const selectAll = () => {
    onChange(AVAILABLE_CATEGORIES.map((c) => c.id));
  };

  const resetToSingle = (categoryId: string = "Online") => {
    onChange([categoryId]);
  };

  const getDisplayText = () => {
    if (selectedCategories.length === 0) return "Select spending categories";
    if (selectedCategories.length === 1) {
      const cat = AVAILABLE_CATEGORIES.find((c) => c.id === selectedCategories[0]);
      return cat?.label || selectedCategories[0];
    }
    if (selectedCategories.length === AVAILABLE_CATEGORIES.length) {
      return "All Categories Selected (8)";
    }
    return `${selectedCategories.length} Categories Selected (${selectedCategories.join(" + ")})`;
  };

  return (
    <div className="multi-category-container" ref={containerRef}>
      <div className="control-label" style={{ marginBottom: "8px" }}>
        <span>Top Spending Categories</span>
        <span className="selected-count-badge">
          {selectedCategories.length} {selectedCategories.length === 1 ? "Category" : "Categories"}
        </span>
      </div>

      {/* Prominent Dropdown Trigger Button */}
      <button
        type="button"
        className={`category-dropdown-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id="category-dropdown-button"
      >
        <span className="dropdown-trigger-label">
          {getDisplayText()}
        </span>
        <span className="dropdown-arrow-icon" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>

      {/* Prominent Selected Category Badges / Pills */}
      <div
        className="selected-categories-chips"
        aria-label="Currently selected categories"
      >
        {selectedCategories.map((catId) => {
          const cat = AVAILABLE_CATEGORIES.find((c) => c.id === catId);
          return (
            <span key={catId} className="category-chip">
              <span className="chip-icon">{cat?.renderIcon(13)}</span>
              <span className="chip-label">{cat?.label || catId}</span>
              {selectedCategories.length > 1 && (
                <button
                  type="button"
                  className="chip-remove"
                  onClick={(e) => removeCategory(catId, e)}
                  aria-label={`Remove ${cat?.label || catId}`}
                  title={`Remove ${cat?.label || catId}`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          className="category-dropdown-menu"
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby="category-dropdown-button"
        >
          {/* Quick Category Combos */}
          <div className="combos-section">
            <span className="combos-title">Preset Combinations</span>
            <div className="combos-grid">
              {CATEGORY_COMBOS.map((combo) => (
                <button
                  key={combo.label}
                  type="button"
                  onClick={() => applyCombo(combo.categories)}
                  className="combo-badge-btn"
                >
                  {combo.label}
                </button>
              ))}
            </div>
          </div>

          <div className="category-options-list">
            {AVAILABLE_CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`category-option-row ${isChecked ? "is-checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.id)}
                    className="category-checkbox"
                  />
                  <span className="option-icon" aria-hidden="true">
                    {cat.renderIcon(16)}
                  </span>
                  <div className="option-text">
                    <span className="option-title">{cat.label}</span>
                    <span className="option-desc">{cat.description}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="dropdown-footer-actions">
            <button
              type="button"
              onClick={selectAll}
              className="action-btn text-btn"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => resetToSingle("Online")}
              className="action-btn text-btn"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="action-btn done-btn"
            >
              Done ({selectedCategories.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
