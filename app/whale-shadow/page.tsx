"use client";

import { ToWebsiteShell, DataList, SideCard } from "../_components/towebsite-shell";
import { useState, useEffect } from "react";
import { Eye, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

interface WhaleAction {
  id: string;
  whale: string;
  market: string;
  action: "BUY" | "SELL";
  amount: string;
  price: string;
  timestamp: string;
  logicStatus: "Analyzing" | "Verified" | "Diverged";
}

export default function WhaleShadowPage() {
  const [actions, setActions] = useState<WhaleAction[]>([
    {
      id: "1",
      whale: "RN1",
      market: "Which party wins White House?",
      action: "BUY",
      amount: "$12,450",
      price: "$0.52",
      timestamp: "2 mins ago",
      logicStatus: "Verified",
    },
    {
      id: "2",
      whale: "swisstony",
      market: "Pennsylvania Election Result",
      action: "SELL",
      amount: "$4,200",
      price: "$0.48",
      timestamp: "5 mins ago",
      logicStatus: "Analyzing",
    }
  ]);

  return (
    <ToWebsiteShell 
      title="Whale Shadow" 
      subtitle="Real-time reverse engineering of high-win-rate trader actions."
      aside={
        <div className="space-y-4">
          <DataList 
            title="Monitoring Herd" 
            rows={[
              { name: "Total Whales", value: "12" },
              { name: "Active Signals", value: "3" },
              { name: "Avg Win Rate", value: "68.4%" },
            ]} 
          />
          <SideCard title="Shadow Alert">
            <div className="flex items-start gap-2 text-yellow-600 bg-yellow-50 p-2 rounded-md text-xs">
              <AlertTriangle className="size-4 shrink-0" />
              <span>RN1 is building a massive position in niche 'PA-House' market. Logic check triggered.</span>
            </div>
          </SideCard>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
              <Eye className="size-4 text-blue-500" />
              Live Shadow Stream
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-600 uppercase">Live Engine Active</span>
            </div>
          </div>
          
          <div className="divide-y divide-zinc-50">
            {actions.map((action) => (
              <div key={action.id} className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center size-8 rounded-full bg-black text-[10px] text-white font-bold">
                      {action.whale.charAt(0)}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{action.whale}</div>
                      <div className="text-[11px] text-zinc-500">{action.timestamp}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    action.logicStatus === "Verified" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {action.logicStatus}
                  </div>
                </div>
                
                <div className="pl-11">
                  <div className="text-sm text-zinc-700 font-medium">{action.market}</div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Action</span>
                      <span className={`text-xs font-bold ${action.action === "BUY" ? "text-green-600" : "text-red-600"}`}>
                        {action.action} {action.amount}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Price</span>
                      <span className="text-xs font-bold text-zinc-900">{action.price}</span>
                    </div>
                    <button className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-bold text-blue-600">
                      View Logic <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToWebsiteShell>
  );
}
