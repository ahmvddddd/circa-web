// //src/components/groups/GroupCard.tsx
"use client";

import Link from "next/link";
import { Group } from "@/lib/groups";

const MaterialIcon = ({
  name,
  sizeClass = "text-[10px]",
}: {
  name: string;
  sizeClass?: string;
}) => (
  <span className={`material-symbols-outlined ${sizeClass}`}>{name}</span>
);

type GroupCardProps = {
  group: Group;
};

export default function GroupCard({ group }: GroupCardProps) {
  const isAdmin = group.role === "Admin";

  const iconContainerClasses = group.gradient.startsWith("bg")
    ? `size-8 rounded-xl flex items-center justify-center shadow-md ${group.gradient}`
    : `size-8 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shadow-md`;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg"
      aria-label={`View details for ${group.title}`}
    >
      <div className="relative flex flex-col justify-between rounded-lg bg-[#1C1C26]/10 dark:bg-[#1C1C26] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg border border-transparent hover:border-primary/20">
        <div className="flex justify-between items-start mb-3">
          <div className={iconContainerClasses}>

            <MaterialIcon name={group.icon} sizeClass="text-white text-base" />
          </div>

          <button
            aria-label="Group options"
            onClick={(e) => e.preventDefault()}
            className="rounded-full p-1 text-gray-500 hover:text-white hover:bg-white/10 transition"
          >
            
            <MaterialIcon name="more_horiz" sizeClass="text-xs" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-bold text-dark dark:text-white mb-0.5 group-hover:text-primary transition-colors">
            {group.title}
          </h3>

          <p className="text-xs text-gray-400 mb-3">
            {group.members} Members • {group.type}
          </p>

          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                isAdmin
                  ? "bg-primary/20 text-primary"
                  : "bg-gray-300 text-primary"
              }`}
            >
              {isAdmin && (
                <span className="size-1 rounded-full bg-primary" />
              )}
              {group.role}
            </span>

            <span className="hidden sm:block text-[10px] text-gray-500">
              Joined {group.joined}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
