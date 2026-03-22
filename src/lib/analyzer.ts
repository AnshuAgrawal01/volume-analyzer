import type { OHLCVBar, VolumeSpike, AnalysisResult, Announcement, FactorScores } from "./types";

/**
 * Institutional Flow Detector — Multi-Factor Scoring Engine
 *
 * Classification draws from:
 *
 * 1. Volume Spread Analysis (VSA) — Tom Williams
 *    - Effort vs Result: high volume + narrow spread = absorption
 *    - CLV thresholds: >0.7 accumulation, <0.3 distribution
 *    - Spread classification relative to 20-bar average
 *
 * 2. Wyckoff Method — Richard Wyckoff
 *    - Multi-bar volume asymmetry (heavier on advances = accumulation)
 *    - Follow-through confirmation (next 2-5 bars must confirm)
 *    - Effort vs Result law
 *
 * 3. Chaikin Money Flow (CMF) — Marc Chaikin
 *    - 20-period volume-weighted CLV: >+0.05 accumulation, <-0.05 distribution
 *
 * 4. Accumulation/Distribution Line (ADL) — Larry Williams / Chaikin
 *    - Cumulative CLV × Volume; divergence from price = institutional activity
 *
 * 5. Statistical layer
 *    - ATR-relative price change for news vs institutional separation
 *    - Return z-score for unusual move detection
 *
 * Single-bar classification is insufficient (all sources agree).
 * We use a 6-factor scoring system with multi-bar context.
 */

const ROLLING_WINDOW = 20;
const VOLUME_ASYMMETRY_WINDOW = 10;
const FOLLOW_THROUGH_BARS = 3;
const MIN_BARS_BEFORE_ANALYSIS = 40;

// ─── Pre-computed arrays for the full bar series ───

interface PrecomputedData {
  clv: number[];          // Close Location Value per bar
  adl: number[];          // Cumulative Accumulation/Distribution Line
  cmf: number[];          // Chaikin Money Flow (20-period)
  atr: number[];          // ATR(20) per bar
  rollingAvgVolume: number[];
  volumeAsymmetry: number[]; // up-volume / down-volume ratio (10-bar)
  avgSpread: number[];    // 20-bar average spread (high - low)
  returnZScore: number[];
}

