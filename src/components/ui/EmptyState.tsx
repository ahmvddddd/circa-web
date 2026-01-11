//src/components/ui/EmptyState.tsx
"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-border bg-surface/70">
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={18} />
        </div>
      )}

      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-[11px] text-muted-foreground">
          {description}
        </p>
      )}

      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-4">
          <button className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-white text-[11px] font-bold transition active:scale-95">
            {actionLabel}
          </button>
        </Link>
      )}
    </div>
  );
}
