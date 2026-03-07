

// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import AppShell from "@/components/layout/AppShell";
// import { authenticationFetch } from "@/lib/auth/authenticationFetch";

// type GroupMember = {
//   user_id: string;
//   name: string;
//   email: string;
//   role_in_group: "OWNER" | "TREASURER" | "MEMBER";
//   joined_at: string;
// };

// type MembersResponse = {
//   members: GroupMember[];
//   pagination: {
//     limit: number;
//     offset: number;
//     total: number;
//   };
// };

// type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

// export default function GroupMembersPage() {
//   const router = useRouter();
//   const params = useParams<{ groupId: string }>();
//   const searchParams = useSearchParams();

//   const groupId = params.groupId;

//   const pageParam = searchParams.get("page");
//   const qParam = searchParams.get("q") || "";

//   const page = Math.max(Number(pageParam) || 1, 1);
//   const limit = 50;
//   const offset = (page - 1) * limit;

//   const [members, setMembers] = useState<GroupMember[]>([]);
//   const [pagination, setPagination] =
//     useState<MembersResponse["pagination"] | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<PageError>(null);

//   const [searchInput, setSearchInput] = useState(qParam);

//   useEffect(() => {
//     setSearchInput(qParam);
//   }, [qParam]);
  

//   useEffect(() => {
//   if (!groupId) return;

//   const timer = setTimeout(() => {
//     const currentQ = qParam.trim();
//     const nextQ = searchInput.trim();

//     if (currentQ === nextQ) return;

//     const params = new URLSearchParams();

    
//     if (nextQ) {
//       params.set("q", nextQ);
//     }

//     router.push(
//       `/groups/${groupId}/members?${params.toString()}`
//     );
//   }, 300);

//   return () => clearTimeout(timer);
// }, [searchInput, qParam, groupId, router]);


//   useEffect(() => {
//     let active = true;

//     async function loadMembers() {
//       if (!groupId) return;

//       setLoading(true);
//       setError(null);

//       const params = new URLSearchParams();
//       params.set("limit", String(limit));
//       params.set("offset", String(offset));
//       if (qParam.trim()) {
//         params.set("q", qParam.trim());
//       }

//       try {
//         const res = await authenticationFetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/members?${params.toString()}`,
//           { method: "GET" }
//         );

//         if (!active) return;

//         if (res.status === 401) {
//           setError("UNAUTHENTICATED");
//           return;
//         }
//         if (res.status === 403) {
//           setError("FORBIDDEN");
//           return;
//         }
//         if (!res.ok) {
//           setError("FAILED");
//           return;
//         }

//         const json: MembersResponse = await res.json();
//         setMembers(json.members || []);
//         setPagination(json.pagination || null);
//       } catch {
//         if (active) setError("FAILED");
//       } finally {
//         if (active) setLoading(false);
//       }
//     }

//     loadMembers();
//     return () => {
//       active = false;
//     };
//   }, [groupId, page, offset, qParam]);

  
//   useEffect(() => {
//     if (error === "UNAUTHENTICATED" && groupId) {
//       router.push(`/login?next=/groups/${groupId}/members`);
//     }
//   }, [error, router, groupId]);

//   const total = pagination?.total ?? 0;
//   const totalPages = Math.max(
//     1,
//     Math.ceil(total / (pagination?.limit || limit))
//   );

//   const hasPrev = page > 1;
//   const hasNext = page < totalPages;

//   const goToPage = (target: number) => {
//     const safe = Math.min(Math.max(target, 1), totalPages);
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", String(safe));
//     router.push(`/groups/${groupId}/members?${params.toString()}`);
//   };

  
//   useEffect(() => {
//     if (!loading && page > totalPages) {
//       goToPage(totalPages);
//     }
//   }, [loading, page, totalPages]);

//   if (error === "FORBIDDEN") {
//     return (
//       <AppShell title="Group members">
//         <p className="text-xs text-gray-500">
//           You are not a member of this group.
//         </p>
//       </AppShell>
//     );
//   }

//   if (error === "FAILED") {
//     return (
//       <AppShell title="Group members">
//         <p className="text-xs text-red-500">
//           Failed to load members.
//         </p>
//       </AppShell>
//     );
//   }

//   return (
//     <AppShell
//       title="Group members"
//       subtitle={
//         loading
//           ? "Loading members…"
//           : `${total} member${total === 1 ? "" : "s"} • Page ${page} of ${totalPages}`
//       }
//     >
//       <div className="flex min-h-[calc(100vh-8rem)] flex-col">
//         {/* Search */}
//         <div className="w-full lg:w-80 mb-4">
//           <input
//             className="w-full h-8 rounded-lg bg-muted text-foreground text-[10px] placeholder:text-muted-foreground px-3"
//             placeholder="Search by name or email…"
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//           />
//         </div>

//         <div className="flex-1">
//           {loading && (
//             <p className="text-xs text-gray-500">Loading members…</p>
//           )}

//           {!loading && members.length === 0 && (
//             <p className="text-xs text-gray-500">
//               No members found.
//             </p>
//           )}

//           {!loading && members.length > 0 && (
//             <>
//               <div className="hidden md:grid grid-cols-4 gap-3 text-[10px] font-medium text-gray-500 mb-2">
//                 <span>Name</span>
//                 <span>Email</span>
//                 <span>Role</span>
//                 <span>Joined</span>
//               </div>

//               <div className="space-y-2">
//                 {members.map((m) => (
//                   <div
//                     key={m.user_id}
//                     className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center rounded-lg border border-border bg-background px-3 py-2"
//                   >
//                     <p className="text-xs font-semibold">
//                       {m.name || m.email}
//                     </p>

//                     <p
//                       className="text-[11px] text-gray-600 truncate"
//                       title={m.email}
//                     >
//                       {m.email}
//                     </p>

