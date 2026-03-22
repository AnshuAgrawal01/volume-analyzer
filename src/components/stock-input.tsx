"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";

interface StockInputProps {
  onAnalyze: (params: {
    symbol: string;
    exchange: "NSE" | "BSE";
    years: number;
    volumeThreshold: number;
    priceThreshold: number;
  }) => void;
  loading: boolean;
}

export function StockInput({ onAnalyze, loading }: StockInputProps) {
  const [symbol, setSymbol] = useState("");
  const [exchange, setExchange] = useState<"NSE" | "BSE">("NSE");
  const [years, setYears] = useState(5);
  const [volumeThreshold, setVolumeThreshold] = useState(3);
  const [priceThreshold, setPriceThreshold] = useState(1.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    onAnalyze({ symbol: symbol.trim(), exchange, years, volumeThreshold, priceThreshold });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1.5 block">
              Stock Symbol
            </label>
            <Input
              placeholder="e.g., RELIANCE, TCS, INFY"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="text-lg font-mono"
            />
          </div>

          <div className="w-[100px]">
            <label className="text-sm font-medium mb-1.5 block">
              Exchange
            </label>
            <Select
              value={exchange}
              onValueChange={(v) => setExchange(v as "NSE" | "BSE")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NSE">NSE</SelectItem>
                <SelectItem value="BSE">BSE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[100px]">
            <label className="text-sm font-medium mb-1.5 block">
              Years
            </label>
            <Select
              value={String(years)}
              onValueChange={(v) => setYears(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[140px]">
            <label className="text-sm font-medium mb-1.5 block">
              Vol Threshold
            </label>
            <Select
              value={String(volumeThreshold)}
              onValueChange={(v) => setVolumeThreshold(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2x avg</SelectItem>
                <SelectItem value="3">3x avg</SelectItem>
                <SelectItem value="4">4x avg</SelectItem>
                <SelectItem value="5">5x avg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[160px]">
            <label className="text-sm font-medium mb-1.5 block">
              Price Sensitivity
            </label>
            <Select
              value={String(priceThreshold)}
              onValueChange={(v) => setPriceThreshold(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">High (0.5x ATR)</SelectItem>
                <SelectItem value="1">Normal (1x ATR)</SelectItem>
                <SelectItem value="1.5">Low (1.5x ATR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading || !symbol.trim()} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Backtest
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
