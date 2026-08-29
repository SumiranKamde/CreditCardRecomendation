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

  // Attempt 1: If an external API is configured, try it with a 2.5s fast-fallback timeout
  if (hasExternalApi) {
    try {
      const timeoutCtrl = new AbortController();
      const onParentAbort = () => timeoutCtrl.abort();
      signal.addEventListener("abort", onParentAbort);
      const timeoutId = setTimeout(() => timeoutCtrl.abort(), 2500); // 2.5s max wait for external server

      try {
        const res = await fetch(`${API_BASE_URL}/api/recommendations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: timeoutCtrl.signal,
        });
        clearTimeout(timeoutId);
        signal.removeEventListener("abort", onParentAbort);
        if (res.ok) {
          response = res;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        signal.removeEventListener("abort", onParentAbort);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        // Fast fallback to built-in route if external backend is sleeping/cold-starting
      }
    } catch (primaryErr) {
      if (primaryErr instanceof DOMException && primaryErr.name === "AbortError" && signal.aborted) {
        throw primaryErr;
      }
    }
  }

  // Attempt 2: Use the built-in Next.js serverless route (instant 30ms response on Vercel)
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
        `Unable to reach the recommendation engine. Please try again in a few moments.`,
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
