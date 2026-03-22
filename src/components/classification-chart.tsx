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
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResult, VolumeSpike } from "@/lib/types";

interface ClassificationChartProps {
  result: AnalysisResult;
}

const COLORS = {
  institutional_accumulation: "hsl(145, 70%, 40%)",
  institutional_distribution: "hsl(0, 70%, 50%)",
  news_driven_up: "hsl(45, 90%, 50%)",
  news_driven_down: "hsl(25, 90%, 50%)",
  ambiguous: "hsl(215, 15%, 65%)",
};

const LABELS: Record<string, string> = {
  institutional_accumulation: "Accumulation",
  institutional_distribution: "Distribution",
  news_driven_up: "News (Bullish)",
  news_driven_down: "News (Bearish)",
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
      fill: COLORS[key as VolumeSpike["classification"]] || "#888",
    }));
  }, [result.spikes]);

  const timelineData = useMemo(() => {
    // Group spikes by quarter
    const quarters: Record<string, Record<string, number>> = {};

    for (const spike of result.spikes) {
      const date = new Date(spike.date);
      const q = `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;

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
    <Card>
      <CardHeader>
        <CardTitle>Event Classification Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie">
          <TabsList>
            <TabsTrigger value="pie">Distribution</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="pie">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
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
                    name="News ↑"
                  />
                  <Bar
                    dataKey="news_down"
                    stackId="a"
                    fill={COLORS.news_driven_down}
                    name="News ↓"
                  />
                  <Bar
                    dataKey="ambiguous"
                    stackId="a"
                    fill={COLORS.ambiguous}
                    name="Ambiguous"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
