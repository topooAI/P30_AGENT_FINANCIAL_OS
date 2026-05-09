"use client";

import { ToWebsiteShell, DataList, SideCard } from "../_components/towebsite-shell";
import { useState } from "react";
import { Zap, ShieldCheck, TrendingUp, ChevronRight } from "lucide-react";

export default function LogicArbPage() {
  const [arbs] = useState([
    {
      id: "1",
      marketA: "Dems Win PA (Yes)",
      marketB: "Trump Wins PA (No)",
      spread: "1.24%",
      risk: "Low",
      status: "Opportunity Detected",
    },
    {
      id: "2",
      marketA: "CPI > 3.1% (Yes)",
      marketB: "Inflation Falls (No)",
      spread: "0.85%",
      risk: "Medium",
      status: "Monitoring",
    }
  ]);

  return (
    <ToWebsiteShell 
      title="Logic Arbitrage" 
      subtitle="Exploiting mathematical mispricing between correlated prediction markets."
      aside={
        <div className="space-y-4">
          <SideCard title="NegRisk Engine">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Global Skew</span>
                <span className="font-bold text-green-600">-0.42%</span>
              </div>
              <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[65%]" />
              </div>
            </div>
          </SideCard>
          <DataList 
            title="Arb Stats" 
            rows={[
              { name: "Active Pairs", value: "8" },
              { name: "Daily Yield", value: "$42.10" },
              { name: "Sharpe Ratio", value: "4.2" },
            ]} 
          />
        </div>
      }
    >
      <div className="grid gap-6">
        {arbs.map((arb) => (
          <div key={arb.id} className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Zap className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Correlation Pair #{arb.id}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                arb.risk === "Low" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              }`}>
                {arb.risk} Risk
              </span>
            </div>
            
            <div className="flex items-center gap-8 mb-4">
              <div className="flex-1 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Leg A</div>
                <div className="text-sm font-medium text-zinc-800">{arb.marketA}</div>
              </div>
              <div className="text-zinc-300">
                <ChevronRight className="size-5" />
              </div>
              <div className="flex-1 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Leg B</div>
                <div className="text-sm font-medium text-zinc-800">{arb.marketB}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Net Spread</span>
                  <span className="text-lg font-bold text-green-600">{arb.spread}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Status</span>
                  <span className="text-xs font-medium text-zinc-600">{arb.status}</span>
                </div>
              </div>
              <button className="h-9 px-4 rounded-lg bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors">
                Execute Arb
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToWebsiteShell>
  );
}
