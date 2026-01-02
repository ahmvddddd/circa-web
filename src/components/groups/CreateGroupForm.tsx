//src/components/groups/CreateGroupForm.tsx
"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupForm() {
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Create Group form submitted");
  }

  function handleCancel() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/groups");
    }
  }  

  return (
    <form
      className="flex flex-col gap-6 text-sm"
      onSubmit={handleSubmit}
    >
      {/* info */}
      <section className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4 sm:p-6 shadow-sm">
        <header className="flex items-center gap-3 mb-4 border-b border-border-light dark:border-border-dark pb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[18px]">
              info
            </span>
          </div>

          <div>
            <h2 className="text-xs font-semibold">
              General Information
            </h2>
            <p className="text-[11px] text-text-sub-light dark:text-text-sub-dark">
              Basic details about your group
            </p>
          </div>
        </header>

        <div className="grid gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g., Final Year Dinner"
              className="rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the purpose of this group and what members can expect..."
              className="rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </section>

      {/* rule template */}
      <section className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4 sm:p-6 shadow-sm">
        <header className="flex items-center gap-3 mb-4 border-b border-border-light dark:border-border-dark pb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[18px]">
              gavel
            </span>
          </div>

          <div>
            <h2 className="text-xs font-semibold">
              Governance & Rules
            </h2>
            <p className="text-[11px] text-text-sub-light dark:text-text-sub-dark">
              Define how the group is managed
            </p>
          </div>
        </header>

        <div className="grid gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium">
              Community Rules
            </label>
            <textarea
              rows={6}
              placeholder={`1. Be respectful
2. No spamming
3. Stay on topic`}
              className="rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium">
                Approvals Required
              </label>
              <input
                type="number"
                min={1}
                defaultValue={1}
                className="rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-[11px] text-text-sub-light dark:text-text-sub-dark">
                Minimum admins required to approve a join request.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium">
                Approvals Cap
              </label>
              <input
                type="number"
                min={1}
                defaultValue={5}
                className="rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-[11px] text-text-sub-light dark:text-text-sub-dark">
                Maximum concurrent approval requests allowed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* actions */}
<div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
  <button
    type="button"
    onClick={handleCancel}
    className="rounded-lg border border-border-light dark:border-border-dark px-4 py-1.5 text-xs font-medium hover:bg-card-light dark:hover:bg-card-dark transition"
  >
    Cancel
  </button>

  <button
    type="submit"
    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition flex justify-center items-center gap-1.5"
  >
    Create Group
  </button>
</div>

    </form>
  );
}
