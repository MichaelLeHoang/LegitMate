import { analyzeDomain } from "../api/client";
import { MessageType, type ExtensionRequest, type ExtensionResponse } from "../messages";
import { buildAnalysisResult } from "../scoring/scoring";
import type { AnalysisResult, DomainAnalysisResponse, PageSignalSummary } from "../scoring/types";
import { analyzeUrl } from "../scoring/urlFeatures";
import { getCachedResult, saveFeedback, setCachedResult } from "../storage/cache";

chrome.runtime.onMessage.addListener((message: ExtensionRequest, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error: unknown) => {
      sendResponse({ ok: false, error: error instanceof Error ? error.message : "Unexpected error" });
    });
  return true;
});

async function handleMessage(message: ExtensionRequest): Promise<ExtensionResponse> {
  switch (message.type) {
    case MessageType.CheckActiveTab:
      return { ok: true, result: await checkActiveTab() };
    case MessageType.GetCachedResult:
      return { ok: true, result: await getCachedResultForActiveTab() };
    case MessageType.ReportSite: {
      const reportId = await saveFeedback(message.payload);
      return { ok: true, reportId };
    }
    default:
      return { ok: false, error: "Unsupported message." };
  }
}

async function checkActiveTab(): Promise<AnalysisResult> {
  const tab = await getActiveTab();
  const checkedUrl = tab.url ?? "";
  const urlAnalysis = analyzeUrl(checkedUrl);

  const [pageSignals, domainOutcome] = await Promise.all([
    tab.id && urlAnalysis.hostname ? collectPageSignals(tab.id) : Promise.resolve(null),
    urlAnalysis.domain ? fetchDomainAnalysis(urlAnalysis.domain) : Promise.resolve({ data: null, error: null })
  ]);

  const result = buildAnalysisResult(urlAnalysis, pageSignals, domainOutcome.data, domainOutcome.error);
  await setCachedResult(result);
  await updateBadge(tab.id, result);
  return result;
}

async function getCachedResultForActiveTab(): Promise<AnalysisResult | null> {
  const tab = await getActiveTab();
  if (!tab.url) return null;
  const urlAnalysis = analyzeUrl(tab.url);
  if (!urlAnalysis.hostname) return null;
  return getCachedResult(urlAnalysis.hostname);
}

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error("No active tab found.");
  return tab;
}

async function collectPageSignals(tabId: number): Promise<PageSignalSummary | null> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content/pageSignals.js"]
    });
    return await chrome.tabs.sendMessage(tabId, { type: MessageType.CollectPageSignals });
  } catch {
    return null;
  }
}

async function fetchDomainAnalysis(
  domain: string
): Promise<{ data: DomainAnalysisResponse | null; error: string | null }> {
  try {
    return { data: await analyzeDomain(domain), error: null };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { data: null, error: "request timed out" };
    }
    return { data: null, error: error instanceof Error ? error.message : "request failed" };
  }
}

async function updateBadge(tabId: number | undefined, result: AnalysisResult): Promise<void> {
  if (!tabId) return;
  const badgeTextByRisk = {
    low: "LOW",
    medium: "MED",
    high: "HIGH",
    unknown: "?"
  } satisfies Record<AnalysisResult["riskLevel"], string>;

  const badgeColorByRisk = {
    low: "#1f8f4d",
    medium: "#9a6700",
    high: "#b42318",
    unknown: "#667085"
  } satisfies Record<AnalysisResult["riskLevel"], string>;

  await chrome.action.setBadgeText({ tabId, text: badgeTextByRisk[result.riskLevel] });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: badgeColorByRisk[result.riskLevel] });
}
