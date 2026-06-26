"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import type { TokenBar } from "@/types/token";

interface TradingChartProps {
  bars: TokenBar[];
  height?: number;
}

export function TradingChart({ bars, height = 320 }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8B9CB3",
      },
      grid: {
        vertLines: { color: "#243044" },
        horzLines: { color: "#243044" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#243044" },
      timeScale: { borderColor: "#243044", timeVisible: true },
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#39FF14",
      downColor: "#FF4757",
      borderUpColor: "#39FF14",
      borderDownColor: "#FF4757",
      wickUpColor: "#39FF14",
      wickDownColor: "#FF4757",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    seriesRef.current = series;
    volumeRef.current = volumeSeries;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current || bars.length === 0) return;
    const candleData = bars.map((b) => ({
      time: b.time as unknown as import("lightweight-charts").UTCTimestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    seriesRef.current.setData(candleData);

    if (volumeRef.current) {
      volumeRef.current.setData(
        bars.map((b) => ({
          time: b.time as unknown as import("lightweight-charts").UTCTimestamp,
          value: b.volume,
          color:
            b.close >= b.open
              ? "rgba(57, 255, 20, 0.35)"
              : "rgba(255, 71, 87, 0.35)",
        })),
      );
    }

    chartRef.current?.timeScale().fitContent();
  }, [bars]);

  return (
    <div className="rounded-xl border border-chad-border bg-chad-surface p-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-chad-muted">
          TradingView Lightweight Charts · Codex OHLCV
        </span>
        <a
          href="https://www.tradingview.com/lightweight-charts/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-chad-accent hover:underline"
        >
          Powered by TradingView
        </a>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
