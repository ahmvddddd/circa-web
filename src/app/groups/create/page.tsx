//src/app/groups/create/page.tsx

import AppShell from "@/components/layout/AppShell";
import CreateGroupForm from "@/components/groups/CreateGroupForm";
import Link from "next/link";

export default function CreateGroupPage() {
  return (
    <AppShell
      title="Create New Group"
      subtitle="Set up the details, rules for your new group."
    >

      {/* Client Component */}
      <CreateGroupForm />
    </AppShell>
  );
}
