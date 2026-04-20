import { groq } from "next-sanity";

// Index — safe public projection
export const ACTIVE_DEALS_QUERY = groq`
  *[_type == "deal" && status != "archived"] | order(coalesce(next_key_event_date, _updatedAt) asc) {
    _id,
    _updatedAt,
    acquirer,
    target,
    acquirer_ticker,
    target_ticker,
    "slug": slug.current,
    status,
    sector,
    equity_value,
    offer_price,
    premium,
    ctfn_estimated_close,
    announcement_date,
    next_key_event_date,
    next_key_event_label,
    deck
  }
`;

// Public deal — safe for any visitor
export const PUBLIC_DEAL_QUERY = groq`
  *[_type == "deal" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    acquirer,
    target,
    acquirer_ticker,
    target_ticker,
    "slug": slug.current,
    status,
    sector,
    target_jurisdiction,
    equity_value,
    shares_outstanding,
    offer_price,
    offer_terms,
    premium,
    premium_reference,
    termination_fee,
    termination_fee_pct,
    reverse_termination_fee,
    reverse_termination_fee_pct,
    termination_fee_notes,
    ctfn_estimated_close,
    announcement_date,
    published_date,
    next_key_event_date,
    next_key_event_label,
    outside_date,
    outside_date_final,
    closing_guidance,
    deck,
    key_risk_summary,
    allow_single_purchase,
    single_purchase_price,
    last_material_update,
    free_preview
  }
`;

// Paid deal — only after server-side paid check
export const PAID_DEAL_QUERY = groq`
  *[_type == "deal" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    acquirer,
    target,
    acquirer_ticker,
    target_ticker,
    "slug": slug.current,
    status,
    sector,
    target_jurisdiction,
    equity_value,
    shares_outstanding,
    offer_price,
    offer_terms,
    premium,
    premium_reference,
    termination_fee,
    termination_fee_pct,
    reverse_termination_fee,
    reverse_termination_fee_pct,
    termination_fee_notes,
    financing,
    ctfn_estimated_close,
    announcement_date,
    published_date,
    next_key_event_date,
    next_key_event_label,
    outside_date,
    outside_date_final,
    closing_guidance,
    deck,
    key_risk_summary,
    allow_single_purchase,
    single_purchase_price,
    last_material_update,
    free_preview,
    background,
    commentary,
    filings[]{
      _key,
      jurisdiction,
      display_name,
      outcome,
      outcome_summary,
      case_url,
      steps[]{ _key, label, expected_date, actual_date, note }
    },
    best_efforts,
    shareholder_votes[]{
      _key,
      party,
      outcome,
      label,
      outcome_summary,
      committed_pct,
      committed_notes,
      steps[]{ _key, label, expected_date, actual_date, note }
    },
    ctfn_target_company,
    ctfn_acquirer_company,
    ctfn_overlaps,
    ctfn_rationale_synergies,
    ctfn_competition,
    ctfn_customers,
    ctfn_precedent_transactions,
    risk_factors,
    shareholder_activism[]{
      _key,
      date,
      actor,
      stance,
      description,
      source_url
    },
    target_advisors,
    acquirer_advisors,
    documents[]{ _key, title, url }
  }
`;

export const DEAL_BY_SLUG_LIGHT_QUERY = groq`
  *[_type == "deal" && slug.current == $slug][0] {
    acquirer,
    target,
    "slug": slug.current,
    alert_summary
  }
`;

export const ALL_ACTIVE_DEAL_COUNT = groq`count(*[_type == "deal" && status != "archived"])`;

// Archive — closed / terminated deals
export const ARCHIVED_DEALS_QUERY = groq`
  *[_type == "deal" && status in ["closed", "terminated"]] | order(_updatedAt desc) {
    _id,
    _updatedAt,
    acquirer,
    target,
    acquirer_ticker,
    target_ticker,
    "slug": slug.current,
    status,
    sector,
    equity_value,
    offer_price,
    premium,
    ctfn_estimated_close,
    announcement_date,
    next_key_event_date,
    next_key_event_label,
    deck
  }
`;

// Event Calendar — deals with filings, votes, and key deal-level dates
export const CALENDAR_DEALS_QUERY = groq`
  *[_type == "deal" && status in ["pre_event", "ongoing"]] | order(coalesce(next_key_event_date, _updatedAt) asc) {
    _id,
    acquirer,
    target,
    target_ticker,
    acquirer_ticker,
    "slug": slug.current,
    status,
    sector,
    outside_date,
    outside_date_final,
    ctfn_estimated_close,
    announcement_date,
    next_key_event_date,
    next_key_event_label,
    filings[]{
      jurisdiction,
      display_name,
      steps[]{ label, expected_date, actual_date, note }
    },
    shareholder_votes[]{
      party,
      steps[]{ label, expected_date, actual_date, note }
    }
  }
`;

export const STALE_DEALS_QUERY = groq`
  *[_type == "deal" && status != "archived" && _updatedAt < $cutoff] {
    _id, acquirer, target, "slug": slug.current, _updatedAt
  }
`;
