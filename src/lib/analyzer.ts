import type { OHLCVBar, VolumeSpike, AnalysisResult, Announcement } from "./types";

/**
 * Core analysis engine for detecting institutional accumulation/distribution
 * via volume-price divergence analysis.
 *
 * Methodology draws from:
 * - Volume Spread Analysis (VSA) — Tom Williams
 * - Wyckoff method — accumulation/distribution phases
 * - Statistical approach: z-score of returns + ATR-relative price movement
 *
 * Key insight: When volume spikes but price barely moves, large players are
 * likely accumulating (buying) or distributing (selling) without moving price.
 * They do this by absorbing counter-party flow — e.g., institutional buying
 * absorbs retail selling, keeping price flat despite huge volume.
 */

const ROLLING_WINDOW = 20;
const MIN_BARS_BEFORE_ANALYSIS = 40; // need enough history for ATR + rolling avg

export function analyze(
  bars: OHLCVBar[],
  volumeThreshold: number = 3,
  priceThreshold: number = 1.0,
  announcements: Map<string, Announcement[]> = new Map()
): { spikes: VolumeSpike[]; rollingVolumes: number[] } {
  if (bars.length < MIN_BARS_BEFORE_ANALYSIS) {
    return { spikes: [], rollingVolumes: [] };
  }

  const spikes: VolumeSpike[] = [];
  const rollingVolumes: number[] = new Array(bars.length).fill(0);

  for (let i = ROLLING_WINDOW; i < bars.length; i++) {
    // Calculate 20-day rolling average volume
    let sumVol = 0;
    for (let j = i - ROLLING_WINDOW; j < i; j++) {
      sumVol += bars[j].volume;
    }
    const rollingAvgVolume = sumVol / ROLLING_WINDOW;
    rollingVolumes[i] = rollingAvgVolume;

    const bar = bars[i];
    const volumeMultiplier = bar.volume / rollingAvgVolume;

    if (volumeMultiplier < volumeThreshold) continue;

    // --- Price behavior analysis ---

    // Close-to-close return
    const prevClose = bars[i - 1].close;
    const priceChangePercent = ((bar.close - prevClose) / prevClose) * 100;

    // Intraday metrics
    const intradayChangePercent = ((bar.close - bar.open) / bar.open) * 100;
    const intradayRange = bar.high - bar.low;

    // Body-to-range ratio (VSA "spread" analysis)
    // Small body relative to range = indecision / absorption
    const bodyToRangeRatio =
      intradayRange > 0 ? Math.abs(bar.close - bar.open) / intradayRange : 0;

    // Close position within day's range (Wyckoff)
    // Close near high = buying pressure; close near low = selling pressure
    const closePosition =
      intradayRange > 0 ? (bar.close - bar.low) / intradayRange : 0.5;

    // ATR(20) — Average True Range for context
    const atr20 = calculateATR(bars, i, ROLLING_WINDOW);

    // Price change relative to ATR
    const priceChangeToATR = atr20 > 0 ? Math.abs(bar.close - prevClose) / atr20 : 0;

    // Return z-score (how unusual is this day's return?)
    const returnZScore = calculateReturnZScore(bars, i, ROLLING_WINDOW);

    // --- Classification ---
    const { classification, signals } = classify(
      volumeMultiplier,
      priceChangePercent,
      priceChangeToATR,
      bodyToRangeRatio,
      closePosition,
      returnZScore,
      priceThreshold
    );

    // Fetch announcements for this date
    const dateKey = bar.date;
    const dayAnnouncements = announcements.get(dateKey) || [];

    spikes.push({
      date: bar.date,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
      rollingAvgVolume: Math.round(rollingAvgVolume),
      volumeMultiplier: Math.round(volumeMultiplier * 100) / 100,
      priceChangePercent: Math.round(priceChangePercent * 100) / 100,
      intradayChangePercent: Math.round(intradayChangePercent * 100) / 100,
      intradayRange: Math.round(intradayRange * 100) / 100,
      atr20: Math.round(atr20 * 100) / 100,
      priceChangeToATR: Math.round(priceChangeToATR * 100) / 100,
      bodyToRangeRatio: Math.round(bodyToRangeRatio * 100) / 100,
      closePosition: Math.round(closePosition * 100) / 100,
      returnZScore: Math.round(returnZScore * 100) / 100,
      classification,
      signals,
      announcements: dayAnnouncements,
    });
  }

  return { spikes, rollingVolumes };
}

function calculateATR(bars: OHLCVBar[], index: number, period: number): number {
  let sumTR = 0;
  const start = Math.max(1, index - period + 1);
  const count = index - start + 1;

  for (let i = start; i <= index; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;
    const trueRange = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    sumTR += trueRange;
  }

  return sumTR / count;
}

function calculateReturnZScore(
  bars: OHLCVBar[],
  index: number,
  period: number
): number {
  const returns: number[] = [];
  const start = Math.max(1, index - period);

  for (let i = start; i <= index; i++) {
    const ret = (bars[i].close - bars[i - 1].close) / bars[i - 1].close;
    returns.push(ret);
  }

  if (returns.length < 2) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  const currentReturn = returns[returns.length - 1];
  return (currentReturn - mean) / stdDev;
}

