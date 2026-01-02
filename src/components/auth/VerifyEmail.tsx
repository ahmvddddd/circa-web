//src/components/auth/VerifyEmail.tsx
"use client";

export default function VerifyEmail() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-sm w-full text-center bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm">
        <h1 className="text-sm font-semibold mb-2">
          Verify your email to continue
        </h1>

        <p className="text-xs text-text-sub-light dark:text-text-sub-dark mb-6">
          You need to verify your email address before creating a group.
        </p>

        <button
          className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
          onClick={() => {
            
            console.log("Resend verification email");
          }}
        >
          Resend verification email
        </button>
      </div>
    </div>
  );
}
