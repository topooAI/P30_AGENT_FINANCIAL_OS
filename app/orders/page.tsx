"use client";
import { ToWebsiteShell } from "../_components/towebsite-shell";

export default function Page() {
  return (
    <ToWebsiteShell title="Order Stream" subtitle="Live execution log of all orders on the Polygon network.">
      <div className="rounded-xl border border-dashed border-zinc-200 p-20 text-center text-zinc-400">
        Order Stream Module Initializing...
      </div>
    </ToWebsiteShell>
  );
}
