import { CACHE_TTL_MS } from "../config";
import {
  DEFAULT_PREFERENCES,
  type AnalysisResult,
  type HistoryEntry,
  type Preferences,
  type UserFeedback
} from "../scoring/types";

interface CachedResult {
  savedAt: number;
  result: AnalysisResult;
}

const RESULT_PREFIX = "result:";
const FEEDBACK_PREFIX = "feedback:";
const HISTORY_KEY = "history";
const PREFS_KEY = "preferences";
const HISTORY_LIMIT = 25;

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

export async function getHistory(): Promise<HistoryEntry[]> {
  const stored = (await chrome.storage.local.get(HISTORY_KEY)) as {
    history?: HistoryEntry[];
  };
  return stored.history ?? [];
}

export async function appendHistory(result: AnalysisResult): Promise<void> {
  if (!result.hostname) return;
  const entry: HistoryEntry = {
    id: `${Date.now()}-${result.hostname}`,
    hostname: result.hostname,
    domain: result.domain,
    score: result.score,
    riskLevel: result.riskLevel,
    checkedAt: result.checkedAt
  };
  const existing = await getHistory();
  // De-duplicate by hostname so re-checks move the entry to the top.
  const deduped = existing.filter((item) => item.hostname !== entry.hostname);
  const next = [entry, ...deduped].slice(0, HISTORY_LIMIT);
  await chrome.storage.local.set({ [HISTORY_KEY]: next });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(HISTORY_KEY);
}

export async function getPreferences(): Promise<Preferences> {
  const stored = (await chrome.storage.local.get(PREFS_KEY)) as {
    preferences?: Partial<Preferences>;
  };
  return { ...DEFAULT_PREFERENCES, ...stored.preferences };
}

export async function setPreferences(prefs: Preferences): Promise<void> {
  await chrome.storage.local.set({ [PREFS_KEY]: prefs });
}
