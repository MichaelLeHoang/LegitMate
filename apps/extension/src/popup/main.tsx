import React from "react";
import { createRoot } from "react-dom/client";
import {
  AlertOctagon,
  Check,
  ChevronRight,
  Clipboard,
  Globe,
  History as HistoryIcon,
  Home,
  Info,
  RefreshCw,
  Send,
  Settings as SettingsIcon,
  ShieldAlert,
  ThumbsUp
} from "lucide-react";
import { MessageType, type ExtensionResponse } from "../messages";
import {
  getReportDestinations,
  getRoutingDecision,
  REPORT_REGIONS,
  type ReportDestination
} from "../reporting/reportRouting";
import {
  DEFAULT_PREFERENCES,
  type AnalysisResult,
  type HistoryEntry,
  type Preferences,
  type ReportRoutingDecision,
  type ScamType,
  type UserFeedback
} from "../scoring/types";
import MascotEgg from "./MascotEgg";
import { eggView, ratingFromRisk, severityDotClass, toneFor } from "./eggRating";
import "./styles.css";

type Tab = "home" | "history" | "report" | "settings";

const SCAM_TYPES: Array<{ value: ScamType; label: string }> = [
  { value: "phishing", label: "Phishing login page" },
  { value: "fake_shop", label: "Fake storefront / shopping scam" },
  { value: "crypto", label: "Investment / get-rich-quick" },
  { value: "impersonation", label: "Brand copycat / typosquatting" },
  { value: "other", label: "Other malicious / scam link" }
];

interface PendingReport {
  feedback: UserFeedback;
  destinations: ReportDestination[];
  routingDecision: ReportRoutingDecision;
}

