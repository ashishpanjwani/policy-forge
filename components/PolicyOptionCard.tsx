"use client";

import { useState } from "react";
import { Check, X, Star, ChevronDown, ChevronUp } from "lucide-react";

export interface Coverage {
  name: string;
  limit: string;
  included: boolean;
  highlight: boolean;
}

export interface ActuarialWorkings {
  base_premium: number;
  adjustments: { label: string; amount: number }[];
  subtotal: number;
  group_discount_pct: number;
  group_discount_amount: number;
  final_premium: number;
}

export interface PolicyOption {
  tier_name: string;
  tier_level: "lean" | "balanced" | "premium";
  insurer_name?: string;
  product_name?: string;
  tagline: string;
  annual_premium_per_employee: number;
  total_annual_cost: number;
  sum_insured: string;
  meets_budget: boolean;
  budget_note: string;
  best_for: string;
  coverages: Coverage[];
  trade_offs: string[];
  actuarial_workings: ActuarialWorkings;
}

const TIER_CONFIG = {
  lean:     { badge: "Lean",     badgeColor: "bg-forge-sea/30 text-forge-navy",  border: "border-forge-beige-dark" },
  balanced: { badge: "Balanced", badgeColor: "bg-forge-navy text-white",         border: "border-forge-navy ring-2 ring-forge-navy/20" },
  premium:  { badge: "Premium",  badgeColor: "bg-forge-blue/20 text-forge-navy", border: "border-forge-blue/50" },
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export function PolicyOptionCard({ option }: { option: PolicyOption }) {
  const [tradeOffsOpen, setTradeOffsOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const cfg = TIER_CONFIG[option.tier_level];
  const isRecommended = option.tier_level === "balanced";

  return (
    <div className={`relative bg-white border-2 ${cfg.border} rounded-card flex flex-col`}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 bg-forge-navy text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">
            <Star className="w-2.5 h-2.5 fill-forge-blue text-forge-blue" />
            RECOMMENDED
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`px-5 pt-6 pb-4 ${isRecommended ? "pt-8" : ""}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${cfg.badgeColor}`}>
            {cfg.badge}
          </span>
          <BudgetBadge meets={option.meets_budget} note={option.budget_note} />
        </div>
        <h3 className="text-forge-navy font-bold text-xl mb-1">{option.tier_name}</h3>
        {option.insurer_name && (
          <p className="text-[10px] font-semibold text-forge-sea mb-1 uppercase tracking-wide">
            {option.insurer_name}
          </p>
        )}
        <p className="text-forge-navy/50 text-xs leading-relaxed">{option.tagline}</p>
      </div>

      {/* Pricing */}
      <div className={`mx-5 mb-4 rounded-xl overflow-hidden ${isRecommended ? "bg-forge-navy/5 border border-forge-navy/10" : "bg-forge-beige/60"}`}>
        <div className="p-3">
          <div className="flex items-baseline gap-1">
            <span className="text-forge-navy font-bold text-2xl">
              {fmt(option.annual_premium_per_employee)}
            </span>
            <span className="text-forge-navy/50 text-xs">/employee/year</span>
          </div>
          <div className="text-forge-navy/40 text-xs mt-0.5">
            {fmt(option.total_annual_cost)} total · {option.sum_insured}
          </div>
        </div>
        {option.actuarial_workings && (
          <>
            <button
              onClick={() => setPricingOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-left border-t border-black/5 hover:bg-black/5 transition-colors"
            >
              <span className="text-[10px] font-semibold text-forge-navy/50 tracking-wide">
                How this was priced
              </span>
              {pricingOpen
                ? <ChevronUp className="w-3 h-3 text-forge-navy/40 flex-shrink-0" />
                : <ChevronDown className="w-3 h-3 text-forge-navy/40 flex-shrink-0" />
              }
            </button>
            {pricingOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-black/5 space-y-1">
                <PricingRow label="Base premium" amount={option.actuarial_workings.base_premium} />
                {option.actuarial_workings.adjustments.map((adj) => (
                  <PricingRow key={adj.label} label={adj.label} amount={adj.amount} sign="+" />
                ))}
                <div className="border-t border-black/10 my-1" />
                <PricingRow label="Subtotal" amount={option.actuarial_workings.subtotal} muted />
                <PricingRow
                  label={`Group discount (${option.actuarial_workings.group_discount_pct}%)`}
                  amount={option.actuarial_workings.group_discount_amount}
                  sign="−"
                  green
                />
                <div className="border-t border-black/10 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-forge-navy">Final</span>
                  <span className="text-[10px] font-bold text-forge-navy">
                    {fmt(option.actuarial_workings.final_premium)}/yr
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Coverages */}
      <div className="px-5">
        <p className="text-[10px] font-semibold text-forge-navy/40 uppercase tracking-widest mb-2">
          Coverage Details
        </p>
        <ul className="space-y-2">
          {option.coverages.map((c) => (
            <li
              key={c.name}
              className={`flex items-start gap-2.5 ${c.highlight ? "bg-forge-blue/8 -mx-2 px-2 py-1 rounded-lg" : ""}`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {c.included
                  ? <Check className={`w-3.5 h-3.5 ${c.highlight ? "text-forge-blue" : "text-emerald-500"}`} />
                  : <X className="w-3.5 h-3.5 text-forge-navy/20" />
                }
              </span>
              <div className="min-w-0">
                <span className={`text-xs font-medium ${c.included ? "text-forge-navy" : "text-forge-navy/35"} ${c.highlight ? "font-semibold" : ""}`}>
                  {c.name}
                </span>
                <span className={`text-xs ${c.included ? "text-forge-navy/50" : "text-forge-navy/25"} ml-1`}>
                  — {c.limit}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Best for */}
      <div className="px-5 pt-4 pb-4">
        <p className="text-[10px] text-forge-navy/40 font-medium">
          <span className="font-semibold text-forge-navy/60">Best for:</span>{" "}
          {option.best_for}
        </p>
      </div>

      {/* Trade-offs — collapsible */}
      {option.trade_offs.length > 0 && (
        <div className="border-t border-forge-beige-dark/30 mt-auto">
          <button
            onClick={() => setTradeOffsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-amber-50/60 transition-colors rounded-b-card"
          >
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
              {option.trade_offs.length} trade-off{option.trade_offs.length > 1 ? "s" : ""} to consider
            </span>
            {tradeOffsOpen
              ? <ChevronUp className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              : <ChevronDown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            }
          </button>
          {tradeOffsOpen && (
            <div className="px-5 pb-5 bg-amber-50/60 border-t border-amber-100/80">
              <ul className="space-y-2 pt-3">
                {option.trade_offs.map((t, i) => (
                  <li key={i} className="text-xs text-amber-800 leading-relaxed flex gap-1.5">
                    <span className="flex-shrink-0 text-amber-400 mt-0.5">·</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PricingRow({
  label, amount, sign, muted, green,
}: {
  label: string; amount: number; sign?: "+" | "−"; muted?: boolean; green?: boolean;
}) {
  const color = green ? "text-emerald-600" : muted ? "text-forge-navy/40" : "text-forge-navy/70";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-[10px] ${color} leading-tight flex-1`}>{label}</span>
      <span className={`text-[10px] font-medium ${color} flex-shrink-0`}>
        {sign && <span className="mr-0.5">{sign}</span>}
        {fmt(amount)}
      </span>
    </div>
  );
}

function BudgetBadge({ meets, note }: { meets: boolean; note: string }) {
  return (
    <span
      title={note}
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        meets ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {meets ? "✓ Budget" : "↑ Over budget"}
    </span>
  );
}
