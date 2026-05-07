"use client";

import { useState } from "react";
import { Sparkles, Loader2, FileText } from "lucide-react";
import { DemographicsForm, type CompanyDemographics } from "@/components/DemographicsForm";
import { ConstraintsInput } from "@/components/ConstraintsInput";
import { PolicyOptionCard, type PolicyOption } from "@/components/PolicyOptionCard";
import { ProposalView } from "@/components/ProposalView";

type ForgeState = "idle" | "generating" | "done" | "error";

const DEFAULT_DEMOGRAPHICS: CompanyDemographics = {
  company_name: "",
  industry: "",
  employee_count: 0,
  avg_age: 0,
  female_pct: 40,
  city: "",
  health_notes: "",
};

export default function ForgePage() {
  const [demographics, setDemographics] = useState<CompanyDemographics>(DEFAULT_DEMOGRAPHICS);
  const [constraints, setConstraints] = useState("");
  const [state, setState] = useState<ForgeState>("idle");
  const [options, setOptions] = useState<PolicyOption[]>([]);
  const [error, setError] = useState("");
  const [proposalOpen, setProposalOpen] = useState(false);

  function isReady() {
    return (
      demographics.employee_count > 0 &&
      demographics.avg_age > 0 &&
      demographics.city !== ""
    );
  }

  async function generate() {
    if (!isReady() || state === "generating") return;
    setState("generating");
    setError("");

    const res = await fetch("/api/forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demographics, constraints }),
    });
    const data = await res.json();

    if (data.error) {
      setError(data.error);
      setState("error");
      return;
    }

    setOptions(data.options);
    setState("done");
  }

  return (
    <div className="min-h-screen bg-forge-beige flex flex-col">
      {/* Header */}
      <header className="bg-forge-navy px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Logo />
        {state === "done" && (
          <button
            onClick={() => setProposalOpen(true)}
            className="flex items-center gap-2 bg-forge-blue hover:bg-forge-blue-dark text-white font-semibold text-sm px-4 py-2 rounded-pill transition-colors"
          >
            <FileText className="w-4 h-4" /> Export Proposal
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
        {/* Left panel — form */}
        <div className="w-full lg:w-[400px] lg:flex-shrink-0 bg-white border-r border-forge-beige-dark/50 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-forge-navy font-bold text-lg">Configure Policy</h2>
              <p className="text-forge-navy/50 text-xs mt-0.5">
                Fill in company profile + constraints to generate options
              </p>
            </div>

            <DemographicsForm value={demographics} onChange={setDemographics} />

            <div className="border-t border-forge-beige-dark/40 pt-5">
              <ConstraintsInput value={constraints} onChange={setConstraints} />
            </div>

            <button
              onClick={generate}
              disabled={!isReady() || state === "generating"}
              className="w-full flex items-center justify-center gap-2 bg-forge-navy hover:bg-forge-navy-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-pill transition-colors"
            >
              {state === "generating" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating options…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Policy Options
                </>
              )}
            </button>

            {!isReady() && state === "idle" && (
              <p className="text-center text-xs text-forge-navy/40">
                Fill in employee count, average age, and city to continue
              </p>
            )}
          </div>
        </div>

        {/* Right panel — output */}
        <div className="flex-1 overflow-y-auto p-6">
          {state === "idle" && <EmptyState />}

          {state === "generating" && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-14 h-14 bg-forge-navy/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-7 h-7 text-forge-navy animate-spin" />
              </div>
              <p className="text-forge-navy font-semibold text-lg mb-1">Modelling your options</p>
              <p className="text-forge-navy/50 text-sm max-w-xs">
                Running actuarial analysis across maternity risk, age bands, and coverage permutations…
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-card p-6 max-w-sm text-center">
                <p className="text-red-700 font-semibold mb-2">Generation failed</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button onClick={() => setState("idle")} className="mt-4 text-sm text-red-600 underline">
                  Try again
                </button>
              </div>
            </div>
          )}

          {state === "done" && options.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-forge-navy font-bold text-xl">3 Policy Options</h2>
                  <p className="text-forge-navy/50 text-xs mt-0.5">
                    For {demographics.company_name || "your company"} · {demographics.employee_count} employees
                  </p>
                </div>
                <button
                  onClick={generate}
                  className="text-xs text-forge-navy/50 hover:text-forge-navy border border-forge-beige-dark/70 hover:border-forge-navy/30 px-3 py-1.5 rounded-pill transition-colors"
                >
                  Regenerate
                </button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {options.map((opt) => (
                  <PolicyOptionCard key={opt.tier_level} option={opt} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {proposalOpen && (
        <ProposalView
          options={options}
          demographics={demographics}
          onClose={() => setProposalOpen(false)}
        />
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-forge-navy-light rounded-lg flex items-center justify-center">
        <span className="text-forge-blue font-bold text-xs">PF</span>
      </div>
      <span className="text-white font-bold text-lg tracking-tight">
        Policy<span className="text-forge-blue">Forge</span>
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-16 h-16 bg-forge-navy/10 rounded-2xl flex items-center justify-center mb-5">
        <Sparkles className="w-8 h-8 text-forge-navy/30" />
      </div>
      <h3 className="text-forge-navy font-bold text-lg mb-2">
        Policy options will appear here
      </h3>
      <p className="text-forge-navy/50 text-sm max-w-xs leading-relaxed">
        Fill in the company profile on the left and hit Generate. Three actuarially priced tiers will appear in seconds.
      </p>
    </div>
  );
}
