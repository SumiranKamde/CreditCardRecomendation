// API client for the zero-PII recommendation endpoint.
// ---------------------------------------------------------------------------
// Sends ONLY allowed anonymous fields. The backend runs an allowlist gate.
// ---------------------------------------------------------------------------

import type {
  RecommendationInput,
  RecommendationsResponse,
} from "./types.ts";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const API_DISPLAY_URL = API_BASE_URL || "the local API proxy";

export class ApiError extends Error {}

export async function fetchRecommendations(
  input: RecommendationInput,
  signal: AbortSignal,
): Promise<RecommendationsResponse> {
  let response: Response;

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

  try {
    response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(
      `Can't reach the recommendation API at ${API_DISPLAY_URL}. Start the backend, then move a slider to retry.`,
    );
  }

  if (response.status === 429) {
    throw new ApiError(
      "Too many requests in the last minute. Wait a few seconds, then move a slider to retry.",
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `The API rejected this request (${response.status}). Adjust the inputs and try again.`,
    );
  }

  return (await response.json()) as RecommendationsResponse;
}
