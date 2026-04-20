// Central regulator registry.
//
// Single source of truth consumed by:
//   - schemas/deal.ts (Sanity filing.jurisdiction enum)
//   - lib/filings.ts (JURISDICTION_LABEL)
//   - lib/calendar.ts (REGULATOR_SHORT)
//   - components/deals/RegulatoryFilings.tsx (filingShortName)
//
// `value` is the canonical ID — stable, unique, stored in Sanity. Never
// rename an existing value without migrating data. Add new rows freely.

export type RegulatorCategory =
  | "Antitrust"
  | "Finance"
  | "Sector"
  | "FDI"
  | "PUC"
  | "Court"
  | "Stock market"
  | "Other";

export type RegulatorLevel =
  | "National"
  | "Supranational"
  | "US state"
  | "Canadian province"
  | "Other subnational";

export interface Regulator {
  value: string; // enum value — stable
  acronym: string; // short label
  name: string; // full human-readable name
  country: string;
  category?: RegulatorCategory;
  level?: RegulatorLevel;
}

// Order here determines order in the Sanity dropdown. Keep loosely grouped
// by geography so editors can find things quickly.
export const REGULATORS: Regulator[] = [
  // ── US — Federal Antitrust / HSR ──────────────────────────────
  { value: "HSR",   acronym: "HSR",   name: "Hart-Scott-Rodino filing (FTC / DOJ)",                       country: "US",     category: "Antitrust", level: "National" },
  { value: "FTC",   acronym: "FTC",   name: "Federal Trade Commission",                                   country: "US",     category: "Antitrust", level: "National" },
  { value: "DOJ",   acronym: "DOJ",   name: "Department of Justice",                                      country: "US",     category: "Antitrust", level: "National" },

  // ── US — Federal Finance ──────────────────────────────────────
  { value: "FRB",   acronym: "FRB",   name: "Federal Reserve Board",                                      country: "US",     category: "Finance",   level: "National" },
  { value: "OCC",   acronym: "OCC",   name: "Office of the Comptroller of the Currency",                  country: "US",     category: "Finance",   level: "National" },
  { value: "FDIC",  acronym: "FDIC",  name: "Federal Deposit Insurance Corporation",                      country: "US",     category: "Finance",   level: "National" },
  { value: "FINRA", acronym: "FINRA", name: "Financial Industry Regulatory Authority",                    country: "US",     category: "Finance",   level: "National" },

  // ── US — Federal Sector / Security ────────────────────────────
  { value: "FCC",    acronym: "FCC",    name: "Federal Communications Commission",                        country: "US",     category: "Sector",    level: "National" },
  { value: "DOT",    acronym: "DOT",    name: "Department of Transportation",                             country: "US",     category: "Sector",    level: "National" },
  { value: "FAA",    acronym: "FAA",    name: "Federal Aviation Administration",                          country: "US",     category: "Sector",    level: "National" },
  { value: "NRC",    acronym: "NRC",    name: "Nuclear Regulatory Commission",                            country: "US",     category: "Sector",    level: "National" },
  { value: "FERC",   acronym: "FERC",   name: "Federal Energy Regulatory Commission",                     country: "US",     category: "Sector",    level: "National" },
  { value: "STB",    acronym: "STB",    name: "Surface Transportation Board",                             country: "US",     category: "Sector",    level: "National" },
  { value: "CFIUS",  acronym: "CFIUS",  name: "Committee on Foreign Investment in the US",                country: "US",     category: "FDI",       level: "National" },
  { value: "DHS",    acronym: "DHS",    name: "Department of Homeland Security",                          country: "US",     category: "Sector",    level: "National" },
  { value: "TSA",    acronym: "TSA",    name: "Transportation Security Administration",                   country: "US",     category: "Sector",    level: "National" },

  // ── US — State AG / state-level ────────────────────────────────
  { value: "State_AG",   acronym: "State AG", name: "State Attorney General (specify in display name)",   country: "US",     category: "Antitrust", level: "US state" },
  { value: "Delaware_SoS", acronym: "Delaware SoS", name: "Delaware Secretary of State",                  country: "US",     level: "US state" },

  // ── US — State PUCs / utility commissions ──────────────────────
  { value: "CPUC",   acronym: "CPUC",   name: "California Public Utilities Commission",                   country: "US",     category: "PUC",       level: "US state" },
  { value: "ICC",    acronym: "ICC",    name: "Illinois Commerce Commission",                             country: "US",     category: "PUC",       level: "US state" },
  { value: "IURC",   acronym: "IURC",   name: "Indiana Utility Regulatory Commission",                    country: "US",     category: "PUC",       level: "US state" },
  { value: "KPSC",   acronym: "KPSC",   name: "Kentucky Public Service Commission",                       country: "US",     category: "PUC",       level: "US state" },
  { value: "MPSC",   acronym: "MPSC",   name: "Montana Public Service Commission",                        country: "US",     category: "PUC",       level: "US state" },
  { value: "NPSC",   acronym: "NPSC",   name: "Nebraska Public Service Commission",                       country: "US",     category: "PUC",       level: "US state" },
  { value: "NJBPU",  acronym: "NJBPU",  name: "New Jersey Board of Public Utilities",                     country: "US",     category: "PUC",       level: "US state" },
  { value: "NMPRC",  acronym: "NMPRC",  name: "New Mexico Public Regulation Commission",                  country: "US",     category: "PUC",       level: "US state" },
  { value: "NYPSC",  acronym: "NYPSC",  name: "New York Public Service Commission",                       country: "US",     category: "PUC",       level: "US state" },
  { value: "NCUC",   acronym: "NCUC",   name: "North Carolina Utilities Commission",                      country: "US",     category: "PUC",       level: "US state" },
  { value: "PUCO",   acronym: "PUCO",   name: "Public Utilities Commission of Ohio",                      country: "US",     category: "PUC",       level: "US state" },
  { value: "APSC",   acronym: "APSC",   name: "Arkansas Public Service Commission",                       country: "US",     category: "PUC",       level: "US state" },
  { value: "PPUC",   acronym: "PPUC",   name: "Pennsylvania Public Utility Commission",                   country: "US",     category: "PUC",       level: "US state" },
  { value: "SDPUC",  acronym: "SDPUC",  name: "South Dakota Public Utilities Commission",                 country: "US",     category: "PUC",       level: "US state" },
  { value: "PSCW",   acronym: "PSCW",   name: "Public Service Commission of Wisconsin",                   country: "US",     category: "PUC",       level: "US state" },
  { value: "PUCT",   acronym: "PUCT",   name: "Public Utility Commission of Texas",                       country: "US",     category: "PUC",       level: "US state" },
  { value: "VSCC",   acronym: "VSCC",   name: "Virginia State Corporation Commission",                    country: "US",     category: "PUC",       level: "US state" },

  // ── US — State insurance / banking regulators ─────────────────
  { value: "ADI_Alabama", acronym: "ADI",     name: "Alabama Department of Insurance",                    country: "US",     category: "Finance",   level: "US state" },
  { value: "ADIFI",       acronym: "ADIFI",   name: "Arizona Department of Insurance and Financial Institutions", country: "US", category: "Finance", level: "US state" },
  { value: "CID",         acronym: "CID",     name: "Connecticut Insurance Department",                   country: "US",     category: "Finance",   level: "US state" },
  { value: "DDOI",        acronym: "DDOI",    name: "Delaware Department of Insurance",                   country: "US",     category: "Finance",   level: "US state" },
  { value: "OSBC",        acronym: "OSBC",    name: "Delaware Office of the State Bank Commissioner",     country: "US",     category: "Finance",   level: "US state" },
  { value: "IID",         acronym: "IID",     name: "Iowa Insurance Division",                            country: "US",     category: "Finance",   level: "US state" },
  { value: "MDI",         acronym: "MDI",     name: "Massachusetts Division of Insurance",                country: "US",     category: "Finance",   level: "US state" },
  { value: "Mass_DoB",    acronym: "Mass DoB", name: "Massachusetts Division of Banks",                   country: "US",     category: "Finance",   level: "US state" },
  { value: "NYSDFS",      acronym: "NYSDFS",  name: "New York Department of Financial Services",          country: "US",     category: "Finance",   level: "US state" },
  { value: "NDID",        acronym: "NDID",    name: "North Dakota Insurance Department",                  country: "US",     category: "Finance",   level: "US state" },
  { value: "DCBS_DFR",    acronym: "Oregon DCBS DFR", name: "Oregon Department of Consumer and Business Services — Division of Financial Regulation", country: "US", category: "Finance", level: "US state" },
  { value: "SDDOB",       acronym: "SDDOB",   name: "South Dakota Division of Banking",                   country: "US",     category: "Finance",   level: "US state" },
  { value: "TDI",         acronym: "TDI",     name: "Texas Department of Insurance",                      country: "US",     category: "Finance",   level: "US state" },
  { value: "TDB",         acronym: "TDB",     name: "Texas Department of Banking",                        country: "US",     category: "Finance",   level: "US state" },
  { value: "VDFR",        acronym: "VDFR",    name: "Vermont Department of Financial Regulation",         country: "US",     category: "Finance",   level: "US state" },
  { value: "NYSE",        acronym: "NYSE",    name: "New York Stock Exchange",                            country: "US",     category: "Stock market", level: "National" },

  // ── UK ────────────────────────────────────────────────────────
  { value: "CMA",     acronym: "CMA",    name: "Competition and Markets Authority",                       country: "UK",     category: "Antitrust", level: "National" },
  { value: "FCA",     acronym: "FCA",    name: "Financial Conduct Authority",                             country: "UK",     category: "Finance",   level: "National" },
  { value: "PRA",     acronym: "PRA",    name: "Prudential Regulation Authority",                         country: "UK",     category: "Finance",   level: "National" },
  { value: "NSIA",    acronym: "NSIA",   name: "National Security and Investment Act screening",          country: "UK",     category: "FDI",       level: "National" },
  { value: "UK_court", acronym: "UK court", name: "UK High Court / Court of England and Wales",           country: "UK",     category: "Court",     level: "National" },

  // ── EU / Supranational ────────────────────────────────────────
  { value: "EC_Merger", acronym: "EC",     name: "European Commission — Merger Control",                  country: "EU",     category: "Antitrust", level: "Supranational" },
  { value: "EC_FSR",    acronym: "EC FSR", name: "European Commission — Foreign Subsidies Regulation",    country: "EU",     category: "FDI",       level: "Supranational" },
  { value: "ECB",       acronym: "ECB",    name: "European Central Bank",                                 country: "EU",     category: "Finance",   level: "Supranational" },
  { value: "COMESA",    acronym: "COMESA", name: "Common Market for Eastern and Southern Africa",         country: "Regional (ESA)", category: "Antitrust", level: "Supranational" },

  // ── FDI (generic fallback; country in display name) ───────────
  { value: "FDI",       acronym: "FDI",    name: "Foreign Direct Investment screening (country in display name)", country: "(varies)", category: "FDI" },

  // ── Americas (ex-US) ──────────────────────────────────────────
  { value: "CCB",           acronym: "CCB",         name: "Canadian Competition Bureau",                  country: "Canada", category: "Antitrust", level: "National" },
  { value: "IRD_ISED",      acronym: "IRD – ISED",  name: "Investment Review Division — Innovation, Science and Economic Development Canada (Investment Canada Act)", country: "Canada", category: "FDI", level: "National" },
  { value: "CMHC",          acronym: "CMHC",        name: "Canada Mortgage and Housing Corporation",      country: "Canada", category: "Sector", level: "National" },
  { value: "Canada_MoF",    acronym: "Canada MoF",  name: "Canadian Minister of Finance",                 country: "Canada", level: "National" },
  { value: "BC_court",      acronym: "BC court",    name: "Supreme Court of British Columbia",            country: "Canada", category: "Court", level: "Canadian province" },
  { value: "Alberta_court", acronym: "Alberta court", name: "Court of King's Bench of Alberta",           country: "Canada", category: "Court", level: "Canadian province" },
  { value: "Ontario_court", acronym: "Ontario court", name: "Ontario Superior Court of Justice",          country: "Canada", category: "Court", level: "Canadian province" },
  { value: "TSX",           acronym: "TSX",         name: "Toronto Stock Exchange",                       country: "Canada", category: "Stock market" },

  { value: "CADE",    acronym: "CADE",    name: "Administrative Council for Economic Defense",             country: "Brazil",  category: "Antitrust", level: "National" },
  { value: "CNA",     acronym: "CNA",     name: "National Antitrust Commission (Comisión Nacional Antimonopolio)", country: "Mexico", category: "Antitrust" },
  { value: "COFECE",  acronym: "COFECE",  name: "Federal Economic Competition Commission",                 country: "Mexico",  category: "Antitrust", level: "National" },
  { value: "IFT",     acronym: "IFT",     name: "Instituto Federal de Telecomunicaciones",                 country: "Mexico",  category: "Sector",    level: "National" },
  { value: "ARTF",    acronym: "ARTF",    name: "Regulatory Agency of Rail Transportation of Mexico",      country: "Mexico",  category: "Sector",    level: "National" },
  { value: "SCT",     acronym: "SCT",     name: "Secretary of Communications and Transportation of Mexico", country: "Mexico", category: "Sector",    level: "National" },
  { value: "CNIE",    acronym: "CNIE",    name: "National Commission of Foreign Investments",              country: "Mexico",  category: "FDI",       level: "National" },
  { value: "Mexican_Rail_Union", acronym: "Mex Rail Union", name: "Mexican Rail Union",                   country: "Mexico" },

  { value: "FNE",         acronym: "FNE",          name: "National Economic Prosecutor's Office (Fiscalía Nacional Económica)", country: "Chile", category: "Antitrust", level: "National" },
  { value: "INDECOPI",    acronym: "INDECOPI",     name: "National Institute for the Defense of Free Competition and Protection of Intellectual Property", country: "Peru", category: "Antitrust", level: "National" },
  { value: "PROINVERSION", acronym: "PROINVERSIÓN", name: "Private Investment Promotion Agency",         country: "Peru",    category: "FDI" },

  // ── Europe (non-EU bodies listed above) ───────────────────────
  { value: "BKartA",       acronym: "BKartA",      name: "Federal Cartel Office (Bundeskartellamt)",       country: "Germany", category: "Antitrust", level: "National" },
  { value: "BMWK",         acronym: "BMWK",        name: "Federal Ministry for Economic Affairs and Climate Action", country: "Germany", category: "FDI", level: "National" },
  { value: "AWG",          acronym: "AWG",         name: "Außenwirtschaftsgesetz (Foreign Trade Act)",     country: "Germany", level: "National" },
  { value: "AWV",          acronym: "AWV",         name: "Außenwirtschaftsverordnung (Foreign Trade Ordinance)", country: "Germany", level: "National" },
  { value: "BaFin",        acronym: "BaFin",       name: "German Federal Financial Supervisory Authority", country: "Germany", category: "Finance",   level: "National" },
  { value: "CdlC",         acronym: "CdlC",        name: "Conseil de la Concurrence",                      country: "France",  category: "Antitrust", level: "National" },
  { value: "Minefi",       acronym: "Minefi",      name: "French Ministry of Economy, Finance and Industrial and Digital Sovereignty", country: "France", category: "Sector", level: "National" },
  { value: "ANFR",         acronym: "ANFR",        name: "Agence Nationale des Fréquences",                country: "France",  level: "National" },
  { value: "ARCEP",        acronym: "ARCEP",       name: "National Telecoms Regulator (Ministry of Space / Telecoms)", country: "France", level: "National" },
  { value: "AGCM",         acronym: "AGCM",        name: "Italian Competition Authority (Autorità Garante della Concorrenza e del Mercato)", country: "Italy", category: "Antitrust", level: "National" },
  { value: "IPMO",         acronym: "IPMO",        name: "Italian Prime Minister's Office (Golden Powers)", country: "Italy", level: "National" },
  { value: "PCM",          acronym: "PCM",         name: "Presidency of the Council of Ministers",          country: "Italy",   category: "FDI",       level: "National" },
  { value: "CONSOB",       acronym: "CONSOB",      name: "Commissione Nazionale per le Società e la Borsa", country: "Italy",   category: "Stock market" },
  { value: "CNMC",         acronym: "CNMC",        name: "Comisión Nacional de los Mercados y la Competencia", country: "Spain", category: "Antitrust", level: "National" },
  { value: "SFI",          acronym: "SFI",         name: "Directorate General for International Trade and Investments (Dirección General de Comercio Internacional e Inversiones)", country: "Spain", category: "FDI", level: "National" },
  { value: "FDI_Spain",    acronym: "FDI Spain",   name: "Spanish Directorate General for Trade and Investment (FDI screening)", country: "Spain", category: "FDI", level: "National" },
  { value: "BdE",          acronym: "BdE",         name: "Banco de España",                                 country: "Spain",   category: "Finance" },
  { value: "CNMV",         acronym: "CNMV",        name: "National Securities Market Commission of Spain",  country: "Spain",   category: "Stock market" },
  { value: "AdC",          acronym: "AdC",         name: "Autoridade da Concorrência",                      country: "Portugal", category: "Antitrust", level: "National" },
  { value: "AFCA",         acronym: "AFCA",        name: "Austrian Federal Competition Authority",          country: "Austria", category: "Antitrust", level: "National" },
  { value: "AFMA",         acronym: "AFMA",        name: "Austrian Financial Market Authority",             country: "Austria" },
  { value: "ComCo",        acronym: "ComCo",       name: "Swiss Competition Commission",                    country: "Switzerland", category: "Antitrust", level: "National" },
  { value: "FINMA",        acronym: "FINMA",       name: "Swiss Financial Market Supervisory Authority",    country: "Switzerland", category: "Finance", level: "National" },
  { value: "AFM",          acronym: "AFM",         name: "Dutch Authority for the Financial Markets",       country: "Netherlands", category: "Finance", level: "National" },
  { value: "DCB",          acronym: "DCB",         name: "De Nederlandsche Bank (Dutch Central Bank)",      country: "Netherlands", category: "Finance" },
  { value: "BTI",          acronym: "BTI",         name: "Bureau Toetsing Investeringen",                   country: "Netherlands", category: "FDI" },
  { value: "ISC",          acronym: "ISC",         name: "Interfederal Screening Commission of Belgium",    country: "Belgium",  category: "Antitrust", level: "National" },
  { value: "NCA",          acronym: "NCA",         name: "Norwegian Competition Authority",                 country: "Norway",   category: "Antitrust", level: "National" },
  { value: "Konkurrensverket", acronym: "Konkurrensverket", name: "Swedish Competition Authority",          country: "Sweden",   category: "Antitrust", level: "National" },
  { value: "ISP",          acronym: "ISP",         name: "Inspectorate of Strategic Products",              country: "Sweden",   category: "FDI" },
  { value: "MHSR",         acronym: "MHSR",        name: "Ministry of Economy of the Slovak Republic",      country: "Slovakia", category: "FDI",       level: "National" },
  { value: "MGTS",         acronym: "MGTŠ",        name: "Ministry of the Economy, Tourism and Sport (FDI)", country: "Slovenia", category: "FDI", level: "National" },
  { value: "UOKiK",        acronym: "UOKiK",       name: "Office of Competition and Consumer Protection (Urząd Ochrony Konkurencji i Konsumentów)", country: "Poland", category: "Antitrust", level: "National" },
  { value: "MRiT",         acronym: "MRiT",        name: "Ministry of Development and Technology (Ministerstwo Rozwoju i Technologii)", country: "Poland", category: "FDI", level: "National" },
  { value: "RCC",          acronym: "RCC",         name: "Romanian Competition Council (Consiliul Concurenței)", country: "Romania", category: "Antitrust", level: "National" },
  { value: "CEISD",        acronym: "CEISD",       name: "Commission for the Examination of Foreign Direct Investments", country: "Romania", category: "FDI", level: "National" },
  { value: "CPC_Cyprus",   acronym: "CPC",         name: "Commission for the Protection of Competition",   country: "Cyprus",   category: "Antitrust", level: "National" },
  { value: "CPC_Serbia",   acronym: "CPC Serbia",  name: "Commission for Protection of Competition of the Republic of Serbia", country: "Serbia", category: "Antitrust", level: "National" },
  { value: "CC_Moldova",   acronym: "CC",          name: "Competition Council of the Republic of Moldova (Consiliul Concurenței)", country: "Moldova", category: "Antitrust", level: "National" },
  { value: "IMA",          acronym: "IMA",         name: "Invest Moldova Agency (Agenția de Investiții din Republica Moldova)", country: "Moldova", category: "FDI", level: "National" },
  { value: "AMCU",         acronym: "AMCU",        name: "Antimonopoly Committee of Ukraine (Антимонопольний комітет України)", country: "Ukraine", category: "Antitrust", level: "National" },
  { value: "UkraineInvest", acronym: "UkraineInvest", name: "Ministry of Economy of Ukraine — Investment Promotion Office", country: "Ukraine", category: "FDI", level: "National" },
  { value: "Turkey",       acronym: "TCA",         name: "Turkish Competition Authority",                   country: "Turkey",   category: "Antitrust", level: "National" },
  { value: "DETE",         acronym: "DETE",        name: "Minister for Enterprise, Trade and Employment",   country: "Ireland",  category: "Antitrust", level: "National" },
  { value: "CCPC",         acronym: "CCPC",        name: "Competition and Consumer Protection Commission",  country: "Ireland",  category: "Antitrust" },
  { value: "CBI",          acronym: "CBI",         name: "Central Bank of Ireland",                         country: "Ireland",  category: "Finance" },
  { value: "MFSA",         acronym: "MFSA",        name: "Malta Financial Services Authority",              country: "Malta",    category: "FDI" },
  { value: "CSSF",         acronym: "CSSF",        name: "Commission de Surveillance du Secteur Financier", country: "Luxembourg", category: "FDI" },
  { value: "CS",           acronym: "CS",          name: "Court of Session in Edinburgh",                   country: "Scotland", category: "Court", level: "Other subnational" },
  { value: "RCJ",          acronym: "RCJ",         name: "Royal Court of Jersey",                           country: "Jersey",   category: "Court",     level: "National" },
  { value: "JCRA",         acronym: "JCRA",        name: "Jersey Competition Regulatory Authority",         country: "Jersey",   category: "Antitrust" },
  { value: "JFSC",         acronym: "JFSC",        name: "Jersey Financial Services Commission",            country: "Jersey",   category: "Finance" },
  { value: "GFSC",         acronym: "GFSC",        name: "Guernsey Financial Services Commission",          country: "Guernsey", category: "Finance" },
  { value: "IOMFSA",       acronym: "IOMFSA",      name: "Isle of Man Financial Services Authority",        country: "Isle of Man", category: "Finance" },

  // ── Middle East / Africa ──────────────────────────────────────
  { value: "GAC",       acronym: "GAC",     name: "General Authority for Competition",                    country: "Saudi Arabia", category: "Antitrust", level: "National" },
  { value: "MoE_UAE",   acronym: "UAE MoE", name: "Ministry of Economy — Competition Department",         country: "UAE",     category: "Antitrust", level: "National" },
  { value: "Dubai_FDI", acronym: "Dubai FDI", name: "Ministry of Economy — Department of Foreign Direct Investment (FDI Unit)", country: "UAE", category: "FDI", level: "National" },
  { value: "DFSA",      acronym: "DFSA",    name: "Dubai Financial Services Authority",                   country: "UAE",     category: "Finance" },
  { value: "ICA",       acronym: "ICA",     name: "Israeli Competition Authority",                        country: "Israel",  category: "Antitrust", level: "National" },
  { value: "IIA",       acronym: "IIA",     name: "Israeli Innovation Authority",                         country: "Israel" },
  { value: "ECA",       acronym: "ECA",     name: "Egyptian Competition Authority",                       country: "Egypt",   category: "Antitrust", level: "National" },
  { value: "MCC",       acronym: "MCC",     name: "Moroccan Competition Council",                         country: "Morocco", category: "Antitrust", level: "National" },
  { value: "SACC",      acronym: "SACC",    name: "South African Competition Commission",                 country: "South Africa", category: "Antitrust", level: "National" },
  { value: "SARB",      acronym: "SARB",    name: "South African Reserve Bank",                           country: "South Africa", category: "Finance", level: "National" },
  { value: "JSE",       acronym: "JSE",     name: "Johannesburg Stock Exchange",                          country: "South Africa", category: "Stock market" },
  { value: "CAK",       acronym: "CAK",     name: "Competition Authority of Kenya",                       country: "Kenya",   category: "Antitrust" },
  { value: "TFTA",      acronym: "TFTA",    name: "Tanzania Fair Competition Act",                        country: "Tanzania", category: "Antitrust", level: "National" },
  { value: "CRA",       acronym: "CRA",     name: "Autoridade Reguladora da Concorrência",                country: "Mozambique", category: "Antitrust" },

  // ── Asia-Pacific ──────────────────────────────────────────────
  { value: "SAMR",      acronym: "SAMR",    name: "State Administration for Market Regulation",           country: "China",     category: "Antitrust", level: "National" },
  { value: "JFTC",      acronym: "JFTC",    name: "Japan Fair Trade Commission",                          country: "Japan",     category: "Antitrust", level: "National" },
  { value: "FEFTA",     acronym: "FEFTA",   name: "Foreign Exchange and Foreign Trade Act",               country: "Japan",     category: "FDI" },
  { value: "JFSA",      acronym: "FSA",     name: "Japan Financial Services Agency",                      country: "Japan",     category: "FDI" },
  { value: "KFTC",      acronym: "KFTC",    name: "Korea Fair Trade Commission",                          country: "South Korea", category: "Antitrust", level: "National" },
  { value: "TFTC",      acronym: "TFTC",    name: "Taiwan Fair Trade Commission",                         country: "Taiwan",    category: "Antitrust", level: "National" },
  { value: "CCI",       acronym: "CCI",     name: "Competition Commission of India",                      country: "India",     category: "Antitrust", level: "National" },
  { value: "SEBI",      acronym: "SEBI",    name: "Securities and Exchange Board of India",               country: "India",     category: "Stock market" },
  { value: "CCCS",      acronym: "CCCS",    name: "Competition and Consumer Commission of Singapore",     country: "Singapore", category: "Antitrust", level: "National" },
  { value: "MAS",       acronym: "MAS",     name: "Monetary Authority of Singapore",                      country: "Singapore", category: "FDI" },
  { value: "MyCC",      acronym: "MyCC",    name: "Malaysia Competition Commission",                      country: "Malaysia",  category: "Antitrust", level: "National" },
  { value: "LFSA",      acronym: "LFSA",    name: "Labuan Financial Services Authority",                  country: "Malaysia",  category: "Finance" },
  { value: "BMSB",      acronym: "BMSB",    name: "Bursa Malaysia Securities Bhd",                        country: "Malaysia",  category: "Stock market" },
  { value: "KPPU",      acronym: "KPPU",    name: "Commission for the Supervision of Business Competition (Komisi Pengawas Persaingan Usaha)", country: "Indonesia", category: "Antitrust", level: "National" },
  { value: "OTCC",      acronym: "OTCC",    name: "Office of Trade Competition Commission",               country: "Thailand",  category: "Antitrust", level: "National" },
  { value: "PCC",       acronym: "PCC",     name: "Philippine Competition Commission",                    country: "Philippines", category: "Antitrust", level: "National" },
  { value: "VCC",       acronym: "VCC",     name: "Vietnam Competition Commission",                       country: "Vietnam",   category: "Antitrust", level: "National" },
  { value: "VCCA",      acronym: "VCCA",    name: "Vietnam Competition and Consumer Authority",           country: "Vietnam",   category: "Antitrust", level: "National" },
  { value: "ACCC",      acronym: "ACCC",    name: "Australian Competition and Consumer Commission",       country: "Australia", category: "Antitrust", level: "National" },
  { value: "ASIC",      acronym: "ASIC",    name: "Australian Securities & Investments Commission",       country: "Australia", category: "Finance",   level: "National" },
  { value: "FIRB",      acronym: "FIRB",    name: "Foreign Investment Review Board",                      country: "Australia", category: "FDI",       level: "National" },
  { value: "ASX",       acronym: "ASX",     name: "Australian Securities Exchange",                       country: "Australia", category: "Finance",   level: "National" },
  { value: "Australia_court", acronym: "Australia court", name: "Federal Court of Australia",             country: "Australia", category: "Court",     level: "National" },
  { value: "SCNSW",     acronym: "SCNSW",   name: "Supreme Court of New South Wales",                     country: "Australia", category: "Court",     level: "Other subnational" },
  { value: "SCWA",      acronym: "SCWA",    name: "Supreme Court of Western Australia",                   country: "Australia", category: "Court",     level: "Other subnational" },
  { value: "NZCC",      acronym: "NZCC",    name: "New Zealand Commerce Commission",                      country: "New Zealand", category: "Antitrust", level: "National" },
  { value: "OIO",       acronym: "OIO",     name: "Overseas Investment Office",                           country: "New Zealand", category: "FDI",     level: "National" },
  { value: "ICCC",      acronym: "ICCC",    name: "PNG Independent Consumer and Competition Commission",  country: "Papua New Guinea", category: "Antitrust" },
  { value: "SFC",       acronym: "SFC",     name: "Securities and Futures Commission of Hong Kong",       country: "Hong Kong", category: "Stock market" },

  // ── Central Asia / post-Soviet ────────────────────────────────
  { value: "APDC",      acronym: "APDC",    name: "Agency for Protection and Development of Competition", country: "Kazakhstan", category: "Antitrust", level: "National" },
  { value: "MFA_CI",    acronym: "MFA-CI",  name: "Ministry of Foreign Affairs — Committee for Investments", country: "Kazakhstan", category: "FDI", level: "National" },
  { value: "SSACMC",    acronym: "SSACMC",  name: "State Service for Antimonopoly and Consumer Market Control", country: "Azerbaijan", category: "Antitrust" },

  // ── Offshore financial centres ────────────────────────────────
  { value: "CBB",       acronym: "CBB",     name: "Central Bank of The Bahamas",                          country: "Bahamas",  category: "Finance" },
  { value: "SCB",       acronym: "SCB",     name: "Securities Commission of the Bahamas",                 country: "Bahamas",  category: "Stock market" },
  { value: "BVIFSC",    acronym: "BVIFSC",  name: "British Virgin Islands Financial Services Commission", country: "British Virgin Islands", category: "Finance" },
  { value: "CIMA",      acronym: "CIMA",    name: "Cayman Islands Monetary Authority",                    country: "Cayman Islands", category: "Finance" },
  { value: "TBLB",      acronym: "TBLB",    name: "Trade and Business Licensing Board",                   country: "Cayman Islands", category: "Sector" },
  { value: "MFSC",      acronym: "MFSC",    name: "Mauritius Financial Services Commission",              country: "Mauritius", category: "Finance" },
  { value: "BMA",       acronym: "BMA",     name: "Bermuda Monetary Authority",                           country: "Bermuda",  category: "Finance" },

  // ── Generic catch-alls (kept last so editors scroll past specifics first) ─
  { value: "Court",       acronym: "Court",   name: "Court / Litigation",                                 country: "(varies)", category: "Court" },
  { value: "Shareholder", acronym: "Vote",    name: "Shareholder Vote",                                   country: "(varies)" },
  { value: "SRA",         acronym: "SRA",     name: "Solicitors Regulation Authority",                    country: "UK" },
  { value: "Other",       acronym: "Other",   name: "Other (specify in display name)",                    country: "(varies)", category: "Other" },
];

// ── Derived maps ────────────────────────────────────────────────

// Full label for use in UI headers (e.g. "Germany — BKartA")
export const JURISDICTION_LABEL: Record<string, string> = Object.fromEntries(
  REGULATORS.map((r) => [r.value, r.country === "(varies)" ? r.name : `${r.country} — ${r.name}`]),
);

// Short label for tight spaces (badges, calendar)
export const REGULATOR_SHORT: Record<string, string> = Object.fromEntries(
  REGULATORS.map((r) => [r.value, r.acronym]),
);

// Sanity option list
export const REGULATOR_OPTIONS = REGULATORS.map((r) => ({
  title: r.country === "(varies)" ? r.name : `${r.country} — ${r.name} (${r.acronym})`,
  value: r.value,
}));
