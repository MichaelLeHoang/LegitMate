import type { CollectPageSignalsMessage } from "../messages";
import type { PageSignalSummary } from "../scoring/types";

const COLLECT_PAGE_SIGNALS = "COLLECT_PAGE_SIGNALS";
const SUSPICIOUS_TEXT = [
  "limited time",
  "act now",
  "verify your account",
  "wallet recovery",
  "seed phrase",
  "gift card",
  "guaranteed return",
  "risk-free investment"
];

function collectPageSignals(): PageSignalSummary {
  const forms = Array.from(document.forms);
  const inputs = Array.from(document.querySelectorAll("input"));
  const pageText = document.body?.innerText?.slice(0, 25_000).toLowerCase() ?? "";
  const currentOrigin = location.origin;

  const externalFormActions = forms
    .map((form) => resolveFormAction(form))
    .filter((action): action is URL => Boolean(action))
    .filter((action) => action.origin !== currentOrigin)
    .map((action) => action.origin);

  return {
    formCount: forms.length,
    passwordFieldCount: inputs.filter((input) => input.type === "password").length,
    paymentFieldCount: inputs.filter(isPaymentInput).length,
    externalFormActions: Array.from(new Set(externalFormActions)).slice(0, 5),
    suspiciousTextMatches: SUSPICIOUS_TEXT.filter((text) => pageText.includes(text)).slice(0, 6),
    hasContactSignals: /contact|support|help center|customer service/.test(pageText),
    hasPolicySignals: /privacy policy|return policy|terms of service|refund policy/.test(pageText)
  };
}

function resolveFormAction(form: HTMLFormElement): URL | null {
  const action = form.getAttribute("action");
  if (!action) return null;
  try {
    return new URL(action, location.href);
  } catch {
    return null;
  }
}

function isPaymentInput(input: HTMLInputElement): boolean {
  const haystack = `${input.type} ${input.name} ${input.id} ${input.autocomplete} ${input.placeholder}`.toLowerCase();
  return /cc-|card|credit|cvv|cvc|expiry|expiration|billing/.test(haystack);
}

chrome.runtime.onMessage.addListener((message: CollectPageSignalsMessage, _sender, sendResponse) => {
  if (message.type !== COLLECT_PAGE_SIGNALS) return false;
  sendResponse(collectPageSignals());
  return false;
});
