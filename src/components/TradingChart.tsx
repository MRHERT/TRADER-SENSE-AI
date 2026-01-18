import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CandlestickData,
  Time,
} from "lightweight-charts";

interface TradingChartProps {
  ticker: string;
  data: CandlestickData<Time>[];
  onPriceUpdate?: (price: number) => void;
}

type Timeframe = "1m" | "15m" | "1h" | "4h" | "1D";

type RsiPoint = {
  time: Time;
  value: number;
};

type MacdPoint = {
  time: Time;
  macd: number;
  signal: number;
  histogram: number;
};

function sliceByTimeframe(source: CandlestickData<Time>[], timeframe: Timeframe) {
  if (source.length === 0) return source;
  const maxBars =
    timeframe === "1m"
      ? 80
      : timeframe === "15m"
      ? 120
      : timeframe === "1h"
      ? 160
      : timeframe === "4h"
      ? 200
      : 240;
  if (source.length <= maxBars) return source;
  return source.slice(source.length - maxBars);
}

function calculateRsi(source: CandlestickData<Time>[], period = 14): RsiPoint[] {
  if (source.length <= period) return [];
  let gains = 0;
  let losses = 0;
  const result: RsiPoint[] = [];
  for (let i = 1; i < source.length; i++) {
    const change = source[i].close - source[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    if (i <= period) {
      gains += gain;
      losses += loss;
      if (i === period) {
        const rs = losses === 0 ? 100 : gains / losses;
        const rsi = losses === 0 ? 100 : 100 - 100 / (1 + rs);
        result.push({ time: source[i].time, value: rsi });
      }
    } else {
      gains = (gains * (period - 1) + gain) / period;
      losses = (losses * (period - 1) + loss) / period;
      const rs = losses === 0 ? 100 : gains / losses;
      const rsi = losses === 0 ? 100 : 100 - 100 / (1 + rs);
      result.push({ time: source[i].time, value: rsi });
    }
  }
  return result;
}

function calculateEma(values: number[], period: number) {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  let prev = sum / period;
  ema.push(prev);
  for (let i = period; i < values.length; i++) {
    const current = values[i] * k + prev * (1 - k);
    ema.push(current);
    prev = current;
  }
  return ema;
}

function calculateMacd(source: CandlestickData<Time>[], fast = 12, slow = 26, signalPeriod = 9): MacdPoint[] {
  if (source.length < slow + signalPeriod) return [];
  const closes = source.map((c) => c.close);
  const slowEma = calculateEma(closes, slow);
  const fastEma = calculateEma(closes, fast);
  const macdValues: number[] = [];
  const offset = slow - fast;
  for (let i = 0; i < slowEma.length; i++) {
    const fastIndex = i + offset;
    if (fastIndex >= 0 && fastIndex < fastEma.length) {
      macdValues.push(fastEma[fastIndex] - slowEma[i]);
    }
  }
  const signalValues = calculateEma(macdValues, signalPeriod);
  const result: MacdPoint[] = [];
  const macdOffset = slow + signalPeriod - 1;
  for (let i = signalPeriod - 1; i < signalValues.length; i++) {
    const macdIndex = i;
    const priceIndex = macdIndex + macdOffset;
    if (priceIndex < source.length && macdIndex < macdValues.length) {
      const macd = macdValues[macdIndex];
      const signal = signalValues[i];
      const histogram = macd - signal;
      result.push({
        time: source[priceIndex].time,
        macd,
        signal,
        histogram,
      });
    }
  }
  return result;
}

export function TradingChart({ ticker, data, onPriceUpdate }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const macdLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistogramSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");

  const visibleData = useMemo(() => sliceByTimeframe(data, timeframe), [data, timeframe]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(215 20% 55%)",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "hsl(217 33% 18% / 0.5)" },
        horzLines: { color: "hsl(217 33% 18% / 0.5)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "hsl(142 76% 45% / 0.5)",
          width: 1,
          style: 2,
          labelBackgroundColor: "hsl(142 76% 45%)",
        },
        horzLine: {
          color: "hsl(142 76% 45% / 0.5)",
          width: 1,
          style: 2,
          labelBackgroundColor: "hsl(142 76% 45%)",
        },
      },
      rightPriceScale: {
        borderColor: "hsl(217 33% 18%)",
        scaleMargins: {
          top: 0.15,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: "hsl(217 33% 18%)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
    });
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "hsl(142 76% 45%)",
      downColor: "hsl(0 84% 60%)",
      borderUpColor: "hsl(142 76% 45%)",
      borderDownColor: "hsl(0 84% 60%)",
      wickUpColor: "hsl(142 76% 45%)",
      wickDownColor: "hsl(0 84% 60%)",
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: {
        type: "volume",
      },
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
    });

    let macdChart: IChartApi | null = null;
    let rsiChart: IChartApi | null = null;

    if (macdContainerRef.current) {
      macdChart = createChart(macdContainerRef.current, {
        layout: {
          background: { color: "transparent" },
          textColor: "hsl(215 20% 55%)",
          fontFamily: "Inter, sans-serif",
        },
        grid: {
          vertLines: { color: "hsl(217 33% 18% / 0.5)" },
          horzLines: { color: "hsl(217 33% 18% / 0.5)" },
        },
        timeScale: {
          borderColor: "hsl(217 33% 18%)",
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: "hsl(217 33% 18%)",
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
      });
      const macdLine = macdChart.addSeries(LineSeries, {
        color: "hsl(217 91% 60%)",
        lineWidth: 1.5,
      });
      const macdSignal = macdChart.addSeries(LineSeries, {
        color: "hsl(142 76% 45%)",
        lineWidth: 1.5,
      });
      const macdHistogram = macdChart.addSeries(HistogramSeries, {
        priceScaleId: "macd",
      });
      macdChartRef.current = macdChart;
      macdLineSeriesRef.current = macdLine;
      macdSignalSeriesRef.current = macdSignal;
      macdHistogramSeriesRef.current = macdHistogram;
    }

    if (rsiContainerRef.current) {
      rsiChart = createChart(rsiContainerRef.current, {
        layout: {
          background: { color: "transparent" },
          textColor: "hsl(215 20% 55%)",
          fontFamily: "Inter, sans-serif",
        },
        grid: {
          vertLines: { color: "hsl(217 33% 18% / 0.5)" },
          horzLines: { color: "hsl(217 33% 18% / 0.5)" },
        },
        timeScale: {
          borderColor: "hsl(217 33% 18%)",
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: "hsl(217 33% 18%)",
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
      });
      const rsiSeries = rsiChart.addSeries(LineSeries, {
        color: "hsl(39 84% 56%)",
        lineWidth: 1.5,
      });
      rsiChartRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;
    }

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
      if (macdContainerRef.current && macdChartRef.current) {
        macdChartRef.current.applyOptions({
          width: macdContainerRef.current.clientWidth,
          height: macdContainerRef.current.clientHeight,
        });
      }
      if (rsiContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({
          width: rsiContainerRef.current.clientWidth,
          height: rsiContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      if (macdChart) {
        macdChart.remove();
      }
      if (rsiChart) {
        rsiChart.remove();
      }
    };
  }, [ticker]);

  useEffect(() => {
    if (visibleData.length === 0) return;
    if (seriesRef.current) {
      seriesRef.current.setData(visibleData);
    }
    if (volumeSeriesRef.current) {
      const volumeData = visibleData.map((bar) => {
        const isUp = bar.close >= bar.open;
        return {
          time: bar.time,
          value: Math.abs(bar.close - bar.open),
          color: isUp ? "rgba(34,197,94,0.6)" : "rgba(248,113,113,0.6)",
        };
      });
      volumeSeriesRef.current.setData(volumeData);
    }
    const macdData = calculateMacd(visibleData);
    if (
      macdData.length > 0 &&
      macdLineSeriesRef.current &&
      macdSignalSeriesRef.current &&
      macdHistogramSeriesRef.current
    ) {
      macdLineSeriesRef.current.setData(
        macdData.map((p) => ({
          time: p.time,
          value: p.macd,
        }))
      );
      macdSignalSeriesRef.current.setData(
        macdData.map((p) => ({
          time: p.time,
          value: p.signal,
        }))
      );
      macdHistogramSeriesRef.current.setData(
        macdData.map((p) => ({
          time: p.time,
          value: p.histogram,
          color: p.histogram >= 0 ? "rgba(56,189,248,0.7)" : "rgba(248,113,113,0.7)",
        }))
      );
    }
    const rsiData = calculateRsi(visibleData);
    if (rsiData.length > 0 && rsiSeriesRef.current) {
      rsiSeriesRef.current.setData(rsiData);
    }
    chartRef.current?.timeScale().fitContent();
    macdChartRef.current?.timeScale().fitContent();
    rsiChartRef.current?.timeScale().fitContent();
    const lastCandle = visibleData[visibleData.length - 1];
    if (onPriceUpdate) {
      onPriceUpdate(lastCandle.close);
    }
  }, [visibleData, onPriceUpdate]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
            $
          </span>
          <div className="flex flex-col">
            <span className="text-slate-50 font-semibold">{ticker}</span>
            <span className="text-slate-500 text-[11px]">Synthetic chart for paper trading</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-md bg-slate-900/80 p-0.5">
          {(["1m", "15m", "1h", "4h", "1D"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={
                timeframe === tf
                  ? "px-2 py-1 rounded-md text-[11px] bg-emerald-500 text-slate-950 font-semibold"
                  : "px-2 py-1 rounded-md text-[11px] text-slate-400 hover:bg-slate-800"
              }
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 p-3">
        <div ref={chartContainerRef} className="flex-1 rounded-md" />
        <div className="grid grid-rows-2 gap-2">
          <div ref={macdContainerRef} className="h-24 rounded-md" />
          <div ref={rsiContainerRef} className="h-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
