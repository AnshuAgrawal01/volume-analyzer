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
              <AlertTitle>Methodology</AlertTitle>
              <AlertDescription className="text-sm">
                <strong>Volume Spread Analysis + Wyckoff:</strong> A volume spike
                (&ge;3x 20-day avg) is classified by price behavior. If price
                barely moved (&lt;0.5x ATR, return z-score &lt;1&sigma;), it
                signals institutional absorption. Close position within the
                day&apos;s range determines accumulation (close near high) vs
                distribution (close near low). News events are cross-referenced
                from BSE corporate announcements.
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