function Popup() {
  const [activeTab, setActiveTab] = React.useState<Tab>("home");
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [prefs, setPrefs] = React.useState<Preferences>(DEFAULT_PREFERENCES);

  const [reportUrl, setReportUrl] = React.useState("");
  const [reportType, setReportType] = React.useState<ScamType>("phishing");
  const [reportSuccess, setReportSuccess] = React.useState(false);
  const [pendingReport, setPendingReport] = React.useState<PendingReport | null>(null);

  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toast = React.useCallback((message: string) => {
    setNotification(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  const refreshHistory = React.useCallback(async () => {
    const response = await sendMessage({ type: MessageType.GetHistory });
    if (response.ok && "history" in response) setHistory(response.history);
  }, []);

  const runScan = React.useCallback(async () => {
    setIsScanning(true);
    setError(null);
    try {
      const response = await sendMessage({ type: MessageType.CheckActiveTab });
      if (!response.ok) throw new Error(response.error);
      if (!("result" in response)) throw new Error("Unexpected check response.");
      setResult(response.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check this site.");
    } finally {
      setIsScanning(false);
      void refreshHistory();
    }
  }, [refreshHistory]);

  // Initial load: preferences, cached result, history; optionally auto-scan.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const prefsResponse = await sendMessage({ type: MessageType.GetPreferences });
      const loadedPrefs =
        prefsResponse.ok && "prefs" in prefsResponse ? prefsResponse.prefs : DEFAULT_PREFERENCES;
      if (cancelled) return;
      setPrefs(loadedPrefs);

      const cached = await sendMessage({ type: MessageType.GetCachedResult });
      if (cancelled) return;
      if (cached.ok && "result" in cached) setResult(cached.result);

      void refreshHistory();

      if (loadedPrefs.autoScanOnOpen) void runScan();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markTrusted() {
    if (!result) return;
    const response = await sendMessage({
      type: MessageType.ReportSite,
      payload: { domain: result.domain, url: result.checkedUrl, verdict: "safe", result }
    });
    toast(response.ok ? "Marked as trusted. Saved locally." : "Could not save feedback.");
  }

  async function copyReport() {
    if (!result) return;
    const view = eggView(result, false);
    const lines = [
      `LegitMate report for ${result.hostname ?? result.checkedUrl}`,
      `${view.label} — ${view.statusText} (risk score ${result.score}/100, ${result.confidence} confidence)`,
      `Mode: ${result.mode === "local-and-cloud" ? "local + cloud" : "local only"}`,
      "",
      "Reasons:",
      ...result.reasons.map((reason) => `- ${reason.title}: ${reason.description}`),
      ...(result.warnings.length ? ["", ...result.warnings.map((w) => `Warning: ${w}`)] : [])
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast("Report copied to clipboard.");
    } catch {
      toast("Could not copy report.");
    }
  }

  async function submitReport(event: React.FormEvent) {
    event.preventDefault();
    if (!reportUrl.trim()) return;
    const url = reportUrl.trim();
    const matchingResult = result?.hostname && url.includes(result.hostname) ? result : null;
    const routingDecision = getRoutingDecision(matchingResult);
    const destinations = getReportDestinations(prefs.reportRegion, reportType);
    const feedback: UserFeedback = {
      domain: null,
      url,
      verdict: "unsafe",
      scamType: reportType,
      region: prefs.reportRegion,
      routingDecision,
      destinationIds: destinations.map((destination) => destination.id),
      // Attach the current scan only when it matches the reported URL.
      result: matchingResult
    };
    setPendingReport({ feedback, destinations, routingDecision });
  }

  async function confirmReport() {
    if (!pendingReport) return;
    const response = await sendMessage({ type: MessageType.ReportSite, payload: pendingReport.feedback });
    if (response.ok) {
      setReportSuccess(true);
      setReportUrl("");
      if ("queued" in response && response.queued) {
        toast("Report submitted to LegitMate review.");
      } else {
        toast("Report saved locally. Central queue unavailable.");
      }
      setPendingReport(null);
      setTimeout(() => setReportSuccess(false), 3000);
    } else {
      toast("Could not file report.");
    }
  }

  async function clearHistory() {
    await sendMessage({ type: MessageType.ClearHistory });
    setHistory([]);
    toast("History cleared.");
  }

  async function updatePref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await sendMessage({ type: MessageType.SetPreferences, payload: next });
  }

  const view = eggView(result, isScanning);
  const ringTrust = view.trustScore ?? (isScanning ? 33 : 0);

  return (
    <div
      className={`w-[360px] h-[560px] bg-bg-warm overflow-hidden flex flex-col font-sans relative ${
        prefs.reduceMotion ? "lm-reduce-motion" : ""
      }`}
    >
      {notification && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-brand-dark text-white text-xs px-3 py-2 rounded-full shadow-lg border border-brand-border flex items-center gap-1.5 animate-bounce-subtle">
          <Check size={12} className="text-brand-yellow" />
          <span>{notification}</span>
        </div>
      )}

      {pendingReport && (
        <ReportConfirmationModal
          pendingReport={pendingReport}
          result={pendingReport.feedback.result}
          onCancel={() => setPendingReport(null)}
          onConfirm={confirmReport}
        />
      )}

      {/* Header */}
      <header className="bg-brand-white border-b-2 border-brand-border p-3.5 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-9 overflow-visible bg-bg-warm rounded-lg flex items-center justify-center p-0.5 border border-brand-border">
            <MascotEgg rating={view.rating} size={28} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-brand-dark text-sm tracking-tight leading-none">
                LegitMate
              </span>
              <span className="text-[9px] font-bold bg-brand-orange/20 text-brand-deep px-1 rounded-sm uppercase">
                v0.1
              </span>
            </div>
            <span className="text-[10px] font-semibold text-brand-dark/60 block mt-0.5">
              Det-Egg-Tive Mate Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyReport}
            disabled={!result}
            className="p-1.5 rounded-lg hover:bg-bg-warm transition-colors text-brand-dark/50 disabled:opacity-40 cursor-pointer"
            title="Copy report"
          >
            <Clipboard size={16} />
          </button>
          <button
            onClick={() => setActiveTab(activeTab === "settings" ? "home" : "settings")}
            className={`p-1.5 rounded-lg hover:bg-bg-warm transition-colors cursor-pointer ${
              activeTab === "settings" ? "text-brand-orange bg-bg-warm" : "text-brand-dark/50"
            }`}
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 pb-16">
        {activeTab === "home" && (
          <>
            {error && (
              <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs rounded-xl p-2.5 leading-snug">
                {error}
              </div>
            )}

            {/* Current site card */}
            <div className="bg-brand-white p-3 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-bg-warm border border-brand-border flex items-center justify-center shrink-0">
                  <Globe size={14} className="text-brand-orange" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-brand-dark/40 tracking-wider">
                    Active Tab
                  </span>
                  <div className="text-xs font-semibold text-brand-dark font-mono truncate max-w-[150px]">
                    {isScanning ? "checking…" : result?.hostname ?? "unsupported page"}
                  </div>
                </div>
              </div>
              <div
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-2xs shrink-0 ${view.badgeBg}`}
              >
                {view.badgeText}
              </div>
            </div>

            {/* Mascot + trust score ring */}
            <div className="bg-brand-white p-4 rounded-2xl border-2 border-brand-border shadow-xs flex flex-col items-center text-center relative overflow-visible">
              <div className="absolute top-1 right-2 text-[10px] font-bold text-brand-dark/30 font-mono">
                {result ? (result.mode === "local-and-cloud" ? "local + cloud" : "local only") : ""}
              </div>

              <div className="flex flex-col items-center py-2 bg-gradient-to-b from-brand-white to-bg-warm/35 rounded-2xl w-full">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="46" fill="none" stroke="#F3D9A4" strokeWidth="6" />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      fill="none"
                      stroke={view.accent}
                      strokeWidth="6"
                      strokeDasharray={`${ringTrust * 2.89} 289`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-visible">
                    <MascotEgg rating={view.rating} size={54} />
                    <span className="text-[10px] font-black font-mono leading-none mt-1 text-brand-dark">
                      {view.trustScore ?? "--"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-center w-full">
                  <div className={`text-sm font-black uppercase tracking-wider ${view.toneClass}`}>
                    {view.label}
                  </div>
                  <div className="text-[10px] text-brand-dark/75 mt-1 font-semibold px-2">
                    Verdict: <span className="font-bold">{view.statusText}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-brand-dark/75 mt-2 max-w-[280px] leading-relaxed px-2">
                {view.description}
              </p>
            </div>

            {/* Warnings (graceful-degradation notices) */}
            {result?.warnings.length ? (
              <div className="bg-brand-yellow/15 border border-brand-yellow/60 rounded-xl p-2.5 flex flex-col gap-1">
                {result.warnings.map((warning) => (
                  <span key={warning} className="text-[11px] text-brand-deep font-semibold leading-snug">
                    ⚠ {warning}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Detective log (reasons) */}
            <div className="bg-brand-white p-3 rounded-xl border border-brand-border shadow-xs">
              <h4 className="text-[11px] font-bold text-brand-dark/50 uppercase tracking-wider mb-2 flex items-center gap-1 justify-between">
                <span>Det-egg-tive Log</span>
                {!isScanning && result && (
                  <span className="text-[10px] font-mono lowercase normal-case text-brand-orange font-bold">
                    {result.confidence} confidence
                  </span>
                )}
              </h4>

              <ul className="flex flex-col gap-2">
                {isScanning ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <li key={i} className="flex gap-2 items-start animate-pulse">
                      <div className="w-3.5 h-3.5 rounded-full bg-bg-warm shrink-0 mt-0.5" />
                      <div className="h-3 bg-bg-warm rounded w-full" />
                    </li>
                  ))
                ) : result && result.reasons.length > 0 ? (
                  result.reasons.slice(0, 8).map((reason) => (
                    <li
                      key={`${reason.source}-${reason.id}`}
                      className="flex gap-2 items-start text-xs text-brand-dark/85"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${severityDotClass(
                          reason.severity
                        )}`}
                      />
                      <span className="leading-tight">
                        <span className="font-bold">{reason.title}.</span> {reason.description}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-brand-dark/50 italic text-center py-2">
                    No strong risk signals — limited evidence, not a guarantee.
                  </li>
                )}
              </ul>
            </div>

            {/* Primary actions */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={runScan}
                disabled={isScanning}
                className="bg-brand-white hover:bg-bg-warm active:scale-95 text-brand-dark font-display font-bold text-xs py-2 px-3 rounded-lg border-2 border-brand-border shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isScanning ? "animate-spin" : ""} />
                Scan Again
              </button>
              <button
                onClick={() => result?.domain && openExternalScan(result.domain)}
                disabled={!result?.domain}
                className="bg-brand-orange hover:bg-brand-deep active:scale-95 text-white font-display font-bold text-xs py-2 px-3 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Info size={12} />
                Full Report
              </button>
            </div>

            {/* Secondary actions */}
            <div className="flex items-center justify-between border-t border-brand-border/60 pt-3 mt-1 px-1">
              <button
                onClick={markTrusted}
                disabled={!result}
                className="text-[11px] font-bold text-brand-green hover:text-brand-green/80 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
              >
                <ThumbsUp size={12} />
                Mark as Trusted
              </button>
              <button
                onClick={() => {
                  setReportUrl(result?.checkedUrl ?? "");
                  setActiveTab("report");
                }}
                className="text-[11px] font-bold text-brand-red hover:text-brand-red/85 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldAlert size={12} />
                Report Scam
              </button>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-brand-dark">Scan History</h3>
              <button
                onClick={clearHistory}
                disabled={history.length === 0}
                className="text-[10px] font-bold text-brand-dark/40 hover:text-brand-red transition-colors cursor-pointer disabled:opacity-40"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="text-center py-12 text-brand-dark/40">
                  <HistoryIcon size={24} className="mx-auto opacity-35 mb-2" />
                  <p className="text-xs">No scans saved yet.</p>
                </div>
              ) : (
                history.map((item) => {
                  const tone = toneFor(ratingFromRisk(item.riskLevel, item.score));
                  const trust = Math.max(0, Math.min(100, 100 - item.score));
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.domain && openExternalScan(item.domain)}
                      className="bg-brand-white p-2.5 rounded-xl border border-brand-border hover:border-brand-orange hover:bg-bg-warm/35 transition-all text-left flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-semibold text-brand-dark truncate">
                          {item.hostname}
                        </div>
                        <span className="text-[10px] text-brand-dark/40 block mt-0.5">
                          {formatRelative(item.checkedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${tone.toneClass}`}
                        >
                          {trust} pts
                        </span>
                        <ChevronRight
                          size={12}
                          className="text-brand-dark/30 group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <h3 className="font-display font-bold text-sm text-brand-dark">Report suspicious site</h3>
              <p className="text-xs text-brand-dark/60 mt-1">
                Send a report to LegitMate review with region context for follow-up.
              </p>
            </div>

            {reportSuccess ? (
              <div className="bg-brand-white p-6 rounded-xl border border-brand-border text-center flex flex-col items-center gap-3 animate-pulse-slow">
                <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-dark">Report filed</h4>
                  <p className="text-xs text-brand-dark/60 mt-1">Thanks for helping other good eggs!</p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={submitReport}
                className="bg-brand-white p-4 rounded-xl border border-brand-border flex flex-col gap-3"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase text-brand-dark/50 tracking-wider block mb-1">
                    Suspect website URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dodgy-deal-payout.info"
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-brand-border bg-bg-warm/30 focus:outline-none focus:border-brand-orange focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-brand-dark/50 tracking-wider block mb-1">
                    Scam type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ScamType)}
                    className="w-full text-xs p-2 rounded-lg border border-brand-border bg-bg-warm/30 focus:outline-none focus:border-brand-orange focus:bg-white"
                  >
                    {SCAM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-brand-dark/50 tracking-wider block mb-1">
                    Report region
                  </label>
                  <select
                    value={prefs.reportRegion}
                    onChange={(e) => updatePref("reportRegion", e.target.value as Preferences["reportRegion"])}
                    className="w-full text-xs p-2 rounded-lg border border-brand-border bg-bg-warm/30 focus:outline-none focus:border-brand-orange focus:bg-white"
                  >
                    {Object.entries(REPORT_REGIONS).map(([region, label]) => (
                      <option key={region} value={region}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-deep w-full text-white text-xs font-display font-bold py-2 rounded-lg mt-1 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send size={11} />
                  Review report
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm text-brand-dark">Preferences</h3>

            <div className="bg-brand-white p-3.5 rounded-xl border border-brand-border flex flex-col gap-3.5">
              <ToggleRow
                title="Auto-scan on open"
                description="Check the active tab automatically when the popup opens"
                checked={prefs.autoScanOnOpen}
                onChange={(v) => updatePref("autoScanOnOpen", v)}
              />
              <ToggleRow
                title="Toolbar badge"
                description="Show LOW / MED / HIGH on the extension icon"
                checked={prefs.showBadge}
                onChange={(v) => updatePref("showBadge", v)}
                divider
              />
              <ToggleRow
                title="Reduce motion"
                description="Turn off popup animations"
                checked={prefs.reduceMotion}
                onChange={(v) => updatePref("reduceMotion", v)}
                divider
              />
              <div className="border-t border-brand-border/40 pt-3">
                <label className="text-xs font-bold text-brand-dark block mb-1">Report region</label>
                <select
                  value={prefs.reportRegion}
                  onChange={(e) => updatePref("reportRegion", e.target.value as Preferences["reportRegion"])}
                  className="w-full text-xs p-2 rounded-lg border border-brand-border bg-bg-warm/30 focus:outline-none focus:border-brand-orange focus:bg-white"
                >
                  {Object.entries(REPORT_REGIONS).map(([region, label]) => (
                    <option key={region} value={region}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-brand-dark/50 block mt-1">
                  Used to recommend official scam-reporting destinations. No location permission is requested.
                </span>
              </div>
            </div>

            <div className="bg-brand-white p-3 rounded-lg border border-brand-border text-[10px] text-brand-dark/60 leading-relaxed">
              <p className="font-bold text-brand-dark/70 mb-1">Privacy</p>
              Only the registrable domain of the active tab is ever sent to the reputation service —
              never full URLs, paths, or browsing history.
            </div>

            <div className="bg-brand-white p-2.5 rounded-lg border border-brand-border text-center text-[10px] font-mono text-brand-dark/40 uppercase">
              LegitMate v0.1.0
            </div>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <footer className="absolute bottom-0 left-0 right-0 h-14 bg-brand-white border-t-2 border-brand-border flex items-center justify-around z-10 p-0.5 shrink-0">
        <NavButton icon={<Home size={18} />} label="Shield" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
        <NavButton icon={<HistoryIcon size={18} />} label="History" active={activeTab === "history"} onClick={() => setActiveTab("history")} />
        <NavButton icon={<AlertOctagon size={18} />} label="Report" active={activeTab === "report"} onClick={() => setActiveTab("report")} />
        <NavButton icon={<SettingsIcon size={18} />} label="Setup" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
      </footer>
    </div>
  );
}

function ReportConfirmationModal({
  pendingReport,
  result,
  onCancel,
  onConfirm
}: {
  pendingReport: PendingReport;
  result: AnalysisResult | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isPriority = pendingReport.routingDecision === "review_priority";
  const topReasons = result?.reasons.slice(0, 3) ?? [];

  return (
    <div className="absolute inset-0 z-40 bg-brand-dark/45 p-4 flex items-center justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-confirm-title"
        className="bg-brand-white w-full max-h-[500px] overflow-y-auto rounded-xl border-2 border-brand-border shadow-2xl p-4 flex flex-col gap-3"
      >
        <div>
          <h3 id="report-confirm-title" className="font-display font-bold text-sm text-brand-dark">
            Confirm report submission
          </h3>
          <p className="text-xs text-brand-dark/60 mt-1 leading-snug">
            LegitMate will collect this report for internal review before any external filing.
          </p>
        </div>

        <div
          className={`rounded-lg border p-2.5 ${
            isPriority ? "bg-brand-red/10 border-brand-red/25" : "bg-brand-yellow/15 border-brand-yellow/50"
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50">
            Review priority
          </div>
          <div className="text-xs font-bold text-brand-dark mt-0.5">
            {isPriority ? "Priority review" : "Standard review"}
          </div>
          <p className="text-[11px] text-brand-dark/65 mt-1 leading-snug">
            {isPriority
              ? "The scan is medium or high risk, so this report will be prioritized in the central review queue."
              : "The scan did not find enough risk signals, so this report will be collected for standard review."}
          </p>
        </div>

        <div className="rounded-lg border border-brand-border p-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50">
            Scan summary
          </div>
          <div className="text-xs font-semibold text-brand-dark mt-0.5">
            {result
              ? `${result.riskLevel.toUpperCase()} risk, score ${result.score}/100`
              : "No matching scan attached"}
          </div>
          {topReasons.length > 0 && (
            <ul className="mt-1.5 flex flex-col gap-1">
              {topReasons.map((reason) => (
                <li key={`${reason.source}-${reason.id}`} className="text-[11px] text-brand-dark/70 leading-snug">
                  {reason.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50">
            Likely destinations after review
          </div>
          {pendingReport.destinations.map((destination) => (
            <div
              key={destination.id}
              className="text-left rounded-lg border border-brand-border bg-bg-warm/35 p-2.5"
            >
              <span className="text-xs font-bold text-brand-dark block">{destination.label}</span>
              <span className="text-[10px] text-brand-dark/55 block mt-0.5">{destination.agency}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="bg-bg-warm hover:bg-brand-border/40 text-brand-dark font-display font-bold text-xs py-2 px-3 rounded-lg border border-brand-border transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-brand-orange hover:bg-brand-deep text-white font-display font-bold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            Submit to review
          </button>
        </div>
      </section>
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
        active ? "text-brand-orange" : "text-brand-dark/40 hover:text-brand-orange/70"
      }`}
    >
      {icon}
      <span className="text-[9px] font-bold mt-0.5">{label}</span>
    </button>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  divider
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  divider?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${divider ? "border-t border-brand-border/40 pt-3" : ""}`}>
      <div className="pr-3">
        <span className="text-xs font-bold text-brand-dark block">{title}</span>
        <span className="text-[10px] text-brand-dark/50 block">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
          checked ? "bg-brand-green" : "bg-brand-dark/20"
        }`}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all shadow-xs ${
            checked ? "right-[3px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function openExternalScan(domain: string) {
  chrome.tabs.create({ url: `https://urlscan.io/search/#domain:${encodeURIComponent(domain)}` });
}

function sendMessage(message: unknown): Promise<ExtensionResponse> {
  return chrome.runtime.sendMessage(message);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
