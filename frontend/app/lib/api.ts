// API client for the zero-PII recommendation endpoint.
// ---------------------------------------------------------------------------
// Sends ONLY allowed anonymous fields. The backend runs an allowlist gate.
// ---------------------------------------------------------------------------

import type {
  RecommendationInput,
  RecommendationsResponse,
} from "./types.ts";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

export class ApiError extends Error {}

export async function fetchRecommendations(
  input: RecommendationInput,
  signal: AbortSignal,
): Promise<RecommendationsResponse> {
  let response: Response | null = null;

  const payload: Record<string, unknown> = {
    monthlySpend: input.monthlySpend,
    annualIncome: input.annualIncome,
  };

  if (input.selectedCategories && input.selectedCategories.length > 0) {
    payload.selectedCategories = input.selectedCategories;
    payload.topCategory = input.selectedCategories.join(", ");
  } else if (input.topCategory) {
    payload.topCategory = input.topCategory;
  }

  const hasExternalApi = API_BASE_URL !== "http://localhost:4000";

  // Attempt 1: If an external API is configured, try it first
  if (hasExternalApi) {
    try {
      response = await fetch(`${API_BASE_URL}/api/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });
    } catch (primaryErr) {
      if (primaryErr instanceof DOMException && primaryErr.name === "AbortError") throw primaryErr;
      // Fall through to built-in route
    }
  }

  // Attempt 2: Use the built-in Next.js serverless route (always available on Vercel)
  if (!response) {
    try {
      response = await fetch(`/api/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });
    } catch (fallbackErr) {
      if (fallbackErr instanceof DOMException && fallbackErr.name === "AbortError") throw fallbackErr;
      throw new ApiError(
        `Unable to reach the recommendation API. Please try again later.`,
      );
    }
  }

  if (!response) {
    throw new ApiError("No response received from the recommendation server.");
  }

  if (response.status === 429) {
    throw new ApiError(
      "Too many requests in the last minute. Wait a few seconds, then adjust a slider to retry.",
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `The API rejected this request (${response.status}). Adjust the inputs and try again.`,
    );
  }

  return (await response.json()) as RecommendationsResponse;
}
