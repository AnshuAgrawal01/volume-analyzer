"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResult, VolumeSpike } from "@/lib/types";

interface ClassificationChartProps {
  result: AnalysisResult;
}

const COLORS: Record<string, string> = {
  institutional_accumulation: "#30d158",
  institutional_distribution: "#ff453a",
  news_driven_up: "#ffd60a",
  news_driven_down: "#ff9f0a",
  ambiguous: "#48484a",
};

const LABELS: Record<string, string> = {
  institutional_accumulation: "Accumulation",
  institutional_distribution: "Distribution",
  news_driven_up: "News up",
  news_driven_down: "News down",
  ambiguous: "Ambiguous",
};

export function ClassificationChart({ result }: ClassificationChartProps) {
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const spike of result.spikes) {
      counts[spike.classification] = (counts[spike.classification] || 0) + 1;
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: LABELS[key] || key,
      value,
      fill: COLORS[key as VolumeSpike["classification"]] || "#48484a",
    }));
  }, [result.spikes]);

  const total = pieData.reduce((s, p) => s + p.value, 0);

  const timelineData = useMemo(() => {
    const quarters: Record<string, Record<string, number>> = {};

    for (const spike of result.spikes) {
      const date = new Date(spike.date);
      const q = `${String(date.getFullYear()).slice(2)} Q${Math.floor(date.getMonth() / 3) + 1}`;

      if (!quarters[q]) {
        quarters[q] = {
          accumulation: 0,
          distribution: 0,
          news_up: 0,
          news_down: 0,
          ambiguous: 0,
        };
      }

      if (spike.classification === "institutional_accumulation")
        quarters[q].accumulation++;
      else if (spike.classification === "institutional_distribution")
        quarters[q].distribution++;
      else if (spike.classification === "news_driven_up")
        quarters[q].news_up++;
      else if (spike.classification === "news_driven_down")
        quarters[q].news_down++;
      else quarters[q].ambiguous++;
    }

    return Object.entries(quarters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([quarter, data]) => ({
        quarter,
        ...data,
      }));
  }, [result.spikes]);

  return (
    <section className="surface p-7">
      <Tabs defaultValue="pie">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">
              Classification breakdown
            </h3>
            <p className="text-[12.5px] text-muted-foreground mt-1">
              How {total} volume spikes resolved
            </p>
          </div>
          <TabsList className="bg-secondary border-0 rounded-[8px] h-8 p-0.5">
            <TabsTrigger
              value="pie"
              className="text-[12px] px-3 h-7 rounded-[6px] data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
            >
              Distribution
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="text-[12px] px-3 h-7 rounded-[6px] data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
            >
              Timeline
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pie">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={108}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#000"
                    paddingAngle={1}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#161618",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 12.5,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {pieData.map((entry) => {
                const pct = total > 0 ? (entry.value / total) * 100 : 0;
                return (
                  <div key={entry.name} className="flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-[13px] text-foreground/90 flex-1">
                      {entry.name}
                    </span>
                    <span className="text-[13px] tnum text-muted-foreground">
                      {entry.value}
                    </span>
                    <span className="text-[12px] tnum text-muted-foreground/70 w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timelineData}
                margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
              >
                <XAxis
                  dataKey="quarter"
                  stroke="transparent"
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="transparent"
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    background: "#161618",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 12.5,
                  }}
                />
                <Bar
                  dataKey="accumulation"
                  stackId="a"
                  fill={COLORS.institutional_accumulation}
                  name="Accumulation"
                />
                <Bar
                  dataKey="distribution"
                  stackId="a"
                  fill={COLORS.institutional_distribution}
                  name="Distribution"
                />
                <Bar
                  dataKey="news_up"
                  stackId="a"
                  fill={COLORS.news_driven_up}
                  name="News up"
                />
                <Bar
                  dataKey="news_down"
                  stackId="a"
                  fill={COLORS.news_driven_down}
                  name="News down"
                />
                <Bar
                  dataKey="ambiguous"
                  stackId="a"
                  fill={COLORS.ambiguous}
                  name="Ambiguous"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

