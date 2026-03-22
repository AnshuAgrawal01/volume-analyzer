"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Building2,
  Newspaper,
  HelpCircle,
  BarChart3,
  Calendar,
} from "lucide-react";

interface SummaryCardsProps {
  result: AnalysisResult;
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const cards = [
    {
      title: "Trading Days",
      value: result.totalTradingDays.toLocaleString(),
      sub: `${result.dataStartDate} → ${result.dataEndDate}`,
      icon: Calendar,
      color: "text-muted-foreground",
    },
    {
      title: "Volume Spikes",
      value: result.totalSpikes,
      sub: `Avg ${result.avgSpikeMultiplier}x · Max ${result.maxSpikeMultiplier}x`,
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Institutional",
      value: result.institutionalEvents,
      sub: `${((result.institutionalEvents / Math.max(result.totalSpikes, 1)) * 100).toFixed(0)}% of all spikes`,
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Accumulation",
      value: result.accumulationEvents,
      sub: "Buying pressure (close near high)",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Distribution",
      value: result.distributionEvents,
      sub: "Selling pressure (close near low)",
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "News-Driven",
      value: result.newsEvents,
      sub: "Significant price movement",
      icon: Newspaper,
      color: "text-amber-600",
    },
    {
      title: "Ambiguous",
      value: result.ambiguousEvents,
      sub: "Mixed signals",
      icon: HelpCircle,
      color: "text-muted-foreground",
    },
    {
      title: "Net Signal",
      value:
        result.accumulationEvents > result.distributionEvents
          ? "Accumulation"
          : result.distributionEvents > result.accumulationEvents
            ? "Distribution"
            : "Neutral",
      sub: `${result.accumulationEvents} buys vs ${result.distributionEvents} sells`,
      icon: Activity,
      color:
        result.accumulationEvents > result.distributionEvents
          ? "text-emerald-600"
          : result.distributionEvents > result.accumulationEvents
            ? "text-red-600"
            : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