//                     <span
//                       className={`inline-flex w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
//                         m.role_in_group === "OWNER"
//                           ? "bg-emerald-500/15 text-emerald-500"
//                           : m.role_in_group === "TREASURER"
//                           ? "bg-primary/15 text-primary"
//                           : "bg-muted text-muted-foreground"
//                       }`}
//                     >
//                       {m.role_in_group}
//                     </span>

//                     <p className="text-[10px] text-gray-500">
//                       {new Date(m.joined_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Pagination */}
//         <div className="mt-auto border-t border-border pt-4">
//           <div className="flex items-center justify-between text-[11px]">
//             <button
//               onClick={() => goToPage(page - 1)}
//               disabled={!hasPrev}
//               className={`px-3 py-1.5 rounded-md border border-border ${
//                 hasPrev
//                   ? "hover:bg-muted"
//                   : "opacity-40 cursor-not-allowed"
//               }`}
//             >
//               ← Previous
//             </button>

//             <button
//               onClick={() => goToPage(page + 1)}
//               disabled={!hasNext}
//               className={`px-3 py-1.5 rounded-md border border-border ${
//                 hasNext
//                   ? "hover:bg-muted"
//                   : "opacity-40 cursor-not-allowed"
//               }`}
//             >
//               Next →
//             </button>
//           </div>
//         </div>
//       </div>
//     </AppShell>
//   );
// }


//src/app/groups/[groupId]/members/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";

type GroupMember = {
  user_id: string;
  name: string;
  email: string;
  role_in_group: "OWNER" | "TREASURER" | "MEMBER";
  joined_at: string;
};

type MembersResponse = {
  members: GroupMember[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

export default function GroupMembersPage() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();

  const groupId = params.groupId;

  const pageParam = searchParams.get("page");
  const qParam = searchParams.get("q") || "";

  const page = Math.max(Number(pageParam) || 1, 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [pagination, setPagination] =
    useState<MembersResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PageError>(null);

  const [searchInput, setSearchInput] = useState(qParam);

  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  useEffect(() => {
    if (!groupId) return;

    const timer = setTimeout(() => {
      const currentQ = qParam.trim();
      const nextQ = searchInput.trim();

      if (currentQ === nextQ) return;

      const params = new URLSearchParams(searchParams.toString());

      params.delete("page");

      if (nextQ) {
        params.set("q", nextQ);
      } else {
        params.delete("q");
      }

      router.push(`/groups/${groupId}/members?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, qParam, groupId, router, searchParams]);

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      if (!groupId) return;

      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      if (qParam.trim()) {
        params.set("q", qParam.trim());
      }

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/members?${params.toString()}`,
          { method: "GET" }
        );

        if (!active) return;

        if (res.status === 401) {
          setError("UNAUTHENTICATED");
          return;
        }
        if (res.status === 403) {
          setError("FORBIDDEN");
          return;
        }
        if (!res.ok) {
          setError("FAILED");
          return;
        }

        const json: MembersResponse = await res.json();
        setMembers(json.members || []);
        setPagination(json.pagination || null);
      } catch {
        if (active) setError("FAILED");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMembers();
    return () => {
      active = false;
    };
  }, [groupId, page, qParam]);

  useEffect(() => {
    if (error === "UNAUTHENTICATED" && groupId) {
      router.push(`/login?next=/groups/${groupId}/members`);
    }
  }, [error, router, groupId]);

  const total = pagination?.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(total / (pagination?.limit || limit))
  );

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const goToPage = (target: number) => {
    const safe = Math.min(Math.max(target, 1), totalPages);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(safe));
    router.push(`/groups/${groupId}/members?${params.toString()}`);
  };

  useEffect(() => {
    if (!loading && page > totalPages) {
      goToPage(totalPages);
    }
  }, [loading, page, totalPages]);

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Group members">
        <p className="text-xs text-gray-500">
          You are not a member of this group.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Group members">
        <p className="text-xs text-red-500">
          Failed to load members.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Group members"
      subtitle={
        loading
          ? "Loading members…"
          : `${total} member${total === 1 ? "" : "s"} • Page ${page} of ${totalPages}`
      }
    >
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        {/* Search */}
        <div className="w-full lg:w-80 mb-4 flex items-center gap-2">
          <input
            className="w-full h-8 rounded-lg bg-muted text-foreground text-[10px] placeholder:text-muted-foreground px-3"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          {loading && (
            <span className="text-[10px] text-gray-500">
              Searching...
            </span>
          )}
        </div>

        <div className="flex-1">
          {loading && (
            <p className="text-xs text-gray-500">Loading members…</p>
          )}

          {!loading && members.length === 0 && (
            <p className="text-xs text-gray-500">
              No members found.
            </p>
          )}

          {!loading && members.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-4 gap-3 text-[10px] font-medium text-gray-500 mb-2">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Joined</span>
              </div>

              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.user_id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <p className="text-xs font-semibold">
                      {m.name || m.email}
                    </p>

                    <p
                      className="text-[11px] text-gray-600 truncate"
                      title={m.email}
                    >
                      {m.email}
                    </p>

                    <span
                      className={`inline-flex w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        m.role_in_group === "OWNER"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : m.role_in_group === "TREASURER"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.role_in_group}
                    </span>

                    <p className="text-[10px] text-gray-500">
                      {new Date(m.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center justify-between text-[11px]">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={!hasPrev}
              className={`px-3 py-1.5 rounded-md border border-border ${
                hasPrev
                  ? "hover:bg-muted"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              ← Previous
            </button>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={!hasNext}
              className={`px-3 py-1.5 rounded-md border border-border ${
                hasNext
                  ? "hover:bg-muted"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}