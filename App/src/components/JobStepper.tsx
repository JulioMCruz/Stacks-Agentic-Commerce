import { Check, X } from "lucide-react";

const STEPS = ["Open", "Funded", "Submitted", "Completed"];

// Visual lifecycle for a job: Open -> Funded -> Submitted -> Completed,
// with Rejected (4) / Expired (5) shown as terminal states.
export default function JobStepper({ status }: { status: number }) {
  const rejected = status === 4;
  const expired = status === 5;
  const isDone = status === 3;
  const reached = rejected ? 2 : expired ? 0 : Math.min(status, 3);

  return (
    <div className="mt-4 flex items-center">
      {STEPS.map((label, i) => {
        const last = i === STEPS.length - 1;
        const terminalHere = last && (rejected || expired);
        const done = !terminalHere && (i < reached || isDone);
        const current = !terminalHere && i === reached && !isDone;

        let ring = "border-white/[0.12] text-mist-500";
        if (done) ring = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
        else if (current) ring = "border-brand/40 bg-brand/10 text-brand-300";
        if (terminalHere && rejected) ring = "border-red-500/40 bg-red-500/10 text-red-300";
        if (terminalHere && expired) ring = "border-white/15 bg-white/[0.04] text-mist-400";

        const text = terminalHere ? (rejected ? "Rejected" : "Expired") : label;
        const lit = done || current || terminalHere;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${ring}`}>
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : terminalHere && rejected ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] ${lit ? "text-mist-300" : "text-mist-500"}`}>{text}</span>
            </div>
            {!last && <div className={`mx-1.5 h-px w-8 sm:w-12 ${i < reached || isDone ? "bg-emerald-500/30" : "bg-white/[0.08]"}`} />}
          </div>
        );
      })}
    </div>
  );
}
