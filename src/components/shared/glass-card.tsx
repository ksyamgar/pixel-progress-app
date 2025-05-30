
"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-md border border-border/30 rounded-xl shadow-2xl", // Enhanced shadow and bg opacity
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

    