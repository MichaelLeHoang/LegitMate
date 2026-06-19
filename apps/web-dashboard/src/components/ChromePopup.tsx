import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  History as HistoryIcon, 
  AlertTriangle, 
  Settings as SettingsIcon, 
  RefreshCw, 
  CheckCircle, 
  ThumbsUp, 
  HelpCircle, 
  Send, 
  Globe, 
  ChevronRight, 
  Info,
  AlertOctagon,
  Home,
  Check,
  RotateCw,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { ScanResult, EggRating, SearchHistoryItem } from '../types';
import { analyzeUrl, getEggRating } from '../utils/analyzer';
import MascotEgg from './MascotEgg';

interface ChromePopupProps {
  currentUrl: string;
  onUrlChange: (newUrl: string) => void;
  onTriggerFullReport: (result: ScanResult) => void;
}

export default function ChromePopup({ currentUrl, onUrlChange, onTriggerFullReport }: ChromePopupProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'report' | 'settings'>('home');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [customReportUrl, setCustomReportUrl] = useState('');
  const [customReportCategory, setCustomReportCategory] = useState('phishing');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([
    { id: '1', url: 'https://paypal.com', domain: 'paypal.com', score: 99, rating: 'GOOD', timestamp: '10 mins ago' },
    { id: '2', url: 'https://paypa1-security.com', domain: 'paypa1-security.com', score: 5, rating: 'ROTTEN', timestamp: '1 hr ago' },
    { id: '3', url: 'https://crypto-doubler-fast.co', domain: 'crypto-doubler-fast.co', score: 8, rating: 'ROTTEN', timestamp: 'Yesterday' },
    { id: '4', url: 'https://local-bakery-shop-ny.com', domain: 'local-bakery-shop-ny.com', score: 72, rating: 'CAREFUL', timestamp: '2 days ago' },
  ]);
  const [trustedDomains, setTrustedDomains] = useState<string[]>(['google.com', 'github.com']);
  const [settings, setSettings] = useState({
    realtimeShield: true,
    eggNotifications: true,
    strictYolkFilter: false,
    autoReport: false
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Trigger scanning animation and analysis
  const runScan = (urlToScan: string) => {
    setIsScanning(true);
    // Simulate short network delay
    setTimeout(() => {
      const result = analyzeUrl(urlToScan);
      setScanResult(result);
      setIsScanning(false);
      
      // Auto-add to search history if not already present
      const exists = searchHistory.some(item => item.domain === result.domain);
      if (!exists && result.domain) {
        const newItem: SearchHistoryItem = {
          id: Date.now().toString(),
          url: result.url,
          domain: result.domain,
          score: result.score,
          rating: result.rating,
          timestamp: 'Just now'
        };
        setSearchHistory(prev => [newItem, ...prev]);
      }
    }, 700);
  };

  // Run initial scan when URL changes
  useEffect(() => {
    runScan(currentUrl);
  }, [currentUrl]);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleMarkAsTrusted = () => {
    if (!scanResult) return;
    if (trustedDomains.includes(scanResult.domain)) {
      triggerNotification(`"${scanResult.domain}" is already trusted.`);
      return;
    }
    setTrustedDomains(prev => [...prev, scanResult.domain]);
    // Force score to 100 on trust list representation
    setScanResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        score: 100,
        rating: 'GOOD',
        statusText: 'Good Egg (User Trusted)',
        description: 'You marked this site as a trusted Good Egg! Happy safe surfing!'
      };
    });
    triggerNotification(`Added ${scanResult.domain} to safe list!`);
  };

  const handleReportScam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReportUrl) return;
    setReportSuccess(true);
    triggerNotification('Report filed to Det-Egg-Tive Mate! 🥚🔍');
    setCustomReportUrl('');
    setTimeout(() => setReportSuccess(false), 3000);
  };

  // Get color indicators based on rating
  const getRatingInfo = (rating: EggRating) => {
    switch (rating) {
      case 'GOOD':
        return {
          bg: 'bg-brand-green/10',
          text: 'text-brand-green',
          border: 'border-brand-green/30',
          badgeText: 'Safe Site',
          badgeBg: 'bg-brand-green text-white',
          accent: '#4CAF50'
        };
      case 'CAREFUL':
        return {
          bg: 'bg-brand-yellow/10',
          text: 'text-brand-orange',
          border: 'border-brand-yellow/50',
          badgeText: 'Suspicious',
          badgeBg: 'bg-brand-orange text-white',
          accent: '#FF9F1C'
        };
      case 'CRACKED':
        return {
          bg: 'bg-brand-red/5',
          text: 'text-brand-orange',
          border: 'border-brand-yellow/60',
          badgeText: 'High Risk',
          badgeBg: 'bg-brand-orange text-white',
          accent: '#FFD166'
        };
      case 'ROTTEN':
        return {
          bg: 'bg-brand-red/10',
          text: 'text-brand-red',
          border: 'border-brand-red/30',
          badgeText: 'DANGER SCAM',
          badgeBg: 'bg-brand-red text-white',
          accent: '#EF4444'
        };
      default:
        return {
          bg: 'bg-brand-dark/5',
          text: 'text-brand-dark',
          border: 'border-brand-border',
          badgeText: 'Unknown',
          badgeBg: 'bg-brand-dark text-white',
          accent: '#2D2A26'
        };
    }
  };

  const ratingInfo = scanResult ? getRatingInfo(isScanning ? 'LOADING' : scanResult.rating) : getRatingInfo('UNKNOWN');

  return (
    <div 
      id="chrome-popup-container" 
      className="w-[360px] h-[560px] bg-bg-warm rounded-3xl border-8 border-brand-dark shadow-2xl overflow-hidden flex flex-col font-sans relative"
    >
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-brand-dark text-white text-xs px-3 py-2 rounded-full shadow-lg border border-brand-border flex items-center gap-1.5 animate-bounce-subtle">
          <Check size={12} className="text-brand-yellow" />
          <span>{notification}</span>
        </div>
      )}

      {/* Pop-up Frame Top Header */}
      <header className="bg-brand-white border-b-2 border-brand-border p-3.5 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-9 overflow-visible bg-bg-warm rounded-lg flex items-center justify-center p-0.5 border border-brand-border">
            <MascotEgg rating={isScanning ? 'LOADING' : (scanResult?.rating || 'UNKNOWN')} size={28} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-brand-dark text-sm tracking-tight leading-none">LegitMate</span>
              <span className="text-[9px] font-bold bg-brand-orange/20 text-brand-deep px-1 py-0.2 rounded-sm uppercase">PRO</span>
            </div>
            <span className="text-[10px] font-semibold text-brand-dark/60 block mt-0.5">Det-Egg-Tive Mate Assistant</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            id="settings-tab-btn"
            onClick={() => setActiveTab(activeTab === 'settings' ? 'home' : 'settings')}
            className={`p-1.5 rounded-lg hover:bg-bg-warm transition-colors ${activeTab === 'settings' ? 'text-brand-orange bg-bg-warm' : 'text-brand-dark/50'}`}
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT SCROLLABLE AREA */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 pb-16">
        
        {/* TAB 1: HOME PANEL */}
        {activeTab === 'home' && (
          <>
            {/* CURRENT SITE DETAILS CARD */}
            <div className="bg-brand-white p-3 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-bg-warm border border-brand-border flex items-center justify-center text-brand-dark/70 shrink-0">
                  <Globe size={14} className="text-brand-orange" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-brand-dark/40 tracking-wider">Simulated Tab</span>
                  <div className="text-xs font-semibold text-brand-dark font-mono truncate max-w-[150px]">
                    {isScanning ? 'resolving link...' : (scanResult?.domain || 'unknown')}
                  </div>
                </div>
              </div>

              {/* State Status Bagde */}
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-2xs ${ratingInfo.badgeBg} shrink-0`}>
                {isScanning ? 'CHECKING...' : ratingInfo.badgeText}
              </div>
            </div>

            {/* EGG MASCOT & TRUST SCORE SECTION */}
            <div className="bg-brand-white p-4 rounded-2xl border-2 border-brand-border shadow-xs flex flex-col items-center text-center relative overflow-visible">
              {/* Score visual helper ring in background */}
              <div className="absolute top-1 right-2 text-[10px] font-bold text-brand-dark/30 font-mono">
                Scoring: v1.2
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
                      stroke={
                        isScanning ? '#FF9F1C' :
                        scanResult?.rating === 'GOOD' ? '#4CAF50' : 
                        scanResult?.rating === 'CAREFUL' ? '#FF9F1C' : 
                        scanResult?.rating === 'CRACKED' ? '#E86A17' : '#EF4444'
                      } 
                      strokeWidth="6" 
                      strokeDasharray={`${(isScanning ? 33 : (scanResult?.score || 0)) * 2.89} 289`} // 2 * Math.PI * 46 = ~289.02
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-visible">
                    <MascotEgg rating={isScanning ? 'LOADING' : (scanResult?.rating || 'UNKNOWN')} size={54} />
                    <span className="text-[10px] font-black font-mono leading-none mt-1 text-brand-dark">{isScanning ? '--' : scanResult?.score}</span>
                  </div>
                </div>

                <div className="mt-2 text-center w-full">
                  {/* Egg State name displayed prominently */}
                  <div id="full-egg-state-label" className={`text-sm font-black uppercase tracking-wider ${
                    isScanning ? 'text-brand-orange' :
                    scanResult?.rating === 'GOOD' ? 'text-brand-green' : 
                    scanResult?.rating === 'CAREFUL' ? 'text-brand-orange' : 
                    scanResult?.rating === 'CRACKED' ? 'text-brand-orange' : 'text-brand-red'
                  }`}>
                    {isScanning ? '🐣 Scrambling Egg...' : (
                      scanResult?.rating === 'GOOD' ? '🟢 Good Egg' :
                      scanResult?.rating === 'CAREFUL' ? '🟡 Careful Egg' :
                      scanResult?.rating === 'CRACKED' ? '🟠 Cracked Egg' : '🔴 Rotten Egg'
                    )}
                  </div>
                  
                  <div className="text-[10px] text-brand-dark/75 mt-1 font-semibold px-2">
                    Verdict: <span className="font-bold">{isScanning ? 'Reviewing indicators...' : scanResult?.statusText}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-brand-dark/75 mt-2 max-w-[280px] leading-relaxed font-sans px-2">
                {isScanning ? 'Scanning certificate chains, heuristic phishing patterns, and registrar database registers...' : scanResult?.description}
              </p>
            </div>

            {/* PLAIN-ENGLISH REASONS LIST */}
            <div className="bg-brand-white p-3 rounded-xl border border-brand-border shadow-xs">
              <h4 className="text-[11px] font-bold text-brand-dark/50 uppercase tracking-wider mb-2 flex items-center gap-1 justify-between">
                <span>Det-egg-tive Log:</span>
                {!isScanning && scanResult && (
                  <span className="text-[10px] font-mono lowercase normal-case text-brand-orange font-bold">
                    risk: {scanResult.details.phishingRisk}
                  </span>
                )}
              </h4>
              
              <ul className="flex flex-col gap-2">
                {isScanning ? (
                  // Loading fake skeletal states
                  Array.from({ length: 3 }).map((_, i) => (
                    <li key={i} className="flex gap-2 items-start animate-pulse">
                      <div className="w-3.5 h-3.5 rounded-full bg-bg-warm shrink-0 mt-0.5" />
                      <div className="h-3 bg-bg-warm rounded w-full" />
                    </li>
                  ))
                ) : scanResult && scanResult.reasons.length > 0 ? (
                  scanResult.reasons.map((reason, index) => (
                    <li key={index} className="flex gap-2 items-start text-xs text-brand-dark/85">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        scanResult.rating === 'GOOD' ? 'bg-brand-green' : 
                        scanResult.rating === 'CAREFUL' ? 'bg-brand-orange' : 'bg-brand-red'
                      }`} />
                      <span className="leading-tight">{reason}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-brand-dark/50 italic text-center py-2">
                    No explicit scans loaded yet.
                  </li>
                )}
              </ul>
            </div>

            {/* MAIN BUTTON ACTIONS */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                id="popup-scan-again-btn"
                onClick={() => runScan(currentUrl)}
                disabled={isScanning}
                className="bg-brand-white hover:bg-bg-warm active:scale-95 text-brand-dark font-display font-bold text-xs py-2 px-3 rounded-lg border-2 border-brand-border shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                Scan Again
              </button>
              
              <button
                id="popup-view-report-btn"
                onClick={() => scanResult && onTriggerFullReport(scanResult)}
                className="bg-brand-orange hover:bg-brand-deep active:scale-95 text-white font-display font-bold text-xs py-2 px-3 rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Info size={12} />
                View Full Report
              </button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="flex items-center justify-between border-t border-brand-border/60 pt-3 mt-1 px-1">
              <button 
                id="popup-trust-btn"
                onClick={handleMarkAsTrusted}
                className="text-[11px] font-bold text-brand-green hover:text-brand-green/80 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ThumbsUp size={12} />
                Mark as Trusted
              </button>

              <button 
                id="popup-navigate-to-report-btn"
                onClick={() => setActiveTab('report')}
                className="text-[11px] font-bold text-brand-red hover:text-brand-red/85 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldAlert size={12} />
                Report Scam Website
              </button>
            </div>
          </>
        )}

        {/* TAB 2: HISTORY PANEL */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-brand-dark">Search & Scan History</h3>
              <button 
                id="clear-history-btn"
                onClick={() => { setSearchHistory([]); triggerNotification('History cleared!'); }}
                className="text-[10px] font-bold text-brand-dark/40 hover:text-brand-red transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto custom-scrollbar">
              {searchHistory.length === 0 ? (
                <div className="text-center py-12 text-brand-dark/40">
                  <HistoryIcon size={24} className="mx-auto opacity-35 mb-2" />
                  <p className="text-xs">No scan history saved yet.</p>
                </div>
              ) : (
                searchHistory.map((item) => {
                  const stateColors = getRatingInfo(item.rating);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => { onUrlChange(item.url); setActiveTab('home'); }}
                      className="bg-brand-white p-2.5 rounded-xl border border-brand-border hover:border-brand-orange hover:bg-bg-warm/35 transition-all text-left flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-semibold text-brand-dark truncate">{item.domain}</div>
                        <span className="text-[10px] text-brand-dark/40 block mt-0.5">{item.timestamp}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${stateColors.bg} ${stateColors.text}`}>
                          {item.score} pts
                        </div>
                        <ChevronRight size={12} className="text-brand-dark/30 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REPORT PANEL */}
        {activeTab === 'report' && (
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <h3 className="font-display font-bold text-sm text-brand-dark">Blower the Whistle! 🥚📢</h3>
              <p className="text-xs text-brand-dark/60 mt-1">Help LegitMate shield other Good Eggs by tagging suspicious links immediately!</p>
            </div>

            {reportSuccess ? (
              <div className="bg-brand-white p-6 rounded-xl border border-brand-border text-center flex flex-col items-center gap-3 animate-pulse-slow">
                <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center">
                  <CheckShieldIcon size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-dark">Report Filed Successfully</h4>
                  <p className="text-xs text-brand-dark/60 mt-1">LegitMate is investigating this server host. Thank you for scanning!</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportScam} className="bg-brand-white p-4 rounded-xl border border-brand-border flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-brand-dark/50 tracking-wider block mb-1">
                    Suspect Website URL
                  </label>
                  <input
                    id="report-url-input"
                    type="text"
                    required
                    placeholder="e.g. dodgy-deal-payout.info"
                    value={customReportUrl}
                    onChange={(e) => setCustomReportUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-brand-border bg-bg-warm/30 focus:outline-none focus:border-brand-orange focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-brand-dark/50 tracking-wider block mb-1">
                    Scam Type
                  </label>
                  <select
                    id="report-scam-type"
                    value={customReportCategory}
                    onChange={(e) => setCustomReportCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-brand-border bg-bg-warm/30 focus:outline-none focus:border-brand-orange focus:bg-white"
                  >
                    <option value="phishing">Phishing Login Page</option>
                    <option value="fake_shop">Fake Storefront / Shopping scam</option>
                    <option value="crypto_doubler">Investment / Get-Rich-Quick Doubler</option>
                    <option value="impersonation">Brand Copycat & Typosquatting</option>
                    <option value="other">Malicious Adware / Scam Link</option>
                  </select>
                </div>

                <button
                  id="submit-report-btn"
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-deep w-full text-white text-xs font-display font-bold py-2 rounded-lg mt-1 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send size={11} />
                  Submit Report to Detective Mate
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS PANEL */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm text-brand-dark">Config & Shield Preferences</h3>
            
            <div className="bg-brand-white p-3.5 rounded-xl border border-brand-border flex flex-col gap-3.5">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-dark block">Real-Time Search Protection</span>
                  <span className="text-[10px] text-brand-dark/50 block">Scan background links ahead in search indices</span>
                </div>
                <button
                  id="toggle-realtime-btn"
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, realtimeShield: !prev.realtimeShield }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${settings.realtimeShield ? 'bg-brand-green' : 'bg-brand-dark/20'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all shadow-xs ${settings.realtimeShield ? 'right-0.75' : 'left-0.75'}`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between border-t border-brand-border/40 pt-3">
                <div>
                  <span className="text-xs font-bold text-brand-dark block">Yolk Notifications</span>
                  <span className="text-[10px] text-brand-dark/50 block">Flash tray alert on Cracked/Rotten warnings</span>
                </div>
                <button
                  id="toggle-notif-btn"
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, eggNotifications: !prev.eggNotifications }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${settings.eggNotifications ? 'bg-brand-green' : 'bg-brand-dark/20'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all shadow-xs ${settings.eggNotifications ? 'right-0.75' : 'left-0.75'}`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between border-t border-brand-border/40 pt-3">
                <div>
                  <span className="text-xs font-bold text-brand-dark block">Strict Safe-Filter</span>
                  <span className="text-[10px] text-brand-dark/50 block">Prevent load for ratings below 40 pts</span>
                </div>
                <button
                  id="toggle-strict-btn"
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, strictYolkFilter: !prev.strictYolkFilter }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${settings.strictYolkFilter ? 'bg-brand-green' : 'bg-brand-dark/20'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all shadow-xs ${settings.strictYolkFilter ? 'right-0.75' : 'left-0.75'}`} />
                </button>
              </div>
            </div>

            {/* Version indicators */}
            <div className="bg-brand-white p-2.5 rounded-lg border border-brand-border text-center text-[10px] font-mono text-brand-dark/40 uppercase">
              Agent Host client: 4.8.1-prod
            </div>
            
            <button
              id="back-home-settings-btn"
              onClick={() => setActiveTab('home')}
              className="bg-brand-dark hover:bg-brand-dark/90 text-white text-xs font-display font-bold py-2 rounded-lg cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </main>

      {/* STICKY BOTTOM TRAY */}
      <footer className="absolute bottom-0 left-0 right-0 h-14 bg-brand-white border-t-2 border-brand-border flex items-center justify-around z-10 p-0.5 shrink-0">
        <button 
          id="nav-home-btn"
          onClick={() => { setActiveTab('home'); }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-brand-orange' : 'text-brand-dark/40 hover:text-brand-orange/70'}`}
        >
          <Home size={18} />
          <span className="text-[9px] font-bold mt-0.5">Shield</span>
        </button>

        <button 
          id="nav-history-btn"
          onClick={() => { setActiveTab('history'); }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${activeTab === 'history' ? 'text-brand-orange' : 'text-brand-dark/40 hover:text-brand-orange/70'}`}
        >
          <HistoryIcon size={18} />
          <span className="text-[9px] font-bold mt-0.5">Journal</span>
        </button>

        <button 
          id="nav-report-btn"
          onClick={() => { setActiveTab('report'); }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${activeTab === 'report' ? 'text-brand-orange' : 'text-brand-dark/40 hover:text-brand-orange/70'}`}
        >
          <AlertOctagon size={18} />
          <span className="text-[9px] font-bold mt-0.5">Report</span>
        </button>

        <button 
          id="nav-settings-btn"
          onClick={() => { setActiveTab('settings'); }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${activeTab === 'settings' ? 'text-brand-orange' : 'text-brand-dark/40 hover:text-brand-orange/70'}`}
        >
          <SettingsIcon size={18} />
          <span className="text-[9px] font-bold mt-0.5">Setup</span>
        </button>
      </footer>
    </div>
  );
}

// Simple inline helper SVG icons for direct compilation cleanliness
function CheckShieldIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check">
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