function precompute(bars: OHLCVBar[]): PrecomputedData {
  const n = bars.length;
  const clv = new Array<number>(n).fill(0);
  const adl = new Array<number>(n).fill(0);
  const cmf = new Array<number>(n).fill(0);
  const atr = new Array<number>(n).fill(0);
  const rollingAvgVolume = new Array<number>(n).fill(0);
  const volumeAsymmetry = new Array<number>(n).fill(1);
  const avgSpread = new Array<number>(n).fill(0);
  const returnZScore = new Array<number>(n).fill(0);

  // ── CLV & ADL ──
  for (let i = 0; i < n; i++) {
    const range = bars[i].high - bars[i].low;
    clv[i] = range > 0
      ? (bars[i].close - bars[i].low) / range
      : 0.5;

    // Money Flow Volume = CLV * Volume
    const mfv = (2 * clv[i] - 1) * bars[i].volume; // CLV mapped to [-1, +1]
    adl[i] = (i > 0 ? adl[i - 1] : 0) + mfv;
  }

  // ── CMF(20): Sum(CLV_mapped * Volume) / Sum(Volume) over 20 bars ──
  for (let i = 0; i < n; i++) {
    if (i < ROLLING_WINDOW - 1) { cmf[i] = 0; continue; }
    let sumMFV = 0;
    let sumVol = 0;
    for (let j = i - ROLLING_WINDOW + 1; j <= i; j++) {
      sumMFV += (2 * clv[j] - 1) * bars[j].volume;
      sumVol += bars[j].volume;
    }
    cmf[i] = sumVol > 0 ? sumMFV / sumVol : 0;
  }

  // ── ATR(20) ──
  for (let i = 0; i < n; i++) {
    if (i < 1) { atr[i] = bars[i].high - bars[i].low; continue; }
    const start = Math.max(1, i - ROLLING_WINDOW + 1);
    let sumTR = 0;
    let count = 0;
    for (let j = start; j <= i; j++) {
      const tr = Math.max(
        bars[j].high - bars[j].low,
        Math.abs(bars[j].high - bars[j - 1].close),
        Math.abs(bars[j].low - bars[j - 1].close)
      );
      sumTR += tr;
      count++;
    }
    atr[i] = sumTR / count;
  }

  // ── Rolling avg volume (20-bar) ──
  for (let i = 0; i < n; i++) {
    if (i < ROLLING_WINDOW) {
      let s = 0;
      for (let j = 0; j <= i; j++) s += bars[j].volume;
      rollingAvgVolume[i] = s / (i + 1);
      continue;
    }
    let s = 0;
    for (let j = i - ROLLING_WINDOW; j < i; j++) s += bars[j].volume;
    rollingAvgVolume[i] = s / ROLLING_WINDOW;
  }

  // ── Average spread (20-bar) ──
  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - ROLLING_WINDOW + 1);
    let s = 0;
    for (let j = start; j <= i; j++) s += (bars[j].high - bars[j].low);
    avgSpread[i] = s / (i - start + 1);
  }

  // ── Volume asymmetry ratio (10-bar lookback) ──
  // avg volume on up-closes / avg volume on down-closes
  for (let i = 0; i < n; i++) {
    if (i < 2) { volumeAsymmetry[i] = 1; continue; }
    const start = Math.max(1, i - VOLUME_ASYMMETRY_WINDOW + 1);
    let upVol = 0, upCount = 0, downVol = 0, downCount = 0;
    for (let j = start; j <= i; j++) {
      if (bars[j].close >= bars[j - 1].close) {
        upVol += bars[j].volume;
        upCount++;
      } else {
        downVol += bars[j].volume;
        downCount++;
      }
    }
    const avgUp = upCount > 0 ? upVol / upCount : 0;
    const avgDown = downCount > 0 ? downVol / downCount : 0;
    volumeAsymmetry[i] = avgDown > 0 ? avgUp / avgDown : (avgUp > 0 ? 2 : 1);
  }

  // ── Return z-score ──
  for (let i = 0; i < n; i++) {
    if (i < 2) { returnZScore[i] = 0; continue; }
    const start = Math.max(1, i - ROLLING_WINDOW);
    const returns: number[] = [];
    for (let j = start; j <= i; j++) {
      returns.push((bars[j].close - bars[j - 1].close) / bars[j - 1].close);
    }
    if (returns.length < 2) { returnZScore[i] = 0; continue; }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    returnZScore[i] = stdDev > 0
      ? (returns[returns.length - 1] - mean) / stdDev
      : 0;
  }

  return { clv, adl, cmf, atr, rollingAvgVolume, volumeAsymmetry, avgSpread, returnZScore };
}

// ─── Follow-through analysis ───
// After a spike, check next N bars to see if price confirms the direction.
// Accumulation confirmed: price holds above spike day's low
// Distribution confirmed: price holds below spike day's high
function computeFollowThrough(
  bars: OHLCVBar[],
  spikeIndex: number,
  clvAtSpike: number
): { score: number; signal: string } {
  const spike = bars[spikeIndex];
  const remaining = bars.length - spikeIndex - 1;
  const lookforward = Math.min(FOLLOW_THROUGH_BARS, remaining);

  if (lookforward === 0) {
    return { score: 0, signal: "No follow-through data (most recent bar)" };
  }

  // Check if accumulation bias (CLV > 0.5) or distribution bias
  const isBullishBias = clvAtSpike > 0.5;

  if (isBullishBias) {
    // Accumulation check: price should hold above spike's low
    // AND next pullback should be on lower volume
    let heldAboveLow = true;
    let pullbackOnLowVol = false;

    for (let j = 1; j <= lookforward; j++) {
      const bar = bars[spikeIndex + j];
      if (bar.low < spike.low) heldAboveLow = false;
      // Check if any down-bar in follow-through has lower volume than spike
      if (bar.close < bars[spikeIndex + j - 1].close && bar.volume < spike.volume * 0.5) {
        pullbackOnLowVol = true;
      }
    }

    if (heldAboveLow && pullbackOnLowVol) {
      return { score: 1, signal: "Price held above spike low + pullback on low volume (confirmed accumulation)" };
    } else if (heldAboveLow) {
      return { score: 1, signal: "Price held above spike day's low (accumulation confirmed)" };
    } else {
      return { score: -1, signal: "Price broke below spike day's low (accumulation rejected)" };
    }
  } else {
    // Distribution check: price should hold below spike's high
    let heldBelowHigh = true;
    let rallyOnLowVol = false;

    for (let j = 1; j <= lookforward; j++) {
      const bar = bars[spikeIndex + j];
      if (bar.high > spike.high) heldBelowHigh = false;
      if (bar.close > bars[spikeIndex + j - 1].close && bar.volume < spike.volume * 0.5) {
        rallyOnLowVol = true;
      }
    }

    if (heldBelowHigh && rallyOnLowVol) {
      return { score: -1, signal: "Price held below spike high + rally on low volume (confirmed distribution)" };
    } else if (heldBelowHigh) {
      return { score: -1, signal: "Price held below spike day's high (distribution confirmed)" };
    } else {
      return { score: 1, signal: "Price broke above spike day's high (distribution rejected)" };
    }
  }
}

