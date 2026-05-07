"use client";

const CHIPS = [
  "Best-in-class maternity",
  "OPD coverage",
  "Dental included",
  "Mental health OPD",
  "No room rent cap",
  "Maternity waiting waiver",
  "Higher sum insured",
  "Parent cover add-on",
];

interface ConstraintsInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function ConstraintsInput({ value, onChange }: ConstraintsInputProps) {
  function appendChip(chip: string) {
    const sep = value.trim() ? ". " : "";
    onChange(value.trim() + sep + chip);
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-forge-navy/40 uppercase tracking-widest">
        Sales Constraints
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={`Describe what the client wants in plain English.\n\ne.g. "Keep premiums under ₹6,000/employee but best maternity possible. Willing to drop dental."`}
        className="w-full bg-white border border-forge-beige-dark/70 rounded-lg px-3 py-3 text-sm text-forge-navy placeholder:text-forge-navy/30 focus:outline-none focus:border-forge-blue focus:ring-1 focus:ring-forge-blue/20 resize-none transition"
      />
      <div>
        <p className="text-[10px] text-forge-navy/40 font-medium mb-2 uppercase tracking-wide">
          Quick-add priorities
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => appendChip(chip)}
              className="text-xs bg-forge-beige-dark/60 hover:bg-forge-blue/15 hover:text-forge-navy border border-forge-beige-dark/80 hover:border-forge-blue/40 text-forge-navy/60 px-3 py-1 rounded-full transition-colors"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
