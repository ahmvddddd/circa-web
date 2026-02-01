"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ArrowDownLeft, Users, LogOut, Table, UserCog } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Groups", href: "/groups", icon: Users },
  { label: "Withdrawals", href: "/withdrawals", icon: ArrowUpRight },
  { label: "Ledgers", href: "/ledgers", icon: Table },
  { label: "Deposit Tracking", href: "/deposit/tracking", icon: ArrowDownLeft },
  { label: "Group Deposits", href: "/group-admin/deposits", icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-muted border-r">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="leading-tight">
            <p className="text-sm font-semibold">Circa</p>
            <p className="text-xs text-muted-foreground">Community wallet</p>
          </div>
        </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition",
                active
                  ? "bg-primary text-white"
                  : "text-text-main-light dark:text-text-main-dark hover:bg-primary/80"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}