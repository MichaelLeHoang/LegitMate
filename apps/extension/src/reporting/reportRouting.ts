import type { AnalysisResult, ReportRegion, ReportRoutingDecision, ScamType } from "../scoring/types";
export type ReportDestinationCapability = "manual_portal" | "guidance";

export interface ReportDestination {
  id: string;
  region: ReportRegion;
  label: string;
  agency: string;
  url: string;
  capability: ReportDestinationCapability;
  supportedScamTypes: ScamType[];
}

export const REPORT_REGIONS: Record<ReportRegion, string> = {
  US: "United States",
  CA: "Canada"
};

export const REPORT_DESTINATIONS: ReportDestination[] = [
  {
    id: "us-ftc-reportfraud",
    region: "US",
    label: "ReportFraud.ftc.gov",
    agency: "Federal Trade Commission",
    url: "https://reportfraud.ftc.gov/",
    capability: "manual_portal",
    supportedScamTypes: ["phishing", "fake_shop", "crypto", "impersonation", "other"]
  },
  {
    id: "us-ic3",
    region: "US",
    label: "Internet Crime Complaint Center",
    agency: "FBI IC3",
    url: "https://www.ic3.gov/",
    capability: "manual_portal",
    supportedScamTypes: ["phishing", "fake_shop", "crypto", "impersonation", "other"]
  },
  {
    id: "us-ftc-phishing-guidance",
    region: "US",
    label: "FTC phishing reporting guidance",
    agency: "Federal Trade Commission",
    url: "https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams#how-to-report-phishing",
    capability: "guidance",
    supportedScamTypes: ["phishing", "impersonation"]
  },
  {
    id: "ca-cafc",
    region: "CA",
    label: "Report fraud and cybercrime",
    agency: "Canadian Anti-Fraud Centre",
    url: "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
    capability: "manual_portal",
    supportedScamTypes: ["phishing", "fake_shop", "crypto", "impersonation", "other"]
  },
  {
    id: "ca-cyber-centre",
    region: "CA",
    label: "Report a cyber incident",
    agency: "Canadian Centre for Cyber Security",
    url: "https://www.cyber.gc.ca/en/incident-management",
    capability: "guidance",
    supportedScamTypes: ["phishing", "impersonation", "other"]
  }
];

export function getReportDestinations(region: ReportRegion, scamType: ScamType): ReportDestination[] {
  return REPORT_DESTINATIONS.filter(
    (destination) =>
      destination.region === region &&
      (destination.supportedScamTypes.includes(scamType) || destination.supportedScamTypes.includes("other"))
  );
}

export function getRoutingDecision(result: AnalysisResult | null): ReportRoutingDecision {
  if (!result) return "standard_review";
  if (result.riskLevel === "medium" || result.riskLevel === "high" || result.score >= 30) {
    return "review_priority";
  }
  return "standard_review";
}
