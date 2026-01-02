// //src/app/groups/page.tsx
// "use client";

// import React from "react";
// import AppShell from "@/components/layout/AppShell";
// import GroupCard from "@/components/groups/GroupCard";
// import { PlusCircle } from "lucide-react";
// import Link from "next/link";

// const MaterialIcon = ({
//   name,
//   sizeClass = "text-[20px]",
// }: {
//   name: string;
//   sizeClass?: string;
// }) => (
//   <span className={`material-symbols-outlined ${sizeClass}`}>{name}</span>
// );

// const groups = [
//   {
//     id: "001",
//     title: "EOY Party",
//     members: 32,
//     type: "Private",
//     role: "Admin",
//     joined: "Oct 24, 2023",
//     icon: "code",
//     gradient: "from-blue-500 to-cyan-400",
//   },
//   {
//     id: "002",
//     title: "Pacific Fund",
//     members: 14,
//     type: "Public",
//     role: "Creator",
//     joined: "Jan 12, 2024",
//     icon: "design_services",
//     gradient: "from-orange-400 to-pink-500",
//   },
//   {
//     id: "003",
//     title: "Marketing Squad",
//     members: 8,
//     type: "Private",
//     role: "Admin",
//     joined: "Feb 02, 2024",
//     icon: "rocket_launch",
//     gradient: "from-purple-500 to-indigo-600",
//   },
//   {
//     id: "004",
//     title: "Weekly Book Club",
//     members: 124,
//     type: "Public",
//     role: "Admin",
//     joined: "Mar 10, 2023",
//     icon: "menu_book",
//     gradient: "bg-[#29382f] border border-[#3a4d40]",
//   },
//   {
//     id: "005",
//     title: "Final Year Dinner",
//     members: 56,
//     type: "Public",
//     role: "Creator",
//     joined: "Apr 15, 2023",
//     icon: "hiking",
//     gradient: "from-emerald-400 to-teal-500",
//   },
//   {
//     id: "006",
//     title: "Gaming Nights",
//     members: 12,
//     type: "Private",
//     role: "Creator",
//     joined: "May 21, 2024",
//     icon: "sports_esports",
//     gradient: "from-yellow-400 to-orange-500",
//   },
// ];


// const GroupsCta = () => (
//   <Link
//     href="groups/create"
//   >
//   <button className="flex items-center gap-2 h-8 px-3 rounded-full bg-[#6824a3] hover:bg-primary/90 text-white text-xs font-bold transition active:scale-95">
//     <PlusCircle size={16} strokeWidth={2} />
//     <span className="hidden sm:inline">Create Group</span>
//   </button>
//   </Link>
// );


// export default function GroupsPage() {
//   const title = "My Groups";
//   const subtitle = `You are a member of ${groups.length} groups`;

//   return (
//     <AppShell title={title} subtitle={subtitle} cta={<GroupsCta />}>
//       {/* Search */}
//       <div className="w-full lg:w-96 mb-6">
//         <input
//           className="w-full h-10 rounded-xl bg-muted text-foreground text-xs placeholder:text-muted-foreground px-4" 
//           placeholder="Search for a group..."
//         />
//       </div>

//       {/* Groups Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
//         {groups.map((group, index) => (
//           <GroupCard key={index} group={group} />
//         ))}
//       </div>
//     </AppShell>
//   );
// }


"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import GroupCard from "@/components/groups/GroupCard";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

const MaterialIcon = ({
  name,
  sizeClass = "text-[10px]", // ↓ reduced from 20px
}: {
  name: string;
  sizeClass?: string;
}) => (
  <span className={`material-symbols-outlined ${sizeClass}`}>{name}</span>
);

const groups = [
  {
    id: "001",
    title: "EOY Party",
    members: 32,
    type: "Private",
    role: "Admin",
    joined: "Oct 24, 2023",
    icon: "code",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: "002",
    title: "Pacific Fund",
    members: 14,
    type: "Public",
    role: "Creator",
    joined: "Jan 12, 2024",
    icon: "design_services",
    gradient: "from-orange-400 to-pink-500",
  },
  {
    id: "003",
    title: "Marketing Squad",
    members: 8,
    type: "Private",
    role: "Admin",
    joined: "Feb 02, 2024",
    icon: "rocket_launch",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    id: "004",
    title: "Weekly Book Club",
    members: 124,
    type: "Public",
    role: "Admin",
    joined: "Mar 10, 2023",
    icon: "menu_book",
    gradient: "bg-[#29382f] border border-[#3a4d40]",
  },
  {
    id: "005",
    title: "Final Year Dinner",
    members: 56,
    type: "Public",
    role: "Creator",
    joined: "Apr 15, 2023",
    icon: "hiking",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "006",
    title: "Gaming Nights",
    members: 12,
    type: "Private",
    role: "Creator",
    joined: "May 21, 2024",
    icon: "sports_esports",
    gradient: "from-yellow-400 to-orange-500",
  },
];

const GroupsCta = () => (
  <Link href="groups/create">
    <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#6824a3] hover:bg-primary/90 text-white text-[10px] font-bold transition active:scale-95">
      {/* ↓ icon reduced */}
      <PlusCircle size={12} strokeWidth={2} />
      <span className="hidden sm:inline">Create Group</span>
    </button>
  </Link>
);

export default function GroupsPage() {
  const title = "My Groups";
  const subtitle = `You are a member of ${groups.length} groups`;

  return (
    <AppShell title={title} subtitle={subtitle} cta={<GroupsCta />}>
      {/* Search */}
      <div className="w-full lg:w-96 mb-5">
        <input
          className="w-full h-8 rounded-lg bg-muted text-foreground text-[10px] placeholder:text-muted-foreground px-3"
          placeholder="Search for a group..."
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {groups.map((group, index) => (
          <GroupCard key={index} group={group} />
        ))}
      </div>
    </AppShell>
  );
}
