import { API_BASE_URL, CHECK_TIMEOUT_MS } from "../config";
import type { DomainAnalysisResponse, ReportSubmissionResponse, UserFeedback } from "../scoring/types";

export async function analyzeDomain(domain: string): Promise<DomainAnalysisResponse> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/v1/analyze/domain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        domain,
        clientVersion: chrome.runtime.getManifest().version
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as DomainAnalysisResponse;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export async function submitReport(feedback: UserFeedback): Promise<ReportSubmissionResponse> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/v1/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(feedback),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as ReportSubmissionResponse;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}
