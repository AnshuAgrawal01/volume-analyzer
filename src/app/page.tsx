"use client";

import { useState } from "react";
import { StockInput } from "@/components/stock-input";
import { SummaryCards } from "@/components/summary-cards";
import { VolumeChart } from "@/components/volume-chart";
import { SpikeTable } from "@/components/spike-table";
import { ClassificationChart } from "@/components/classification-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Activity } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (params: {
    symbol: string;
    exchange: "NSE" | "BSE";
    years: number;
    volumeThreshold: number;
    priceThreshold: number;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Institutional Flow Detector
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Detect institutional accumulation and distribution by analyzing
            volume-price divergence. When volume spikes but price barely moves,
            institutions are likely at work — absorbing counter-party flow
            without moving the market.
          </p>
        </div>

        <Separator />

        {/* Input */}
        <StockInput onAnalyze={handleAnalyze} loading={loading} />

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                {result.companyName}{" "}
                <span className="text-muted-foreground font-normal text-base">
                  ({result.symbol})
                </span>
              </h2>
              <SummaryCards result={result} />
            </div>

            {/* Methodology note */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Methodology — 6-Factor Multi-Bar Scoring</AlertTitle>
              <AlertDescription className="text-sm space-y-1">
                <p>
                  <strong>Step 1 — News gate:</strong> If price moved &gt;1x ATR
                  with z-score &gt;1.5&sigma;, the spike is classified as
                  news-driven (no further scoring).
                </p>
                <p>
                  <strong>Step 2 — 6-factor institutional scoring:</strong> Each
                  factor scores +1 (accumulation), -1 (distribution), or 0
                  (neutral). Sum ranges from -6 to +6.
                </p>
                <p className="text-xs text-muted-foreground">
                  (1) CLV &gt;0.70/&lt;0.30 &bull; (2) CMF(20) &gt;+0.05/&lt;-0.05
                  &bull; (3) Volume asymmetry ratio &gt;1.3/&lt;0.7 &bull; (4) ADL
                  slope rising/falling &bull; (5) Effort vs Result: high vol +
                  narrow spread + close position &bull; (6) Follow-through: next 3
                  bars confirm or reject.
                </p>
                <p className="text-xs text-muted-foreground">
                  Score &ge;3 = high confidence, &ge;1 = moderate/low, 0 = ambiguous.
                  Based on VSA (Tom Williams), Wyckoff, CMF (Chaikin), ADL.
                </p>
              </AlertDescription>
            </Alert>

            {/* Charts */}
            <VolumeChart result={result} />

            <ClassificationChart result={result} />

            {/* Spike table */}
            <SpikeTable spikes={result.spikes} />
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="text-center py-20 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">
              Enter a stock symbol and click Backtest to analyze volume-price
              divergence patterns
            </p>
            <p className="text-sm mt-2">
              Try RELIANCE, TCS, INFY, HDFCBANK, or any NSE/BSE listed stock
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
