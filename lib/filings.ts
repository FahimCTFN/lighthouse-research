import type { Filing, FilingOutcome, FilingStep } from "@/lib/sanity/types";

export const JURISDICTION_LABEL: Record<string, string> = {
  HSR: "US — FTC / DOJ (HSR)",
  CFIUS: "US — CFIUS",
  STB: "US — STB",
  FCC: "US — FCC",
  State_AG: "US — State Attorney General",
  EC_Merger: "EU — European Commission",
  EC_FSR: "EU — Foreign Subsidies Regulation",
  CMA: "UK — Competition & Markets Authority",
  CADE: "Brazil — CADE",
  SAMR: "China — SAMR",
  CCB: "Canada — Competition Bureau",
  Turkey: "Turkey — Competition Authority",
  BKartA: "Germany — BKartA",
  CNA: "Mexico — CNA",
  Court: "Court / Litigation",
  Shareholder: "Shareholder Vote",
  Other: "Other",
};

export const OUTCOME_LABEL: Record<FilingOutcome, string> = {
  pending: "Pending",
  cleared: "Cleared",
  cleared_with_remedies: "Cleared with remedies",
  conditional: "Under investigation",
  blocked: "Blocked",
  withdrawn: "Withdrawn",
};

export const OUTCOME_BADGE: Record<FilingOutcome, string> = {
  pending: "bg-gray-100 text-gray-700 border border-gray-300",
  cleared: "bg-green-50 text-green-800 border border-green-200",
  cleared_with_remedies: "bg-green-50 text-green-800 border border-green-200",
  conditional: "bg-brand-gold-light text-brand-gold-ink border border-brand-gold/40",
  blocked: "bg-red-50 text-red-800 border border-red-200",
  withdrawn: "bg-gray-100 text-gray-500 border border-gray-300",
};

export type StepStatus = "done" | "next" | "overdue" | "upcoming" | "planned";

export interface StepWithStatus extends FilingStep {
  status: StepStatus;
}

export function annotateSteps(steps: FilingStep[] = []): StepWithStatus[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First pass: basic status per step
  const base = steps.map<StepWithStatus>((s) => {
    if (s.actual_date) return { ...s, status: "done" };
    if (!s.expected_date) return { ...s, status: "planned" };
    const exp = new Date(s.expected_date);
    if (exp < today) return { ...s, status: "overdue" };
    return { ...s, status: "upcoming" };
  });

  // Promote the first non-done (upcoming / overdue / planned) to "next"
  const nextIdx = base.findIndex((s) => s.status !== "done");
  if (nextIdx >= 0 && base[nextIdx].status === "upcoming") {
    base[nextIdx].status = "next";
  }
  return base;
}

export function filingDisplayName(filing: Filing): string {
  return (
    filing.display_name ||
    JURISDICTION_LABEL[filing.jurisdiction] ||
    filing.jurisdiction
  );
}

export function effectiveDate(step: FilingStep): string | undefined {
  return step.actual_date || step.expected_date;
}
