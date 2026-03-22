export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Per-factor score: +1 (accumulation), -1 (distribution), 0 (neutral)
export interface FactorScores {
  clv: number;         // Close Location Value: >0.7 = +1, <0.3 = -1
  cmf: number;         // Chaikin Money Flow (20d): >+0.05 = +1, <-0.05 = -1
  volumeAsymmetry: number; // Up-vol / Down-vol ratio (10d): >1.3 = +1, <0.7 = -1
  adlSlope: number;    // ADL trend (20d): rising = +1, falling = -1
  effortVsResult: number; // High vol + narrow spread + close position
  followThrough: number;  // Next 3 bars: price holds = +1, fails = -1
}

export interface VolumeSpike {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rollingAvgVolume: number;
  volumeMultiplier: number;
  priceChangePercent: number;
  intradayChangePercent: number;
  intradayRange: number;
  atr20: number;
  priceChangeToATR: number;
  bodyToRangeRatio: number;
  closePosition: number;  // CLV: (close - low) / (high - low)
  returnZScore: number;

  // New multi-factor classification
  cmf20: number;          // Chaikin Money Flow (20-period) at time of spike
  adlSlope: number;       // ADL slope over 20 bars (normalized)
  volumeAsymmetryRatio: number; // avg vol on up-closes / avg vol on down-closes (10d)
  followThroughScore: number;   // +1 price held, -1 price failed, 0 no data yet

  factorScores: FactorScores;
  totalScore: number;     // Sum of all factor scores (-6 to +6)
  confidence: "high" | "moderate" | "low";

  classification: "institutional_accumulation" | "institutional_distribution" | "news_driven_up" | "news_driven_down" | "ambiguous";
  signals: string[];
  announcements: Announcement[];
}

export interface Announcement {
  date: string;
  headline: string;
  category?: string;
  source?: string;
}

export interface AnalysisResult {
  symbol: string;
  companyName: string;
  dataStartDate: string;
  dataEndDate: string;
  totalTradingDays: number;
  totalSpikes: number;
  institutionalEvents: number;
  newsEvents: number;
  ambiguousEvents: number;
  accumulationEvents: number;
  distributionEvents: number;
  avgSpikeMultiplier: number;
  maxSpikeMultiplier: number;
  spikes: VolumeSpike[];
  dailyData: OHLCVBar[];
  rollingVolumes: number[];
}

export interface AnalysisRequest {
  symbol: string;
  exchange?: "NSE" | "BSE";
  years?: number;
  volumeThreshold?: number;
  priceThreshold?: number;
}
