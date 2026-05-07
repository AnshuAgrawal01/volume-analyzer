"use client";

import type { AnalysisResult } from "@/lib/types";

interface SummaryCardsProps {
  result: AnalysisResult;
}

type Tone = "neutral" | "up" | "down" | "warn";

interface Card {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
  emphasis?: boolean;
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const netLeads =
    result.accumulationEvents > result.distributionEvents
      ? "up"
      : result.distributionEvents > result.accumulationEvents
        ? "down"
        : "neutral";

  const netLabel =
    netLeads === "up"
      ? "Accumulation"
      : netLeads === "down"
        ? "Distribution"
        : "Neutral";

  const instPct =
    result.totalSpikes > 0
      ? Math.round((result.institutionalEvents / result.totalSpikes) * 100)
      : 0;

  const cards: Card[] = [
    {
      label: "Net signal",
      value: netLabel,
      sub: `${result.accumulationEvents} buys · ${result.distributionEvents} sells`,
      tone: netLeads as Tone,
      emphasis: true,
    },
    {
      label: "Institutional",
      value: result.institutionalEvents.toLocaleString(),
      sub: `${instPct}% of spikes`,
      tone: "neutral",
    },
    {
      label: "Volume spikes",
      value: result.totalSpikes.toLocaleString(),
      sub: `Avg ${result.avgSpikeMultiplier}× · Max ${result.maxSpikeMultiplier}×`,
      tone: "neutral",
    },
    {
      label: "Trading days",
      value: result.totalTradingDays.toLocaleString(),
      sub: `${result.dataStartDate} → ${result.dataEndDate}`,
      tone: "neutral",
    },
  ];

  const secondary: Card[] = [
    {
      label: "Accumulation",
      value: result.accumulationEvents.toLocaleString(),
      sub: "Buying pressure",
      tone: "up",
    },
    {
      label: "Distribution",
      value: result.distributionEvents.toLocaleString(),
      sub: "Selling pressure",
      tone: "down",
    },
    {
      label: "News-driven",
      value: result.newsEvents.toLocaleString(),
      sub: "Filtered out",
      tone: "warn",
    },
    {
      label: "Ambiguous",
      value: result.ambiguousEvents.toLocaleString(),
      sub: "Mixed signals",
      tone: "neutral",
    },
  ];

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <SummaryCard key={c.label} card={c} />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {secondary.map((c) => (
          <SummaryCard key={c.label} card={c} small />
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ card, small = false }: { card: Card; small?: boolean }) {
  const valueColor =
    card.tone === "up"
      ? "var(--color-up)"
      : card.tone === "down"
        ? "var(--color-down)"
        : card.tone === "warn"
          ? "var(--color-warn)"
          : "var(--foreground)";

  return (
    <div className="surface p-5">
      <p className="text-[12px] text-muted-foreground mb-3">{card.label}</p>
      <p
        className="tnum tracking-[-0.02em] font-semibold"
        style={{
          color: valueColor,
          fontSize: small ? 24 : card.emphasis ? 32 : 30,
          lineHeight: 1.05,
        }}
      >
        {card.value}
      </p>
      <p className="text-[12px] text-muted-foreground mt-2 tnum">
        {card.sub}
      </p>
    </div>
  );
}
