"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/fumadocs-system/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

export function ChartContainer({
  children,
  className,
  config,
}: {
  children: ReactNode;
  className?: string;
  config?: ChartConfig;
}) {
  const style = Object.entries(config ?? {}).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value.color) {
      acc[`--color-${key}`] = value.color;
    }
    return acc;
  }, {});

  return (
    <div className={cn("w-full", className)} style={style as CSSProperties}>
      {children}
    </div>
  );
}
