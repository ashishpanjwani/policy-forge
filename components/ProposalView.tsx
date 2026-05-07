"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Check } from "lucide-react";
import type { PolicyOption } from "./PolicyOptionCard";
import type { CompanyDemographics } from "./DemographicsForm";

interface ProposalViewProps {
  options: PolicyOption[];
  demographics: CompanyDemographics;
  onClose: () => void;
}

// Abbreviated: used in summary headers
function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

// Full precision with Indian comma formatting: used in table cells
function fmtFull(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN")}`;
}

// Amount with sign, handles negatives correctly
function fmtAdj(amount: number) {
  if (amount < 0) return <span className="text-emerald-600">−{fmtFull(amount)}</span>;
  return <span>+{fmtFull(amount)}</span>;
}

export function ProposalView({ options, demographics, onClose }: ProposalViewProps) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    document.body.classList.add("proposal-open");
    return () => document.body.classList.remove("proposal-open");
  }, []);

  // Only show coverage rows where at least one tier includes it
  const visibleCoverages = options[0].coverages.filter((cov) =>
    options.some((o) => o.coverages.find((c) => c.name === cov.name)?.included)
  );

  // All unique adjustment labels across all tiers
  const allAdjLabels = Array.from(
    new Set(options.flatMap((o) => o.actuarial_workings?.adjustments.map((a) => a.label) ?? []))
  );

  const hasWorkings = options.every((o) => o.actuarial_workings);

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="no-print fixed inset-0 bg-forge-navy/60 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Proposal panel */}
      <div id="proposal-root" className="fixed inset-0 z-50 overflow-y-auto bg-white">

        {/* Toolbar */}
        <div className="no-print bg-white border-b border-forge-beige-dark/50 px-8 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <span className="text-forge-navy font-semibold text-sm">Proposal Preview</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-forge-navy text-white text-sm font-medium px-4 py-2 rounded-pill hover:bg-forge-navy-light transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Export PDF
            </button>
            <button onClick={onClose} className="text-forge-navy/50 hover:text-forge-navy transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-10 print:py-6 print:px-6">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-6 pb-4 print:mb-4 print:pb-3 border-b-2 border-forge-navy">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 bg-forge-navy rounded flex items-center justify-center">
                  <span className="text-forge-blue font-bold text-[9px]">PF</span>
                </div>
                <span className="text-forge-navy font-bold text-sm tracking-tight">
                  Policy<span className="text-forge-blue">Forge</span>
                </span>
              </div>
              <h1 className="text-forge-navy font-bold text-3xl print:text-2xl leading-tight">Group Health Insurance Proposal</h1>
              <p className="text-forge-navy/60 text-sm mt-1">
                Prepared for <strong>{demographics.company_name || "Your Company"}</strong>
                {demographics.industry ? ` · ${demographics.industry}` : ""}
              </p>
            </div>
            <div className="text-right text-xs text-forge-navy/50 space-y-0.5 shrink-0 ml-8">
              <p className="font-semibold text-forge-navy/70 text-sm">{today}</p>
              <p>{demographics.employee_count} employees · {demographics.city}</p>
              <p>Avg age {demographics.avg_age} · {demographics.female_pct}% female</p>
              {demographics.health_notes && <p className="text-forge-navy/40">Notes: {demographics.health_notes}</p>}
            </div>
          </div>

          {/* ── Tier price summary strip ── */}
          <div className="grid grid-cols-3 gap-4 mb-6 print:mb-4">
            {options.map((o) => {
              const isRec = o.tier_level === "balanced";
              return (
                <div
                  key={o.tier_level}
                  className={`rounded-xl px-5 py-4 print:px-4 print:py-3 ${isRec ? "bg-forge-navy text-white" : "bg-forge-beige border border-forge-beige-dark/50"}`}
                >
                  {isRec && <p className="text-forge-blue text-[9px] font-bold uppercase tracking-widest mb-1">★ Recommended</p>}
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isRec ? "text-white/60" : "text-forge-navy/40"}`}>
                    {o.tier_level}
                  </p>
                  <p className={`font-bold text-lg print:text-base leading-none ${isRec ? "text-white" : "text-forge-navy"}`}>{o.tier_name}</p>
                  {o.insurer_name && (
                    <p className={`text-[10px] font-semibold mt-0.5 ${isRec ? "text-forge-blue" : "text-forge-sea"}`}>
                      {o.insurer_name}
                    </p>
                  )}
                  <p className={`text-xs print:text-[10px] mt-0.5 ${isRec ? "text-white/60" : "text-forge-navy/50"}`}>{o.tagline}</p>
                  <div className="mt-3 print:mt-2 flex items-baseline gap-1">
                    <span className={`font-bold text-2xl print:text-xl ${isRec ? "text-white" : "text-forge-navy"}`}>
                      {fmt(o.annual_premium_per_employee)}
                    </span>
                    <span className={`text-[10px] ${isRec ? "text-white/50" : "text-forge-navy/40"}`}>/employee/yr</span>
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isRec ? "text-white/50" : "text-forge-navy/40"}`}>
                    {fmt(o.total_annual_cost)} total · {o.sum_insured}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Coverage Comparison ── */}
          <div className="mb-6 print:mb-4 rounded-xl border border-forge-beige-dark/40 overflow-hidden">
            <div className="bg-forge-navy px-5 py-3 print:py-2">
              <h2 className="text-white font-semibold text-xs tracking-widest uppercase">Coverage Comparison</h2>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-forge-beige-dark/40 bg-forge-beige/30">
                  <th className="text-left px-5 py-2.5 text-forge-navy/40 font-semibold uppercase tracking-wide text-[10px] w-[32%]">Feature</th>
                  {options.map((o) => (
                    <th key={o.tier_level} className={`text-center px-4 py-2.5 text-xs font-bold ${o.tier_level === "balanced" ? "text-forge-navy bg-forge-navy/5" : "text-forge-navy/70"}`}>
                      {o.tier_name}
                      {o.insurer_name && (
                        <span className={`block text-[9px] font-semibold ${o.tier_level === "balanced" ? "text-forge-blue" : "text-forge-sea"}`}>
                          {o.insurer_name}
                        </span>
                      )}
                      <span className={`block text-[9px] font-normal ${o.tier_level === "balanced" ? "text-forge-navy/50" : "text-forge-navy/35"}`}>
                        {o.tier_level === "balanced" ? "★ Recommended" : o.tier_level}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Pricing rows */}
                {[
                  {
                    label: "Annual Premium / Employee",
                    bold: true,
                    render: (o: PolicyOption) => (
                      <span className="font-bold text-forge-navy">{fmtFull(o.annual_premium_per_employee)}</span>
                    ),
                  },
                  {
                    label: "Total Annual Cost",
                    render: (o: PolicyOption) => fmtFull(o.total_annual_cost),
                  },
                  {
                    label: "Sum Insured",
                    render: (o: PolicyOption) => o.sum_insured,
                  },
                  {
                    label: "Budget",
                    render: (o: PolicyOption) => (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${o.meets_budget ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {o.meets_budget ? "✓ Within budget" : "↑ Over budget"}
                      </span>
                    ),
                  },
                ].map(({ label, bold, render }, i) => (
                  <tr key={label} className={`border-b border-forge-beige-dark/20 ${i % 2 === 0 ? "bg-forge-navy/[0.03]" : ""}`}>
                    <td className={`px-5 py-2 ${bold ? "font-semibold text-forge-navy" : "text-forge-navy/60"}`}>{label}</td>
                    {options.map((o) => (
                      <td key={o.tier_level} className={`text-center px-4 py-2 text-forge-navy/70 ${o.tier_level === "balanced" ? "bg-forge-navy/5" : ""}`}>
                        {render(o)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Coverage rows — only where at least one tier is included */}
                {visibleCoverages.map((cov, idx) => (
                  <tr key={cov.name} className={`border-b border-forge-beige-dark/20 ${idx % 2 === 0 ? "" : "bg-forge-beige/20"}`}>
                    <td className="px-5 py-2 text-forge-navy/60 font-medium">{cov.name}</td>
                    {options.map((o) => {
                      const c = o.coverages.find((x) => x.name === cov.name);
                      return (
                        <td key={o.tier_level} className={`text-center px-4 py-2 ${o.tier_level === "balanced" ? "bg-forge-navy/5" : ""}`}>
                          {c?.included ? (
                            <span className={c.highlight ? "font-semibold text-forge-navy" : "text-forge-navy/70"}>
                              {c.highlight && <Check className="w-3 h-3 text-forge-blue inline mr-1 mb-0.5" />}
                              {c.limit}
                            </span>
                          ) : (
                            <span className="text-forge-navy/20">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pricing Methodology ── */}
          {hasWorkings && (
            <div className="mb-6 rounded-xl border border-forge-beige-dark/40 overflow-hidden print-page-break">
              <div className="bg-forge-navy/8 border-b border-forge-beige-dark/40 px-5 py-3 print:py-2">
                <h2 className="text-forge-navy font-semibold text-xs tracking-widest uppercase">Pricing Methodology</h2>
                <p className="text-forge-navy/40 text-[10px] mt-0.5">Step-by-step actuarial build-up from the India 2024–25 reference table</p>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-forge-beige-dark/30 bg-forge-beige/30">
                    <th className="text-left px-5 py-2 text-forge-navy/40 font-semibold uppercase tracking-wide text-[10px] w-[40%]">Component</th>
                    {options.map((o) => (
                      <th key={o.tier_level} className="text-right px-4 py-2 text-forge-navy font-semibold text-[11px]">{o.tier_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-forge-beige-dark/20 bg-forge-navy/5">
                    <td className="px-5 py-2 font-semibold text-forge-navy">Base premium</td>
                    {options.map((o) => (
                      <td key={o.tier_level} className="text-right px-4 py-2 font-semibold text-forge-navy">
                        {fmtFull(o.actuarial_workings.base_premium)}
                      </td>
                    ))}
                  </tr>
                  {allAdjLabels.map((label) => (
                    <tr key={label} className="border-b border-forge-beige-dark/15">
                      <td className="px-5 py-1.5 text-forge-navy/55 pl-8 text-[11px]">{label}</td>
                      {options.map((o) => {
                        const adj = o.actuarial_workings.adjustments.find((a) => a.label === label);
                        return (
                          <td key={o.tier_level} className="text-right px-4 py-1.5 text-[11px]">
                            {adj ? fmtAdj(adj.amount) : <span className="text-forge-navy/20">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-b border-forge-beige-dark/30 border-t border-forge-beige-dark/40 bg-forge-beige/30">
                    <td className="px-5 py-2 text-forge-navy/60 font-medium">Subtotal</td>
                    {options.map((o) => (
                      <td key={o.tier_level} className="text-right px-4 py-2 text-forge-navy/70 font-medium">
                        {fmtFull(o.actuarial_workings.subtotal)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-forge-beige-dark/20">
                    <td className="px-5 py-1.5 text-emerald-700 pl-8">Group discount ({options[0].actuarial_workings.group_discount_pct}%)</td>
                    {options.map((o) => (
                      <td key={o.tier_level} className="text-right px-4 py-1.5 text-emerald-600">
                        −{fmtFull(o.actuarial_workings.group_discount_amount)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-forge-navy/5">
                    <td className="px-5 py-2.5 font-bold text-forge-navy">Final premium / employee / year</td>
                    {options.map((o) => (
                      <td key={o.tier_level} className="text-right px-4 py-2.5 font-bold text-forge-navy">
                        {fmtFull(o.actuarial_workings.final_premium)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ── Tier notes — 3 columns (screen only) ── */}
          <div className="no-print grid grid-cols-3 gap-4 mb-8">
            {options.map((opt) => <TierSummary key={opt.tier_level} option={opt} />)}
          </div>

          {/* ── Trade-offs summary — print only, 3 columns ── */}
          <div className="hidden print:grid grid-cols-3 gap-4 mb-5">
            {options.map((o) => (
              <div key={o.tier_level} className={`rounded-lg border p-3 ${o.tier_level === "balanced" ? "border-forge-navy/30 bg-forge-navy/5" : "border-forge-beige-dark/50"}`}>
                <p className="text-[9px] font-bold text-forge-navy/40 uppercase tracking-widest mb-0.5">{o.tier_level}</p>
                <p className="text-forge-navy font-bold text-[11px] mb-1">{o.tier_name}</p>
                <p className="text-forge-navy/50 text-[10px] leading-snug mb-2">{o.best_for}</p>
                {o.trade_offs.slice(0, 3).map((t, i) => (
                  <p key={i} className="text-[10px] text-amber-800 flex gap-1 leading-snug mb-0.5">
                    <span className="text-amber-400 shrink-0">·</span><span>{t}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-forge-beige-dark/40 pt-4 text-center text-[10px] text-forge-navy/35">
            <p>Generated using AI-assisted actuarial modelling. Final premiums are subject to insurer underwriting and confirmation.</p>
            <p className="mt-0.5">PolicyForge · {today}</p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function TierSummary({ option }: { option: PolicyOption }) {
  const isRecommended = option.tier_level === "balanced";
  return (
    <div className={`rounded-xl border-2 p-4 ${isRecommended ? "border-forge-navy bg-forge-navy/5" : "border-forge-beige-dark/50"}`}>
      {isRecommended && (
        <div className="bg-forge-navy text-white text-[9px] font-bold text-center py-0.5 rounded-full mb-2.5 tracking-widest">
          ★ RECOMMENDED
        </div>
      )}
      <p className="text-[9px] font-bold text-forge-navy/35 uppercase tracking-widest">{option.tier_level}</p>
      <h3 className="text-forge-navy font-bold text-sm mt-0.5 mb-1">{option.tier_name}</h3>
      <p className="text-forge-navy/50 text-[10px] leading-snug mb-2">{option.tagline}</p>
      <p className="text-[10px] text-forge-navy/45">
        <span className="font-semibold text-forge-navy/60">Best for:</span> {option.best_for}
      </p>
      {option.trade_offs.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-forge-beige-dark/40">
          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wide mb-1">Key considerations</p>
          <ul className="space-y-1">
            {option.trade_offs.slice(0, 2).map((t, i) => (
              <li key={i} className="text-[10px] text-amber-800 leading-snug flex gap-1">
                <span className="text-amber-400 shrink-0">·</span>
                <span>{t}</span>
              </li>
            ))}
            {option.trade_offs.length > 2 && (
              <li className="text-[10px] text-forge-navy/30 italic">+{option.trade_offs.length - 2} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
