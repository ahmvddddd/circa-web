// src/components/layout/MobileSidebar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowUpRight, Users, Table } from "lucide-react";
import clsx from "clsx";

type MobileSidebarProps = { open: boolean; onClose: () => void };

const navItems = [
  { label: "Groups", href: "/groups", icon: Users },
  { label: "Withdrawals", href: "/withdrawals", icon: ArrowUpRight },
  { label: "Ledgers", href: "/ledgers", icon: Table },
  { label: "New Group", href: "groups/create", icon: Table },
];

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // lock scroll
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className="lg:hidden">
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[320px]",
          "bg-surface text-foreground border-r border-border",
          "transform transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="leading-tight">
            <p className="text-sm font-semibold">Circa</p>
            <p className="text-xs text-muted-foreground">Community wallet</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-3">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}