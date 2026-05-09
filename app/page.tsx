"use client";

import { ToWebsiteShell } from "./_components/towebsite-shell";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Liveline = dynamic(() => import("liveline").then((mod) => mod.Liveline), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-50 animate-pulse" />
});

import { Activity, Terminal as TerminalIcon, Globe } from "lucide-react";

// The real Liveline component expects data in { time, value } format
const generateInitialData = () => {
  const now = Math.floor(Date.now() / 1000); // Use 10-digit seconds
  return Array.from({ length: 50 }, (_, i) => ({
    time: now - (50 - i),
    value: 55 
  }));
};

export default function DashboardPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [data, setData] = useState(generateInitialData());
  const [currentValue, setCurrentValue] = useState(61.91);

  useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), 100);
    
    // Use a more realistic "Brownian motion" walk instead of pure random
    const interval = setInterval(() => {
      setCurrentValue(prev => {
        const change = (Math.random() - 0.5) * 0.5; // Small random walk
        const next = prev + change;
        setData(d => [...d.slice(1), { time: Math.floor(Date.now() / 1000), value: next }]);
        return next;
      });
    }, 2000); // Slower update for smoother feel
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <ToWebsiteShell 
      title="Pure Reason Terminal" 
      subtitle="Critique of logical arbitrage v1.0.2"
      constrainMain={true} 
    >
      <div className="flex flex-col gap-12 bg-white min-h-screen pt-4">
        
        {/* Header - Pure Flat Minimalist */}
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">US Election</h2>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">
              <span>Polymarket</span>
              <span className="size-1 rounded-full bg-zinc-200" />
              <span>Dems Win</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-mono font-bold text-zinc-900 tracking-tighter leading-none mb-1">
              {currentValue.toFixed(4)}
            </div>
            <div className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">
              +4.28% Market Alpha
            </div>
          </div>
        </div>

        {/* THE REAL LIVELINE - NO BORDERS, NO SHADOWS */}
        <div style={{ height: 260, width: '100%' }} className="relative">
          {hasMounted ? (
            <Liveline 
              data={data} 
              value={currentValue}
              theme="light"
              lineColor="#3b82f6"
              fillColor="rgba(59,130,246,0.04)"
              strokeWidth={1.5}
              showControls={true}
              showValueOverlay={true}
              showCurrentValue={true}
              showXAxis={true}
              showYAxis={true}
              showGrid={true}
              showTooltip={true}
              interactive={true}
              momentum={true}
              momentumArrows={true}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] font-mono text-zinc-300">
              Initializing Canvas...
            </div>
          )}
        </div>

        {/* Bottom Grid - Pure Flat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 px-1">
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Intelligence</h3>
            <div className="space-y-6">
              {[
                { t: "RN1 buying PA. Logic alignment 92%.", m: "1m" },
                { t: "Poll anomaly detected. Alpha high.", m: "5m" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2 border-l border-zinc-100 pl-4">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest">{item.m} ago</span>
                  <p className="text-[14px] text-zinc-800 font-medium leading-relaxed tracking-tight">{item.t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-zinc-900 uppercase tracking-[0.2em]">Kernel Output</h3>
            <div className="bg-zinc-50 p-8 rounded-sm font-mono text-[11px] text-zinc-500 space-y-3 leading-relaxed">
              <div className="flex gap-3">
                <span className="text-blue-500">→</span>
                <span>Subscribed: 0x4bFb...6075</span>
              </div>
              <div className="flex gap-3">
                <span className="text-zinc-300">#</span>
                <span>Whale.Shadow: Monitoring 12 targets</span>
              </div>
              <div className="flex gap-3 text-blue-500 animate-pulse">
                <span className="text-blue-200">#</span>
                <span>Awaiting new events...</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ToWebsiteShell>
  );
}
