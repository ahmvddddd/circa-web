//src/app/groups/page.tsx
"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import GroupCard from "@/components/groups/GroupCard";
import EmptyState from "@/components/ui/EmptyState";
import { groups } from "@/lib/groups";
import { PlusCircle, Users } from "lucide-react";
import Link from "next/link";

const MaterialIcon = ({
  name,
  sizeClass = "text-[10px]",
}: {
  name: string;
  sizeClass?: string;
}) => (
  <span className={`material-symbols-outlined ${sizeClass}`}>{name}</span>
);

const GroupsCta = () => (
  <Link href="groups/create">
    <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-[10px] font-bold transition active:scale-95">
      <PlusCircle size={12} strokeWidth={2} />
      <span className="hidden sm:inline">Create Group</span>
    </button>
  </Link>
);

export default function GroupsPage() {
  const title = "My Groups";
  const subtitle = `You are a member of ${groups.length} groups`;
  const isEmpty = groups.length === 0;

  return (
    <AppShell title={title} subtitle={subtitle} cta={<GroupsCta />}>
      {/* Search */}
      <div className="w-full lg:w-96 mb-5">
        <input
          className="w-full h-8 rounded-lg bg-muted text-foreground text-[10px] placeholder:text-muted-foreground px-3"
          placeholder="Search for a group..."
        />
      </div>

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
        /* Groups Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {groups.map((group, index) => (
            <GroupCard key={index} group={group} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
