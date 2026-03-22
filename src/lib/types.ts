export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface VolumeSpike {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rollingAvgVolume: number;
  volumeMultiplier: number; // e.g., 4.2x
  priceChangePercent: number; // close-to-close % change
  intradayChangePercent: number; // (close - open) / open
  intradayRange: number; // high - low
  atr20: number; // 20-day Average True Range
  priceChangeToATR: number; // |price change| / ATR — measures if price move is significant
  bodyToRangeRatio: number; // |close - open| / (high - low) — narrow body = institutional
  closePosition: number; // (close - low) / (high - low) — 0=closed at low, 1=closed at high
  returnZScore: number; // how many std devs is this day's return from recent mean
  classification: "institutional_accumulation" | "institutional_distribution" | "news_driven_up" | "news_driven_down" | "ambiguous";
  signals: string[]; // human-readable signals
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
  dailyData: OHLCVBar[]; // for charting
  rollingVolumes: number[]; // 20-day rolling avg for charting
}

export interface AnalysisRequest {
  symbol: string;
  exchange?: "NSE" | "BSE";
  years?: number; // default 5
  volumeThreshold?: number; // default 3
  priceThreshold?: number; // ATR multiplier for "significant" price change, default 1.0
}
