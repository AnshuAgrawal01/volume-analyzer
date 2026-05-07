import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.search(query, {
      quotesCount: 8,
      newsCount: 0,
    });

    const quotes = (result.quotes || [])
      .filter(
        (q: { symbol?: string; quoteType?: string }) =>
          q.symbol && q.quoteType === "EQUITY"
      )
      .map(
        (q: {
          symbol: string;
          shortname?: string;
          longname?: string;
          exchange?: string;
        }) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          exchange: q.exchange || "",
          isIndian:
            q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"),
        })
      );

    return NextResponse.json(quotes);
  } catch {
    return NextResponse.json([]);
  }
}
