import { CACHE_TTL_MS } from "../config";
import type { AnalysisResult, UserFeedback } from "../scoring/types";

interface CachedResult {
  savedAt: number;
  result: AnalysisResult;
}

const RESULT_PREFIX = "result:";
const FEEDBACK_PREFIX = "feedback:";

export async function getCachedResult(hostname: string): Promise<AnalysisResult | null> {
  const key = `${RESULT_PREFIX}${hostname}`;
  const stored = (await chrome.storage.session.get(key)) as Record<string, CachedResult | undefined>;
  const cached = stored[key];
  if (!cached) return null;
  if (Date.now() - cached.savedAt > CACHE_TTL_MS) {
    await chrome.storage.session.remove(key);
    return null;
  }
  return cached.result;
}

export async function setCachedResult(result: AnalysisResult): Promise<void> {
  if (!result.hostname) return;
  await chrome.storage.session.set({
    [`${RESULT_PREFIX}${result.hostname}`]: {
      savedAt: Date.now(),
      result
    } satisfies CachedResult
  });
}

export async function saveFeedback(feedback: UserFeedback): Promise<string> {
  const reportId = `${Date.now()}-${crypto.randomUUID()}`;
  await chrome.storage.local.set({
    [`${FEEDBACK_PREFIX}${reportId}`]: {
      savedAt: Date.now(),
      feedback
    }
  });
  return reportId;
}
