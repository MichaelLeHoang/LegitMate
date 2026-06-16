import type { AnalysisResult, UserFeedback } from "./scoring/types";

export const MessageType = {
  CheckActiveTab: "CHECK_ACTIVE_TAB",
  GetCachedResult: "GET_CACHED_RESULT",
  CollectPageSignals: "COLLECT_PAGE_SIGNALS",
  ReportSite: "REPORT_SITE"
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

export type ExtensionRequest =
  | CheckActiveTabMessage
  | GetCachedResultMessage
  | CollectPageSignalsMessage
  | ReportSiteMessage;

export type ExtensionResponse =
  | { ok: true; result: AnalysisResult | null }
  | { ok: true; reportId: string }
  | { ok: false; error: string };
