import type { PortableTextBlock } from "@portabletext/react";

export type DealStatus =
  | "announced"
  | "regulatory_review"
  | "hsr_waiting"
  | "proxy_filed"
  | "vote_scheduled"
  | "closing_imminent"
  | "closed"
  | "terminated"
  | "archived";

export type Sector =
  | "technology"
  | "healthcare"
  | "financial_services"
  | "energy"
  | "consumer"
  | "industrials"
  | "media_telecom"
  | "other";

export interface DealListItem {
  _id: string;
  _updatedAt: string;
  acquirer: string;
  target: string;
  acquirer_ticker?: string;
  target_ticker?: string;
  slug: string;
  status: DealStatus;
  sector: Sector;
  equity_value?: number;
  offer_price?: number;
  premium?: number;
  ctfn_closing_probability?: number;
  ctfn_estimated_close?: string;
  announcement_date?: string;
  next_key_event_date?: string;
  next_key_event_label?: string;
  deck?: string;
}

export interface PublicDeal extends DealListItem {
  target_jurisdiction?: string;
  enterprise_value?: number;
  shares_outstanding?: number;
  offer_terms?: string;
  premium_reference?: string;
  termination_fee?: number;
  termination_fee_pct?: number;
  reverse_termination_fee?: number;
  reverse_termination_fee_pct?: number;
  termination_fee_notes?: string;
  published_date?: string;
  outside_date?: string;
  outside_date_final?: string;
  outside_date_notes?: string;
  closing_guidance?: string;
  key_risk_summary?: string;
  allow_single_purchase?: boolean;
  single_purchase_price?: number;
  last_material_update?: string;
  free_preview?: PortableTextBlock[];
}

export type FilingOutcome =
  | "pending"
  | "cleared"
  | "cleared_with_remedies"
  | "conditional"
  | "blocked"
  | "withdrawn";

export interface FilingStep {
  _key?: string;
  label: string;
  expected_date?: string;
  actual_date?: string;
  note?: string;
}

export interface Filing {
  _key?: string;
  jurisdiction: string;
  display_name?: string;
  outcome: FilingOutcome;
  outcome_summary?: string;
  steps?: FilingStep[];
}

export interface DealDocument {
  _key?: string;
  title?: string;
  url?: string;
}

export type ActivismStance =
  | "supportive"
  | "opposed"
  | "critical"
  | "neutral";

export interface ActivismEntry {
  _key?: string;
  date?: string;
  actor?: string;
  stance?: ActivismStance;
  description?: string;
  source_url?: string;
}

export type ShareholderVoteOutcome =
  | "pending"
  | "approved"
  | "rejected"
  | "postponed"
  | "not_required";

export interface ShareholderVote {
  outcome?: ShareholderVoteOutcome;
  label?: string;
  outcome_summary?: string;
  committed_pct?: number;
  committed_notes?: string;
  steps?: FilingStep[];
}

export interface PaidDeal extends PublicDeal {
  ctfn_probability_notes?: string;
  financing?: string;
  best_efforts?: string;
  shareholder_vote?: ShareholderVote;
  target_advisors?: string;
  acquirer_advisors?: string;
  filings?: Filing[];
  background?: PortableTextBlock[];
  commentary?: PortableTextBlock[];
  ctfn_analysis?: PortableTextBlock[];
  risk_factors?: PortableTextBlock[];
  shareholder_activism?: ActivismEntry[];
  documents?: DealDocument[];
}
