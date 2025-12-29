"use client";

import React from "react";
import clsx from "clsx";
import { Menu, LayoutDashboard } from "lucide-react";


type PageHeaderProps = {
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
  className?: string;
  onMenuClick?: () => void;
};

export default function PageHeader({
  title,
  subtitle,
  cta,
  className,
  onMenuClick,
}: PageHeaderProps) {
  return (
    <header
      className={clsx(
        "sticky top-0 z-30",
        className
      )}
    >

      <div className="flex items-center gap-4 px-1 py-1">
        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden"
          >
            <LayoutDashboard className="h-6 w-6" />
          </button>
        )}

        {/* Title */}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-semibold">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* CTA */}
        {cta && <div className="shrink-0">{cta}</div>}
      </div>
    </header>
  );
}
