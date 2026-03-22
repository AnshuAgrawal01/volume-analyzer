# Institutional Accumulation vs Distribution: Research Compendium

Comprehensive survey of academic, industry, and practitioner methods for classifying
institutional accumulation and distribution from volume-price data.

---

## Table of Contents

1. [Wyckoff Method](#1-wyckoff-method)
2. [Volume Spread Analysis (VSA)](#2-volume-spread-analysis-vsa)
3. [Academic Microstructure Models](#3-academic-microstructure-models)
4. [Traditional Volume-Price Indicators](#4-traditional-volume-price-indicators)
5. [Modern Quantitative Approaches](#5-modern-quantitative-approaches)
6. [Dark Pool & Off-Exchange Data](#6-dark-pool--off-exchange-data)
7. [Key Questions Answered](#7-key-questions-answered)
8. [Synthesis: Recommended Approach](#8-synthesis-recommended-approach)

---

## 1. Wyckoff Method

Richard Wyckoff (1930s). Framework built around the "Composite Man" -- a theoretical
entity representing collective institutional behavior.

### Core Principle

Institutions cannot buy/sell large positions in a single session. They operate over
weeks/months, creating distinctive multi-phase price-volume structures.

### 1.1 Accumulation Schematic (5 Phases)

#### Phase A: Stopping the Downtrend

| Event | Price Action | Volume Signature |
|-------|-------------|-----------------|
| **PS (Preliminary Support)** | First bounce in downtrend | Widening spread, increasing volume |
| **SC (Selling Climax)** | Sharp capitulation drop | Ultra-high volume, wide spread, close well off the low |
| **AR (Automatic Rally)** | Sharp snap-back rally | Surge in volume as selling pressure evaporates |
| **ST (Secondary Test)** | Retest of SC low area | **Significantly diminished** volume and spread vs SC |

**Key signature:** SC has highest volume of the entire structure. ST must show
meaningfully lower volume -- this confirms demand absorbed supply.

#### Phase B: Building the Cause (Weeks to Months)

- Institutions accumulate at low prices while keeping price range-bound
- Early swings: **wide spreads + high volume** (both directions)
- As phase progresses: **downswings show progressively diminishing volume**
- Upswings begin to show **relatively higher volume** than downswings
- Multiple STs occur, each ideally on lower volume than the last

**Key signature:** Volume asymmetry develops -- heavier on up-days, lighter on
down-days. This is the single most important multi-bar signature of accumulation.

#### Phase C: The Spring (Supply Depletion Test)

| Event | Price Action | Volume Signature |
|-------|-------------|-----------------|
| **Spring** | Price drops BELOW trading range support | **Low volume** = supply exhausted (bullish) |
| **Spring** (failed) | Price drops below support | **High volume** = supply still present (bearish) |
| **Terminal Shakeout** | Deeper, sharper spring variant | Volume spike but quick recovery |

**Key signature:** A low-volume spring is the most powerful Wyckoff signal. It proves
no sellers remain. A high-volume spring means accumulation is incomplete.

#### Phase D: Markup Begins

| Event | Price Action | Volume Signature |
|-------|-------------|-----------------|
| **SOS (Sign of Strength)** | Rally on widening spread | **Increasing volume** (demand dominates) |
| **LPS (Last Point of Support)** | Pullback to former resistance | **Diminished volume and spread** |
| **BU (Back-Up)** | Final retest before breakout | Low volume, narrow range |

**Key signature:** Advances occur on expanding volume; reactions occur on
contracting volume. This asymmetry confirms institutional sponsorship.

#### Phase E: Full Markup

Clear uptrend. Setbacks are short-lived. Re-accumulation ranges may form at
higher levels.

### 1.2 Distribution Schematic (5 Phases)

#### Phase A: Stopping the Uptrend

| Event | Price Action | Volume Signature |
|-------|-------------|-----------------|
| **PSY (Preliminary Supply)** | First stall in uptrend | Volume expands, spread widens |
| **BC (Buying Climax)** | Parabolic blow-off top | Ultra-high volume, widest spread |
| **AR (Automatic Reaction)** | Sharp decline from BC | High volume as buying collapses |
| **ST (Secondary Test)** | Rally back toward BC | **Decreased volume and spread** vs BC |

#### Phase B: Distribution Building

- Institutions sell into rallies while keeping price range-bound
- **SOW (Sign of Weakness):** Drops break through support on **increased spread
  and volume** on the downside
- Rallies show progressively **diminishing volume**
- Supply consistently overwhelms demand on each test

#### Phase C: Demand Exhaustion Test

| Event | Price Action | Volume Signature |
|-------|-------------|-----------------|
| **UT (Upthrust)** | Price breaks above TR resistance, then reverses | Can be high or low volume |
| **UTAD (Upthrust After Distribution)** | Late-stage thrust above range | Tests remaining demand; traps breakout buyers |

#### Phase D: Markdown Begins

| Event | Price Action | Volume Signature |
|-------|-------------|-----------------|
| **LPSY (Last Point of Supply)** | Feeble rally attempts | **Narrow spread, low volume** |
| **SOW** | Decisive break below support | Wide spread, high volume |

#### Phase E: Full Markdown

Clear downtrend. Rallies are feeble. Redistribution ranges may form at lower levels.

### 1.3 Wyckoff's Three Laws

1. **Supply and Demand:** Price moves based on the balance. When demand > supply,
   prices rise. Volume confirms which force dominates.

2. **Cause and Effect:** The "cause" is the accumulation/distribution range. The
   "effect" is the subsequent trend. Wider/longer trading ranges produce larger moves.

3. **Effort vs Result:** Volume is effort; price movement is result. They should be
   proportional. Divergences signal institutional activity:
   - High effort (volume) + weak result (small price change) = absorption
   - Low effort + large result = path of least resistance

---

## 2. Volume Spread Analysis (VSA)

Tom Williams. Modernized Wyckoff's principles into bar-by-bar classification rules.

### 2.1 Three Variables Per Bar

1. **Spread (Range):** High - Low of the bar
   - Classified as narrow/average/wide relative to recent bars
   - Common method: compare to 30-period average range
   - Narrow: < 0.7x average; Wide: > 1.5x average

2. **Volume:** Current bar's volume
   - Classified as low/average/high/ultra-high relative to recent bars
   - Common method: compare to 30-period average volume
   - Low: < 0.7x average; High: > 1.5x average; Ultra-high: > 2x average

3. **Close Position:** Where the close sits within the bar's range
   - Formula: CLV = (Close - Low) / (High - Low)
   - High close: CLV > 0.7
   - Mid close: 0.3 <= CLV <= 0.7
   - Low close: CLV < 0.3

### 2.2 Complete VSA Pattern Catalog

#### Bearish Patterns (Signs of Weakness)

| Pattern | Spread | Volume | Close Position | Context | Signal |
|---------|--------|--------|---------------|---------|--------|
| **Selling Climax** | Wide | Ultra-high | Mid or high (off the low) | Extended downtrend | Potential reversal; smart money absorbing panic selling |
| **No Demand** | Narrow | Low (< prev 2 bars) | Mid or low | After rally or in distribution | No professional buying; expect decline |
| **Upthrust** | Wide | High | Low (near bar low) | At/above resistance | False breakout; smart money selling into public buying |
| **Effort > Result (bearish)** | Narrow | High | Any | Uptrend | High volume but no price progress = distribution/absorption |
| **Topping-Out Volume** | Progressively narrowing | Above-average, increasing | Lower half | End of uptrend | Long upper wicks; specialists selling |
| **Demand Test (failed)** | Wide, bullish | High | Upper | Distribution area | Buyers still present; distribution incomplete |

#### Bullish Patterns (Signs of Strength)

| Pattern | Spread | Volume | Close Position | Context | Signal |
|---------|--------|--------|---------------|---------|--------|
| **Stopping Volume** | Narrow | High/above-average | Mid or high | Extended downtrend | Smart money absorbing selling; potential reversal |
| **No Supply** | Narrow | Low (< prev 2 bars) | Mid or high | After decline or in accumulation | No professional selling; expect rally |
| **Spring/Shakeout** | Wide initial drop, then recovery | Varies | High (recovers) | Below TR support | False breakdown; smart money buying |
| **Test (successful)** | Narrow | Low | Mid or high (not at low) | After stopping volume/spring | No supply remains; strong BUY signal |
| **Effort > Result (bullish)** | Narrow | High | Any | Downtrend | High volume but no price decline = accumulation/absorption |
| **Supply Test (successful)** | Narrow, long lower wick | Low | High | Accumulation area | Market rejected lower prices; no sellers |

#### The Effort vs Result Law (Quantified)

| Scenario | Volume | Spread | Interpretation |
|----------|--------|--------|---------------|
| Harmony (bullish) | High | Wide up | Genuine buying; continuation |
| Harmony (bearish) | High | Wide down | Genuine selling; continuation |
| Anomaly (bearish) | High | Narrow (up context) | Absorption/distribution; reversal |
| Anomaly (bullish) | High | Narrow (down context) | Absorption/accumulation; reversal |
| Weak trend | Low | Wide | False move; unsustainable |
| Quiet market | Low | Narrow | No interest; wait |

### 2.3 Quantitative VSA Implementation

From open-source implementations (GitHub: m-root, neurotrader888):

```
# Spread classification (30-day lookback)
avg_spread = rolling_mean(High - Low, 30)
wide_spread = (High - Low) > 1.5 * avg_spread
narrow_spread = (High - Low) < 0.7 * avg_spread

# Volume classification (30-day lookback)
avg_volume = rolling_mean(Volume, 30)
high_volume = Volume > 1.5 * avg_volume
low_volume = Volume < 0.7 * avg_volume
ultra_high_volume = Volume > 2.0 * avg_volume

# Close position (bar_range_ratio)
close_position = (Close - Low) / (High - Low)
high_close = close_position > 0.7
mid_close = 0.3 <= close_position <= 0.7
low_close = close_position < 0.3

# No Demand: up bar + narrow spread + low volume (lower than prev 2 bars)
no_demand = (Close > Close[-1]) & narrow_spread & (Volume < Volume[-1]) & (Volume < Volume[-2])

# No Supply: down bar + narrow spread + low volume (lower than prev 2 bars)
no_supply = (Close < Close[-1]) & narrow_spread & (Volume < Volume[-1]) & (Volume < Volume[-2])

# Stopping Volume: down bar + narrow spread + high volume + close in upper half
stopping_volume = (Close < Close[-1]) & narrow_spread & high_volume & high_close

# Test: low volume + narrow spread + in area of prior stopping volume/spring
test = narrow_spread & low_volume & (close_position > 0.5)

# Upthrust: wide spread up bar + close near low + high volume
upthrust = wide_spread & high_volume & low_close & (High > recent_resistance)

# Effort vs Result divergence
effort_no_result = high_volume & narrow_spread  # absorption
```

### 2.4 Multi-Bar Context Rules

VSA is NOT just single-bar analysis. Key principles:

1. **Background is everything:** A no-demand bar in an uptrend is bearish; in
   accumulation it may be irrelevant. Always check the phase (Wyckoff context).

2. **Sequence matters:** Stopping volume -> test -> breakout SOS is the classic
   accumulation sequence. Each bar confirms the previous.

3. **Confirmation required:** A single VSA signal is a "heads-up." Confirmation
   comes from subsequent price action (next 2-5 bars).

4. **Volume comparison window:** Most implementations use the previous 2 bars
   for no-demand/no-supply, but 20-30 bar average for spread/volume classification.

---

## 3. Academic Microstructure Models

### 3.1 PIN: Probability of Informed Trading

**Authors:** Easley, Kiefer, O'Hara, Paperman (1996)
**Paper:** "Liquidity, Information, and Infrequently Traded Stocks"

#### Model Parameters

| Parameter | Meaning |
|-----------|---------|
| alpha (a) | Probability of information event on any given day |
| delta (d) | Probability that information event is bad news |
| mu (u) | Arrival rate of informed traders (Poisson) |
| epsilon_b (eb) | Arrival rate of uninformed buyers (Poisson) |
| epsilon_s (es) | Arrival rate of uninformed sellers (Poisson) |

#### PIN Formula

```
PIN = (a * u) / (a * u + eb + es)
```

PIN represents the fraction of all trades that are information-motivated.

#### Likelihood Function

For a given day with B buys and S sells, the likelihood combines three scenarios:

```
L(B,S | theta) =
    (1-a) * e^(-eb) * (eb^B/B!) * e^(-es) * (es^S/S!)           # no info
  + a*d * e^(-eb) * (eb^B/B!) * e^(-(u+es)) * ((u+es)^S/S!)     # bad news
  + a*(1-d) * e^(-(u+eb)) * ((u+eb)^B/B!) * e^(-es) * (es^S/S!) # good news
```

Estimated via MLE across multiple trading days. Parameters estimated by
numerical optimization of the log-likelihood function.

#### Practical Notes

- Requires classifying each trade as buyer- or seller-initiated
  (typically Lee-Ready algorithm, ~73% accuracy)
- Computationally expensive (factorial overflow issues with large B, S)
- Typical PIN values: 0.10 - 0.50 across US equities
- Higher PIN = more informed trading = more institutional activity
- Implementation available: R package `PINstimation`

### 3.2 VPIN: Volume-Synchronized PIN

**Authors:** Easley, Lopez de Prado, O'Hara (2011, 2012)
**Key advantage:** Does not require trade-by-trade classification

#### Step-by-Step Calculation

**Step 1: Construct Volume Buckets**

```
V_bar = Average_Daily_Volume / n_buckets    # typically n_buckets = 50
```

Aggregate trades into buckets of exactly V_bar shares each. This is the
"volume clock" -- sampling is synchronized to volume, not time.

**Step 2: Create Time Bars**

Aggregate trade data into fixed time intervals (e.g., 1-minute bars).
Calculate price change (dP) and total volume per bar.

**Step 3: Bulk Volume Classification (BVC)**

Instead of classifying individual trades, classify entire bars probabilistically:

```
V_buy = V_bar * Phi(dP / sigma)
V_sell = V_bar - V_buy
```

Where:
- Phi() is the standard normal CDF
- dP is the price change of the bar
- sigma is the rolling standard deviation of price changes
  (estimated over the last n_buckets bars)

**Intuition:** If price went up, more of the volume is classified as buying.
The CDF provides a smooth probabilistic classification rather than binary.

**Step 4: Calculate Order Imbalance per Bucket**

```
OI_tau = |V_sell_tau - V_buy_tau|
```

**Step 5: Calculate VPIN**

```
VPIN = Sum(OI_tau, tau=1..n) / (V_bar * n)
```

Where n is the number of buckets in the sample window (default: 50).

#### VPIN Properties

- Ranges from 0 to 1
- Higher VPIN = more order flow toxicity = more informed trading
- Elevated VPIN preceded the 2010 Flash Crash
- Correlated with future short-term return volatility
- No trade-by-trade classification needed (key advantage over PIN)
- Updates with each new volume bucket (event-driven, not time-driven)

#### VPIN Parameters in Practice

| Parameter | Typical Value | Notes |
|-----------|---------------|-------|
| n_buckets per day | 50 | Easley et al. default |
| Time bar interval | 1 minute | For BVC calculation |
| sigma lookback | 50 buckets | Rolling window for vol estimate |
| VPIN window | 50 buckets | For the final metric |

### 3.3 Kyle's Lambda

**Author:** Albert Kyle (1985)
**Paper:** "Continuous Auctions and Insider Trading"

#### The Model

In Kyle's framework, an informed trader, noise traders, and a market maker
interact. The market maker sets prices based on observed net order flow.
Lambda measures how much price moves per unit of order flow.

#### Regression Specification

```
r_{i,n} = lambda_i * S_{i,n} + epsilon_{i,n}
```

Where:
- r_{i,n} = stock return in the n-th interval (typically 5-minute)
- S_{i,n} = signed square-root dollar volume:
  S = Sum_k[ sign(v_k) * sqrt(|v_k|) ]
  where v_k is the signed dollar volume of the k-th trade
  (+1 for buyer-initiated, -1 for seller-initiated)
- lambda = slope coefficient = Kyle's Lambda

#### Interpretation

- Higher lambda = greater price impact per unit of order flow = less liquid
- Higher lambda also correlates with more informed trading
- Lambda is higher for stocks with more private information
- Requires intraday trade-level data with buy/sell classification
- Square-root transformation reduces influence of extreme volumes

### 3.4 Amihud Illiquidity Ratio

**Author:** Yakov Amihud (2002)
**Paper:** "Illiquidity and stock returns: cross-section and time-series effects"

#### Formula

```
ILLIQ_i,y = (1/D_i,y) * Sum_{d=1}^{D} ( |R_{i,d}| / VOLD_{i,d} )
```

Where:
- D_i,y = number of trading days for stock i in year y
- R_{i,d} = return on day d
- VOLD_{i,d} = dollar trading volume on day d
- Minimum 10 trading days required

#### Interpretation

- Measures "price response per dollar of trading volume"
- Higher ILLIQ = less liquid = each dollar of volume moves price more
- Advantages: requires only daily data (vs intraday for Kyle's Lambda)
- Most-cited liquidity proxy in finance (11,000+ citations)
- Can be used to detect institutional activity: sudden drops in ILLIQ
  on high-volume days suggest large institutional orders being absorbed
  by the market without proportional price impact

### 3.5 Order Flow Imbalance (OFI)

**Authors:** Cont, Kukanov, Stoikov (2014)
**Paper:** "The Price Impact of Order Book Events"

#### Key Finding

Linear relationship between order flow imbalance and price changes:

```
Delta_P = lambda * OFI + epsilon
```

Where OFI measures the imbalance between supply and demand at the best
bid/ask. Lambda (slope) is inversely proportional to market depth.

- Robust across time scales and across stocks
- Implies the "square-root law": magnitude of price moves scales with
  sqrt(trading volume)
- Requires Level 2 (order book) data

### 3.6 Trade Classification Algorithms

Methods for classifying individual trades as buyer- or seller-initiated:

| Algorithm | Method | Accuracy | Data Required |
|-----------|--------|----------|---------------|
| **Lee-Ready (1991)** | Quote rule + tick test: trades above midpoint = buy, below = sell. Midpoint trades classified by tick direction | ~73% | TAQ (quotes + trades) |
| **Tick Rule** | Compare to previous trade price: uptick = buy, downtick = sell | ~72% | Trade prices only |
| **Bulk Volume Classification** | V_buy = V * Phi(dP/sigma) | N/A (probabilistic) | OHLCV bars only |

Lee-Ready is the academic standard but only ~73% accurate. BVC avoids
individual trade classification entirely, making it practical for daily data.

---

## 4. Traditional Volume-Price Indicators

### 4.1 On-Balance Volume (OBV)

**Author:** Joe Granville (1963)

#### Formula

```
If Close > Close_prev:  OBV = OBV_prev + Volume
If Close < Close_prev:  OBV = OBV_prev - Volume
If Close = Close_prev:  OBV = OBV_prev
```

#### Strengths
- Simple and intuitive
- Effective for detecting divergences (price makes new high, OBV doesn't)
- Leading indicator when it breaks out before price

#### Limitations
- **Binary classification:** Assigns 100% of volume to buyers or sellers
  based solely on close-to-close comparison. A 0.01% move classifies
  the same as a 5% move.
- **Sensitive to volume spikes:** A single massive-volume day (earnings,
  rebalancing) can distort OBV for months
- **Ignores intraday range:** Close at bar high vs close at bar mid both
  get same treatment
- **Cumulative:** Absolute values become meaningless over long periods;
  only trend/divergence matters
- **No weighting:** Does not account for where the close sits within the
  day's range

### 4.2 Accumulation/Distribution Line (ADL)

**Author:** Marc Chaikin (building on Larry Williams' work)

#### Formula (3 steps)

```
Step 1: Money Flow Multiplier (CLV)
  CLV = [(Close - Low) - (High - Close)] / (High - Low)
      = (2 * Close - Low - High) / (High - Low)

  Range: -1 (close = low) to +1 (close = high)

Step 2: Money Flow Volume
  MFV = CLV * Volume

Step 3: ADL (cumulative)
  ADL = ADL_prev + MFV
```

#### Strengths vs OBV
- Proportional classification: uses close position within range, not binary
- Close at the high = +1 * Volume; close at the mid = 0; close at the low = -1 * Volume
- Captures intraday distribution of buying/selling pressure

#### Limitations
- **Ignores gaps:** A stock gapping down 5% but closing at the high of the
  day gets positive MFV, even though net sellers dominated
- **Still single-bar:** Each bar classified independently
- **Cumulative drift:** Like OBV, absolute values less meaningful than trend

### 4.3 Williams Accumulation/Distribution

**Author:** Larry Williams

#### Formula

```
If Close > Close_prev:
  WAD = WAD_prev + (Close - TRL)
  where TRL = min(Low, Close_prev)

If Close < Close_prev:
  WAD = WAD_prev + (Close - TRH)
  where TRH = max(High, Close_prev)

If Close = Close_prev:
  WAD = WAD_prev
```

Uses True Range High/Low instead of simple High/Low. Does NOT incorporate
volume -- purely price-based. Less useful for institutional detection.

### 4.4 Chaikin Money Flow (CMF)

**Author:** Marc Chaikin

#### Formula

```
CMF(n) = Sum(CLV_i * Volume_i, i=1..n) / Sum(Volume_i, i=1..n)
```

Default period: n = 20 or 21 days.

#### Properties
- Oscillates between -1 and +1 (typically -0.50 to +0.50)
- Positive CMF = net accumulation over the period
- Negative CMF = net distribution over the period
- Zero line crossovers generate signals

#### Practical Thresholds
- **Bullish:** CMF crosses above +0.05 (buffer above zero)
- **Bearish:** CMF crosses below -0.05 (buffer below zero)
- **Strong accumulation:** CMF > +0.20
- **Strong distribution:** CMF < -0.20

#### Limitations
- Same gap issue as ADL (ignores open-to-close gaps)
- Choppy/unreliable in ranging markets
- Should not be used standalone; combine with RSI/MACD

### 4.5 Money Flow Index (MFI)

**Authors:** Gene Quong, Avrum Soudack

#### Formula (4 steps)

```
Step 1: Typical Price
  TP = (High + Low + Close) / 3

Step 2: Raw Money Flow
  RMF = TP * Volume

Step 3: Classify flows
  If TP > TP_prev:  Positive Money Flow += RMF
  If TP < TP_prev:  Negative Money Flow += RMF

Step 4: Money Flow Index
  Money Ratio = (14-period Positive MF) / (14-period Negative MF)
  MFI = 100 - 100 / (1 + Money Ratio)
```

Default period: 14.

#### Thresholds
- **Standard overbought:** > 80
- **Standard oversold:** < 20
- **Extreme overbought:** > 90 (rare; unsustainable)
- **Extreme oversold:** < 10 (rare; unsustainable)

#### Interpretation
- "Volume-weighted RSI"
- Divergences between MFI and price are key signals
- MFI > 80 + price failing to make new highs = distribution
- MFI < 20 + price failing to make new lows = accumulation

### 4.6 Volume Price Trend (VPT)

#### Formula

```
VPT = VPT_prev + Volume * (Close - Close_prev) / Close_prev
```

Key difference from OBV: adds a **proportion** of volume weighted by the
percentage price change, not the full volume.

A steadily rising VPT during a sideways price range indicates institutional
accumulation (buying without pushing price up).

### 4.7 Force Index

**Author:** Alexander Elder

#### Formula

```
FI = (Close - Close_prev) * Volume
```

Typically smoothed with a 13-period EMA.

Combines three elements: direction, extent, and volume. Large positive
values = strong buying conviction; large negative = strong selling.

### 4.8 Negative Volume Index (NVI) / Positive Volume Index (PVI)

**Authors:** Paul Dysart (1936), refined by Norman Fosback (1976)

#### Concept

- **NVI:** Only updates on days when volume DECREASES from prior day.
  Assumption: "smart money" operates on quiet days.
- **PVI:** Only updates on days when volume INCREASES.
  Assumption: "uninformed money" operates on active days.

#### NVI Formula

```
If Volume < Volume_prev:
  NVI = NVI_prev + (Close - Close_prev) / Close_prev * NVI_prev
Else:
  NVI = NVI_prev  (unchanged)
```

#### Fosback's Finding (1941-1975 test period)

- When NVI > its 1-year moving average: **96% probability** of bull market
- When NVI < its 1-year moving average: **53% probability** of bear market
- When PVI > its 1-year moving average: **79% probability** of bull market

---

## 5. Modern Quantitative Approaches

### 5.1 Relative Volume (RVOL) for Institutional Screening

```
RVOL = Current_Volume / Average_Volume_Same_Time_Period
```

#### Industry-Standard Thresholds

| RVOL | Interpretation |
|------|---------------|
| < 1.0 | Below-average activity |
| 1.3 - 1.8 | Growing institutional participation (sustained = accumulation/distribution) |
| 2.0 - 3.0 | Significant unusual activity; institutional interest likely |
| 3.0 - 5.0 | Major event; strong institutional conviction |
| > 5.0 | Extreme; momentum/gap plays; likely news-driven |

Professional day traders typically require RVOL >= 2.0 minimum. For
institutional accumulation screening, sustained RVOL of 1.3-1.8 over
multiple sessions is more informative than a single spike.

### 5.2 Z-Score Volume Anomaly Detection

```
Z = (Current_Volume - Mean_Volume) / StdDev_Volume
```

#### Thresholds

| Z-Score | Interpretation |
|---------|---------------|
| |Z| > 2.0 | Unusual activity (95th percentile) |
| |Z| > 3.0 | Highly unusual (99.7th percentile) |
| |Z| > 4.0 | Extreme volume spike |

Used in the AlgoAlpha "Smart Money Volume Activity" indicator:
- Scans lower-timeframe data for volume z-scores > 2
- Classifies events as "smart money" (volume concentrated inside candle body)
  vs "retail" (volume at bar extremes = chase/panic)

### 5.3 PhenLabs Institutional Detector Algorithm

Commercially available TradingView indicator combining multiple approaches:

#### Candle Classification (Dual-Type)

1. **Momentum Candles:** Body-to-range ratio >= 55% + RVOL >= 1.8x
   = directional conviction by institutions
2. **VSA Absorption Candles:** Wick-to-range ratio >= 45% + RVOL >= 1.8x
   = hidden buying/selling via long wicks (absorption)

#### Five-Factor Quality Score (0-5)

1. RVOL intensity (how far above 1.8x?)
2. Absorption presence (VSA wick patterns?)
3. Consolidation tightness (tight range = strong cause building)
4. Candle participation (how many institutional candles in cluster?)
5. Directional bias (>= 60% of institutional candles agree on direction)

#### Zone Detection Parameters

- Cluster lookback: 15 bars
- Minimum institutional candles per zone: 3
- Maximum zone range: 3.5x ATR
- Trend filter: accumulation only above 200 EMA; distribution only below
- Micro volume profile: 20 price bins per zone, with POC and HVN

### 5.4 VWAP for Institutional Activity

```
VWAP = Cumulative(Typical_Price * Volume) / Cumulative(Volume)
```

#### Institutional Usage

- Institutions benchmark execution against VWAP
- Buying at VWAP = fair value; below = discount; above = premium
- **Price sustained above VWAP** = net institutional accumulation
- **Price sustained below VWAP** = net institutional distribution
- **Price bouncing off VWAP from above** = accumulation signal
- **Price rejected at VWAP from below** = distribution signal

#### Standard Deviation Bands

- +/- 1 SD: ~68% of price action
- +/- 2 SD: ~95% of price action (primary mean-reversion threshold)
- +/- 3 SD: ~99.7% of price action (extreme)

Price at +2 SD with volume climax = exhaustion; high probability of
reversion to VWAP.

### 5.5 Volume Profile Analysis

Not a single indicator but a methodology:

- **High Volume Nodes (HVN):** Price levels with highest traded volume.
  Act as magnets / support-resistance. Institutional levels.
- **Low Volume Nodes (LVN):** Price levels with lowest traded volume.
  Price moves quickly through these. Rejection zones.
- **Point of Control (POC):** Single price level with highest volume.
  The "fair value" for the session.
- **Value Area (VA):** Price range containing 70% of session volume.
  Institutional acceptance zone.

---

## 6. Dark Pool & Off-Exchange Data

### 6.1 Dark Pool Basics

- ~38-42% of all US equity volume executes in dark pools
- Large-cap stocks typically see 35-45% of volume in dark pools
- Institutions use dark pools to hide large orders and minimize market impact

### 6.2 SqueezeMetrics Dark Ratio (D)

```
D = q_short / q_total
```

Where q_short and q_total are from FINRA dark pool short volume data,
smoothed with a 5-day moving average.

**Key insight from SqueezeMetrics' "Short is Long" thesis:**
- Market makers who sell shares to institutional buyers must sell SHORT
  (they don't own the shares being demanded)
- Therefore, high short volume in dark pools = high institutional BUYING
- **Higher D (dark ratio) = more bullish institutional activity**
- This is counterintuitive but empirically validated

### 6.3 Dark Pool Accumulation/Distribution Signals

| Signal | Pattern | Interpretation |
|--------|---------|---------------|
| Accumulation | Dark pool volume surges + flat/declining public price | Institutions buying quietly |
| Distribution | Dark pool volume surges + flat/rising public price | Institutions selling quietly |
| Accumulation | Dark pool market share > 40% + high short ratio | Institutional buying via market makers |
| Breakout imminent | Rising dark pool activity + tightening range | Cause building; effect coming |

---

## 7. Key Questions Answered

### Q1: What's the most reliable way to determine if a high-volume day is accumulation vs distribution?

**Answer: Close Location Value (CLV) weighted by context.**

Single most important metric: where does price close within the day's range?

```
CLV = (Close - Low) / (High - Low)
```

But this alone is necessary-not-sufficient. The reliable approach is:

1. **CLV classification:** CLV > 0.7 = accumulation bias; CLV < 0.3 = distribution bias
2. **Volume confirmation:** The volume must be significantly above average (RVOL >= 1.5)
3. **Multi-day context:** Check the volume asymmetry over 5-20 bars:
   - Accumulation: high-volume up-closes + low-volume down-closes
   - Distribution: high-volume down-closes + low-volume up-closes
4. **Subsequent confirmation:** Price holds above the day's low for accumulation
   (or below the day's high for distribution) over the next 2-5 bars
5. **Structural context:** Where is this in the Wyckoff phase? A high-volume
   close at the high means something different at a SC vs at a UTAD

### Q2: Is close position within range sufficient, or do you need multi-day context?

**Answer: Multi-day context is essential. Single-bar CLV is insufficient.**

Evidence:
- Chaikin's own CMF uses 20-day windows, not single bars
- Wyckoff's entire framework is multi-phase (weeks/months)
- VSA practitioners state "background is everything"
- Academic: PIN/VPIN use multi-day windows by construction
- ADL's power comes from cumulative divergences, not single values

The CLV tells you the intraday bias of a SINGLE session. But:
- A stock can gap down 5% and still close at the high of that day's range
  (CLV = 1.0), which looks like accumulation but is net distribution
- A single high-CLV day could be a short-covering rally, not institutional
  buying
- Repeated high-CLV days on above-average volume IS accumulation

**Minimum practical window: 5-20 bars for trend-level classification.**

### Q3: What role does the NEXT few days' price action play (confirmation)?

**Answer: Critical. Professionals require follow-through before classification is final.**

The Wyckoff method explicitly requires:
- After a Spring: price must show SOS (sign of strength) to confirm
- After an Upthrust: price must show SOW to confirm
- A genuine move shows follow-through; false signals fail quickly

VSA approach:
- Stopping volume is just a "heads-up"
- Confirmed only by a subsequent successful test (low-volume retest)
- Then confirmed by SOS breakout

Academic approach:
- VPIN uses rolling windows of 50+ volume buckets
- PIN estimates across multiple trading days
- No microstructure model classifies single trades in isolation

**Rule of thumb: A signal bar generates a hypothesis. The next 2-5 bars
confirm or reject it. Classification should never be based on a single bar.**

### Q4: How do professionals handle classification -- single-bar vs multi-bar patterns?

**Answer: Both, in a hierarchy.**

**Level 1: Single-bar screening** -- Identify candidate bars using:
- Volume anomaly (RVOL >= 1.5 or z-score >= 2)
- CLV extreme (> 0.7 or < 0.3)
- Spread anomaly (unusually wide or narrow for the volume)

**Level 2: Multi-bar pattern matching** -- Place candidates in context:
- Is this part of a Wyckoff phase? (SC, Spring, SOS, LPSY, etc.)
- Does volume asymmetry exist over the last 10-20 bars?
- Is the ADL/CMF diverging from price?

**Level 3: Structural confirmation** -- Wait for follow-through:
- Does price hold above/below the candidate bar?
- Does the next pullback occur on diminished volume?
- Does VWAP confirm institutional direction?

**Level 4: Cross-reference** -- Combine indicators:
- ADL trend + CMF sign + OBV divergence + VWAP position
- No single indicator is definitive; consensus across multiple methods
  increases confidence

### Q5: What are the statistical thresholds used in practice?

| Metric | Accumulation Threshold | Distribution Threshold |
|--------|----------------------|----------------------|
| CLV | > 0.70 | < 0.30 |
| CMF (20-period) | > +0.05 (signal), > +0.20 (strong) | < -0.05 (signal), < -0.20 (strong) |
| MFI (14-period) | < 20 (oversold/accumulation) | > 80 (overbought/distribution) |
| RVOL | >= 1.5 (notable), >= 2.0 (significant) | Same |
| Volume Z-score | >= 2.0 (unusual), >= 3.0 (extreme) | Same |
| VPIN | > 0.5 (elevated toxicity) | Same |
| PIN | > 0.20 (above-average informed trading) | Same |
| VWAP position | Price sustained above VWAP | Price sustained below VWAP |
| NVI | Above 1-year MA (96% bull) | Below 1-year MA |
| Volume vs prev 2 bars | Lower = no demand/no supply pattern | Same |
| Spread vs 30-period avg | < 0.7x = narrow, > 1.5x = wide | Same |
| Body-to-range ratio | > 0.55 = momentum candle | Same |
| Wick-to-range ratio | > 0.45 = absorption candle | Same |

---

## 8. Synthesis: Recommended Approach

### Tier 1: Foundation Indicators (Always Compute)

These require only OHLCV data and provide the base classification:

1. **CLV per bar:** `(Close - Low) / (High - Low)` -- the single most important
   per-bar metric for accumulation vs distribution
2. **ADL (cumulative):** `ADL += CLV * Volume` -- the most important trend metric;
   divergences from price are the strongest signal
3. **CMF (20-period):** Volume-weighted CLV average -- bounded oscillator for
   current accumulation/distribution pressure
4. **Relative Volume:** `Volume / SMA(Volume, 20)` -- filters significant bars
   from noise

### Tier 2: Pattern Detection (Wyckoff/VSA)

Layer these on top of Tier 1:

5. **VSA bar classification:** Using the spread/volume/close rules above,
   flag stopping volume, no demand, no supply, tests, upthrusts
6. **Multi-bar volume asymmetry:** Over rolling 10-20 bar windows, compute
   `avg_volume_on_up_closes / avg_volume_on_down_closes`. Ratio > 1.3 =
   accumulation bias; < 0.7 = distribution bias
7. **Effort vs Result:** Flag bars where volume is > 1.5x average but
   spread is < 0.7x average (absorption/hidden activity)

### Tier 3: Confirmation & Scoring

8. **VWAP position:** Sustained above = accumulation; below = distribution
9. **OBV divergence:** OBV making new highs while price is flat = accumulation
10. **MFI extreme:** MFI < 20 near support = accumulation setup

### Tier 4: Academic Models (If Intraday Data Available)

11. **VPIN:** Requires intraday bars for BVC classification
12. **Kyle's Lambda:** Requires tick-level data with buy/sell classification
13. **Amihud Ratio:** Can use daily data; declining ILLIQ on rising volume =
    institutional absorption of supply

### Classification Decision Framework

```
For each bar/day:
  1. Compute CLV, RVOL, spread_ratio
  2. If RVOL < 1.0: classify as NOISE (insufficient activity)
  3. If CLV > 0.7 AND RVOL >= 1.5: candidate ACCUMULATION bar
  4. If CLV < 0.3 AND RVOL >= 1.5: candidate DISTRIBUTION bar
  5. If high_volume AND narrow_spread: flag ABSORPTION (direction from context)

For multi-bar classification (rolling 20-bar window):
  6. Compute up_volume_ratio = sum(volume where CLV>0.5) / sum(volume where CLV<0.5)
  7. Compute CMF_20
  8. Compute ADL trend (slope of ADL over window)
  9. Score:
     - ACCUMULATION if: up_volume_ratio > 1.3 AND CMF > 0.05 AND ADL rising
     - DISTRIBUTION if: up_volume_ratio < 0.7 AND CMF < -0.05 AND ADL falling
     - NEUTRAL otherwise

For confirmation (next 2-5 bars after signal):
  10. Accumulation confirmed if: price holds above signal bar's low
      AND next pullback has RVOL < 1.0
  11. Distribution confirmed if: price holds below signal bar's high
      AND next rally has RVOL < 1.0
```

---

## Sources

### Wyckoff Method
- [The Wyckoff Method: A Tutorial - StockCharts](https://chartschool.stockcharts.com/table-of-contents/market-analysis/wyckoff-analysis-articles/the-wyckoff-method-a-tutorial)
- [Wyckoff Method - Wyckoff Analytics](https://www.wyckoffanalytics.com/wyckoff-method/)
- [Wyckoff Accumulation Pattern - TrendSpider](https://trendspider.com/learning-center/chart-patterns-wyckoff-accumulation/)
- [Decoding Wyckoff Schematics - PriceActionNinja](https://priceactionninja.com/decoding-wyckoff-schematics-the-ultimate-cheat-sheet/)

### Volume Spread Analysis
- [VSA Guide - Trading Setups Review](https://www.tradingsetupsreview.com/guide-volume-spread-analysis-vsa/)
- [VSA Guide - EarnForex](https://www.earnforex.com/guides/volume-spread-analysis/)
- [VSA in Trading - DotNetTutorials](https://dotnettutorials.net/lesson/volume-spread-analysis-in-trading/)
- [VSA Strategy Quantifying - PyQuantLab](https://pyquantlab.medium.com/volume-spread-analysis-vsa-strategy-quantifying-market-action-for-trading-signals-with-rolling-9aa57fb79fe9)
- [Algorithmic VSA Exploration - PyQuantLab](https://pyquantlab.medium.com/an-algorithmic-exploration-of-volume-spread-analysis-vsa-2c92a8ae7d3c)
- [Effort vs Result - TradingWyckoff](https://tradingwyckoff.com/en/effort-vs-result/)
- [GitHub: neurotrader888/VSAIndicator](https://github.com/neurotrader888/VSAIndicator)
- [GitHub: VSA Gist](https://gist.github.com/m-root/d2ba4c1fdba3f0fef5f2251c9cedfacd)

### Academic Microstructure
- [PIN Model - frds.io](https://frds.io/measures/probability_of_informed_trading/)
- [Kyle's Lambda - frds.io](https://frds.io/measures/kyle_lambda/)
- [VPIN Paper - Easley, Lopez de Prado, O'Hara](https://www.quantresearch.org/VPIN.pdf)
- [From PIN to VPIN](https://www.quantresearch.org/From%20PIN%20to%20VPIN.pdf)
- [VPIN Calculation GitHub Gist](https://gist.github.com/ProbablePattern/c46e4fb12bf758b99b03)
- [PINstimation R Package](https://www.pinstimation.com/)
- [Amihud 2002 Paper](https://www.cis.upenn.edu/~mkearns/finread/amihud.pdf)
- [Order Flow Imbalance - Cont, Kukanov, Stoikov](https://arxiv.org/abs/1011.6402)
- [Trade Classification Algorithms - Medium](https://medium.com/@simomenaldo/trade-classification-algorithms-6a2fede1e4f5)
- [Lee-Ready Test Accuracy](https://www.sciencedirect.com/science/article/abs/pii/S1042443100000482)

### Traditional Indicators
- [CMF - StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/chaikin-money-flow-cmf)
- [ADL - StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/accumulation-distribution-line)
- [OBV - StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/on-balance-volume-obv)
- [MFI - StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/money-flow-index-mfi)
- [NVI - StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/negative-volume-index-nvi)
- [VPT - Corporate Finance Institute](https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/volume-price-trend-indicator-vpt/)
- [Force Index - StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/force-index)
- [CLV - StockResearchPro](https://www.stockresearchpro.com/calculate-and-interpret-the-close-location-value-clv/)

### Modern/Quantitative
- [PhenLabs Institutional Detector - TradingView](https://www.tradingview.com/script/MoK4KeHY-Institutional-Accumulation-and-Distribution-Detector-PhenLabs/)
- [Smart Money Volume Activity - AlgoAlpha](https://www.tradingview.com/script/POrDlSAK-Smart-Money-Volume-Activity-AlgoAlpha/)
- [RVOL - StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/relative-volume-rvol)
- [VWAP - Charles Schwab](https://www.schwab.com/learn/story/how-to-use-volume-weighted-indicators-trading)
- [15 Volume Indicators Python - Medium](https://datadave1.medium.com/15-essential-volume-indicators-and-using-them-in-python-5e681a9285bd)
- [QuantConnect Accumulation Distribution](https://www.quantconnect.com/docs/v2/writing-algorithms/indicators/supported-indicators/accumulation-distribution)
- [SqueezeMetrics](https://squeezemetrics.com/monitor/docs)
- [Dark Pool Analysis - FINRA](https://www.finra.org/finra-data/browse-catalog/short-sale-volume-data/daily-short-sale-volume-files)
