// API client for the zero-PII recommendation endpoint.
// ---------------------------------------------------------------------------
// Sends EXACTLY the three allowed fields. The backend runs a strict allowlist
// and rejects any other key with 400, so never spread extra state into body.
// ---------------------------------------------------------------------------

import type {
  RecommendationInput,
  RecommendationsResponse,
} from "./types.ts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

/** A message already written for the person reading it, plus a retry hint. */
export class ApiError extends Error {}

export async function fetchRecommendations(
  input: RecommendationInput,
  signal: AbortSignal,
): Promise<RecommendationsResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Exactly three fields — see the allowlist note above.
      body: JSON.stringify({
        monthlySpend: input.monthlySpend,
        topCategory: input.topCategory,
        annualIncome: input.annualIncome,
      }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(
      `Can't reach the recommendation API at ${API_BASE_URL}. Start the backend, then move a slider to retry.`,
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