// ─── ADL slope over a window (linear regression slope, normalized) ───
function adlSlope(adlValues: number[], index: number, window: number): number {
  const start = Math.max(0, index - window + 1);
  const n = index - start + 1;
  if (n < 3) return 0;

  // Simple linear regression slope
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const y = adlValues[start + i];
    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Normalize by average ADL magnitude to make comparable across stocks
  const avgADL = sumY / n;
  if (Math.abs(avgADL) < 1) return slope > 0 ? 1 : slope < 0 ? -1 : 0;
  return slope / Math.abs(avgADL) * n; // normalized slope
}

// ─── Effort vs Result scoring ───
function effortVsResultScore(
  volume: number,
  avgVolume: number,
  spread: number,
  avgSpreadVal: number,
  clvVal: number
): { score: number; signal: string } {
  const highVolume = volume > 1.5 * avgVolume; // already guaranteed by spike threshold, but explicit
  const narrowSpread = spread < 0.7 * avgSpreadVal;

  if (highVolume && narrowSpread) {
    // Classic effort > result: high volume but price didn't move much
    // Direction comes from CLV
    if (clvVal > 0.7) {
      return { score: 1, signal: `Effort > Result: ${(volume / avgVolume).toFixed(1)}x volume but only ${(spread / avgSpreadVal * 100).toFixed(0)}% avg spread, close near high — absorption (accumulation)` };
    } else if (clvVal < 0.3) {
      return { score: -1, signal: `Effort > Result: ${(volume / avgVolume).toFixed(1)}x volume but only ${(spread / avgSpreadVal * 100).toFixed(0)}% avg spread, close near low — absorption (distribution)` };
    } else {
      // Narrow spread, mid-close — absorption but direction unclear from this factor alone
      return { score: 0, signal: `Effort > Result: high volume + narrow spread but mid-close — absorption detected, direction ambiguous from this factor` };
    }
  }

  // Wide spread + high volume = harmony (genuine move, not absorption)
  const wideSpread = spread > 1.5 * avgSpreadVal;
  if (highVolume && wideSpread) {
    return { score: 0, signal: `Effort = Result: high volume matched by wide spread (${(spread / avgSpreadVal * 100).toFixed(0)}% avg) — genuine move, not absorption` };
  }

  return { score: 0, signal: "No clear effort vs result divergence" };
}

// ─── Main analysis function ───

