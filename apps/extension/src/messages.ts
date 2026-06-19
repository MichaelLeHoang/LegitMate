import type { AnalysisResult, HistoryEntry, Preferences, UserFeedback } from "./scoring/types";

export const MessageType = {
  CheckActiveTab: "CHECK_ACTIVE_TAB",
  GetCachedResult: "GET_CACHED_RESULT",
  CollectPageSignals: "COLLECT_PAGE_SIGNALS",
  ReportSite: "REPORT_SITE",
  GetHistory: "GET_HISTORY",
  ClearHistory: "CLEAR_HISTORY",
  GetPreferences: "GET_PREFERENCES",
  SetPreferences: "SET_PREFERENCES"
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface CheckActiveTabMessage {
  type: typeof MessageType.CheckActiveTab;
}

export interface GetCachedResultMessage {
  type: typeof MessageType.GetCachedResult;
}

export interface CollectPageSignalsMessage {
  type: typeof MessageType.CollectPageSignals;
}

export interface ReportSiteMessage {
  type: typeof MessageType.ReportSite;
  payload: UserFeedback;
}

export interface GetHistoryMessage {
  type: typeof MessageType.GetHistory;
}

export interface ClearHistoryMessage {
  type: typeof MessageType.ClearHistory;
}

export interface GetPreferencesMessage {
  type: typeof MessageType.GetPreferences;
}

export interface SetPreferencesMessage {
  type: typeof MessageType.SetPreferences;
  payload: Preferences;
}

export type ExtensionRequest =
  | CheckActiveTabMessage
  | GetCachedResultMessage
  | CollectPageSignalsMessage
  | ReportSiteMessage
  | GetHistoryMessage
  | ClearHistoryMessage
  | GetPreferencesMessage
  | SetPreferencesMessage;

export type ExtensionResponse =
  | { ok: true; result: AnalysisResult | null }
  | { ok: true; reportId: string }
  | { ok: true; history: HistoryEntry[] }
  | { ok: true; prefs: Preferences }
  | { ok: true }
  | { ok: false; error: string };
