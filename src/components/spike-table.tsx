"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { VolumeSpike } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SpikeTableProps {
  spikes: VolumeSpike[];
}

type SortKey = "date" | "volumeMultiplier" | "priceChangePercent" | "totalScore";
type FilterType =
  | "all"
  | "institutional"
  | "news"
  | "ambiguous"
  | "accumulation"
  | "distribution"
  | "high_confidence";

const UP = "var(--color-up)";
const DOWN = "var(--color-down)";
const WARN = "var(--color-warn)";

const classificationStyle: Record<
  VolumeSpike["classification"],
  { label: string; color: string; bg: string }
> = {
  institutional_accumulation: {
    label: "Accumulation",
    color: UP,
    bg: "rgba(48, 209, 88, 0.12)",
  },
  institutional_distribution: {
    label: "Distribution",
    color: DOWN,
    bg: "rgba(255, 69, 58, 0.12)",
  },
  news_driven_up: {
    label: "News up",
    color: WARN,
    bg: "rgba(255, 214, 10, 0.12)",
  },
  news_driven_down: {
    label: "News down",
    color: WARN,
    bg: "rgba(255, 214, 10, 0.12)",
  },
  ambiguous: {
    label: "Ambiguous",
    color: "rgba(255,255,255,0.5)",
    bg: "rgba(255, 255, 255, 0.05)",
  },
};

function formatVolume(v: number) {
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(v);
}

function FactorDot({ score }: { score: number }) {
  const color =
    score > 0
      ? UP
      : score < 0
        ? DOWN
        : "rgba(255,255,255,0.15)";
  return (
    <span
      className="w-1.5 h-1.5 rounded-full inline-block"
      style={{ background: color }}
    />
  );
}

