"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

interface VolumeChartProps {
  result: AnalysisResult;
}

export function VolumeChart({ result }: VolumeChartProps) {
  const { chartData, spikeDates } = useMemo(() => {
    const spikeSet = new Set(result.spikes.map((s) => s.date));

    // Downsample for performance if too many bars
    const step = result.dailyData.length > 1000 ? Math.floor(result.dailyData.length / 500) : 1;

    const data = [];
    for (let i = 0; i < result.dailyData.length; i += step) {
      const bar = result.dailyData[i];
      const isSpike = spikeSet.has(bar.date);
      data.push({
        date: bar.date,
        close: Math.round(bar.close * 100) / 100,
        volume: bar.volume,
        rollingAvg: result.rollingVolumes[i] || 0,
        isSpike,
        spikeVolume: isSpike ? bar.volume : null,
      });
    }

    return { chartData: data, spikeDates: spikeSet };
  }, [result]);

  const institutionalSpikes = useMemo(
    () =>
      result.spikes.filter(
        (s) =>
          s.classification === "institutional_accumulation" ||
          s.classification === "institutional_distribution"
      ),
    [result.spikes]
  );

  const formatVolume = (v: number) => {
    if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
    if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return String(v);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Price & Volume
          <span className="text-sm font-normal text-muted-foreground">
            (highlighted bars = volume spikes)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(2, 7)}
                interval={Math.floor(chartData.length / 12)}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                tick={{ fontSize: 11 }}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `₹${v}`}
              />
              <YAxis
                yAxisId="volume"
                orientation="left"
                tick={{ fontSize: 11 }}
                tickFormatter={formatVolume}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  if (!d) return null;
                  return (
                    <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
                      <p className="font-medium">{d.date}</p>
                      <p>Close: ₹{d.close}</p>
                      <p>Volume: {formatVolume(d.volume)}</p>
                      <p>20d Avg: {formatVolume(d.rollingAvg)}</p>
                      {d.isSpike && (
                        <p className="text-amber-600 font-medium mt-1">
                          Volume Spike!
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Legend />

              {/* Volume bars */}
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="hsl(215, 20%, 80%)"
                opacity={0.4}
                name="Volume"
              />

              {/* Spike volume overlay */}
              <Bar
                yAxisId="volume"
                dataKey="spikeVolume"
                fill="hsl(25, 95%, 53%)"
                opacity={0.8}
                name="Spike Volume"
              />

              {/* Rolling average volume line */}
              <Line
                yAxisId="volume"
                dataKey="rollingAvg"
                stroke="hsl(215, 60%, 50%)"
                strokeWidth={1.5}
                dot={false}
                name="20d Avg Vol"
              />

              {/* Price line */}
              <Line
                yAxisId="price"
                dataKey="close"
                stroke="hsl(145, 60%, 40%)"
                strokeWidth={2}
                dot={false}
                name="Close Price"
              />

              {/* Mark institutional events on price line */}
              {institutionalSpikes.map((spike) => {
                const idx = chartData.findIndex((d) => d.date === spike.date);
                if (idx === -1) return null;
                return (
                  <ReferenceDot
                    key={spike.date}
                    yAxisId="price"
                    x={spike.date}
                    y={spike.close}
                    r={5}
                    fill={
                      spike.classification === "institutional_accumulation"
                        ? "hsl(145, 80%, 40%)"
                        : "hsl(0, 80%, 50%)"
                    }
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            Accumulation
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            Distribution
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            Volume Spike
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
