
// src/components/layout/AppShell.tsx
// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { authStore } from "@/stores/authStore";
// import { usePathname } from "next/navigation";
// import Sidebar from "@/components/layout/Sidebar";
// import MobileSidebar from "@/components/layout/MobileSidebar";
// import PageHeader from "@/components/ui/PageHeader";
// import { refreshAccessToken } from "@/lib/auth/refreshAccessToken";
// import { checkGroupAdmin } from "@/lib/auth/checkGroupAdmin";

// type AppShellProps = {
//   title: string;
//   subtitle?: string;
//   cta?: React.ReactNode;
//   children: React.ReactNode;
// };

// export default function AppShell({ title, subtitle, cta, children }: AppShellProps) {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const pathname = usePathname();

//   // Routes where we do NOT run auth checks
//   const isAuthRoute = useMemo(
//     () =>
//       pathname.startsWith("/login") ||
//       pathname.startsWith("/register") ||
//       pathname.startsWith("/forgot-password"),
//     [pathname]
//   );

//   useEffect(() => {
//     if (isAuthRoute) return;   // ⬅️ skip refresh + admin check on auth pages

//     async function initAuth() {
//       // const ok = await refreshAccessToken();
//       // if (ok) {
//       //   await checkGroupAdmin();
//       // }
//       const token = authStore.getAccessToken();

// if (!token) {
//   const ok = await refreshAccessToken();
//   if (!ok) return;
// }

// await checkGroupAdmin();
// authStore.setAuthReady(true); //change
//     }

//     initAuth();
//   }, [isAuthRoute]);

  

//   return (
//     <div className="min-h-screen bg-background-light dark:bg-background-dark">
//       {/* Desktop Sidebar */}
//       <Sidebar />

//       {/* Mobile Drawer */}
//       <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

//       {/* Mobile Header */}
//       <div className="lg:hidden sticky top-0 z-30 bg-background/80">
//         <PageHeader
//           title={title}
//           subtitle={subtitle}
//           cta={cta}
//           onMenuClick={() => setMobileOpen(true)}
//         />
//       </div>

//       {/* Desktop Header */}
//       <header className="hidden lg:block sticky top-0 z-30 lg:ml-64 bg-background/80">
//         <div className="max-w-[1080px] mx-auto">
//           <PageHeader
//             title={title}
//             subtitle={subtitle}
//             cta={cta}
//             className="!px-4 !py-4"
//           />
//         </div>
//       </header>

//       {/* Page Content */}
//       <main className="lg:pl-64">
//         <div className="max-w-[1080px] mx-auto px-4 py-6">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }

// src/components/layout/AppShell.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import PageHeader from "@/components/ui/PageHeader";
import { usePathname } from "next/navigation";
import { checkGroupAdmin } from "@/lib/auth/checkGroupAdmin";

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
  const pathname = usePathname();

  const isPublicPage = useMemo(() => {
    return (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/deposit/tracking")
    );
  }, [pathname]);

  useEffect(() => {
    if (isPublicPage) return;
    checkGroupAdmin();
  }, [isPublicPage]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Desktop Sidebar */}
      {!isPublicPage && <Sidebar />}

      {/* Mobile Drawer */}
      {!isPublicPage && (
        <MobileSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-background/80">
        <PageHeader
          title={title}
          subtitle={subtitle}
          cta={cta}
          onMenuClick={!isPublicPage ? () => setMobileOpen(true) : undefined}
        />
      </div>

      {/* Desktop Header */}
      <header
        className={`hidden lg:block sticky top-0 z-30 bg-background/80 ${
          !isPublicPage ? "lg:ml-64" : ""
        }`}
      >
        <div className="max-w-[1080px] mx-auto">
          <PageHeader
            title={title}
            subtitle={subtitle}
            cta={cta}
            className="!px-4 !py-4"
          />
        </div>
      </header>

      {/* Page Content */}
      <main className={!isPublicPage ? "lg:pl-64" : ""}>
        <div className="max-w-[1080px] mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}