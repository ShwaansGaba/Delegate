import { ALL_COUNTRIES } from "./portfolioDatabase";

export interface CommitteeTemplateDefinition {
  name: string;
  code: string;
  suggestedSeats: number;
  agenda: string;
  type: "un_body" | "un_agency" | "regional_body" | "indian_body" | "crisis";
  portfolioKind: "country" | "party" | "character";
  pool?: string[];
}

// Master pool of 90 most commonly allotted countries in Model UN
export const MASTER_STANDARD_POOL_NAMES: string[] = [
  "United States",
  "United Kingdom",
  "China",
  "France",
  "Russia",
  "India",
  "Germany",
  "Japan",
  "Brazil",
  "Canada",
  "Australia",
  "South Africa",
  "Saudi Arabia",
  "Egypt",
  "Turkey",
  "Indonesia",
  "Mexico",
  "South Korea",
  "Italy",
  "Spain",
  "Pakistan",
  "Iran",
  "Israel",
  "Ukraine",
  "Argentina",
  "Nigeria",
  "Kenya",
  "United Arab Emirates",
  "Poland",
  "Netherlands",
  "Sweden",
  "Norway",
  "Switzerland",
  "Belgium",
  "Algeria",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Bangladesh",
  "Belarus",
  "Bolivia",
  "Bulgaria",
  "Chile",
  "Colombia",
  "Cuba",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Ethiopia",
  "Finland",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "Iraq",
  "Ireland",
  "Jordan",
  "Kazakhstan",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Malaysia",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Nepal",
  "New Zealand",
  "North Korea",
  "Peru",
  "Philippines",
  "Portugal",
  "Qatar",
  "Romania",
  "Rwanda",
  "Senegal",
  "Serbia",
  "Singapore",
  "Sri Lanka",
  "Sudan",
  "Syria",
  "Thailand",
  "Tunisia",
  "Uganda",
  "Uruguay",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zimbabwe",
];

// Indian Political Parties for AIPPM, Lok Sabha, Rajya Sabha
export const MASTER_INDIAN_PARTIES: { name: string; code: string }[] = [
  { name: "Bharatiya Janata Party", code: "BJ" },
  { name: "Indian National Congress", code: "IN" },
  { name: "Aam Aadmi Party", code: "AA" },
  { name: "Bahujan Samaj Party", code: "BS" },
  { name: "Communist Party of India (Marxist)", code: "CM" },
  { name: "Communist Party of India", code: "CP" },
  { name: "Nationalist Congress Party", code: "NC" },
  { name: "National People's Party", code: "NP" },
  { name: "All India Trinamool Congress", code: "TC" },
  { name: "Samajwadi Party", code: "SP" },
  { name: "Dravida Munnetra Kazhagam", code: "DM" },
  { name: "All India Anna Dravida Munnetra Kazhagam", code: "AD" },
  { name: "Shiv Sena", code: "SS" },
  { name: "Shiv Sena (UBT)", code: "SU" },
  { name: "Nationalist Congress Party (SP)", code: "NS" },
  { name: "Janata Dal (United)", code: "JD" },
  { name: "Rashtriya Janata Dal", code: "RJ" },
  { name: "Telugu Desam Party", code: "TD" },
  { name: "YSR Congress Party", code: "YS" },
  { name: "Biju Janata Dal", code: "BD" },
  { name: "Bharat Rashtra Samithi", code: "BR" },
  { name: "Jharkhand Mukti Morcha", code: "JM" },
  { name: "Shiromani Akali Dal", code: "SD" },
  { name: "Jammu and Kashmir National Conference", code: "JK" },
  { name: "Peoples Democratic Party", code: "PD" },
  { name: "Lok Janshakti Party (Ram Vilas)", code: "LP" },
  { name: "Rashtriya Lok Dal", code: "RL" },
  { name: "Janata Dal (Secular)", code: "JS" },
  { name: "Jana Sena Party", code: "JS" },
  { name: "Tamilaga Vettri Kazhagam", code: "TV" },
  { name: "All India Majlis-e-Ittehadul Muslimeen", code: "AM" },
  { name: "Indian Union Muslim League", code: "IU" },
  { name: "Asom Gana Parishad", code: "AG" },
  { name: "All India United Democratic Front", code: "AF" },
  { name: "Mizo National Front", code: "MF" },
  { name: "Zoram People's Movement", code: "ZP" },
  { name: "Naga People's Front", code: "NF" },
  { name: "Sikkim Krantikari Morcha", code: "SK" },
  { name: "Sikkim Democratic Front", code: "SF" },
  { name: "Apna Dal (Sonelal)", code: "AS" },
  { name: "Hindustani Awam Morcha", code: "HA" },
  { name: "Rashtriya Lok Morcha", code: "RM" },
  { name: "Viduthalai Chiruthaigal Katchi", code: "VC" },
  { name: "Pattali Makkal Katchi", code: "PK" },
  { name: "Desiya Murpokku Dravida Kazhagam", code: "DK" },
  { name: "Kerala Congress (M)", code: "KC" },
  { name: "Revolutionary Socialist Party", code: "RS" },
  { name: "All India Forward Bloc", code: "FB" },
  { name: "Maharashtra Navnirman Sena", code: "MN" },
  { name: "Vanchit Bahujan Aghadi", code: "VA" },
  { name: "Azad Samaj Party (Kanshi Ram)", code: "AP" },
  { name: "Rashtriya Loktantrik Party", code: "RT" },
  { name: "Bharat Adivasi Party", code: "BA" },
  { name: "Voice of the People Party", code: "VP" },
  { name: "Independent Members", code: "IM" },
  { name: "Nominated Members", code: "NM" },
];

