"use client";

export type Step = {
  label: string;
  status: "pending" | "active" | "done";
};

const STEP_LABELS: Record<string, string> = {
  classifying: "Classifying intent",
  searching: "Searching policy",
  responding: "Generating response",
};

export function AgentSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center gap-2 py-2 px-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <StatusDot status={step.status} />
            <span
              className={`text-xs font-medium transition-colors ${
                step.status === "active"
                  ? "text-loop-green"
                  : step.status === "done"
                  ? "text-gray-400"
                  : "text-gray-300"
              }`}
            >
              {STEP_LABELS[step.label] ?? step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className="text-gray-300 text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusDot({ status }: { status: Step["status"] }) {
  if (status === "active") {
    return (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-loop-lime opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-loop-lime" />
      </span>
    );
  }
  if (status === "done") {
    return <span className="inline-flex rounded-full h-2 w-2 bg-gray-300" />;
  }
  return <span className="inline-flex rounded-full h-2 w-2 bg-gray-200" />;
}
