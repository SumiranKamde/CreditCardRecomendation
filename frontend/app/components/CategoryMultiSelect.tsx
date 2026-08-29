"use client";

import React from "react";
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
    label: "Fuel & EV",
    description: "Petrol, diesel, CNG & EV charging",
    renderIcon: (size = 16) => <FuelIcon size={size} />,
  },
  {
    id: "Shopping",
    label: "Shopping",
    description: "Amazon, Flipkart, retail malls",
    renderIcon: (size = 16) => <ShoppingIcon size={size} />,
  },
  {
    id: "Dining",
    label: "Dining & Food",
    description: "Swiggy, Zomato, cafes & restaurants",
    renderIcon: (size = 16) => <DiningIcon size={size} />,
  },
  {
    id: "Travel",
    label: "Travel & Flights",
    description: "Flights, hotels, IRCTC & cabs",
    renderIcon: (size = 16) => <TravelIcon size={size} />,
  },
  {
    id: "Online",
    label: "Online & Subs",
    description: "E-commerce & digital subscriptions",
    renderIcon: (size = 16) => <OnlineIcon size={size} />,
  },
  {
    id: "Grocery",
    label: "Grocery",
    description: "Zepto, Blinkit, Instamart & marts",
    renderIcon: (size = 16) => <GroceryIcon size={size} />,
  },
  {
    id: "Utilities",
    label: "Bills & Recharges",
    description: "Electricity, mobile bills & wifi",
    renderIcon: (size = 16) => <UtilitiesIcon size={size} />,
  },
  {
    id: "Other",
    label: "Other Spends",
    description: "General retail & offline POS",
    renderIcon: (size = 16) => <OtherIcon size={size} />,
  },
];

export const CATEGORY_COMBOS = [
  { label: "Fuel + Shopping", categories: ["Fuel", "Shopping"] },
  { label: "Dining + Travel", categories: ["Dining", "Travel"] },
  { label: "Online + Grocery", categories: ["Online", "Grocery"] },
  { label: "All Spends", categories: AVAILABLE_CATEGORIES.map((c) => c.id) },
];

interface CategoryMultiSelectProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export default function CategoryMultiSelect({
  selectedCategories,
  onChange,
}: CategoryMultiSelectProps) {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Don't allow 0 categories selected (keep at least 1)
      if (selectedCategories.length > 1) {
        onChange(selectedCategories.filter((id) => id !== categoryId));
      }
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const selectAll = () => {
    onChange(AVAILABLE_CATEGORIES.map((c) => c.id));
  };

  const selectCombo = (categories: string[]) => {
    onChange(categories);
  };

  return (
    <div className="category-selection-block" aria-label="Select spending categories">
      {/* Header Info */}
      <div className="category-header-row">
        <div className="category-label-wrap">
          <label className="category-main-title">Select Spending Categories</label>
          <span className="category-help-text">Tap to select your top spend areas</span>
        </div>

        <div className="category-header-actions">
          <button
            type="button"
            className="category-quick-btn"
            onClick={
              selectedCategories.length === AVAILABLE_CATEGORIES.length
                ? () => onChange(["Online"])
                : selectAll
            }
          >
            {selectedCategories.length === AVAILABLE_CATEGORIES.length
              ? "Reset to 1"
              : "Select All (8)"}
          </button>
          <span className="category-active-counter">
            {selectedCategories.length} Active
          </span>
        </div>
      </div>

      {/* Quick Combos Row */}
      <div className="category-combos-scroll" aria-label="Quick category presets">
        {CATEGORY_COMBOS.map((combo) => {
          const isActive =
            combo.categories.length === selectedCategories.length &&
            combo.categories.every((c) => selectedCategories.includes(c));
          return (
            <button
              key={combo.label}
              type="button"
              className={`combo-pill-btn ${isActive ? "is-active" : ""}`}
              onClick={() => selectCombo(combo.categories)}
            >
              {combo.label}
            </button>
          );
        })}
      </div>

      {/* 1-Tap Direct Visual Category Grid */}
      <div className="category-direct-grid" role="group" aria-label="Categories">
        {AVAILABLE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              className={`category-tile-btn ${isSelected ? "is-selected" : ""}`}
              onClick={() => toggleCategory(cat.id)}
            >
              <div className="category-tile-icon-wrap">
                {cat.renderIcon(18)}
              </div>
              <div className="category-tile-info">
                <span className="category-tile-title">{cat.label}</span>
                <span className="category-tile-desc">{cat.description}</span>
              </div>
              <div className="category-tile-check" aria-hidden="true">
                {isSelected ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="check-empty-circle" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
