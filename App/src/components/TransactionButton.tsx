export default function TransactionButton({
  onClick,
  children,
  isLoading,
  loadingText,
  variant = "primary",
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
  className?: string;
}) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-600 hover:bg-gray-700",
    danger: "bg-red-600 hover:bg-red-700",
    success: "bg-green-600 hover:bg-green-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`${variants[variant]} text-white px-3 py-1 rounded text-sm disabled:opacity-50 ${className}`}
    >
      {isLoading ? loadingText || "Loading..." : children}
    </button>
  );
}