function classify(
  volumeMultiplier: number,
  priceChangePercent: number,
  priceChangeToATR: number,
  bodyToRangeRatio: number,
  closePosition: number,
  returnZScore: number,
  priceThreshold: number
): {
  classification: VolumeSpike["classification"];
  signals: string[];
} {
  const signals: string[] = [];
  const absReturnZ = Math.abs(returnZScore);

  // Price moved significantly?
  // "Significant" = price change > priceThreshold * ATR AND return z-score > 1.5
  const priceSignificant =
    priceChangeToATR > priceThreshold && absReturnZ > 1.5;

  // Price barely moved despite huge volume?
  // "Quiet" = price change < 0.5 * ATR AND return z-score < 1.0
  const priceQuiet = priceChangeToATR < 0.5 && absReturnZ < 1.0;

  // VSA body analysis: narrow body = absorption
  const narrowBody = bodyToRangeRatio < 0.3;

  if (priceSignificant) {
    // NEWS / EVENT DRIVEN
    signals.push(
      `Price moved ${Math.abs(priceChangePercent).toFixed(1)}% — ${priceChangeToATR.toFixed(1)}x ATR`
    );
    signals.push(`Return z-score: ${returnZScore.toFixed(1)}σ (unusual move)`);

    if (priceChangePercent > 0) {
      signals.push("Strong bullish move — likely positive news/earnings");
      return { classification: "news_driven_up", signals };
    } else {
      signals.push("Strong bearish move — likely negative news/earnings");
      return { classification: "news_driven_down", signals };
    }
  }

  if (priceQuiet || (narrowBody && priceChangeToATR < 0.7)) {
    // INSTITUTIONAL — volume spike but price absorbed
    signals.push(
      `Volume ${volumeMultiplier.toFixed(1)}x avg but price only moved ${Math.abs(priceChangePercent).toFixed(1)}%`
    );
    signals.push(
      `Price change just ${priceChangeToATR.toFixed(2)}x ATR — absorbed`
    );

    if (narrowBody) {
      signals.push(
        `Narrow candle body (${(bodyToRangeRatio * 100).toFixed(0)}% of range) — classic absorption`
      );
    }

    if (closePosition > 0.6) {
      signals.push(
        `Close in upper ${((1 - closePosition) * 100).toFixed(0)}% of range — buying pressure (accumulation)`
      );
      return { classification: "institutional_accumulation", signals };
    } else if (closePosition < 0.4) {
      signals.push(
        `Close in lower ${(closePosition * 100).toFixed(0)}% of range — selling pressure (distribution)`
      );
      return { classification: "institutional_distribution", signals };
    } else {
      // Close is mid-range — use price direction as tiebreaker
      if (priceChangePercent >= 0) {
        signals.push("Close near mid-range, slight upward bias — likely accumulation");
        return { classification: "institutional_accumulation", signals };
      } else {
        signals.push("Close near mid-range, slight downward bias — likely distribution");
        return { classification: "institutional_distribution", signals };
      }
    }
  }

  // AMBIGUOUS — somewhere between news-driven and institutional
  signals.push(
    `Moderate price movement (${priceChangeToATR.toFixed(2)}x ATR) with ${volumeMultiplier.toFixed(1)}x volume`
  );
  signals.push(
    "Could be partial institutional activity with some news catalyst"
  );
  return { classification: "ambiguous", signals };
}

export function buildAnalysisResult(
  symbol: string,
  companyName: string,
  bars: OHLCVBar[],
  spikes: VolumeSpike[],
  rollingVolumes: number[]
): AnalysisResult {
  const institutionalEvents = spikes.filter(
    (s) =>
      s.classification === "institutional_accumulation" ||
      s.classification === "institutional_distribution"
  ).length;

  const newsEvents = spikes.filter(
    (s) =>
      s.classification === "news_driven_up" ||
      s.classification === "news_driven_down"
  ).length;

  const ambiguousEvents = spikes.filter(
    (s) => s.classification === "ambiguous"
  ).length;

  const accumulationEvents = spikes.filter(
    (s) => s.classification === "institutional_accumulation"
  ).length;

  const distributionEvents = spikes.filter(
    (s) => s.classification === "institutional_distribution"
  ).length;

  const avgSpikeMultiplier =
    spikes.length > 0
      ? spikes.reduce((sum, s) => sum + s.volumeMultiplier, 0) / spikes.length
      : 0;

  const maxSpikeMultiplier =
    spikes.length > 0
      ? Math.max(...spikes.map((s) => s.volumeMultiplier))
      : 0;

  return {
    symbol,
    companyName,
    dataStartDate: bars.length > 0 ? bars[0].date : "",
    dataEndDate: bars.length > 0 ? bars[bars.length - 1].date : "",
    totalTradingDays: bars.length,
    totalSpikes: spikes.length,
    institutionalEvents,
    newsEvents,
    ambiguousEvents,
    accumulationEvents,
    distributionEvents,
    avgSpikeMultiplier: Math.round(avgSpikeMultiplier * 100) / 100,
    maxSpikeMultiplier: Math.round(maxSpikeMultiplier * 100) / 100,
    spikes,
    dailyData: bars,
    rollingVolumes,
  };
}
