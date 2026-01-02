// //src/app/groups/create/page.tsx

import AppShell from "@/components/layout/AppShell";
import CreateGroupForm from "@/components/groups/CreateGroupForm";
import VerifyEmail from "@/components/auth/VerifyEmail";
import { requireAuth } from "@/lib/auth";

const emailVerified =
  process.env.NEXT_PUBLIC_EMAIL_VERIFIED === "true";

export default async function CreateGroupPage() {
  const user = await requireAuth();

  // Email verification gate
  if (!user.emailVerified || !emailVerified) {
    return (
      <AppShell
        title="Email verification required"
        subtitle="Verify your email to continue"
      >
        <VerifyEmail />
      </AppShell>
    );
  }

  // Verified user
  return (
    <AppShell
      title="Create New Group"
      subtitle="Set up the details and rules for your new group."
    >
      <CreateGroupForm />
    </AppShell>
  );
}
