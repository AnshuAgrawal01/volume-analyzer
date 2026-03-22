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
import { ChevronDown, ChevronUp, Info } from "lucide-react";

interface SpikeTableProps {
  spikes: VolumeSpike[];
}

type SortKey = "date" | "volumeMultiplier" | "priceChangePercent" | "priceChangeToATR";
type FilterType = "all" | "institutional" | "news" | "ambiguous" | "accumulation" | "distribution";

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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="institutional">Institutional Only</SelectItem>
            <SelectItem value="accumulation">Accumulation Only</SelectItem>
            <SelectItem value="distribution">Distribution Only</SelectItem>
            <SelectItem value="news">News-Driven Only</SelectItem>
            <SelectItem value="ambiguous">Ambiguous Only</SelectItem>
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
                <TableHead className="text-right">Volume</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("priceChangePercent")}
                >
                  Price Δ <SortIcon col="priceChangePercent" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("priceChangeToATR")}
                >
                  vs ATR <SortIcon col="priceChangeToATR" />
                </TableHead>
                <TableHead className="text-center">Body/Range</TableHead>
                <TableHead className="text-center">Close Pos</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead className="text-center">News</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((spike) => {
                const config = classificationConfig[spike.classification];
                const isExpanded = expandedRow === spike.date;

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
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatVolume(spike.volume)}
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
                      <TableCell className="text-right text-sm">
                        {spike.priceChangeToATR}x
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {(spike.bodyToRangeRatio * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="w-full bg-muted rounded-full h-2 relative">
                          <div
                            className="absolute top-0 h-2 w-1.5 rounded-full bg-foreground"
                            style={{ left: `${spike.closePosition * 100}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
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
                        <TableCell colSpan={10} className="bg-muted/30 p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
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
                              <span className="text-muted-foreground">20d Avg Vol</span>
                              <p className="font-medium">{formatVolume(spike.rollingAvgVolume)}</p>
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
                              <span className="text-muted-foreground">Intraday Δ</span>
                              <p className="font-medium">{spike.intradayChangePercent}%</p>
                            </div>
                          </div>
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
                    colSpan={10}
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
