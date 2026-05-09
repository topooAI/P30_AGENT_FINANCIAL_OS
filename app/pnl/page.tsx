"use client";

import { ToWebsiteShell } from "../_components/towebsite-shell";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PieChart, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

const Liveline = dynamic(() => import("liveline").then((mod) => mod.Liveline), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-50 animate-pulse" />
});

const generatePnLData = () => {
  const now = Math.floor(Date.now() / 1000);
  let val = 1000;
  return Array.from({ length: 100 }, (_, i) => {
    val += (Math.random() - 0.45) * 5; // Slight upward bias
    return { time: now - (100 - i) * 10, value: val };
  });
};

export default function PnlPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [data, setData] = useState(generatePnLData());
  const [netWorth, setNetWorth] = useState(1042.85);

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 100);
  }, []);

  return (
    <ToWebsiteShell 
      title="PnL Analytics" 
      subtitle="Pure Reason / Capital Efficiency Audit"
      constrainMain={true}
    >
      <div className="flex flex-col gap-16 py-8">
        
        {/* Main Stats - Minimalist Nansen Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-1">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Total Net Value</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold tracking-tighter text-zinc-900">${netWorth.toLocaleString()}</span>
              <span className="text-[10px] font-mono font-bold text-green-500">+4.2%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Logic Alpha</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold tracking-tighter text-blue-600">+$124.50</span>
              <span className="text-[10px] font-mono font-bold text-zinc-400">FILTERED 12 PITFALLS</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Max Drawdown</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold tracking-tighter text-zinc-900">1.85%</span>
              <ShieldCheck className="size-4 text-green-500" />
            </div>
          </div>
        </div>

        {/* Equity Curve - The LiveLine */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-mono font-bold text-zinc-900 uppercase tracking-[0.2em]">Equity Curve</h3>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">100 Cycles / Real-time</span>
          </div>
          <div style={{ height: 300, width: '100%' }} className="relative">
            {hasMounted ? (
              <Liveline 
                data={data} 
                value={netWorth}
                theme="light"
                lineColor="#3b82f6"
                fillColor="rgba(59,130,246,0.03)"
                strokeWidth={1.5}
                showControls={false}
                showXAxis={true}
                showYAxis={true}
                showGrid={false}
                momentum={true}
                style={{ width: '100%', height: '100%' }}
              />
            ) : null}
          </div>
        </div>

        {/* Position Matrix - Flat & Clean */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-mono font-bold text-zinc-900 uppercase tracking-[0.2em] px-1">Active Positions</h3>
          <div className="grid gap-px bg-zinc-100 overflow-hidden">
            {[
              { asset: "Dems Win PA", size: "$450.00", pnl: "+$42.10", logic: "RN1 + News Confirmed", status: "Open" },
              { asset: "GOP Win GA", size: "$120.00", pnl: "-$5.20", logic: "Logical Hedge", status: "Hedging" },
            ].map((pos, i) => (
              <div key={i} className="bg-white p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">{pos.asset}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter ${
                      pos.status === "Open" ? "bg-blue-50 text-blue-600" : "bg-zinc-50 text-zinc-500"
                    }`}>{pos.status}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">Strategy: {pos.logic}</p>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">Size</div>
                    <div className="text-sm font-mono font-bold text-zinc-900">{pos.size}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">PnL</div>
                    <div className={`text-sm font-mono font-bold ${pos.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {pos.pnl}
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-zinc-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ToWebsiteShell>
  );
}