// UNSC Pool: P5 permanent members first, followed by top rotating pool
export const UNSC_POOL: string[] = [
  "United States",
  "United Kingdom",
  "China",
  "France",
  "Russia",
  "India",
  "Japan",
  "Germany",
  "Brazil",
  "South Africa",
  "Algeria",
  "Ecuador",
  "Guyana",
  "Republic of Korea",
  "Sierra Leone",
  "Slovenia",
  "Switzerland",
  "Malta",
  "Mozambique",
  "Pakistan",
  "Somalia",
  "Panama",
  "Denmark",
  "Greece",
  "Ghana",
  "United Arab Emirates",
  "Albania",
  "Gabon",
  "Kenya",
  "Mexico",
  "Ireland",
  "Norway",
  "Egypt",
  "Nigeria",
  "Saudi Arabia",
  "Indonesia",
  "Turkey",
  "Canada",
  "Australia",
  "Spain",
];

// UNHRC 47 Pool
export const UNHRC_POOL: string[] = [
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "India",
  "Japan",
  "Brazil",
  "South Africa",
  "Indonesia",
  "Argentina",
  "Bangladesh",
  "Belgium",
  "Benin",
  "Bulgaria",
  "Chile",
  "China",
  "Costa Rica",
  "Cote d'Ivoire",
  "Cuba",
  "Dominican Republic",
  "Eritrea",
  "Finland",
  "Gambia",
  "Georgia",
  "Ghana",
  "Honduras",
  "Kazakhstan",
  "Kuwait",
  "Kyrgyzstan",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Maldives",
  "Mexico",
  "Montenegro",
  "Morocco",
  "Netherlands",
  "Paraguay",
  "Qatar",
  "Romania",
  "Somalia",
  "Sudan",
  "United Arab Emirates",
  "Vietnam",
  "Algeria",
  "Georgia",
  "South Africa",
];

// G20 Pool
export const G20_POOL: string[] = [
  "Argentina",
  "Australia",
  "Brazil",
  "Canada",
  "China",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Mexico",
  "Republic of Korea",
  "Russia",
  "Saudi Arabia",
  "South Africa",
  "Turkey",
  "United Kingdom",
  "United States",
  "Spain",
  "Netherlands",
  "Singapore",
  "United Arab Emirates",
  "Switzerland",
  "Nigeria",
  "Egypt",
  "Vietnam",
];

