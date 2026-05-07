"use client";

import { useEffect, useRef, useState } from "react";

const widgetMap: Record<string, string> = {
  SPY: "AMEX:SPY",
  QQQ: "NASDAQ:QQQ",
  VIX: "TVC:VIX",
  GLD: "AMEX:GLD",
  USO: "AMEX:USO",
  "BTC-USD": "COINBASE:BTCUSD",
  UUP: "AMEX:UUP",
  // TLT is commonly available as NASDAQ:TLT in TradingView embeds.
  TLT: "NASDAQ:TLT",
  DIA: "AMEX:DIA",
  IWM: "AMEX:IWM",
  IEF: "NASDAQ:IEF",
  SHY: "NASDAQ:SHY",
  HYG: "AMEX:HYG",
  LQD: "AMEX:LQD",
  KRE: "AMEX:KRE",
  XLF: "AMEX:XLF",
  AAPL: "NASDAQ:AAPL",
  MSFT: "NASDAQ:MSFT",
  NVDA: "NASDAQ:NVDA",
  AMZN: "NASDAQ:AMZN",
  META: "NASDAQ:META",
  GOOGL: "NASDAQ:GOOGL",
  TSLA: "NASDAQ:TSLA",
  SMH: "NASDAQ:SMH",
  SOXX: "NASDAQ:SOXX",
  SLV: "AMEX:SLV",
  CPER: "AMEX:CPER",
  "ETH-USD": "COINBASE:ETHUSD",
};

export function TradingViewWidget({ symbol = "SPY" }: { symbol?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const tvSymbol = widgetMap[symbol] ?? "AMEX:SPY";

  useEffect(() => {
    if (!ref.current) return;
    setFailed(false);
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: tvSymbol,
      width: "100%",
      height: 220,
      locale: "en",
      dateRange: "3M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    });
    script.onerror = () => setFailed(true);
    ref.current.appendChild(script);
  }, [tvSymbol]);

  if (failed) {
    return <div className="flex h-56 items-center justify-center rounded border border-line bg-ink text-sm text-slate-400">TradingView unavailable</div>;
  }

  return <div className="tradingview-widget-container min-h-56 rounded border border-line bg-ink p-2" ref={ref} />;
}
