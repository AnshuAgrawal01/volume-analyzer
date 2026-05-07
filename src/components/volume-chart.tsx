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
} from "recharts";
import type { AnalysisResult, VolumeSpike } from "@/lib/types";

interface VolumeChartProps {
  result: AnalysisResult;
}

const UP = "#30d158";
const DOWN = "#ff453a";
const WARN = "#ffd60a";

function TriangleUp({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const h = size;
  const w = size * 1.05;
  return (
    <polygon
      points={`${cx},${cy - h} ${cx - w},${cy + h * 0.55} ${cx + w},${cy + h * 0.55}`}
      fill={UP}
      stroke="#000"
      strokeWidth={1.25}
    />
  );
}

function TriangleDown({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const h = size;
  const w = size * 1.05;
  return (
    <polygon
      points={`${cx},${cy + h} ${cx - w},${cy - h * 0.55} ${cx + w},${cy - h * 0.55}`}
      fill={DOWN}
      stroke="#000"
      strokeWidth={1.25}
    />
  );
}

export function VolumeChart({ result }: VolumeChartProps) {
  const chartData = useMemo(() => {
    const spikeSet = new Set(result.spikes.map((s) => s.date));
    const step =
      result.dailyData.length > 1000
        ? Math.floor(result.dailyData.length / 500)
        : 1;

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

    if (step > 1) {
      const dateSet = new Set(data.map((d) => d.date));
      for (const spike of result.spikes) {
        if (!dateSet.has(spike.date)) {
          const idx = result.dailyData.findIndex((d) => d.date === spike.date);
          if (idx >= 0) {
            data.push({
              date: spike.date,
              close: Math.round(result.dailyData[idx].close * 100) / 100,
              volume: result.dailyData[idx].volume,
              rollingAvg: result.rollingVolumes[idx] || 0,
              isSpike: true,
              spikeVolume: result.dailyData[idx].volume,
            });
          }
        }
      }
      data.sort((a, b) => a.date.localeCompare(b.date));
    }

    return data;
  }, [result]);

  const { accumulationSpikes, distributionSpikes, newsSpikes } = useMemo(() => {
    const acc: VolumeSpike[] = [];
    const dist: VolumeSpike[] = [];
    const news: VolumeSpike[] = [];

    for (const s of result.spikes) {
      if (s.classification === "institutional_accumulation") acc.push(s);
      else if (s.classification === "institutional_distribution") dist.push(s);
      else if (
        s.classification === "news_driven_up" ||
        s.classification === "news_driven_down"
      )
        news.push(s);
    }

    return {
      accumulationSpikes: acc,
      distributionSpikes: dist,
      newsSpikes: news,
    };
  }, [result.spikes]);

  const formatVolume = (v: number) => {
    if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
    if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return String(v);
  };

  return (
    <section className="surface p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            Price & volume
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            Markers show classified events
          </p>
        </div>
        <Legend />
      </div>

      <div className="h-[440px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 18, bottom: 0, left: 8 }}
          >
            <XAxis
              dataKey="date"
              tickFormatter={(d) => d.slice(2, 7)}
              interval={Math.max(1, Math.floor(chartData.length / 10))}
              stroke="transparent"
              tickLine={false}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={["auto", "auto"]}
              tickFormatter={(v) => `₹${v}`}
              stroke="transparent"
              tickLine={false}
              width={56}
            />
            <YAxis
              yAxisId="volume"
              orientation="left"
              tickFormatter={formatVolume}
              stroke="transparent"
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;

                const spike = result.spikes.find((s) => s.date === d.date);

                return (
                  <div className="bg-popover border border-border rounded-[10px] shadow-2xl shadow-black/60 p-3.5 text-[12.5px] min-w-[200px]">
                    <p className="text-muted-foreground tnum mb-2">{d.date}</p>
                    <div className="space-y-1">
                      <Row label="Close" value={`₹${d.close}`} />
                      <Row label="Volume" value={formatVolume(d.volume)} />
                      <Row
                        label="20d avg"
                        value={formatVolume(d.rollingAvg)}
                        muted
                      />
                    </div>
                    {spike && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p
                          className="text-[12.5px] font-medium"
                          style={{
                            color: spike.classification.includes("accumulation")
                              ? UP
                              : spike.classification.includes("distribution")
                                ? DOWN
                                : spike.classification.includes("news")
                                  ? WARN
                                  : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {spike.volumeMultiplier}× —{" "}
                          {spike.classification.replace(/_/g, " ")}
                        </p>
                        {spike.totalScore !== 0 && !spike.classification.includes("news") && (
                          <p className="text-[11.5px] text-muted-foreground mt-0.5 tnum">
                            Score {spike.totalScore > 0 ? "+" : ""}
                            {spike.totalScore} / 7 · {spike.confidence}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="rgba(255, 255, 255, 0.06)"
              radius={[1, 1, 0, 0]}
              name="Volume"
            />
            <Bar
              yAxisId="volume"
              dataKey="spikeVolume"
              fill="rgba(255, 255, 255, 0.22)"
              radius={[1, 1, 0, 0]}
              name="Spike volume"
            />
            <Line
              yAxisId="volume"
              dataKey="rollingAvg"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth={1}
              dot={false}
              name="20d avg"
            />
            <Line
              yAxisId="price"
              dataKey="close"
              stroke="#f5f5f7"
              strokeWidth={1.5}
              dot={false}
              name="Close"
            />

            {accumulationSpikes.map((spike) => (
              <ReferenceDot
                key={`acc-${spike.date}`}
                yAxisId="price"
                x={spike.date}
                y={spike.close}
                r={0}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => {
                  const cx = props.cx ?? 0;
                  const cy = props.cy ?? 0;
                  const size =
                    spike.confidence === "high"
                      ? 7
                      : spike.confidence === "moderate"
                        ? 6
                        : 5;
                  return <TriangleUp cx={cx} cy={cy - 12} size={size} />;
                }}
              />
            ))}
            {distributionSpikes.map((spike) => (
              <ReferenceDot
                key={`dist-${spike.date}`}
                yAxisId="price"
                x={spike.date}
                y={spike.close}
                r={0}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => {
                  const cx = props.cx ?? 0;
                  const cy = props.cy ?? 0;
                  const size =
                    spike.confidence === "high"
                      ? 7
                      : spike.confidence === "moderate"
                        ? 6
                        : 5;
                  return <TriangleDown cx={cx} cy={cy + 12} size={size} />;
                }}
              />
            ))}
            {newsSpikes.map((spike) => (
              <ReferenceDot
                key={`news-${spike.date}`}
                yAxisId="price"
                x={spike.date}
                y={spike.close}
                r={3.5}
                fill={WARN}
                stroke="#000"
                strokeWidth={1.25}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`tnum ${muted ? "text-muted-foreground" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Legend() {
  const items: { label: string; render: React.ReactNode }[] = [
    {
      label: "Accumulation",
      render: (
        <svg width="10" height="10" viewBox="0 0 12 12">
          <polygon points="6,1 1,10 11,10" fill={UP} stroke="#000" strokeWidth="1" />
        </svg>
      ),
    },
    {
      label: "Distribution",
      render: (
        <svg width="10" height="10" viewBox="0 0 12 12">
          <polygon points="6,11 1,2 11,2" fill={DOWN} stroke="#000" strokeWidth="1" />
        </svg>
      ),
    },
    {
      label: "News",
      render: (
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: WARN }}
        />
      ),
    },
  ];
  return (
    <div className="hidden md:flex items-center gap-4 text-[12px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          {it.render}
          {it.label}
        </span>
      ))}
    </div>
  );
}
