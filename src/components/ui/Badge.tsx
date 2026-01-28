function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold";

  switch (status) {
    case "COMPLETED":
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          Completed
        </span>
      );

    case "FAILED":
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          Failed
        </span>
      );

    case "CANCELLED":
      return (
        <span className={`${base} bg-gray-200 text-gray-700`}>
          Cancelled
        </span>
      );

    default:
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          Pending
        </span>
      );
  }
}
