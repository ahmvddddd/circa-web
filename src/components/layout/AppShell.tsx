// src/components/layout/AppShell.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import PageHeader from "@/components/ui/PageHeader";

type AppShellProps = {
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
  children: React.ReactNode;
};

export default function AppShell({
  title,
  subtitle,
  cta,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-background/80">
        <PageHeader
          title={title}
          subtitle={subtitle}
          cta={cta}
          onMenuClick={() => setMobileOpen(true)}
        />
      </div>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-30 lg:ml-64 bg-background/80">
        <div className="max-w-[1080px] mx-auto">
          <PageHeader title={title} subtitle={subtitle} cta={cta} className="!px-4 !py-4" />
        </div>
      </header>

      {/* Page Content */}
      <main className="lg:pl-64">
        <div className="max-w-[1080px] mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