export function analyze(
  bars: OHLCVBar[],
  volumeThreshold: number = 3,
  priceThreshold: number = 1.0,
  announcements: Map<string, Announcement[]> = new Map()
): { spikes: VolumeSpike[]; rollingVolumes: number[] } {
  if (bars.length < MIN_BARS_BEFORE_ANALYSIS) {
    return { spikes: [], rollingVolumes: [] };
  }

  // Pre-compute all indicators across the full series
  const data = precompute(bars);
  const spikes: VolumeSpike[] = [];

  for (let i = ROLLING_WINDOW; i < bars.length; i++) {
    const bar = bars[i];
    const avgVol = data.rollingAvgVolume[i];
    const volumeMultiplier = bar.volume / avgVol;

    if (volumeMultiplier < volumeThreshold) continue;

    // ── Basic bar metrics ──
    const prevClose = bars[i - 1].close;
    const priceChangePercent = ((bar.close - prevClose) / prevClose) * 100;
    const intradayChangePercent = ((bar.close - bar.open) / bar.open) * 100;
    const intradayRange = bar.high - bar.low;
    const bodyToRangeRatio = intradayRange > 0
      ? Math.abs(bar.close - bar.open) / intradayRange : 0;
    const closePosition = data.clv[i];
    const priceChangeToATR = data.atr[i] > 0
      ? Math.abs(bar.close - prevClose) / data.atr[i] : 0;
    const zScore = data.returnZScore[i];

    // ── News vs Institutional gate ──
    // If price moved significantly, it's news-driven (skip multi-factor scoring)
    const priceSignificant =
      priceChangeToATR > priceThreshold && Math.abs(zScore) > 1.5;

    if (priceSignificant) {
      const isUp = priceChangePercent > 0;
      const classification = isUp ? "news_driven_up" as const : "news_driven_down" as const;
      const signals = [
        `Price moved ${Math.abs(priceChangePercent).toFixed(1)}% (${priceChangeToATR.toFixed(1)}x ATR)`,
        `Return z-score: ${zScore.toFixed(1)}σ — statistically unusual`,
        isUp ? "Strong bullish move — likely positive news/earnings" : "Strong bearish move — likely negative news/earnings",
      ];

      const dayAnnouncements = announcements.get(bar.date) || [];
      spikes.push({
        date: bar.date, open: bar.open, high: bar.high, low: bar.low, close: bar.close,
        volume: bar.volume,
        rollingAvgVolume: Math.round(avgVol),
        volumeMultiplier: r2(volumeMultiplier),
        priceChangePercent: r2(priceChangePercent),
        intradayChangePercent: r2(intradayChangePercent),
        intradayRange: r2(intradayRange),
        atr20: r2(data.atr[i]),
        priceChangeToATR: r2(priceChangeToATR),
        bodyToRangeRatio: r2(bodyToRangeRatio),
        closePosition: r2(closePosition),
        returnZScore: r2(zScore),
        cmf20: r2(data.cmf[i]),
        adlSlope: r2(adlSlope(data.adl, i, ROLLING_WINDOW)),
        volumeAsymmetryRatio: r2(data.volumeAsymmetry[i]),
        followThroughScore: 0,
        factorScores: { clv: 0, cmf: 0, volumeAsymmetry: 0, adlSlope: 0, effortVsResult: 0, followThrough: 0 },
        totalScore: 0,
        confidence: "high",
        classification,
        signals,
        announcements: dayAnnouncements,
      });
      continue;
    }

    // ── Multi-factor scoring for institutional classification ──

    // Factor 1: CLV (Close Location Value)
    // >0.7 = accumulation (+1), <0.3 = distribution (-1)
    const clvScore = closePosition > 0.7 ? 1 : closePosition < 0.3 ? -1 : 0;
    const clvSignal = clvScore === 1
      ? `CLV ${closePosition.toFixed(2)} > 0.70 — close near high (buying pressure)`
      : clvScore === -1
        ? `CLV ${closePosition.toFixed(2)} < 0.30 — close near low (selling pressure)`
        : `CLV ${closePosition.toFixed(2)} — mid-range close (neutral)`;

    // Factor 2: CMF(20)
    // >+0.05 = accumulation, <-0.05 = distribution
    const cmfVal = data.cmf[i];
    const cmfScore = cmfVal > 0.05 ? 1 : cmfVal < -0.05 ? -1 : 0;
    const cmfSignal = cmfScore === 1
      ? `CMF(20) = ${cmfVal.toFixed(3)} > +0.05 — net buying pressure over 20 days`
      : cmfScore === -1
        ? `CMF(20) = ${cmfVal.toFixed(3)} < -0.05 — net selling pressure over 20 days`
        : `CMF(20) = ${cmfVal.toFixed(3)} — neutral money flow`;

    // Factor 3: Volume Asymmetry Ratio (10-bar)
    // >1.3 = heavier volume on up-closes (accumulation)
    // <0.7 = heavier volume on down-closes (distribution)
    const vaRatio = data.volumeAsymmetry[i];
    const vaScore = vaRatio > 1.3 ? 1 : vaRatio < 0.7 ? -1 : 0;
    const vaSignal = vaScore === 1
      ? `Volume asymmetry ${vaRatio.toFixed(2)} > 1.30 — heavier volume on up-closes (Wyckoff accumulation pattern)`
      : vaScore === -1
        ? `Volume asymmetry ${vaRatio.toFixed(2)} < 0.70 — heavier volume on down-closes (Wyckoff distribution pattern)`
        : `Volume asymmetry ${vaRatio.toFixed(2)} — balanced`;

    // Factor 4: ADL Slope (20-bar)
    const adlSlopeVal = adlSlope(data.adl, i, ROLLING_WINDOW);
    const adlScore = adlSlopeVal > 0.1 ? 1 : adlSlopeVal < -0.1 ? -1 : 0;
    const adlSignal = adlScore === 1
      ? `ADL trending up (slope ${adlSlopeVal.toFixed(3)}) — cumulative buying pressure rising`
      : adlScore === -1
        ? `ADL trending down (slope ${adlSlopeVal.toFixed(3)}) — cumulative selling pressure rising`
        : `ADL flat (slope ${adlSlopeVal.toFixed(3)}) — no clear trend`;

    // Factor 5: Effort vs Result
    const evrResult = effortVsResultScore(
      bar.volume, avgVol, intradayRange, data.avgSpread[i], closePosition
    );

    // Factor 6: Follow-through (next 3 bars)
    const ftResult = computeFollowThrough(bars, i, closePosition);

    // ── Aggregate score ──
    const factorScores: FactorScores = {
      clv: clvScore,
      cmf: cmfScore,
      volumeAsymmetry: vaScore,
      adlSlope: adlScore,
      effortVsResult: evrResult.score,
      followThrough: ftResult.score,
    };

    const totalScore = clvScore + cmfScore + vaScore + adlScore + evrResult.score + ftResult.score;
    // Range: -6 to +6

    // ── Classification from score ──
    let classification: VolumeSpike["classification"];
    let confidence: VolumeSpike["confidence"];

    if (totalScore >= 3) {
      classification = "institutional_accumulation";
      confidence = "high";
    } else if (totalScore >= 1) {
      classification = "institutional_accumulation";
      confidence = totalScore >= 2 ? "moderate" : "low";
    } else if (totalScore <= -3) {
      classification = "institutional_distribution";
      confidence = "high";
    } else if (totalScore <= -1) {
      classification = "institutional_distribution";
      confidence = totalScore <= -2 ? "moderate" : "low";
    } else {
      classification = "ambiguous";
      confidence = "low";
    }

    // ── Build signals array ──
    const signals: string[] = [
      `Volume ${volumeMultiplier.toFixed(1)}x avg, price moved ${Math.abs(priceChangePercent).toFixed(1)}% (${priceChangeToATR.toFixed(2)}x ATR) — likely institutional`,
      clvSignal,
      cmfSignal,
      vaSignal,
      adlSignal,
      evrResult.signal,
      ftResult.signal,
      `Multi-factor score: ${totalScore > 0 ? "+" : ""}${totalScore}/6 → ${classification.replace(/_/g, " ")} (${confidence} confidence)`,
    ];

    const dayAnnouncements = announcements.get(bar.date) || [];

    spikes.push({
      date: bar.date, open: bar.open, high: bar.high, low: bar.low, close: bar.close,
      volume: bar.volume,
      rollingAvgVolume: Math.round(avgVol),
      volumeMultiplier: r2(volumeMultiplier),
      priceChangePercent: r2(priceChangePercent),
      intradayChangePercent: r2(intradayChangePercent),
      intradayRange: r2(intradayRange),
      atr20: r2(data.atr[i]),
      priceChangeToATR: r2(priceChangeToATR),
      bodyToRangeRatio: r2(bodyToRangeRatio),
      closePosition: r2(closePosition),
      returnZScore: r2(zScore),
      cmf20: r2(cmfVal),
      adlSlope: r2(adlSlopeVal),
      volumeAsymmetryRatio: r2(vaRatio),
      followThroughScore: ftResult.score,
      factorScores,
      totalScore,
      confidence,
      classification,
      signals,
      announcements: dayAnnouncements,
    });
  }

  return { spikes, rollingVolumes: data.rollingAvgVolume };
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildAnalysisResult(
  symbol: string,
  companyName: string,
  bars: OHLCVBar[],
  spikes: VolumeSpike[],
  rollingVolumes: number[]
): AnalysisResult {
  const institutionalEvents = spikes.filter(
    (s) => s.classification === "institutional_accumulation" || s.classification === "institutional_distribution"
  ).length;
  const newsEvents = spikes.filter(
    (s) => s.classification === "news_driven_up" || s.classification === "news_driven_down"
  ).length;
  const ambiguousEvents = spikes.filter((s) => s.classification === "ambiguous").length;
  const accumulationEvents = spikes.filter((s) => s.classification === "institutional_accumulation").length;
  const distributionEvents = spikes.filter((s) => s.classification === "institutional_distribution").length;

  const avgSpikeMultiplier = spikes.length > 0
    ? spikes.reduce((sum, s) => sum + s.volumeMultiplier, 0) / spikes.length : 0;
  const maxSpikeMultiplier = spikes.length > 0
    ? Math.max(...spikes.map((s) => s.volumeMultiplier)) : 0;

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
    avgSpikeMultiplier: r2(avgSpikeMultiplier),
    maxSpikeMultiplier: r2(maxSpikeMultiplier),
    spikes,
    dailyData: bars,
    rollingVolumes,
  };
}
