import React from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, CheckCircle2, Clipboard, ExternalLink, Flag, RefreshCw, ShieldQuestion } from "lucide-react";
import { MessageType, type ExtensionResponse } from "../messages";
import type { AnalysisResult, RiskLevel, UserFeedback } from "../scoring/types";
import "./styles.css";

type ViewState =
  | { status: "loading" }
  | { status: "ready"; result: AnalysisResult | null }
  | { status: "checking"; result: AnalysisResult | null }
  | { status: "error"; message: string; result: AnalysisResult | null };

function Popup() {
  const [state, setState] = React.useState<ViewState>({ status: "loading" });
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    sendMessage({ type: MessageType.GetCachedResult })
      .then((response) => {
        if (!response.ok) throw new Error(response.error);
        if (!("result" in response)) throw new Error("Unexpected cached result response.");
        setState({ status: "ready", result: response.result });
      })
      .catch((error: unknown) => {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not load cached result.",
          result: null
        });
      });
  }, []);

  async function checkSite() {
    const previous = "result" in state ? state.result : null;
    setState({ status: "checking", result: previous });
    setNotice(null);
    try {
      const response = await sendMessage({ type: MessageType.CheckActiveTab });
      if (!response.ok) throw new Error(response.error);
      if (!("result" in response)) throw new Error("Unexpected check response.");
      setState({ status: "ready", result: response.result });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Could not check this site.",
        result: previous
      });
    }
  }

  async function copyReport(result: AnalysisResult) {
    const lines = [
      `LegitMate report for ${result.hostname ?? result.checkedUrl}`,
      `Risk: ${result.riskLevel.toUpperCase()} (${result.score}/100, ${result.confidence} confidence)`,
      "",
      "Reasons:",
      ...result.reasons.map((reason) => `- ${reason.title}: ${reason.description}`),
      result.warnings.length ? "" : null,
      ...result.warnings.map((warning) => `Warning: ${warning}`)
    ].filter((line): line is string => line !== null);

    await navigator.clipboard.writeText(lines.join("\n"));
    setNotice("Report copied.");
  }

  async function report(result: AnalysisResult, verdict: UserFeedback["verdict"]) {
    const response = await sendMessage({
      type: MessageType.ReportSite,
      payload: {
        domain: result.domain,
        url: result.checkedUrl,
        verdict,
        result
      }
    });
    if (!response.ok) {
      setNotice(response.error);
      return;
    }
    if (!("reportId" in response)) {
      setNotice("Unexpected feedback response.");
      return;
    }
    setNotice(`Feedback saved locally: ${response.reportId}`);
  }

  const result = "result" in state ? state.result : null;
  const isChecking = state.status === "checking";

  return (
    <main className="lm-popup">
      <header className="lm-header">
        <div>
          <p className="lm-kicker">LegitMate</p>
          <h1>Website risk</h1>
        </div>
        <RiskIcon riskLevel={result?.riskLevel ?? "unknown"} />
      </header>

      {state.status === "error" ? <div className="lm-alert">{state.message}</div> : null}

      {result ? <RiskSummary result={result} /> : <EmptyState isLoading={state.status === "loading"} />}

      <section className="lm-actions" aria-label="Actions">
        <button className="lm-button lm-button-primary" onClick={checkSite} disabled={isChecking}>
          <RefreshCw size={16} aria-hidden="true" />
          {isChecking ? "Checking" : "Check current site"}
        </button>
        <button className="lm-icon-button" title="Copy safety report" aria-label="Copy safety report" disabled={!result} onClick={() => result && copyReport(result)}>
          <Clipboard size={16} aria-hidden="true" />
        </button>
        <button className="lm-icon-button" title="Open external scan" aria-label="Open external scan" disabled={!result?.domain} onClick={() => result?.domain && openExternalScan(result.domain)}>
          <ExternalLink size={16} aria-hidden="true" />
        </button>
      </section>

      {result ? (
        <section className="lm-feedback" aria-label="Feedback">
          <button onClick={() => report(result, "safe")}>I think this is safe</button>
          <button onClick={() => report(result, "unsafe")}>I think this is unsafe</button>
        </section>
      ) : null}

      {notice ? <p className="lm-notice">{notice}</p> : null}
    </main>
  );
}

function RiskSummary({ result }: { result: AnalysisResult }) {
  return (
    <>
      <section className={`lm-score lm-score-${result.riskLevel}`}>
        <div>
          <span className="lm-score-label">Risk</span>
          <strong>{result.riskLevel}</strong>
        </div>
        <div className="lm-score-number">{result.score}</div>
      </section>

      <section className="lm-meta">
        <div>
          <span>Site</span>
          <strong>{result.hostname ?? "Unsupported page"}</strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>{result.confidence}</strong>
        </div>
        <div>
          <span>Mode</span>
          <strong>{result.mode === "local-and-cloud" ? "local + cloud" : "local only"}</strong>
        </div>
      </section>

      {result.warnings.length ? (
        <section className="lm-warning-list">
          {result.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </section>
      ) : null}

      <section className="lm-reasons">
        <h2>Reasons</h2>
        {result.reasons.length ? (
          result.reasons.slice(0, 8).map((reason) => (
            <article className="lm-reason" key={`${reason.source}-${reason.id}`}>
              <div>
                <strong>{reason.title}</strong>
                <p>{reason.description}</p>
              </div>
              <span className={`lm-severity lm-severity-${reason.severity}`}>{reason.severity}</span>
            </article>
          ))
        ) : (
          <p className="lm-muted">No strong risk signals yet. Treat this as limited evidence, not a guarantee.</p>
        )}
      </section>
    </>
  );
}

function EmptyState({ isLoading }: { isLoading: boolean }) {
  return (
    <section className="lm-empty">
      <ShieldQuestion size={28} aria-hidden="true" />
      <p>{isLoading ? "Loading cached result." : "Check the active tab to generate an explainable risk report."}</p>
    </section>
  );
}

function RiskIcon({ riskLevel }: { riskLevel: RiskLevel }) {
  if (riskLevel === "low") return <CheckCircle2 className="lm-risk-icon lm-risk-icon-low" size={24} aria-hidden="true" />;
  if (riskLevel === "high") return <AlertTriangle className="lm-risk-icon lm-risk-icon-high" size={24} aria-hidden="true" />;
  if (riskLevel === "medium") return <Flag className="lm-risk-icon lm-risk-icon-medium" size={24} aria-hidden="true" />;
  return <ShieldQuestion className="lm-risk-icon lm-risk-icon-unknown" size={24} aria-hidden="true" />;
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
