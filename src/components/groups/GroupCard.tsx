//src/components/groups/GroupCard.tsx
"use client";

import Link from "next/link";
import { Group } from "@/lib/groups";

const MaterialIcon = ({
  name,
  sizeClass = "text-[20px]",
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
    ? `size-10 rounded-2xl flex items-center justify-center shadow-lg ${group.gradient}`
    : `size-10 rounded-2xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shadow-lg`;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-xl"
      aria-label={`View details for ${group.title}`}
    >
      <div className="relative flex flex-col justify-between rounded-xl bg-[#1C1C26]/10 dark:bg-[#1C1C26] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D8D8DB] dark:hover:shadow-black border border-transparent hover:border-primary/20">
        <div className="flex justify-between items-start mb-4">
          <div className={iconContainerClasses}>
            <MaterialIcon name={group.icon} sizeClass="text-white text-2xl" />
          </div>

          <button
            aria-label="Group options"
            onClick={(e) => e.preventDefault()}
            className="rounded-full p-1 text-gray-500 hover:text-white hover:bg-white/10 transition"
          >
            <MaterialIcon name="more_horiz" sizeClass="text-base" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1C1C26] dark:text-white mb-1 group-hover:text-primary transition-colors">
            {group.title}
          </h3>

          <p className="text-sm text-gray-400 mb-4">
            {group.members} Members • {group.type}
          </p>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isAdmin
                  ? "bg-primary/20 text-primary"
                  : "bg-white/10 text-gray-300"
              }`}
            >
              {isAdmin && <span className="size-1.5 rounded-full bg-primary" />}
              {group.role}
            </span>

            <span className="hidden sm:block text-xs text-gray-500">
              Joined {group.joined}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
