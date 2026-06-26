export default function ErrorMessage({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
      <span>{message}</span>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="underline hover:text-red-900"
        >
          Retry
        </button>
      )}
    </div>
  );
}
