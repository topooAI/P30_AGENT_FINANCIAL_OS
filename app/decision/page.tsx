"use client";

import { ToWebsiteShell } from "../_components/towebsite-shell";
import { useState } from "react";

export default function DecisionChainPage() {
  const [steps] = useState([
    { id: "1", name: "INGESTION", details: "RN1 bought PA @ 0.52", out: "POLY.RPC", status: "ok" },
    { id: "2", name: "REASONING", details: "1000 agents simulate outcome. 88% Match.", out: "MIRO.SIM", status: "ok" },
    { id: "3", name: "CALIBRATION", details: "Kelly scale 0.15. Max bet $85.", out: "RISK.V1", status: "ok" },
    { id: "4", name: "EXECUTION", details: "EIP-712 push. TX broadcasted.", out: "POLY.API", status: "ok" },
  ]);

  return (
    <ToWebsiteShell 
      title="Decision Chain" 
      subtitle="Pixel-perfect LiveLine audit flow." 
      constrainMain={true}
    >
      <div className="relative pl-[40px] py-10 bg-white">
        
        {/* The Vertical LiveLine - 1.5px stroke, Zinc-100 */}
        <div className="absolute left-[19.25px] top-4 bottom-4 w-[1.5px] bg-zinc-100" />
        
        <div className="space-y-[48px]">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              
              {/* The LiveLine Node - Dot + Halo Design */}
              <div className="absolute -left-[26px] top-1 flex items-center justify-center">
                <div className="size-[10px] rounded-full bg-blue-500/15 flex items-center justify-center">
                  <div className="size-[4px] rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
              
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-mono font-bold text-zinc-900 uppercase tracking-[0.2em]">{step.name}</h3>
                  <div className="px-2 py-0.5 bg-zinc-100 rounded-sm text-[9px] font-mono font-bold text-zinc-500 uppercase">
                    {step.out}
                  </div>
                </div>
                
                <div className="bg-zinc-50/50 p-6 rounded-sm">
                  <p className="text-[13px] text-zinc-700 font-medium leading-relaxed tracking-tight">{step.details}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </ToWebsiteShell>
  );
}
