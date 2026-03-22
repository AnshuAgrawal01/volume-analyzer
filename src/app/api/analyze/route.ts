import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { analyze, buildAnalysisResult } from "@/lib/analyzer";
import type { OHLCVBar, Announcement } from "@/lib/types";
import { subYears, format } from "date-fns";

export const maxDuration = 60;

const yf = new YahooFinance();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      symbol,
      exchange = "NSE",
      years = 5,
      volumeThreshold = 3,
      priceThreshold = 1.0,
    } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    // Yahoo Finance ticker format for Indian stocks
    const suffix = exchange === "BSE" ? ".BO" : ".NS";
    const ticker = symbol.toUpperCase().includes(".")
      ? symbol.toUpperCase()
      : `${symbol.toUpperCase()}${suffix}`;

    const endDate = new Date();
    const startDate = subYears(endDate, years);

    // Fetch OHLCV data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.chart(ticker, {
      period1: format(startDate, "yyyy-MM-dd"),
      period2: format(endDate, "yyyy-MM-dd"),
      interval: "1d",
    });

    if (!result.quotes || result.quotes.length === 0) {
      return NextResponse.json(
        { error: `No data found for ${ticker}. Check the symbol and try again.` },
        { status: 404 }
      );
    }

    const companyName =
      result.meta?.shortName || result.meta?.longName || ticker;

    // Convert to our format
    const quotes: Array<{
      date: string | Date;
      open?: number | null;
      high?: number | null;
      low?: number | null;
      close?: number | null;
      volume?: number | null;
    }> = result.quotes;

    const bars: OHLCVBar[] = quotes
      .filter(
        (q) =>
          q.open != null &&
          q.high != null &&
          q.low != null &&
          q.close != null &&
          q.volume != null &&
          q.volume > 0
      )
      .map((q) => ({
        date: format(new Date(q.date), "yyyy-MM-dd"),
        open: q.open!,
        high: q.high!,
        low: q.low!,
        close: q.close!,
        volume: q.volume!,
      }));

    // Skip first 30 trading days to avoid IPO volatility
    const listingCutoff = 30;
    const effectiveBars =
      bars.length > listingCutoff + 40
        ? bars.slice(listingCutoff)
        : bars;

    // Fetch corporate announcements from BSE
    const announcements = await fetchBSEAnnouncements(
      symbol.toUpperCase(),
      format(startDate, "yyyy-MM-dd"),
      format(endDate, "yyyy-MM-dd")
    );

    // Run analysis
    const { spikes, rollingVolumes } = analyze(
      effectiveBars,
      volumeThreshold,
      priceThreshold,
      announcements
    );

    const analysisResult = buildAnalysisResult(
      ticker,
      companyName,
      effectiveBars,
      spikes,
      rollingVolumes
    );

    return NextResponse.json(analysisResult);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function fetchBSEAnnouncements(
  symbol: string,
  fromDate: string,
  toDate: string
): Promise<Map<string, Announcement[]>> {
  const announcements = new Map<string, Announcement[]>();

  try {
    // BSE Corporate Announcements API
    // Try to fetch from BSE India's public API
    const url = `https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?strCat=-1&strPrevDate=${fromDate}&strScrip=${symbol}&strSearch=P&strToDate=${toDate}&strType=C`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.bseindia.com/",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.Table && Array.isArray(data.Table)) {
        for (const item of data.Table) {
          const date = item.NEWS_DT
            ? format(new Date(item.NEWS_DT), "yyyy-MM-dd")
            : null;
          if (!date) continue;

          const announcement: Announcement = {
            date,
            headline: item.NEWSSUB || item.HEADLINE || "Corporate Announcement",
            category: item.CATEGORYNAME || undefined,
            source: "BSE",
          };

          const existing = announcements.get(date) || [];
          existing.push(announcement);
          announcements.set(date, existing);
        }
      }
    }
  } catch {
    // BSE API may not always be available — analysis proceeds without it
    console.warn("BSE announcements fetch failed — proceeding without news data");
  }

  return announcements;
}