export function SpikeTable({ spikes }: SpikeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = [...spikes];

    if (filter === "institutional") {
      items = items.filter(
        (s) =>
          s.classification === "institutional_accumulation" ||
          s.classification === "institutional_distribution"
      );
    } else if (filter === "accumulation") {
      items = items.filter(
        (s) => s.classification === "institutional_accumulation"
      );
    } else if (filter === "distribution") {
      items = items.filter(
        (s) => s.classification === "institutional_distribution"
      );
    } else if (filter === "news") {
      items = items.filter(
        (s) =>
          s.classification === "news_driven_up" ||
          s.classification === "news_driven_down"
      );
    } else if (filter === "ambiguous") {
      items = items.filter((s) => s.classification === "ambiguous");
    } else if (filter === "high_confidence") {
      items = items.filter((s) => s.confidence === "high");
    }

    items.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return items;
  }, [spikes, filter, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? (
      <ChevronUp className="h-3 w-3 inline ml-0.5 text-foreground/60" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-0.5 text-foreground/60" />
    );
  };

  return (
    <section className="surface p-0 overflow-hidden">
      <div className="flex items-center justify-between px-7 py-5 border-b border-border flex-wrap gap-4">
        <div className="flex items-baseline gap-3">
          <h3 className="text-[15px] font-semibold tracking-tight">Events</h3>
          <span className="text-[12.5px] text-muted-foreground tnum">
            {filtered.length} of {spikes.length}
          </span>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
        >
          <SelectTrigger className="w-[180px] h-8 bg-transparent border-border text-[12.5px] rounded-[8px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all" className="text-[12.5px]">All events</SelectItem>
            <SelectItem value="institutional" className="text-[12.5px]">Institutional</SelectItem>
            <SelectItem value="accumulation" className="text-[12.5px]">Accumulation</SelectItem>
            <SelectItem value="distribution" className="text-[12.5px]">Distribution</SelectItem>
            <SelectItem value="news" className="text-[12.5px]">News-driven</SelectItem>
            <SelectItem value="ambiguous" className="text-[12.5px]">Ambiguous</SelectItem>
            <SelectItem value="high_confidence" className="text-[12.5px]">High confidence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[560px]">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
            <tr className="border-b border-border">
              <Th onClick={() => handleSort("date")}>
                Date <SortIcon col="date" />
              </Th>
              <Th onClick={() => handleSort("volumeMultiplier")} align="right">
                Vol <SortIcon col="volumeMultiplier" />
              </Th>
              <Th onClick={() => handleSort("priceChangePercent")} align="right">
                Price <SortIcon col="priceChangePercent" />
              </Th>
              <Th onClick={() => handleSort("totalScore")} align="center">
                Score <SortIcon col="totalScore" />
              </Th>
              <Th align="center">Factors</Th>
              <Th>Type</Th>
              <Th align="center">Conf</Th>
              <Th align="center">News</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((spike) => {
              const config = classificationStyle[spike.classification];
              const isExpanded = expandedRow === spike.date;
              const isNews =
                spike.classification === "news_driven_up" ||
                spike.classification === "news_driven_down";

              return (
                <Fragment key={spike.date}>
                  <tr
                    className="border-b border-border/60 hover:bg-white/[0.02] cursor-pointer transition-base"
                    onClick={() =>
                      setExpandedRow(isExpanded ? null : spike.date)
                    }
                  >
                    <td className="py-3 px-7 font-mono text-[12.5px] text-foreground/80 tnum">
                      {spike.date}
                    </td>
                    <td className="py-3 px-3 text-right font-medium tnum">
                      {spike.volumeMultiplier}×
                    </td>
                    <td
                      className="py-3 px-3 text-right font-medium tnum"
                      style={{
                        color:
                          spike.priceChangePercent > 0
                            ? UP
                            : spike.priceChangePercent < 0
                              ? DOWN
                              : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {spike.priceChangePercent > 0 ? "+" : ""}
                      {spike.priceChangePercent}%
                    </td>
                    <td className="py-3 px-3 text-center tnum">
                      {isNews ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span
                          className="font-medium"
                          style={{
                            color:
                              spike.totalScore > 0
                                ? UP
                                : spike.totalScore < 0
                                  ? DOWN
                                  : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {spike.totalScore > 0 ? "+" : ""}
                          {spike.totalScore}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isNews ? (
                        <span className="text-muted-foreground/40 text-center block">—</span>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex gap-1 items-center justify-center">
                              <FactorDot score={spike.factorScores.clv} />
                              <FactorDot score={spike.factorScores.cmf} />
                              <FactorDot score={spike.factorScores.volumeAsymmetry} />
                              <FactorDot score={spike.factorScores.adlSlope} />
                              <FactorDot score={spike.factorScores.effortVsResult} />
                              <FactorDot score={spike.factorScores.followThrough} />
                              <FactorDot score={spike.factorScores.marketContext} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-[11.5px]">
                            <p>CLV · CMF · Vol asym · ADL · E/R · Follow · Market</p>
                            <p className="mt-1 text-muted-foreground">
                              Green buy · Red sell · Dark neutral
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded-md text-[11.5px] font-medium"
                        style={{ color: config.color, background: config.bg }}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isNews ? (
                        <span className="text-muted-foreground/40 text-[12px]">—</span>
                      ) : (
                        <span
                          className="text-[12px]"
                          style={{
                            color:
                              spike.confidence === "high"
                                ? UP
                                : spike.confidence === "moderate"
                                  ? WARN
                                  : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {spike.confidence}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-7 text-center">
                      {spike.announcements.length > 0 ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <span
                              className="text-[12px] tnum font-medium"
                              style={{ color: WARN }}
                            >
                              {spike.announcements.length}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[320px]">
                            {spike.announcements.map((a, i) => (
                              <p key={i} className="text-[11.5px] text-foreground/80">
                                {a.headline}
                              </p>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground/30 text-[12px]">—</span>
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={8}
                        className="bg-black/40 px-7 py-6 border-b border-border"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-[12.5px] mb-5">
                          <MetricCell label="Open" value={`₹${spike.open.toFixed(2)}`} />
                          <MetricCell label="High" value={`₹${spike.high.toFixed(2)}`} />
                          <MetricCell label="Low" value={`₹${spike.low.toFixed(2)}`} />
                          <MetricCell label="Close" value={`₹${spike.close.toFixed(2)}`} />
                          <MetricCell
                            label="Volume"
                            value={`${formatVolume(spike.volume)} (${spike.volumeMultiplier}×)`}
                          />
                          <MetricCell label="ATR(20)" value={`₹${spike.atr20}`} />
                          <MetricCell label="Return z-score" value={`${spike.returnZScore}σ`} />
                          <MetricCell label="Price vs ATR" value={`${spike.priceChangeToATR}×`} />
                        </div>

                        {!isNews && (
                          <div className="surface-raised p-5 mb-5">
                            <p className="text-[12px] text-muted-foreground mb-4">
                              7-factor breakdown
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12.5px]">
                              <FactorRow
                                label="CLV"
                                score={spike.factorScores.clv}
                                detail={`${(spike.closePosition * 100).toFixed(0)}% — ${spike.closePosition > 0.7 ? ">70% (buy)" : spike.closePosition < 0.3 ? "<30% (sell)" : "mid"}`}
                              />
                              <FactorRow
                                label="CMF (20d)"
                                score={spike.factorScores.cmf}
                                detail={`${spike.cmf20 > 0 ? "+" : ""}${spike.cmf20.toFixed(3)}`}
                              />
                              <FactorRow
                                label="Vol asymmetry"
                                score={spike.factorScores.volumeAsymmetry}
                                detail={`${spike.volumeAsymmetryRatio.toFixed(2)} ratio`}
                              />
                              <FactorRow
                                label="ADL slope"
                                score={spike.factorScores.adlSlope}
                                detail={`${spike.adlSlope > 0 ? "+" : ""}${spike.adlSlope.toFixed(3)}`}
                              />
                              <FactorRow
                                label="Effort/result"
                                score={spike.factorScores.effortVsResult}
                                detail={`Body ${(spike.bodyToRangeRatio * 100).toFixed(0)}% of range`}
                              />
                              <FactorRow
                                label="Follow-through"
                                score={spike.factorScores.followThrough}
                                detail={
                                  spike.followThroughScore > 0
                                    ? "Confirmed"
                                    : spike.followThroughScore < 0
                                      ? "Rejected"
                                      : "Inconclusive"
                                }
                              />
                              <FactorRow
                                label="Market context"
                                score={spike.factorScores.marketContext}
                                detail={`Nifty ${spike.marketReturn > 0 ? "+" : ""}${spike.marketReturn}%`}
                              />
                            </div>
                            <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                              <span className="text-[12px] text-muted-foreground">Total</span>
                              <span
                                className="text-[20px] tnum font-semibold"
                                style={{
                                  color:
                                    spike.totalScore > 0
                                      ? UP
                                      : spike.totalScore < 0
                                        ? DOWN
                                        : "rgba(255,255,255,0.4)",
                                }}
                              >
                                {spike.totalScore > 0 ? "+" : ""}
                                {spike.totalScore}
                                <span className="text-muted-foreground text-[14px]">
                                  {" "}/ 7
                                </span>
                              </span>
                              <span className="text-[12px] text-muted-foreground">
                                {spike.confidence} ·{" "}
                                {spike.classification.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <p className="text-[12px] text-muted-foreground mb-2">Signals</p>
                          {spike.signals.map((sig, i) => (
                            <p
                              key={i}
                              className="text-[12.5px] text-foreground/70 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="text-muted-foreground/60 mt-0.5">·</span>
                              {sig}
                            </p>
                          ))}
                        </div>

                        {spike.announcements.length > 0 && (
                          <div className="mt-5 space-y-1.5">
                            <p className="text-[12px] text-muted-foreground mb-2">
                              Corporate announcements
                            </p>
                            {spike.announcements.map((a, i) => (
                              <p
                                key={i}
                                className="text-[12.5px] text-foreground/70 flex items-start gap-2 leading-relaxed"
                              >
                                <span style={{ color: WARN }} className="mt-0.5">·</span>
                                <span style={{ color: WARN, opacity: 0.7 }}>
                                  [{a.category || "General"}]
                                </span>
                                {a.headline}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-muted-foreground py-16 text-[13px]"
                >
                  No events match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollArea>
    </section>
  );
}

function Th({
  children,
  onClick,
  align = "left",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  align?: "left" | "right" | "center";
}) {
  const padX =
    align === "right" || align === "center" ? "px-3" : "px-7";
  return (
    <th
      className={`py-3 ${padX} text-[11.5px] font-medium text-muted-foreground transition-base ${
        onClick ? "cursor-pointer hover:text-foreground" : ""
      } text-${align}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11.5px] text-muted-foreground mb-0.5">{label}</p>
      <p className="tnum font-medium text-foreground/90">{value}</p>
    </div>
  );
}

function FactorRow({
  label,
  score,
  detail,
}: {
  label: string;
  score: number;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-1.5">
        <FactorDot score={score} />
      </div>
      <div>
        <p className="font-medium text-foreground/85">{label}</p>
        <p className="text-[11.5px] text-muted-foreground tnum">{detail}</p>
      </div>
    </div>
  );
}
