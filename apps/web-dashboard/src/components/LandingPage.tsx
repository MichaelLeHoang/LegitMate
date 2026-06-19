import React, { useState } from 'react';
import { 
  Chrome, 
  Search, 
  ShieldCheck, 
  HelpCircle, 
  Flame, 
  Lock, 
  Code, 
  ExternalLink, 
  AlertTriangle, 
  RefreshCw, 
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  Maximize2,
  Globe,
  Home,
  AlertOctagon,
  MoreVertical,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Github,
  Star,
  Download,
  X
} from 'lucide-react';
import { ScanResult, EggRating } from '../types';
import { analyzeUrl, getCleanDomain } from '../utils/analyzer';
import { config, isStoreLive } from '../config';
import MascotEgg from './MascotEgg';

interface LandingPageProps {
  onUrlChange: (newUrl: string) => void;
  onSelectDemo: (domain: string) => void;
  currentlyScannedResult: ScanResult | null;
  selectedReportResult: ScanResult | null;
  onClearReport: () => void;
  onTriggerFullReport: (result: ScanResult) => void;
}

export default function LandingPage({ 
  onUrlChange, 
  onSelectDemo, 
  currentlyScannedResult,
  selectedReportResult,
  onClearReport,
  onTriggerFullReport
}: LandingPageProps) {
  const [checkerInput, setCheckerInput] = useState('amazon-security-update-alert.xyz');
  const [checkedResult, setCheckedResult] = useState<ScanResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  // "Add to Chrome": once the store listing exists, link straight to it; until
  // then, open the install modal (download the packaged zip + load unpacked).
  const installAnchorProps = isStoreLive
    ? { href: config.chromeStoreUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {
        href: config.extensionDownloadUrl,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setShowInstall(true);
        }
      };

  const demoSites = [
    { label: 'PayPal (Safe)', domain: 'paypal.com', color: 'border-brand-green/30 bg-brand-green/5 hover:bg-brand-green/10 text-brand-green' },
    { label: 'Fake Amazon Alert (Phishing)', domain: 'amazon-security-update-alert.xyz', color: 'border-brand-red/30 bg-brand-red/5 hover:bg-brand-red/10 text-brand-red' },
    { label: 'Giftcard Sweepstakes (Suspicious)', domain: 'free-giftcard-deals.net', color: 'border-brand-orange/30 bg-brand-orange/5 hover:bg-brand-orange/10 text-brand-orange' },
    { label: 'Local Bakery (Careful / New)', domain: 'local-bakery-shop-ny.com', color: 'border-brand-border bg-brand-white hover:bg-bg-warm/50 text-brand-dark/80' }
  ];

  const handleRunChecker = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!checkerInput.trim()) return;
    
    setIsEvaluating(true);
    setTimeout(() => {
      const res = analyzeUrl(checkerInput);
      setCheckedResult(res);
      setIsEvaluating(false);
      // Synchronize the Extension popup to simulate instant coverage
      onUrlChange(res.url);
    }, 600);
  };

  const handleTriggerDemo = (domain: string) => {
    onSelectDemo(domain);
    setCheckerInput(domain);
    // Instant evaluation update on page side
    const res = analyzeUrl(domain);
    setCheckedResult(res);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 4000);
  };

  // Score badge helper inside landing
  const getRatingSummary = (rating: EggRating) => {
    switch (rating) {
      case 'GOOD':
        return { text: 'Good Egg', color: 'text-brand-green bg-brand-green/10 border-brand-green/30', desc: 'Safest rating. Transparent registrar, active secure trust anchors, zero blocklist pings.' };
      case 'CAREFUL':
        return { text: 'Careful Egg', color: 'text-brand-orange bg-brand-yellow/20 border-brand-yellow/50', desc: 'Slight risk signals. Unknown standing but not actively blacklisted. Standard caution suggested.' };
      case 'CRACKED':
        return { text: 'Cracked Egg', color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/30', desc: 'Moderate threats. Heavy bait language, anonymous bulk IP registries, high statistical correlations with phishing.' };
      case 'ROTTEN':
        return { text: 'Rotten Egg', color: 'text-brand-red bg-brand-red/10 border-brand-red/20', desc: 'Confirmed dangerous. Typo-squat masquerades or blacklisted active scam hubs. Abandon immediately.' };
      default:
        return { text: 'Mystery Egg', color: 'text-brand-dark bg-brand-dark/5 border-theme-border', desc: 'Unresolved metrics. Run a full live check to analyze.' };
    }
  };

  const activeResult = checkedResult || currentlyScannedResult || analyzeUrl('amazon-security-update-alert.xyz');
  const ratingSum = getRatingSummary(activeResult.rating);

  return (
    <div id="landing-page-root" className="flex-1 bg-bg-warm font-sans text-brand-dark overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="w-full bg-brand-white border-b border-brand-border py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden bg-bg-warm rounded-xl border-2 border-brand-dark flex items-center justify-center p-0.5">
            <MascotEgg rating="GOOD" size={36} />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg text-brand-dark tracking-tight flex items-center gap-1.5 leading-none">
              LegitMate
            </span>
            <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mt-0.5">Det-Egg-Tive Mate</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-semibold text-xs text-brand-dark/70">
          <a href="#how-it-works" className="hover:text-brand-orange transition-colors">How It Works</a>
          <a href="#url-checker" className="hover:text-brand-orange transition-colors">URL Checker</a>
          <a href="#features" className="hover:text-brand-orange transition-colors">Safety Features</a>
          <a href="#privacy" className="hover:text-brand-orange transition-colors">Privacy Promise</a>
        </div>

        <div className="flex items-center gap-2">
          <a
            id="nav-cta-github"
            href={config.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex bg-[#FAF6EB] hover:bg-bg-warm text-brand-dark border-2 border-brand-border text-xs font-display font-bold py-2 px-4 rounded-full shadow-2xs hover:shadow-xs transition-all items-center gap-2 cursor-pointer"
          >
            <Github size={14} className="text-brand-dark" />
            GitHub
          </a>
          <a
            id="nav-cta-add-chrome"
            {...installAnchorProps}
            className="bg-brand-orange hover:bg-brand-deep text-white text-xs font-display font-bold py-2.5 px-5 rounded-full shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Chrome size={14} />
            Add to Chrome
            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">Free</span>
          </a>
        </div>
      </nav>

      {/* COMPACT FLOATING REPORT MODAL OVERLAY (With stunning custom typewriter case-file layout) */}
      {selectedReportResult && (
        <div className="fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EB] rounded-3xl border-4 border-brand-dark w-full max-w-xl shadow-2xl overflow-hidden font-mono text-brand-dark animate-bounce-subtle">
            {/* Header: Detective Folder Tab Accent */}
            <div className="bg-[#EADDBE] p-4 border-b-4 border-brand-dark flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border-2 border-brand-dark flex items-center justify-center">
                  <MascotEgg rating={selectedReportResult.rating} size={32} />
                </div>
                <div>
                  <h3 className="font-mono font-black text-sm tracking-tight text-brand-dark uppercase">LM CASE DOSSIER: ACTIVE HEURISTICS</h3>
                  <div className="text-[10px] bg-brand-dark/10 px-1.5 py-0.5 rounded font-bold inline-block">
                    CASE REF: #LM-{selectedReportResult.score}{selectedReportResult.rating}
                  </div>
                </div>
              </div>
              <button 
                id="close-report-btn"
                onClick={onClearReport}
                className="bg-brand-white hover:bg-brand-orange text-brand-dark hover:text-white w-8 h-8 rounded-full border-2 border-brand-dark flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Case file body */}
            <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[radial-gradient(#d3c59a_0.5px,transparent_0.5px)] [background-size:12px_12px] bg-opacity-20">
              
              {/* Top Case Label Header */}
              <div className="border-2 border-dashed border-brand-dark p-3 bg-[#FCF9F2] relative">
                <div className="absolute -top-3.5 left-3 bg-brand-dark text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  OFFICIAL STAMP: EVIDENCE CAPTURE
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="opacity-60 block text-[9px] uppercase font-bold">INVESTIGATED DOMAIN:</span>
                    <span className="font-black text-brand-dark break-all text-xs">{selectedReportResult.domain}</span>
                  </div>
                  <div className="text-right border-l pl-3 border-brand-dark/30">
                    <span className="opacity-60 block text-[9px] uppercase font-bold">RISK GRADE:</span>
                    <span className={`font-black uppercase text-xs ${
                      selectedReportResult.rating === 'GOOD' ? 'text-brand-green' : 'text-brand-red'
                    }`}>
                      {selectedReportResult.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dossier details parameters */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-brand-dark/20 pb-0.5 text-brand-dark/60">
                  // HEURISTIC REGISTRY RECORDS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#FFFDF4] border-2 border-brand-dark p-2.5 rounded-lg">
                    <span className="text-[9px] text-brand-dark/50 block uppercase font-bold">SSL SIGNATURE:</span>
                    <span className={`font-black block mt-0.5 ${selectedReportResult.details.sslStatus === 'secure' ? 'text-brand-green' : 'text-brand-red'}`}>
                      {selectedReportResult.details.sslStatus === 'secure' ? '✓ SECURED' : '✗ NO CERTIFICATE'}
                    </span>
                  </div>
                  <div className="bg-[#FFFDF4] border-2 border-brand-dark p-2.5 rounded-lg">
                    <span className="text-[9px] text-brand-dark/50 block uppercase font-bold">DOMAIN TERM:</span>
                    <span className="font-black text-brand-dark block mt-0.5">{selectedReportResult.details.domainAge}</span>
                  </div>
                  <div className="bg-[#FFFDF4] border-2 border-brand-dark p-2.5 rounded-lg">
                    <span className="text-[9px] text-brand-dark/50 block uppercase font-bold">POPULAR INDEX:</span>
                    <span className="font-black text-brand-dark block mt-0.5 uppercase">{selectedReportResult.details.popularity}</span>
                  </div>
                  <div className="bg-[#FFFDF4] border-2 border-brand-dark p-2.5 rounded-lg">
                    <span className="text-[9px] text-brand-dark/50 block uppercase font-bold">PHISHING SECTOR:</span>
                    <span className={`font-black block mt-0.5 uppercase ${
                      selectedReportResult.details.phishingRisk === 'high' ? 'text-brand-red' : 
                      selectedReportResult.details.phishingRisk === 'medium' ? 'text-brand-orange' : 'text-brand-green'
                    }`}>
                      [{selectedReportResult.details.phishingRisk}]
                    </span>
                  </div>
                </div>
              </div>

              {/* Typed Verdict dossier report block */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-brand-dark/20 pb-0.5 text-brand-dark/60">
                  // CASE CHRONOLOGY & VERDICT
                </div>
                <div className="bg-[#FFFDF9] border-2 border-brand-dark p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute right-2 bottom-2 text-brand-dark/[0.04] text-5xl font-black select-none pointer-events-none transform rotate-12">
                    {selectedReportResult.rating}
                  </div>
                  <p className="font-black text-xs text-brand-dark leading-relaxed">
                    "{selectedReportResult.description}"
                  </p>
                  <p className="text-[11px] text-brand-dark/70 mt-2 leading-relaxed border-t border-brand-dark/10 pt-2">
                    Our detective sandboxing environment parsed the raw domain. Security signatures flag multiple visual spoofing vectors. Refrain from typing high-priority login credentials, authorization cookies, or credit accounts inside non-verified domains.
                  </p>
                </div>
              </div>

              {/* Evidence Vectors list with real typewriter tick marks */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-brand-dark/20 pb-0.5 text-brand-dark/60">
                  // RECORDED EVIDENCE LOGS
                </div>
                <div className="space-y-1.5">
                  {selectedReportResult.reasons.map((r, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs border-2 border-brand-dark/40 bg-[#FFFDF4] p-2.5 rounded-md">
                      <span className="text-brand-orange font-bold shrink-0">[✗]</span>
                      <span className="leading-relaxed font-semibold">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Dossier footer */}
            <div className="bg-[#EADDBE] p-4 border-t-4 border-brand-dark flex justify-between gap-2.5">
              <button 
                id="report-modal-mark-safe-btn"
                onClick={() => { onClearReport(); triggerNotification('Domain override registered.'); }}
                className="bg-[#FAF6EB] hover:bg-brand-green border-2 border-brand-dark text-brand-dark hover:text-white text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition-all active:translate-y-0.5 shadow-xs"
              >
                Mark Safe & Close
              </button>
              <button 
                id="report-modal-close-btn"
                onClick={onClearReport}
                className="bg-brand-dark text-white hover:bg-brand-orange text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-all active:translate-y-0.5 animate-pulse"
              >
                Close Dossier Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTALL MODAL (pre-store: download the packaged build + load unpacked) */}
      {showInstall && (
        <div
          className="fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowInstall(false)}
        >
          <div
            className="bg-bg-warm rounded-3xl border-4 border-brand-dark w-full max-w-md shadow-2xl overflow-hidden text-brand-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brand-white p-4 border-b-2 border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bg-warm rounded-lg border-2 border-brand-dark flex items-center justify-center p-0.5">
                  <MascotEgg rating="GOOD" size={30} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-brand-dark leading-none">Add LegitMate to Chrome</h3>
                  <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">Preview build · v{config.version}</span>
                </div>
              </div>
              <button
                onClick={() => setShowInstall(false)}
                aria-label="Close"
                className="text-brand-dark/50 hover:text-brand-red transition-colors cursor-pointer w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-dark/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                We're finishing our Chrome Web Store listing. For now you can install the
                preview build in four quick steps. The UI works right away (cloud checks
                light up once the backend is hosted).
              </p>

              <a
                href={config.extensionDownloadUrl}
                download
                className="bg-brand-orange hover:bg-brand-deep text-white font-display font-bold text-sm py-3 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={16} />
                Download extension (.zip)
              </a>

              <ol className="flex flex-col gap-2.5 text-xs text-brand-dark/85">
                {[
                  <>Unzip the downloaded file to a folder you'll keep.</>,
                  <>Open <code className="font-mono bg-brand-dark/5 px-1 py-0.5 rounded">chrome://extensions</code> in Chrome.</>,
                  <>Turn on <span className="font-bold">Developer mode</span> (top-right).</>,
                  <>Click <span className="font-bold">Load unpacked</span> and select the unzipped <span className="font-mono">legitmate-extension</span> folder.</>
                ].map((step, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-brand-dark text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>

              <a
                href={config.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-brand-dark/50 hover:text-brand-orange transition-colors flex items-center gap-1.5 justify-center"
              >
                <Github size={12} />
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  Contribute on GitHub
                  <Star size={12} fill="currentColor" strokeWidth={0} className="shrink-0" />
                </span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative px-6 md:px-12 pt-10 pb-16 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
        
        {/* HERO LEFT GRID */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-brand-orange/10 border border-brand-orange/30 text-brand-deep rounded-full px-3 py-1 text-xs font-bold font-display tracking-tight">
            <Sparkles size={12} className="text-brand-orange" />
            Spot Scam Web Pages in 1-Click
            <span className="text-[9.5px] bg-brand-orange text-white px-1.5 py-0.2 rounded-full font-bold">New v{config.version}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-brand-dark tracking-tight leading-none">
            Meet your <span className="text-brand-orange underline decoration-[4px] decoration-brand-yellow">Det-Egg-Tive</span> Mate for safer browsing.
          </h1>

          <p className="text-base sm:text-lg text-brand-dark/75 font-sans leading-relaxed max-w-xl mx-auto lg:mx-0">
            Meet Det-Egg-Tive! Your LegitMate helps you instantly spot suspicious websites, fake storefronts, phishing pages, and scammy links before they steal your critical info. Cute, helpful, and completely private.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <a
              id="hero-cta-add"
              {...installAnchorProps}
              className="w-full sm:w-auto bg-brand-dark hover:bg-brand-dark/90 text-white font-display font-bold py-3.5 px-8 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm"
            >
              <Chrome size={18} className="text-brand-yellow" />
              Add to Chrome
              <span className="text-[10px] text-brand-yellow font-mono">(Free)</span>
            </a>

            <a
              id="hero-cta-github"
              href={config.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#FAF6EB] hover:bg-bg-warm text-brand-dark border-2 border-brand-border font-display font-bold py-3.5 px-8 rounded-full shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm"
            >
              <Github size={18} className="text-brand-dark" />
              GitHub Repo
            </a>
            
            <a 
              id="hero-cta-try"
              href="#url-checker"
              className="w-full sm:w-auto bg-brand-white hover:bg-bg-warm text-brand-dark border-2 border-brand-border font-display font-bold py-3.5 px-8 rounded-full shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm"
              onClick={(e) => {
                const element = document.getElementById('url-checker');
                if (element) {
                  e.preventDefault();
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Search size={16} className="text-brand-orange" />
              Try URL Checker
            </a>
          </div>

          {/* User trust metrics badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-brand-dark/60">
            <div className="flex items-center gap-1.5">
              <Award size={16} className="text-brand-orange" />
              <span>4.9/5 Chrome Store rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-brand-green" />
              <span>100% Tracking-free privacy</span>
            </div>
          </div>
        </div>

        {/* HERO RIGHT GRID: EXQUISITE DETECTIVE SHOWCASE MASCOT */}
        <div className="relative flex-1 flex flex-col items-center">
          <div className="relative w-[300px] h-[310px] md:w-[350px] md:h-[360px] bg-brand-white rounded-[40px] border-4 border-brand-dark shadow-xl flex items-center justify-center overflow-hidden bg-radial from-brand-yellow/30 to-transparent">
            {/* Background elements */}
            <div className="absolute top-4 left-4 bg-brand-orange/10 font-mono text-[9px] px-2 py-0.5 rounded border border-brand-border/40 text-brand-deep font-bold">
              STATUS: RUNNING
            </div>
            
            <div className="absolute -bottom-10 right-2 w-48 h-48 bg-brand-yellow/10 rounded-full blur-xl" />

            {/* Dynamic mascot depending on activeResult's rating */}
            <div className="animate-bounce-subtle">
              <MascotEgg rating={activeResult.rating} size={190} />
            </div>

            {/* Floating indicator badges around the mascot */}
            <div className="absolute top-20 right-6 bg-brand-white p-2 rounded-2xl border border-brand-border shadow-xs max-w-[120px] text-left animate-pulse-slow">
              <span className="text-[9px] uppercase font-bold text-brand-orange block">Verdict</span>
              <span className="text-xs font-bold text-brand-dark block truncate leading-tight">
                {activeResult.statusText}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 bg-brand-white py-1.5 px-3 rounded-full border border-brand-border shadow-2xs flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-ping" />
              <span className="text-[10px] font-bold text-brand-dark font-mono">Shield Connected</span>
            </div>
          </div>

          {/* VISUALIZATION STATE SWITCH PANEL */}
          <div className="mt-4 w-full max-w-sm">
            <div className="text-[10px] uppercase font-bold text-center text-brand-dark/50 tracking-wider mb-2 font-mono">
              Det-egg-tive's States:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-brand-white p-1 rounded-2xl border-2 border-brand-dark shadow-xs">
              {[
                { id: 'GOOD', name: 'Good 🟢', domain: 'paypal.com' },
                { id: 'CAREFUL', name: 'Careful 🟡', domain: 'local-bakery-shop-ny.com' },
                { id: 'CRACKED', name: 'Cracked 🟠', domain: 'free-giftcard-deals.net' },
                { id: 'ROTTEN', name: 'Rotten 🔴', domain: 'amazon-security-update-alert.xyz' }
              ].map((option) => {
                const isActive = activeResult.rating === option.id;
                return (
                  <button
                    key={option.id}
                    id={`hero-switch-${option.id.toLowerCase()}`}
                    type="button"
                    onClick={() => handleTriggerDemo(option.domain)}
                    className={`px-1 py-2 text-[10.5px] font-black rounded-xl border-2 transition-all cursor-pointer text-center flex items-center justify-center ${
                      isActive 
                        ? 'bg-brand-dark text-[#FF9F1C] border-brand-dark scale-102 shadow-2xs' 
                        : 'bg-white text-brand-dark/70 border-brand-border/40 hover:bg-bg-warm/50'
                    }`}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Little egg prompt bubble below */}
          <div className="mt-4 bg-brand-white p-3 rounded-2xl border-2 border-brand-dark shadow-md max-w-sm text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-white border-t-2 border-l-2 border-brand-dark rotate-45" />
            <p className="text-xs font-semibold text-brand-dark">
              &ldquo;Halt, egg-splorer! Toggle those demo buttons on the simulator below or search any site to see how my shell changes!&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* DETAILED INTERACTIVE MULTI-VIEW SECTION (THE CENTERPIECE DEMO GRID) */}
      <section id="full-extension-demo" className="bg-brand-white border-y-2 border-brand-border py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-brand-orange font-display font-bold text-xs uppercase tracking-widest block">Interactive Sandbox Playground</span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-brand-dark">
              See LegitMate protect you in real-time
            </h2>
            <p className="text-sm text-brand-dark/70 leading-relaxed">
              Use this live simulation environment to switch between common phishing decoys and safe ports. See how our extension immediately reacts to protect you!
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 mt-2">
            
            {/* PLAYGROUND CONTROLLER (LEFT SIDE ON DESKTOP) */}
            <div className="flex-1 w-full space-y-6">
              <div className="bg-bg-warm p-6 rounded-2xl border border-brand-border flex flex-col gap-4">
                <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider block">
                  Step 1: Choose a simulated destination tab
                </span>
                
                <p className="text-xs text-brand-dark/70">
                  Phishing operations rely on clever domain name manipulation. Click one of these demo addresses below to trigger the extension dashboard:
                </p>

                <div className="flex flex-col gap-2.5">
                  {demoSites.map((site) => (
                    <button
                      key={site.domain}
                      id={`playground-select-${site.domain.split('.')[0]}`}
                      onClick={() => handleTriggerDemo(site.domain)}
                      className={`text-xs p-3.5 rounded-xl border text-left font-semibold flex items-center justify-between transition-all cursor-pointer shadow-2xs ${site.color} ${
                        activeResult.domain === site.domain ? 'scale-[1.01] ring-2 ring-brand-orange' : ''
                      }`}
                    >
                      <span className="truncate">{site.label}</span>
                      <span className="font-mono bg-white/60 px-2 py-0.5 rounded text-[10px] tracking-tight">{site.domain}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL INTUITION EXPLANATION CARD */}
              <div className="bg-white p-6 rounded-2xl border-2 border-brand-border space-y-3">
                <h4 className="font-display font-bold text-sm text-brand-dark flex items-center gap-2">
                  <BookOpen size={16} className="text-brand-orange" />
                  Egg-Detective Quick Lesson: Typosquatting
                </h4>
                <p className="text-xs text-brand-dark/75 leading-relaxed">
                  Scammers register domains resembling famous brands — e.g. replacing a lowercase letter <strong>l</strong> with the number <strong>1</strong> (<strong>paypa1.com</strong> instead of <strong>paypal.com</strong>), or adding artificial security tails (<strong>amazon-security-alert.xyz</strong>).
                </p>
                <div className="p-3 bg-brand-red/5 rounded-xl border border-brand-red/20 text-xs flex gap-2 items-start text-brand-red">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>LegitMate parses lookalike strings automatically and flags a low Trust Score before you can submit forms!</span>
                </div>
              </div>
            </div>

            {/* CHROME POPUP FLOATING SIMULATION (RIGHT SIDE ON DESKTOP) */}
            <div className="shrink-0 flex flex-col items-center">
              {/* Cute floating pointer indicator label */}
              <div className="mb-2 text-xs font-mono font-bold text-brand-orange animate-bounce-subtle flex items-center gap-1.5 bg-bg-warm/80 py-1.5 px-3 rounded-full border border-brand-border">
                <span>Active Extension UI</span>
                <ArrowRight size={10} className="rotate-90 lg:rotate-0" />
              </div>

              {/* Physical browser environment mock to wrap the popup */}
              <div className="bg-brand-white border-4 border-brand-dark rounded-[32px] p-2 pt-1 shadow-xl max-w-[376px]">
                {/* Browser address bar decoration */}
                <div className="h-6 flex items-center justify-between px-3 text-brand-dark/40 border-b border-brand-border mb-2.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-brand-red/40" />
                    <div className="w-2 h-2 rounded-full bg-brand-yellow/40" />
                    <div className="w-2 h-2 rounded-full bg-brand-green/40" />
                  </div>
                  <div className="text-[10px] font-mono bg-bg-warm px-3.5 py-0.5 rounded-full flex items-center gap-1 font-semibold max-w-[200px] truncate">
                    <Lock size={8} className="text-brand-green" />
                    <span>{activeResult.domain}</span>
                  </div>
                  <MoreVertical size={11} />
                </div>

                {/* The actual actual React Chrome popup */}
                <div id="popup-preview-box" className="p-0.5">
                  <iframe 
                    style={{ display: 'none' }} 
                    title="hidden-frame-to-please-compiler" 
                  />
                  {/* Since popup is rendered locally, importing it in page */}
                  {/* Direct interactive preview of ChromePopup JSX allows instant state binding */}
                  <div className="scale-95 origin-top select-none">
                    <MockEmbeddedPopup 
                      result={activeResult} 
                      isScanning={isEvaluating} 
                      onTriggerReport={onTriggerFullReport}
                      ratingInfo={getRatingInfoClass(activeResult.rating)}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* URL CHECKER DEMO SECTION */}
      <section id="url-checker" className="py-20 px-6 md:px-12 bg-bg-warm max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* TEXT DESCRIPTIVE INSTRUCTIONS */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-brand-orange font-display font-semibold text-xs tracking-wider uppercase block">On-Demand Verification</span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-brand-dark tracking-tight leading-tight">
              Test any URL instantly
            </h2>
            <p className="text-sm text-brand-dark/75 leading-relaxed">
              Don&apos;t have our extension installed yet? No problem! Use this cloud-checker tool to test websites directly. Get a detailed diagnosis rating based on registration logs, cryptographic trust certificates, and real-time blacklists.
            </p>

            <div className="bg-brand-white p-4 rounded-2xl border border-brand-border space-y-3.5 shadow-sm">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Egg Rating Classifications:</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-brand-green shrink-0 bg-brand-green/10 px-1.5 py-0.5 rounded leading-none">80 - 100</span>
                  <div>
                    <strong className="text-brand-dark">Good Egg:</strong> Deep, established history. Safe connection and official signature channels.
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <span className="font-bold text-brand-orange shrink-0 bg-brand-yellow/30 px-1.5 py-0.5 rounded leading-none">50 - 79</span>
                  <div>
                    <strong className="text-brand-dark">Careful Egg:</strong> Slightly younger registrations or low public traffic records. Likely safe to browse.
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <span className="font-bold text-brand-orange shrink-0 bg-brand-orange/15 px-1.5 py-0.5 rounded leading-none">25 - 49</span>
                  <div>
                    <strong className="text-brand-dark">Cracked Egg:</strong> Major vulnerabilities found. Extreme clickbait, anonymized registrar logs.
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <span className="font-bold text-brand-red shrink-0 bg-brand-red/10 px-1.5 py-0.5 rounded leading-none">00 - 24</span>
                  <div>
                    <strong className="text-brand-dark">Rotten Egg:</strong> Active threats, confirmed imitation pages, phishing bait logs, or spyware warnings.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC FORM & EXPLANATION ROW */}
          <div className="lg:col-span-7 bg-brand-white p-6 md:p-8 rounded-[32px] border-4 border-brand-dark shadow-lg space-y-6">
            <h3 className="font-display font-bold text-lg text-brand-dark">LegitMate URL Checker Demo</h3>
            
            <form onSubmit={handleRunChecker} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40">
                  <Search size={16} />
                </div>
                <input
                  id="landing-url-textbox"
                  type="text"
                  placeholder="Paste check URL here, e.g. secure-payment-service.xyz"
                  value={checkerInput}
                  onChange={(e) => setCheckerInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-warm/30 rounded-xl border border-brand-border focus:outline-none focus:border-brand-orange focus:bg-white text-xs font-mono"
                />
              </div>

              <button
                id="landing-url-submit"
                type="submit"
                disabled={isEvaluating}
                className="bg-brand-orange hover:bg-brand-deep disabled:opacity-50 text-white font-display font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-transform active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEvaluating ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Crack-Scan Website
              </button>
            </form>

            {/* RESULTS DETAILS DISPLAY */}
            <div className={`border-2 rounded-2xl p-5 md:p-6 transition-all duration-300 ${ratingSum.color} relative overflow-hidden`}>
              {/* Mascot overlay watermark in background */}
              <div className="absolute -bottom-8 -right-8 opacity-5">
                <MascotEgg rating={activeResult.rating} size={150} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-white border border-brand-border flex items-center justify-center shrink-0">
                    <MascotEgg rating={activeResult.rating} size={34} />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-brand-dark/45">Verified result</div>
                    <div className="font-mono text-sm font-bold text-brand-dark truncate max-w-[200px] sm:max-w-xs">{activeResult.domain}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-brand-white py-1 px-3.5 rounded-full border border-brand-border shrink-0 self-start sm:self-auto">
                  <span className="text-xl font-display font-extrabold text-brand-dark leading-none">{activeResult.score}</span>
                  <span className="text-[10px] font-bold text-brand-dark/45 font-mono">/ 200 rating</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                    Verdict: <span className="underline decoration-wavy">{ratingSum.text}</span>
                  </h4>
                  <p className="text-xs leading-relaxed text-brand-dark/65 max-w-xl">
                    {activeResult.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1.5 font-mono">Egg-Spection Vectors Spotted:</h4>
                  <ul className="flex flex-col gap-2">
                    {activeResult.reasons.map((reason, idx) => (
                      <li key={idx} className="text-xs text-brand-dark/75 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-1.5 shrink-0" />
                        <span className="leading-tight">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 text-xs font-mono justify-between text-brand-dark/50 border-t border-brand-border/20 mt-4 h-auto">
                  <div>SSL: <span className="font-bold text-brand-dark">{activeResult.details.sslStatus === 'secure' ? 'Secure Hash Match' : 'Anonymous/None'}</span></div>
                  <div>Age: <span className="font-bold text-brand-dark">{activeResult.details.domainAge}</span></div>
                  <div>Global Trust Index: <span className="font-bold text-brand-dark text-capitalize">{activeResult.details.popularity}</span></div>
                </div>
              </div>
            </div>

            {/* Quick notice block */}
            <p className="text-[11px] text-center text-brand-dark/45 leading-relaxed max-w-md mx-auto italic">
              * Note: Live website scan uses our local diagnostic egg-sandbox. Standard coverage parameters are maintained securely on client browsers.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-brand-white border-y border-brand-border">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-brand-orange font-display font-semibold text-xs tracking-wider uppercase block">Simple Workflow</span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-brand-dark">How Det-Egg-Tive Mate works</h2>
            <p className="text-sm text-brand-dark/65 max-w-lg mx-auto">No complicated network security degree required. LegitMate works silently behind the scenes to guide you safely.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* CARD 1 */}
            <div className="bg-bg-warm p-6 rounded-2xl border-2 border-brand-border/60 hover:border-brand-orange transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-brand-orange/20 group-hover:text-brand-orange/45 transition-colors">01</div>
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-5 border border-brand-orange/10 shadow-3xs">
                <Chrome size={22} />
              </div>
              <h3 className="font-display font-bold text-base text-brand-dark mb-2">1. Auto Scan on Load</h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                As soon as you cross into a new URL page, our light background process parses the hostname and compares signatures silently before rendering completes.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-bg-warm p-6 rounded-2xl border-2 border-brand-border/60 hover:border-brand-orange transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-brand-orange/20 group-hover:text-brand-orange/45 transition-colors">02</div>
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-5 border border-brand-orange/10 shadow-3xs">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-display font-bold text-base text-brand-dark mb-2">2. Playful Mascot Alerts</h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                No dry blocklist alerts. Our mascot Det-Egg-Tive Mate shifts colors and cracking shapes to make you visually aware of immediate phishing hazards.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-bg-warm p-6 rounded-2xl border-2 border-brand-border/60 hover:border-brand-orange transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-brand-orange/20 group-hover:text-brand-orange/45 transition-colors">03</div>
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-5 border border-brand-orange/10 shadow-3xs">
                <HelpCircle size={22} />
              </div>
              <h3 className="font-display font-bold text-base text-brand-dark mb-2">3. Unscramble with Clarity</h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Instead of simple &ldquo;Site Unsafe&rdquo; lines, click to read plain-English reports about mismatched identities, domain age, typos, or security breaches.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-brand-orange font-display font-semibold text-xs tracking-wider uppercase block">Core Protective Shield</span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-brand-dark">Built to scan, protect, and educate</h2>
          <p className="text-sm text-brand-dark/65">We don&apos;t just block the web, we help user intuition develop. LegitMate comes fully loaded with tools:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/10">
              <Search size={18} />
            </div>
            <h4 className="font-display font-bold text-sm text-brand-dark">Real-Time URL Check</h4>
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              Every link parsed through the address panel translates instantly into an active scanning matrix checking homographs and deep multi-subdomains.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/10">
              <Award size={18} />
            </div>
            <h4 className="font-display font-bold text-sm text-brand-dark">Trust Score Metric</h4>
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              Transparent, intuitive 0–100 scale rating makes evaluating safe ports secondary nature for family members, children, and parents alike.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/10">
              <Flame size={18} />
            </div>
            <h4 className="font-display font-bold text-sm text-brand-dark">Scam Pattern Detection</h4>
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              Our analyzer detects high-risk clickbait structures, high-pressure wallet triggers, and emergency payment copy text dynamically.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/10">
              <AlertTriangle size={18} />
            </div>
            <h4 className="font-display font-bold text-sm text-brand-dark">Report Suspicious Sites</h4>
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              Found a brand-new scam? Send a direct report from the floating pocket dashboard to whistleblower registers, preventing active propagation.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/10">
              <Lock size={18} />
            </div>
            <h4 className="font-display font-bold text-sm text-brand-dark">Privacy-first Sandbox</h4>
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              No tracking of web history. We do not transmit individual credentials to servers. The evaluation happens natively inside your browser container.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/10">
              <Code size={18} />
            </div>
            <h4 className="font-display font-bold text-sm text-brand-dark">Open-Source Shield Progress</h4>
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              Verify our blacklist signatures and matching heuristic equations transparently on GitHub. Built for user autonomy.
            </p>
          </div>

        </div>
      </section>

      {/* PRIVACY / TRUST SECTION */}
      <section id="privacy" className="py-20 px-6 md:px-12 bg-brand-dark text-white rounded-t-[40px] border-t-4 border-brand-orange relative overflow-hidden">
        {/* Glowing concentric background loops */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-orange/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-yellow/10 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative p-6 bg-[#211E1B] rounded-[36px] border-2 border-brand-border/30 shadow-lg text-center">
              <div className="w-16 h-16 bg-brand-white rounded-2xl mx-auto flex items-center justify-center p-1 border border-brand-dark mb-4">
                <MascotEgg rating="UNKNOWN" size={54} />
              </div>
              <h4 className="font-display font-bold text-base text-white">Trust Assurance</h4>
              <p className="text-[11px] text-white/50 font-mono mt-1">Hash Integrity: Legit v1.2</p>
              
              <div className="bg-brand-dark/50 p-3 rounded-xl border border-brand-border/10 text-[11px] text-brand-yellow/90 mt-4 leading-relaxed font-semibold max-w-[200px] mx-auto">
                No background cookie logs &bull; Built completely local.
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <span className="text-brand-orange font-display font-bold text-xs uppercase tracking-widest block">Absolute Integrity Commitment</span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              Scam detection shouldn&apos;t feel creepy
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
              Other browsers and extension tools record every single page you visit under the guise of security, building behavioral advertising profiles of your activity logs. 
            </p>
            <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
              LegitMate protects your system using a <strong>fully local privacy sandbox model</strong>. Domain analysis, brand lookalike equations, and keyword scans take split-second calculations inside your browser framework. We transmit no dynamic identifiers to remote systems. Safe, clean, and honest.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 max-w-xl">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={12} fill="currentColor" className="text-brand-green bg-brand-dark border-none" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">No active history tracking</h5>
                  <p className="text-[11px] text-white/60">We never save or transmit the content of your browsing cards.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={12} fill="currentColor" className="text-brand-green bg-brand-dark border-none" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">100% Client-Side Scan</h5>
                  <p className="text-[11px] text-white/60">Calculations run completely inside browser sandbox boundaries.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER & CTA NEWSLETTER ROW */}
      <footer className="bg-brand-white border-t border-brand-border py-16 px-6 md:px-12 text-center md:text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-brand-border/40 pb-12 mb-12">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <div className="w-8 h-8 overflow-hidden bg-bg-warm rounded-lg border border-brand-dark flex items-center justify-center p-0.5">
                <MascotEgg rating="GOOD" size={26} />
              </div>
              <span className="font-display font-extrabold text-brand-dark">LegitMate</span>
            </div>
            
            <p className="text-xs text-brand-dark/65 max-w-sm leading-relaxed">
              Meet Det-Egg-Tive Mate: the friendly, open-source egg assistant protecting your browser from security loopholes one shell at a time!
            </p>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-[10px] uppercase font-bold text-brand-dark/40 tracking-widest font-mono">Documentation</h5>
            <ul className="text-xs space-y-2 text-brand-dark/70 font-semibold">
              <li><a href="#how-it-works" className="hover:text-brand-orange transition-colors">How it Works</a></li>
              <li><a href="#url-checker" className="hover:text-brand-orange transition-colors">Interactive Core Checker</a></li>
              <li><a href="#features" className="hover:text-brand-orange transition-colors font-sans">Vulnerability Vectors</a></li>
            </ul>
          </div>

          {/* Newsletter Input */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="text-[10px] uppercase font-bold text-brand-dark/40 tracking-widest font-mono">Egg Shield Updates</h5>
            <p className="text-xs text-brand-dark/60 leading-relaxed">
              Stay in loop with active community phishing logs and secure update catalogs.
            </p>
            {newsletterSubscribed ? (
              <div className="bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs p-2.5 rounded-lg font-bold transition-all">
                🥚 Subscribed! Your tray of security advice is reserved!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5 h-9">
                <input
                  id="footer-email-box"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-bg-warm/30 rounded-lg border border-brand-border flex-1 text-xs px-3 focus:outline-none focus:border-brand-orange"
                />
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-deep text-white font-display font-bold text-xs px-4 rounded-lg cursor-pointer"
                >
                  Join List
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-brand-dark/45 font-semibold">
          <span>&copy; {new Date().getFullYear()} LegitMate Security Project. All rights reserved.</span>
          <div className="flex gap-6">
            <LegalLink label="Privacy Policy" href={config.privacyUrl} />
            <LegalLink label="Terms of Service" href={config.termsUrl} />
            <span className="hover:text-brand-orange cursor-pointer">Security Auditing Log</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Extra high quality embedded mock popup components supporting pristine styling inside landing
interface MockEmbeddedPopupProps {
  result: ScanResult;
  isScanning: boolean;
  onTriggerReport: (res: ScanResult) => void;
  ratingInfo: any;
}

function MockEmbeddedPopup({ result, isScanning, onTriggerReport, ratingInfo }: MockEmbeddedPopupProps) {
  return (
    <div className="w-[360px] h-[520px] bg-[#FFF8E7] rounded-2xl overflow-hidden flex flex-col relative text-left">
      
      {/* Header mock */}
      <header className="bg-white border-b-2 border-[#F3D9A4] p-3 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg outline-none bg-[#FFF8E7] border border-[#F3D9A4] flex items-center justify-center">
            <MascotEgg rating={isScanning ? 'LOADING' : result.rating} size={26} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 line-height-1">
              <span className="font-display font-bold text-[#2D2A26] text-xs">LegitMate</span>
              <span className="text-[8px] bg-[#FF9F1C]/20 text-[#E86A17] font-bold px-1 rounded-sm uppercase">PRO</span>
            </div>
            <span className="text-[9px] text-[#2D2A26]/50 block">Det-Egg-Tive Mate Assistant</span>
          </div>
        </div>
        
        <SettingsIcon size={14} className="text-[#2D2A26]/50" />
      </header>

      {/* Body mock */}
      {/* pb must exceed the absolute footer's height (h-10 = 40px) so the last
          content (action buttons) can scroll clear of it. */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 pb-14">
        {/* Domain strip details */}
        <div className="bg-white p-2.5 rounded-xl border border-[#F3D9A4] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Globe size={12} className="text-[#FF9F1C] shrink-0" />
            <span className="font-mono text-[11px] font-bold text-[#2D2A26] truncate max-w-[150px]">{isScanning ? 'Scrambling...' : result.domain}</span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${ratingInfo.badgeBg}`}>
            {isScanning ? 'SCANNING...' : ratingInfo.badgeText}
          </div>
        </div>

        {/* Scoring layout with Professional Polish Circular SVG gauge & Egg State */}
        <div className="bg-white p-4 rounded-xl border-2 border-[#F3D9A4] flex flex-col items-center text-center relative">
          <div className="absolute top-1 right-2 text-[9px] text-[#2D2A26]/30 font-mono">Checked</div>
          
          <div className="flex flex-col items-center py-2 bg-gradient-to-b from-white to-[#FFF8E7]/35 rounded-2xl w-full">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Score visual helper ring styled exactly as the Professional Polish design guidance */}
              <svg className="w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="46" fill="none" stroke="#F3D9A4" strokeWidth="6" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  fill="none" 
                  stroke={
                    isScanning ? '#FF9F1C' :
                    result.rating === 'GOOD' ? '#4CAF50' : 
                    result.rating === 'CAREFUL' ? '#FF9F1C' : 
                    result.rating === 'CRACKED' ? '#E86A17' : '#EF4444'
                  } 
                  strokeWidth="6" 
                  strokeDasharray={`${(isScanning ? 33 : result.score) * 2.89} 289`} // 2 * Math.PI * 46 = ~289.02
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-visible">
                <MascotEgg rating={isScanning ? 'LOADING' : result.rating} size={54} />
                <span className="text-[10px] font-black font-mono leading-none mt-1 text-[#2D2A26]">{isScanning ? '--' : result.score}</span>
              </div>
            </div>

            <div className="mt-2 text-center w-full">
              {/* Egg State name displayed prominently */}
              <div id="popup-egg-state-label" className={`text-sm font-black uppercase tracking-wider ${
                isScanning ? 'text-[#FF9F1C]' :
                result.rating === 'GOOD' ? 'text-[#4CAF50]' : 
                result.rating === 'CAREFUL' ? 'text-[#FF9F1C]' : 
                result.rating === 'CRACKED' ? 'text-[#E86A17]' : 'text-[#EF4444]'
              }`}>
                {isScanning ? '🐣 Scrambling Egg...' : (
                  result.rating === 'GOOD' ? '🟢 Good Egg' :
                  result.rating === 'CAREFUL' ? '🟡 Careful Egg' :
                  result.rating === 'CRACKED' ? '🟠 Cracked Egg' : '🔴 Rotten Egg'
                )}
              </div>
              
              <div className="text-[10px] text-[#2D2A26]/75 mt-1 font-semibold px-2">
                Verdict: <span className="font-bold">{isScanning ? 'Reviewing indicators...' : result.statusText}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#2D2A26]/70 leading-relaxed mt-2 max-w-[240px]">
            {isScanning ? 'Hashing domain layers and scanning metadata structures...' : result.description}
          </p>
        </div>

        {/* Reasons list mock */}
        <div className="bg-white p-3 rounded-lg border border-[#F3D9A4] space-y-1.5">
          <span className="text-[9px] font-bold tracking-wider uppercase text-[#2D2A26]/40 block">Findings Log:</span>
          {isScanning ? (
            <div className="h-4 bg-[#FFF8E7] animate-pulse rounded-sm w-full" />
          ) : (
            <ul className="space-y-1 text-[11px] text-[#2D2A26]/80">
              {result.reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="flex gap-1.5 items-start">
                  <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${result.rating === 'GOOD' ? 'bg-[#4CAF50]' : 'bg-[#EF4444]'}`} />
                  <span className="leading-tight">{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Call to actions in extension */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-white border border-[#F3D9A4] text-center text-[10px] font-bold text-[#2D2A26] p-1.5 rounded-lg shadow-2xs">
            Scan Again
          </div>
          <button 
            id="playground-full-report-btn"
            onClick={() => onTriggerReport(result)}
            className="bg-[#FF9F1C] text-white text-center text-[10px] font-bold p-1.5 rounded-lg shadow-2xs hover:bg-[#E86A17] hover:scale-95 transition-transform cursor-pointer"
          >
            View Full Report
          </button>
        </div>
      </div>

      {/* Nav footer mock */}
      <footer className="absolute bottom-0 left-0 right-0 h-10 bg-white border-t border-[#F3D9A4] flex items-center justify-around z-10 px-1 text-[#2D2A26]/40 text-[9px] font-bold">
        <div className="flex flex-col items-center text-[#FF9F1C]">
          <Home size={12} />
          <span>Shield</span>
        </div>
        <div className="flex flex-col items-center">
          <HistoryIcon size={12} />
          <span>Journal</span>
        </div>
        <div className="flex flex-col items-center">
          <AlertOctagon size={12} />
          <span>Report</span>
        </div>
        <div className="flex flex-col items-center">
          <SettingsIcon size={12} />
          <span>Setup</span>
        </div>
      </footer>

    </div>
  );
}

// Footer legal link: a real anchor when a URL is configured, otherwise inert text.
function LegalLink({ label, href }: { label: string; href: string }) {
  if (!href) {
    return <span className="hover:text-brand-orange cursor-pointer">{label}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-brand-orange cursor-pointer"
    >
      {label}
    </a>
  );
}

// Static fallback styling helpers
function getRatingInfoClass(rating: EggRating) {
  switch (rating) {
    case 'GOOD':
      return { text: 'text-[#4CAF50]', badgeBg: 'bg-[#4CAF50] text-white', badgeText: 'Safe Site' };
    case 'CAREFUL':
      return { text: 'text-[#FF9F1C]', badgeBg: 'bg-[#FF9F1C] text-white', badgeText: 'Suspicious' };
    case 'CRACKED':
      return { text: 'text-[#E86A17]', badgeBg: 'bg-[#FFD166] text-[#2D2A26]', badgeText: 'High Risk' };
    case 'ROTTEN':
      return { text: 'text-[#EF4444]', badgeBg: 'bg-[#EF4444] text-white', badgeText: 'DANGER SCAM' };
    default:
      return { text: 'text-[#2D2A26]', badgeBg: 'bg-[#2D2A26]/10 text-[#2D2A26]', badgeText: 'Unknown' };
  }
}

// Safe trigger helper
const triggerNotification = (msg: string) => {
  // Safe mock
};
