import React, { useState, useEffect } from 'react';
import { 
  Chrome, 
  Sparkles, 
  X, 
  HelpCircle, 
  Layers, 
  Cpu, 
  ExternalLink, 
  AlertTriangle 
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import ChromePopup from './components/ChromePopup';
import MascotEgg from './components/MascotEgg';
import { ScanResult } from './types';
import { analyzeUrl } from './utils/analyzer';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('amazon-security-update-alert.xyz');
  const [selectedReportResult, setSelectedReportResult] = useState<ScanResult | null>(null);
  const [isExtensionHubOpen, setIsExtensionHubOpen] = useState(false);
  const [activeScannedResult, setActiveScannedResult] = useState<ScanResult | null>(null);
  const [showWorkspaceNotification, setShowWorkspaceNotification] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10000); // 10 seconds total duration
  const totalDuration = 10000;

  // Auto-dismiss countdown for workspace toast
  useEffect(() => {
    if (!showWorkspaceNotification) return;
    const intervalTime = 100;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= intervalTime) {
          setShowWorkspaceNotification(false);
          clearInterval(timer);
          return 0;
        }
        return prev - intervalTime;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [showWorkspaceNotification]);

  // Sync analyzed state for overlay parameters
  useEffect(() => {
    const res = analyzeUrl(currentUrl);
    setActiveScannedResult(res);
  }, [currentUrl]);

  const handleUrlChange = (newUrl: string) => {
    setCurrentUrl(newUrl);
  };

  const handleSelectDemo = (domain: string) => {
    setCurrentUrl(domain);
  };

  const handleTriggerFullReport = (result: ScanResult) => {
    setSelectedReportResult(result);
  };

  const handleClearReport = () => {
    setSelectedReportResult(null);
  };

  return (
    <div id="legitmate-master-root" className="min-h-screen bg-bg-warm flex flex-col relative font-sans selection:bg-[#FF9F1C] selection:text-white">
      
      {/* FLOATING DESIGN WORKSPACE TOAST NOTIFICATION (With real-time loading countdown bar and auto-dismiss) */}
      {showWorkspaceNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-brand-dark text-brand-white p-4 pb-5 rounded-2xl border-2 border-[#FF9F1C] shadow-2xl animate-fade-in-up pointer-events-auto overflow-hidden">
          <div className="flex gap-3">
            <div className="w-10 h-10 shrink-0 bg-white/10 rounded-xl border border-brand-orange/45 flex items-center justify-center p-0.5">
              <MascotEgg rating="GOOD" size={30} />
            </div>
            
            <div className="flex-1 pr-3">
              <div className="text-[10px] font-mono tracking-widest text-[#FF9F1C] font-black uppercase">
                INTERACTIVE WORKSPACE
              </div>
              <p className="text-[11px] font-semibold text-brand-yellow mt-1 leading-normal font-sans">
                Preview the live Chrome extension overlay mockup interacting with the detective dashboard.
              </p>
              
              <div className="mt-3 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExtensionHubOpen(!isExtensionHubOpen)}
                  className="bg-[#FF9F1C] hover:bg-brand-orange text-brand-dark text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-md cursor-pointer transition-all active:scale-95"
                >
                  {isExtensionHubOpen ? 'Hide Extension' : 'Show Extension'}
                </button>
                <span className="text-[10px] font-mono text-brand-white/50 font-medium">Target: 360x560px Popup</span>
              </div>
            </div>

            {/* Close Button X */}
            <button
              type="button"
              onClick={() => setShowWorkspaceNotification(false)}
              className="absolute top-2.5 right-2.5 text-brand-white/60 hover:text-brand-orange transition-colors cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>

          {/* Toast Countdown Loader Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-white/10">
            <div 
              className="h-full bg-brand-orange transition-all duration-100 ease-linear"
              style={{ width: `${(timeLeft / totalDuration) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* PRIMARY RESPONSIVE LANDING PAGE */}
      <LandingPage 
        onUrlChange={handleUrlChange}
        onSelectDemo={handleSelectDemo}
        currentlyScannedResult={activeScannedResult}
        selectedReportResult={selectedReportResult}
        onClearReport={handleClearReport}
        onTriggerFullReport={handleTriggerFullReport}
      />

      {/* FLOATING CORNER EXTENSION LAUNCHER & SIMULATOR */}
      {/* Allows testing the authentic extension interface overlaying any responsive viewport */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* The Extension Panel (Floating container with entry transition) */}
        {isExtensionHubOpen && (
          <div className="pointer-events-auto h-[570px] flex flex-col items-end select-none animate-[bounce-subtle_4s_infinite_ease-in-out]">
            {/* Direct Close Button on floating hub */}
            <button
              id="close-floating-ext"
              onClick={() => setIsExtensionHubOpen(false)}
              className="bg-brand-dark text-white hover:bg-brand-red p-1.5 rounded-full border border-brand-border/60 shadow-md mb-1.5 hover:scale-105 transition-all cursor-pointer flex items-center justify-center pointer-events-auto self-end"
              title="Close Panel Overlay"
            >
              <X size={14} />
            </button>

            <div className="shadow-2xl rounded-3xl overflow-hidden border-2 border-brand-dark bg-bg-warm">
              <ChromePopup 
                currentUrl={currentUrl}
                onUrlChange={handleUrlChange}
                onTriggerFullReport={handleTriggerFullReport}
              />
            </div>
          </div>
        )}

        {/* Pulse Floating Pocket Toggle Icon */}
        <button
          id="floating-hub-toggle"
          onClick={() => setIsExtensionHubOpen(!isExtensionHubOpen)}
          className="pointer-events-auto bg-brand-orange hover:bg-brand-deep border-4 border-brand-dark rounded-full p-3 shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs font-display font-extrabold text-brand-dark tracking-tight cursor-pointer cursor-pointers select-none animate-bounce"
        >
          {isExtensionHubOpen ? (
            <>
              <X size={16} className="text-brand-dark" />
              <span>Close Extension Preview</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg outline-none bg-white flex items-center justify-center p-0.5 border border-brand-dark shadow-2xs">
                <MascotEgg rating={activeScannedResult?.rating || 'GOOD'} size={24} />
              </div>
              <span className="text-white pr-1">Try Egg-tention Panel overlay</span>
              
              {/* Little Notification badge for warning states */}
              {activeScannedResult && activeScannedResult.score < 50 && (
                <div className="w-3.5 h-3.5 bg-brand-red text-white flex items-center justify-center rounded-full text-[9px] font-bold absolute -top-1 -left-1 animate-ping">
                  !
                </div>
              )}
            </>
          )}
        </button>

      </div>

    </div>
  );
}
