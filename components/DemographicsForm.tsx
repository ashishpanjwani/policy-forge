"use client";

export interface CompanyDemographics {
  company_name: string;
  industry: string;
  employee_count: number;
  avg_age: number;
  female_pct: number;
  city: string;
  health_notes: string;
}

interface DemographicsFormProps {
  value: CompanyDemographics;
  onChange: (d: CompanyDemographics) => void;
}

const INDUSTRIES = ["Tech / IT", "Healthcare", "Manufacturing", "Finance / BFSI", "Retail / E-commerce", "Education", "Other"];
const CITIES = ["Bangalore", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Chennai", "Other Metro", "Tier-2 City"];

export function DemographicsForm({ value, onChange }: DemographicsFormProps) {
  function set<K extends keyof CompanyDemographics>(key: K, val: CompanyDemographics[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-5">
      <SectionLabel>Company Profile</SectionLabel>

      {/* Company name + Industry */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company Name">
          <input
            type="text"
            value={value.company_name}
            onChange={(e) => set("company_name", e.target.value)}
            placeholder="e.g. Acme Technologies"
            className={inputClass}
          />
        </Field>
        <Field label="Industry">
          <select
            value={value.industry}
            onChange={(e) => set("industry", e.target.value)}
            className={inputClass}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </Field>
      </div>

      {/* Headcount + Avg age */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Employee Count">
          <input
            type="number"
            value={value.employee_count || ""}
            onChange={(e) => set("employee_count", Number(e.target.value))}
            placeholder="e.g. 80"
            min={1}
            className={inputClass}
          />
        </Field>
        <Field label="Average Age">
          <input
            type="number"
            value={value.avg_age || ""}
            onChange={(e) => set("avg_age", Number(e.target.value))}
            placeholder="e.g. 28"
            min={18}
            max={65}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Female % + City */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Female Employees — ${value.female_pct}%`}>
          <input
            type="range"
            value={value.female_pct}
            onChange={(e) => set("female_pct", Number(e.target.value))}
            min={0}
            max={100}
            step={5}
            className="w-full accent-forge-blue mt-1"
          />
          <div className="flex justify-between text-[10px] text-forge-navy/40 mt-0.5">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </Field>
        <Field label="Primary City">
          <select
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          >
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* Health notes */}
      <Field label="Known Health Risk Factors (optional)">
        <input
          type="text"
          value={value.health_notes}
          onChange={(e) => set("health_notes", e.target.value)}
          placeholder="e.g. high stress, sedentary workforce, night shifts"
          className={inputClass}
        />
      </Field>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-forge-navy/40 uppercase tracking-widest">
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-forge-navy mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-white border border-forge-beige-dark/70 rounded-lg px-3 py-2.5 text-sm text-forge-navy placeholder:text-forge-navy/30 focus:outline-none focus:border-forge-blue focus:ring-1 focus:ring-forge-blue/20 transition";
