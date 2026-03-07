// src/app/groups/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import GroupCard from "@/components/groups/GroupCard";
import EmptyState from "@/components/ui/EmptyState";
import { PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";
import { authStore } from "@/stores/authStore"; 


type ApiGroup = {
  group_id: string;
  group_name: string;
  role_in_group: "OWNER" | "TREASURER" | "MEMBER";
  joined_at: string;
};

type GroupSummary = {
  id: string;
  name: string;
  my_role?: "OWNER" | "TREASURER" | "MEMBER";
  joined_at?: string;
};

type PageError = "UNAUTHENTICATED" | "FAILED" | null;


const GroupsCta = () => (
  <Link href="/groups/create">
    <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-[10px] font-bold transition active:scale-95">
      <PlusCircle size={12} strokeWidth={2} />
      <span className="hidden sm:inline">Create Group</span>
    </button>
  </Link>
);


export default function GroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PageError>(null);

  useEffect(() => {
    let active = true;

    async function loadGroups() {
      setLoading(true);
      setError(null);

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/my-groups`,
          { method: "GET" }
        );

        if (!active) return;

        if (res.status === 401) {
          setError("UNAUTHENTICATED");
          return;
        }

        if (!res.ok) {
          setError("FAILED");
          return;
        }

        const json = await res.json();

        const apiGroups: ApiGroup[] = Array.isArray(json?.groups)
          ? json.groups
          : [];

        const normalized: GroupSummary[] = apiGroups.map((g) => ({
          id: g.group_id,
          name: g.group_name,
          my_role: g.role_in_group,
          joined_at: g.joined_at,
        }));

        setGroups(normalized);
      } catch {
        if (!active) return;
        setError("FAILED");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadGroups();

    return () => {
      active = false;
    };
  }, []); //change


  useEffect(() => {
    if (error === "UNAUTHENTICATED") {
      router.push("/login?next=/groups");
    }
  }, [error, router]);


  const filteredGroups = useMemo(() => {
    if (!Array.isArray(groups)) return [];

    const q = search.trim().toLowerCase();
    if (!q) return groups;

    return groups.filter((g) =>
      g.name.toLowerCase().includes(q)
    );
  }, [groups, search]);


  const isEmpty = !loading && filteredGroups.length === 0;

  const subtitle = loading
    ? "Loading your groups..."
    : `You are a member of ${groups.length} group${groups.length === 1 ? "" : "s"}`;


  return (
    <AppShell title="My Groups" subtitle={subtitle} cta={<GroupsCta />}>
      {/* Search */}
      <div className="w-full lg:w-96 mb-5">
        <input
          className="w-full h-8 rounded-lg bg-muted text-foreground text-[10px] placeholder:text-muted-foreground px-3"
          placeholder="Search for a group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error === "FAILED" && (
        <p className="text-xs text-red-500 mb-4">
          Failed to load your groups. Please try again later.
        </p>
      )}

      {/* Loading */}
      {loading && !error && (
        <p className="text-xs text-gray-500 mb-4">
          Loading your groups...
        </p>
      )}

      {/* Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group to start collaborating with others."
          actionLabel="Create your first group"
          actionHref="/groups/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </AppShell>
  );
}