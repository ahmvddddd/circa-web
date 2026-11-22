// src/components/layout/MobileSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Table,
  UserCog,
  Banknote,
  FileText,
} from "lucide-react";
import clsx from "clsx";
import { useGroupAccess } from "@/lib/hooks/useGroupAccess";

const baseNavItems = [
  { label: "Groups", href: "/groups", icon: Users },
  { label: "Withdrawals", href: "/withdrawals", icon: ArrowUpRight },
  { label: "Ledgers", href: "/ledgers", icon: Table },
  { label: "Deposit Tracking", href: "/deposit/tracking", icon: ArrowDownLeft },
];

const adminNavItems = [
  { label: "Group Deposits", href: "/group-admin/deposits", icon: UserCog },
  { label: "Group Withdrawals", href: "/group-admin/withdrawals", icon: Banknote },
  {
    label: "Withdrawal Approvals",
    href: "/group-admin/withdrawals/approvals",
    icon: FileText,
  },
];

export interface MobileSidebarProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MobileSidebar({ open, isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const groupId = params?.groupId as string | undefined;

  const { isOwner, isTreasurer } = useGroupAccess(groupId);
  const isGroupAdmin = isOwner || isTreasurer;

  const navItems = [
    ...baseNavItems,
    ...(isGroupAdmin ? adminNavItems : []),
  ];

  const showDrawer = open ?? isOpen ?? false;

  return (
    <div className={clsx("lg:hidden", showDrawer ? "block" : "hidden")}>
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-muted border-r">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold">Circa</p>
            <p className="text-xs text-muted-foreground">Community wallet</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
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
    </div>
  );
}