// BRICS Pool
export const BRICS_POOL: string[] = [
  "Brazil",
  "Russia",
  "India",
  "China",
  "South Africa",
  "Egypt",
  "Ethiopia",
  "Iran",
  "United Arab Emirates",
  "Saudi Arabia",
  "Indonesia",
  "Argentina",
  "Turkey",
  "Nigeria",
  "Algeria",
  "Thailand",
  "Vietnam",
  "Kazakhstan",
  "Malaysia",
];

// SAARC Pool
export const SAARC_POOL: string[] = [
  "India",
  "Pakistan",
  "Bangladesh",
  "Sri Lanka",
  "Nepal",
  "Afghanistan",
  "Bhutan",
  "Maldives",
  "Myanmar",
  "Mauritius",
  "China",
  "Japan",
  "United States",
];

// NATO Pool
export const NATO_POOL: string[] = [
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Canada",
  "Italy",
  "Turkey",
  "Poland",
  "Norway",
  "Netherlands",
  "Spain",
  "Greece",
  "Belgium",
  "Portugal",
  "Denmark",
  "Czech Republic",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Slovakia",
  "Slovenia",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Croatia",
  "Albania",
  "Montenegro",
  "North Macedonia",
  "Finland",
  "Sweden",
  "Iceland",
  "Luxembourg",
];

// Comprehensive Delegato Template Presets
export const COMMITTEE_PRESET_TEMPLATES: CommitteeTemplateDefinition[] = [
  {
    name: "UNSC",
    code: "UNSC",
    suggestedSeats: 15,
    agenda: "[YOUR AGENDA]",
    type: "un_body",
    portfolioKind: "country",
    pool: UNSC_POOL,
  },
  {
    name: "DISEC",
    code: "DISEC",
    suggestedSeats: 40,
    agenda: "[YOUR AGENDA]",
    type: "un_body",
    portfolioKind: "country",
    pool: MASTER_STANDARD_POOL_NAMES,
  },
  {
    name: "UNHRC",
    code: "UNHRC",
    suggestedSeats: 47,
    agenda: "[YOUR AGENDA]",
    type: "un_body",
    portfolioKind: "country",
    pool: UNHRC_POOL,
  },
  {
    name: "UNEP",
    code: "UNEP",
    suggestedSeats: 30,
    agenda: "[YOUR AGENDA]",
    type: "un_agency",
    portfolioKind: "country",
    pool: MASTER_STANDARD_POOL_NAMES,
  },
  {
    name: "UNGA",
    code: "UNGA",
    suggestedSeats: 60,
    agenda: "[YOUR AGENDA]",
    type: "un_body",
    portfolioKind: "country",
    pool: MASTER_STANDARD_POOL_NAMES,
  },
  {
    name: "WHO",
    code: "WHO",
    suggestedSeats: 35,
    agenda: "[YOUR AGENDA]",
    type: "un_agency",
    portfolioKind: "country",
    pool: MASTER_STANDARD_POOL_NAMES,
  },
  {
    name: "AIPPM",
    code: "AIPPM",
    suggestedSeats: 50,
    agenda: "[YOUR AGENDA]",
    type: "indian_body",
    portfolioKind: "party",
  },
  {
    name: "Lok Sabha",
    code: "LS",
    suggestedSeats: 45,
    agenda: "[YOUR AGENDA]",
    type: "indian_body",
    portfolioKind: "party",
  },
  {
    name: "G20",
    code: "G20",
    suggestedSeats: 21,
    agenda: "[YOUR AGENDA]",
    type: "regional_body",
    portfolioKind: "country",
    pool: G20_POOL,
  },
  {
    name: "BRICS",
    code: "BRICS",
    suggestedSeats: 10,
    agenda: "[YOUR AGENDA]",
    type: "regional_body",
    portfolioKind: "country",
    pool: BRICS_POOL,
  },
  {
    name: "NATO",
    code: "NATO",
    suggestedSeats: 32,
    agenda: "[YOUR AGENDA]",
    type: "regional_body",
    portfolioKind: "country",
    pool: NATO_POOL,
  },
];

