const STATUS_CONFIG: Record<number, { label: string; className: string }> = {
  0: { label: "Open", className: "bg-gray-100 text-gray-800" },
  1: { label: "Funded", className: "bg-yellow-100 text-yellow-800" },
  2: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
  3: { label: "Completed", className: "bg-green-100 text-green-800" },
  4: { label: "Rejected", className: "bg-red-100 text-red-800" },
  5: { label: "Expired", className: "bg-gray-100 text-gray-500" },
};

export default function StatusBadge({ status }: { status: number }) {
  const config = STATUS_CONFIG[status] || { label: "Unknown", className: "bg-gray-100" };
  
  return (
    <span className={`px-2 py-1 rounded text-xs ${config.className}`}>
      {config.label}
    </span>
  );
}
