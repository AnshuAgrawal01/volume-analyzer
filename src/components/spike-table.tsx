"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronDown, ChevronUp, Info, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface SpikeTableProps {
  spikes: VolumeSpike[];
}

type SortKey = "date" | "volumeMultiplier" | "priceChangePercent" | "totalScore";
type FilterType = "all" | "institutional" | "news" | "ambiguous" | "accumulation" | "distribution" | "high_confidence";

const classificationConfig: Record<
  VolumeSpike["classification"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  institutional_accumulation: { label: "Accumulation", variant: "default" },
  institutional_distribution: { label: "Distribution", variant: "destructive" },
  news_driven_up: { label: "News ↑", variant: "secondary" },
  news_driven_down: { label: "News ↓", variant: "secondary" },
  ambiguous: { label: "Ambiguous", variant: "outline" },
};

function formatVolume(v: number) {
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(v);
}

function FactorDot({ score }: { score: number }) {
  if (score > 0) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
  if (score < 0) return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  return <MinusCircle className="h-3.5 w-3.5 text-muted-foreground/50" />;
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
      items = items.filter((s) => s.classification === "institutional_accumulation");
    } else if (filter === "distribution") {
      items = items.filter((s) => s.classification === "institutional_distribution");
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
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Volume Spike Events ({filtered.length})
        </CardTitle>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="institutional">Institutional Only</SelectItem>
            <SelectItem value="accumulation">Accumulation Only</SelectItem>
            <SelectItem value="distribution">Distribution Only</SelectItem>
            <SelectItem value="news">News-Driven Only</SelectItem>
            <SelectItem value="ambiguous">Ambiguous Only</SelectItem>
            <SelectItem value="high_confidence">High Confidence Only</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("date")}
                >
                  Date <SortIcon col="date" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("volumeMultiplier")}
                >
                  Vol Spike <SortIcon col="volumeMultiplier" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("priceChangePercent")}
                >
                  Price Δ <SortIcon col="priceChangePercent" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-center"
                  onClick={() => handleSort("totalScore")}
                >
                  Score <SortIcon col="totalScore" />
                </TableHead>
                <TableHead className="text-center">Factors</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead className="text-center">News</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((spike) => {
                const config = classificationConfig[spike.classification];
                const isExpanded = expandedRow === spike.date;
                const isNews = spike.classification === "news_driven_up" || spike.classification === "news_driven_down";

                return (
                  <Fragment key={spike.date}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : spike.date)
                      }
                    >
                      <TableCell className="font-mono text-sm">
                        {spike.date}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {spike.volumeMultiplier}x
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          spike.priceChangePercent > 0
                            ? "text-emerald-600"
                            : spike.priceChangePercent < 0
                              ? "text-red-600"
                              : ""
                        }`}
                      >
                        {spike.priceChangePercent > 0 ? "+" : ""}
                        {spike.priceChangePercent}%
                      </TableCell>
                      <TableCell className="text-center">
                        {isNews ? (
                          <span className="text-muted-foreground text-sm">—</span>
                        ) : (
                          <span className={`font-bold ${
                            spike.totalScore > 0 ? "text-emerald-600" :
                            spike.totalScore < 0 ? "text-red-600" :
                            "text-muted-foreground"
                          }`}>
                            {spike.totalScore > 0 ? "+" : ""}{spike.totalScore}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isNews ? (
                          <span className="text-muted-foreground text-sm">—</span>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex gap-0.5 items-center">
                                <FactorDot score={spike.factorScores.clv} />
                                <FactorDot score={spike.factorScores.cmf} />
                                <FactorDot score={spike.factorScores.volumeAsymmetry} />
                                <FactorDot score={spike.factorScores.adlSlope} />
                                <FactorDot score={spike.factorScores.effortVsResult} />
                                <FactorDot score={spike.factorScores.followThrough} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                              <p>CLV | CMF | Vol Asymmetry | ADL | Effort/Result | Follow-through</p>
                              <p className="mt-1">Green = accumulation, Red = distribution, Gray = neutral</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {isNews ? (
                          <Badge variant="secondary" className="text-xs">N/A</Badge>
                        ) : (
                          <Badge variant="outline" className={`text-xs ${
                            spike.confidence === "high" ? "border-emerald-500 text-emerald-700" :
                            spike.confidence === "moderate" ? "border-amber-500 text-amber-700" :
                            "border-muted-foreground/30"
                          }`}>
                            {spike.confidence}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {spike.announcements.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-amber-600">
                                {spike.announcements.length}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                              {spike.announcements.map((a, i) => (
                                <p key={i} className="text-xs">
                                  {a.headline}
                                </p>
                              ))}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30 p-4">
                          {/* OHLCV + basic metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-muted-foreground">Open</span>
                              <p className="font-medium">₹{spike.open.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">High</span>
                              <p className="font-medium">₹{spike.high.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Low</span>
                              <p className="font-medium">₹{spike.low.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Close</span>
                              <p className="font-medium">₹{spike.close.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Volume</span>
                              <p className="font-medium">{formatVolume(spike.volume)} ({spike.volumeMultiplier}x avg)</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">ATR(20)</span>
                              <p className="font-medium">₹{spike.atr20}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Return Z-Score</span>
                              <p className="font-medium">{spike.returnZScore}σ</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price vs ATR</span>
                              <p className="font-medium">{spike.priceChangeToATR}x</p>
                            </div>
                          </div>

                          {/* Multi-factor breakdown (only for institutional/ambiguous) */}
                          {!isNews && (
                            <div className="mb-4 border rounded-lg p-3 bg-background">
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                                6-Factor Scoring Breakdown
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <FactorRow label="CLV (Close Position)" value={spike.closePosition} score={spike.factorScores.clv} detail={`${(spike.closePosition * 100).toFixed(0)}% — ${spike.closePosition > 0.7 ? ">70% (buying)" : spike.closePosition < 0.3 ? "<30% (selling)" : "mid-range"}`} />
                                <FactorRow label="CMF (20-day)" value={spike.cmf20} score={spike.factorScores.cmf} detail={`${spike.cmf20 > 0 ? "+" : ""}${spike.cmf20.toFixed(3)} — ${spike.cmf20 > 0.05 ? "net buying flow" : spike.cmf20 < -0.05 ? "net selling flow" : "neutral"}`} />
                                <FactorRow label="Volume Asymmetry" value={spike.volumeAsymmetryRatio} score={spike.factorScores.volumeAsymmetry} detail={`${spike.volumeAsymmetryRatio.toFixed(2)} — ${spike.volumeAsymmetryRatio > 1.3 ? "heavier on up-closes" : spike.volumeAsymmetryRatio < 0.7 ? "heavier on down-closes" : "balanced"}`} />
                                <FactorRow label="ADL Slope" value={spike.adlSlope} score={spike.factorScores.adlSlope} detail={`${spike.adlSlope > 0 ? "+" : ""}${spike.adlSlope.toFixed(3)} — ${spike.adlSlope > 0.1 ? "rising (buying)" : spike.adlSlope < -0.1 ? "falling (selling)" : "flat"}`} />
                                <FactorRow label="Effort vs Result" value={spike.bodyToRangeRatio} score={spike.factorScores.effortVsResult} detail={`Body ${(spike.bodyToRangeRatio * 100).toFixed(0)}% of range — ${spike.bodyToRangeRatio < 0.3 ? "narrow (absorption)" : "wide (genuine move)"}`} />
                                <FactorRow label="Follow-Through" value={spike.followThroughScore} score={spike.factorScores.followThrough} detail={spike.followThroughScore > 0 ? "Price held (confirmed)" : spike.followThroughScore < 0 ? "Price failed (rejected)" : "Inconclusive"} />
                              </div>
                              <div className="mt-3 pt-2 border-t flex items-center gap-2">
                                <span className="text-sm font-medium">Total Score:</span>
                                <span className={`text-lg font-bold ${spike.totalScore > 0 ? "text-emerald-600" : spike.totalScore < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                                  {spike.totalScore > 0 ? "+" : ""}{spike.totalScore}/6
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({spike.confidence} confidence {spike.classification.replace(/_/g, " ")})
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Signals */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Analysis Signals
                            </p>
                            {spike.signals.map((sig, i) => (
                              <p key={i} className="text-sm">
                                • {sig}
                              </p>
                            ))}
                          </div>

                          {/* Announcements */}
                          {spike.announcements.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase">
                                Corporate Announcements
                              </p>
                              {spike.announcements.map((a, i) => (
                                <p key={i} className="text-sm">
                                  • [{a.category || "General"}] {a.headline}
                                </p>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No events found with current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function FactorRow({ label, score, detail }: { label: string; value: number; score: number; detail: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">
        <FactorDot score={score} />
      </div>
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
