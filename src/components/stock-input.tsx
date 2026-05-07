"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  isIndian: boolean;
}

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

interface Option {
  value: string;
  label: string;
}

export function StockInput({ onAnalyze, loading }: StockInputProps) {
  const [symbol, setSymbol] = useState("");
  const [exchange, setExchange] = useState<"NSE" | "BSE">("NSE");
  const [years, setYears] = useState(5);
  const [volumeThreshold, setVolumeThreshold] = useState(3);
  const [priceThreshold, setPriceThreshold] = useState(1.0);

  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: SearchResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      setHighlightedIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    const upper = value.toUpperCase();
    setSymbol(upper);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(upper), 250);
  };

  const selectSuggestion = (result: SearchResult) => {
    const dotIndex = result.symbol.indexOf(".");
    const baseSymbol =
      dotIndex > 0 ? result.symbol.substring(0, dotIndex) : result.symbol;
    setSymbol(baseSymbol);

    if (result.symbol.endsWith(".NS")) setExchange("NSE");
    else if (result.symbol.endsWith(".BO")) setExchange("BSE");

    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setShowSuggestions(false);
    onAnalyze({
      symbol: symbol.trim(),
      exchange,
      years,
      volumeThreshold,
      priceThreshold,
    });
  };

  const exchangeOpts: Option[] = [
    { value: "NSE", label: "NSE" },
    { value: "BSE", label: "BSE" },
  ];
  const yearOpts: Option[] = [
    { value: "1", label: "1 year" },
    { value: "2", label: "2 years" },
    { value: "3", label: "3 years" },
    { value: "5", label: "5 years" },
    { value: "10", label: "10 years" },
  ];
  const volumeOpts: Option[] = [
    { value: "2", label: "2× average" },
    { value: "3", label: "3× average" },
    { value: "4", label: "4× average" },
    { value: "5", label: "5× average" },
  ];
  const sensitivityOpts: Option[] = [
    { value: "0.5", label: "High" },
    { value: "1", label: "Normal" },
    { value: "1.5", label: "Low" },
  ];

  return (
    <form onSubmit={handleSubmit} className="surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Symbol input */}
        <div className="flex-1 min-w-[260px] relative" ref={containerRef}>
          <Caption>Symbol</Caption>
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              strokeWidth={2}
            />
            <input
              placeholder="Search a company or ticker"
              value={symbol}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() =>
                suggestions.length > 0 && setShowSuggestions(true)
              }
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full h-10 pl-9 pr-3 bg-secondary border border-transparent rounded-[10px] text-[14px] tracking-tight text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/25 transition-base"
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[60] top-full left-0 right-0 mt-2 bg-popover border border-border rounded-[12px] shadow-2xl shadow-black/60 overflow-hidden">
              {suggestions.map((result, index) => (
                <button
                  key={result.symbol}
                  type="button"
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-base ${
                    index === highlightedIndex
                      ? "bg-white/[0.06]"
                      : "hover:bg-white/[0.03]"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(result);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[13px] text-foreground shrink-0 tnum">
                      {result.symbol.split(".")[0]}
                    </span>
                    <span className="text-[13px] text-muted-foreground truncate">
                      {result.name}
                    </span>
                  </div>
                  {result.isIndian && (
                    <span className="text-[11px] text-muted-foreground/70 shrink-0 ml-2">
                      {result.symbol.endsWith(".NS") ? "NSE" : "BSE"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selects */}
        <SelectField
          label="Exchange"
          value={exchange}
          onChange={(v) => setExchange(v as "NSE" | "BSE")}
          options={exchangeOpts}
          width="w-[88px]"
        />
        <SelectField
          label="Lookback"
          value={String(years)}
          onChange={(v) => setYears(Number(v))}
          options={yearOpts}
          width="w-[112px]"
        />
        <SelectField
          label="Volume threshold"
          value={String(volumeThreshold)}
          onChange={(v) => setVolumeThreshold(Number(v))}
          options={volumeOpts}
          width="w-[124px]"
        />
        <SelectField
          label="Sensitivity"
          value={String(priceThreshold)}
          onChange={(v) => setPriceThreshold(Number(v))}
          options={sensitivityOpts}
          width="w-[110px]"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !symbol.trim()}
          className="h-10 px-5 rounded-[10px] font-medium text-[13.5px] bg-foreground text-background hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-base flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing</span>
            </>
          ) : (
            <span>Analyze</span>
          )}
        </button>
      </div>
    </form>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 tracking-tight">
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  width,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  width: string;
}) {
  const activeLabel =
    options.find((o) => o.value === value)?.label ?? value;
  return (
    <div className={width}>
      <Caption>{label}</Caption>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger
          aria-label={label}
          className="h-10 w-full bg-secondary border-transparent text-[13.5px] rounded-[10px] hover:border-foreground/15 focus-visible:border-foreground/25 transition-base"
        >
          <SelectValue>{() => activeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-[10px]">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-[13.5px]"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