// Helper: look up ISO 2-letter country code from ALL_COUNTRIES
export function getCountryCode(name: string): string {
  const clean = name.trim().toLowerCase();
  const found = ALL_COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === clean ||
      (clean === "russia" && c.name.toLowerCase().includes("russia")) ||
      (clean.includes("united states") && c.name.toLowerCase().includes("united states")) ||
      (clean.includes("united kingdom") && c.name.toLowerCase().includes("united kingdom")) ||
      (clean.includes("korea") && c.name.toLowerCase().includes("korea"))
  );
  if (found) return found.code;

  // Fallback: two letters
  return name.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "UN";
}

/**
 * Returns EXACTLY `count` portfolios for a given committee, adhering to the requested seat count (min 3, max 150).
 * Draws first from the committee's specialized pool, then backfills from the master standard pool.
 */
export function getPortfoliosForCommittee(
  committeeName: string,
  requestedCount: number
): { name: string; code: string }[] {
  // Enforce strict limits: minimum 3, maximum 150
  const count = Math.max(3, Math.min(150, requestedCount || 30));
  const cleanName = (committeeName || "").trim().toUpperCase();

  // 1. Indian Bodies: AIPPM, Lok Sabha, Rajya Sabha
  if (
    cleanName.includes("AIPPM") ||
    cleanName.includes("LOK SABHA") ||
    cleanName.includes("RAJYA SABHA") ||
    cleanName === "LS" ||
    cleanName === "RS"
  ) {
    const list: { name: string; code: string }[] = [];
    const used = new Set<string>();

    for (const party of MASTER_INDIAN_PARTIES) {
      if (list.length >= count) break;
      if (!used.has(party.name.toLowerCase())) {
        used.add(party.name.toLowerCase());
        list.push(party);
      }
    }

    // If still need more to fulfill `count`, add indexed regional seats
    let idx = 1;
    while (list.length < count) {
      const name = `Independent MP ${idx}`;
      list.push({ name, code: `I${idx % 10}` });
      idx++;
    }

    return list.slice(0, count);
  }

  // 2. Specialized Bodies: UNSC, UNHRC, G20, BRICS, NATO, SAARC
  let candidatePoolNames: string[] = [];
  if (cleanName === "UNSC" || cleanName.includes("SECURITY COUNCIL")) {
    candidatePoolNames = UNSC_POOL;
  } else if (cleanName === "UNHRC" || cleanName.includes("HUMAN RIGHTS")) {
    candidatePoolNames = UNHRC_POOL;
  } else if (cleanName === "G20" || cleanName.includes("GROUP OF TWENTY")) {
    candidatePoolNames = G20_POOL;
  } else if (cleanName === "BRICS") {
    candidatePoolNames = BRICS_POOL;
  } else if (cleanName === "NATO") {
    candidatePoolNames = NATO_POOL;
  } else if (cleanName === "SAARC") {
    candidatePoolNames = SAARC_POOL;
  } else {
    // Default to the 90 most commonly allotted MUN countries
    candidatePoolNames = MASTER_STANDARD_POOL_NAMES;
  }

  const result: { name: string; code: string }[] = [];
  const added = new Set<string>();

  // Add from specific pool first
  for (const country of candidatePoolNames) {
    if (result.length >= count) break;
    const lower = country.toLowerCase();
    if (!added.has(lower)) {
      added.add(lower);
      result.push({ name: country, code: getCountryCode(country) });
    }
  }

  // Backfill from MASTER_STANDARD_POOL_NAMES if more seats are requested
  if (result.length < count) {
    for (const country of MASTER_STANDARD_POOL_NAMES) {
      if (result.length >= count) break;
      const lower = country.toLowerCase();
      if (!added.has(lower)) {
        added.add(lower);
        result.push({ name: country, code: getCountryCode(country) });
      }
    }
  }

  // Backfill from ALL_COUNTRIES if even more seats (e.g. 100-150 seats)
  if (result.length < count) {
    for (const country of ALL_COUNTRIES) {
      if (result.length >= count) break;
      const lower = country.name.toLowerCase();
      if (!added.has(lower)) {
        added.add(lower);
        result.push({ name: country.name, code: country.code });
      }
    }
  }

  return result.slice(0, count);
}
