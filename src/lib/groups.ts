// src/lib/groups.ts
export type Group = {
  id: string;
  title: string;
  members: number;
  type: string;
  role: "Admin" | "Creator" | "Member";
  joined: string;
  icon: string;
  gradient: string;
};


export const groups: Group[] = [
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