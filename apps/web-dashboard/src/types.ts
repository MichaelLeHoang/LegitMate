export type EggRating = 'GOOD' | 'CAREFUL' | 'CRACKED' | 'ROTTEN' | 'LOADING' | 'UNKNOWN';

export interface ScanResult {
  url: string;
  domain: string;
  score: number; // 0 - 100
  rating: EggRating;
  statusText: string; // "Good Egg", "Careful Egg", "Cracked Egg", "Rotten Egg"
  description: string;
  reasons: string[];
  details: {
    sslStatus: 'secure' | 'warning' | 'none';
    domainAge: string;
    popularity: 'high' | 'medium' | 'low' | 'unknown';
    phishingRisk: 'none' | 'low' | 'medium' | 'high';
  };
}

export interface SearchHistoryItem {
  id: string;
  url: string;
  domain: string;
  score: number;
  rating: EggRating;
  timestamp: string;
}
