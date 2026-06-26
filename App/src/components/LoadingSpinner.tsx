export default function LoadingSpinner({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="container-x py-20 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
      <p className="mt-3 text-sm text-mist-500">{text}</p>
    </div>
  );
}
