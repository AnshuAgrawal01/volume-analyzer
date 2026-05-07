"use client";

import { useState } from "react";
import { StockInput } from "@/components/stock-input";
import { SummaryCards } from "@/components/summary-cards";
import { VolumeChart } from "@/components/volume-chart";
import { SpikeTable } from "@/components/spike-table";
import { ClassificationChart } from "@/components/classification-chart";
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
    <main className="min-h-screen">
      {/* Top bar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-[1240px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="text-[15px] font-semibold tracking-tight">
              Flow
            </span>
            <span className="text-[13px] text-muted-foreground ml-2 hidden sm:inline">
              Institutional volume-price divergence
            </span>
          </div>
          <a
            href="#methodology"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-base"
          >
            Methodology
          </a>
        </div>
      </nav>

      <div className="max-w-[1240px] mx-auto px-6 pt-16 pb-24">
        {/* Hero */}
        {!result && !loading && (
          <header className="fade-rise mb-12 max-w-3xl">
            <h1 className="text-[44px] md:text-[56px] leading-[1.05] font-semibold tracking-[-0.025em]">
              See what
              <span className="text-muted-foreground"> institutions </span>
              are quietly doing.
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground max-w-xl">
              When volume spikes but price barely moves, large players are
              absorbing flow without showing their hand. Enter any Indian
              equity to surface those moments.
            </p>
          </header>
        )}

        {result && (
          <header className="fade-rise mb-10">
            <p className="text-[13px] text-muted-foreground mb-2">
              Analysis
            </p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[34px] md:text-[40px] leading-none font-semibold tracking-[-0.02em]">
                {result.companyName}
              </h1>
              <span className="font-mono text-[15px] text-muted-foreground tnum">
                {result.symbol}
              </span>
            </div>
          </header>
        )}

        {/* Input — relative + z-30 so the absolute suggestions dropdown
            inside paints above the rest of the page. */}
        <div
          className="relative z-30 fade-rise"
          style={{ animationDelay: "60ms" }}
        >
          <StockInput onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="fade-rise mt-6 surface px-5 py-4 flex items-center gap-3"
            style={{ borderColor: "rgba(255, 69, 58, 0.3)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-down)" }}
            />
            <p className="text-[14px]" style={{ color: "var(--color-down)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-16 flex flex-col items-center text-center fade-rise">
            <div className="relative w-10 h-10 mb-5">
              <div className="absolute inset-0 rounded-full border border-border" />
              <div
                className="absolute inset-0 rounded-full border-t border-foreground animate-spin"
                style={{ animationDuration: "0.9s" }}
              />
            </div>
            <p className="text-[14px] text-muted-foreground">
              Scanning historical bars
            </p>
          </div>
        )}

        {/* Empty state — restrained tickers */}
        {!result && !loading && !error && (
          <div className="mt-16 fade-rise" style={{ animationDelay: "120ms" }}>
            <p className="text-[13px] text-muted-foreground mb-3">Try</p>
            <div className="flex flex-wrap gap-2">
              {["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC"].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-md text-[13px] font-mono text-foreground/80 surface-raised tnum"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-12 space-y-12">
            <SummaryCards result={result} />
            <VolumeChart result={result} />
            <ClassificationChart result={result} />
            <SpikeTable spikes={result.spikes} />
          </div>
        )}

        {/* Methodology — always present so the nav link always lands somewhere */}
        <section
          id="methodology"
          className={`surface p-7 max-w-3xl ${result ? "mt-12" : "mt-24"} scroll-mt-20`}
        >
          <h3 className="text-[15px] font-semibold tracking-tight mb-3">
            How this works
          </h3>
          <div className="text-[14px] text-muted-foreground space-y-2 leading-relaxed">
            <p>
              <span className="text-foreground">News gate.</span> If price
              moved more than 1× ATR with z-score above 1.5σ, the event is
              classified as news-driven and excluded from institutional
              scoring.
            </p>
            <p>
              <span className="text-foreground">7-factor scoring.</span>{" "}
              CLV, CMF(20), volume asymmetry, ADL slope, effort vs result,
              follow-through, and market context. Each contributes +1, −1,
              or 0. Total ranges −7 to +7.
            </p>
            <p>
              Score ≥ 4 is high confidence, ≥ 3 moderate, ≥ 1 low. Built on
              VSA, Wyckoff, CMF, ADL, and Fama-French.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
