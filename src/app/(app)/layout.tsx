// import AppShell from '@/components/layout/AppShell';
// import React from 'react';

// export default function AppLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {

//   return <AppShell>{children}</AppShell>;
// }

// src/app/(app)/layout.tsx
// src/app/(app)/layout.tsx
import AppShell from '@/components/layout/AppShell';
import Sidebar from '@/components/layout/Sidebar';
import React from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Outer container: Full height, horizontal flex
    <div className="min-h-screen flex">
        {/* 1. Desktop Sidebar: Must be a direct flex child */}
        {/* We rely on Sidebar.tsx being hidden on small screens and w-64/flex-shrink-0 on large screens */}
        <Sidebar />

        {/* 2. Main Content Area: Takes up all remaining space. */}
        {/* We use flex-1 and overflow-x-hidden to prevent horizontal scrolling when content overflows */}
        <div className="flex-1 overflow-x-hidden">
            <AppShell>{children}</AppShell>
        </div>
    </div>
  );
}