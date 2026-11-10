import type { MunPortfolio } from "./types";

export interface PortfolioItem {
  name: string;
  code: string;
  category: "country" | "politician" | "party" | "regional";
  designation?: string;
}

// 193 UN Member States + Common MUN country designations
export const ALL_COUNTRIES: PortfolioItem[] = [
  { name: "Afghanistan", code: "AF", category: "country" },
  { name: "Albania", code: "AL", category: "country" },
  { name: "Algeria", code: "DZ", category: "country" },
  { name: "Andorra", code: "AD", category: "country" },
  { name: "Angola", code: "AO", category: "country" },
  { name: "Antigua and Barbuda", code: "AG", category: "country" },
  { name: "Argentina", code: "AR", category: "country" },
  { name: "Armenia", code: "AM", category: "country" },
  { name: "Australia", code: "AU", category: "country" },
  { name: "Austria", code: "AT", category: "country" },
  { name: "Azerbaijan", code: "AZ", category: "country" },
  { name: "Bahamas", code: "BS", category: "country" },
  { name: "Bahrain", code: "BH", category: "country" },
  { name: "Bangladesh", code: "BD", category: "country" },
  { name: "Barbados", code: "BB", category: "country" },
  { name: "Belarus", code: "BY", category: "country" },
  { name: "Belgium", code: "BE", category: "country" },
  { name: "Belize", code: "BZ", category: "country" },
  { name: "Benin", code: "BJ", category: "country" },
  { name: "Bhutan", code: "BT", category: "country" },
  { name: "Bolivia", code: "BO", category: "country" },
  { name: "Bosnia and Herzegovina", code: "BA", category: "country" },
  { name: "Botswana", code: "BW", category: "country" },
  { name: "Brazil", code: "BR", category: "country" },
  { name: "Brunei Darussalam", code: "BN", category: "country" },
  { name: "Bulgaria", code: "BG", category: "country" },
  { name: "Burkina Faso", code: "BF", category: "country" },
  { name: "Burundi", code: "BI", category: "country" },
  { name: "Cabo Verde", code: "CV", category: "country" },
  { name: "Cambodia", code: "KH", category: "country" },
  { name: "Cameroon", code: "CM", category: "country" },
  { name: "Canada", code: "CA", category: "country" },
  { name: "Central African Republic", code: "CF", category: "country" },
  { name: "Chad", code: "TD", category: "country" },
  { name: "Chile", code: "CL", category: "country" },
  { name: "China", code: "CN", category: "country" },
  { name: "Colombia", code: "CO", category: "country" },
  { name: "Comoros", code: "KM", category: "country" },
  { name: "Congo (Republic of the)", code: "CG", category: "country" },
  { name: "Costa Rica", code: "CR", category: "country" },
  { name: "Cote d'Ivoire", code: "CI", category: "country" },
  { name: "Croatia", code: "HR", category: "country" },
  { name: "Cuba", code: "CU", category: "country" },
  { name: "Cyprus", code: "CY", category: "country" },
  { name: "Czech Republic", code: "CZ", category: "country" },
  { name: "Democratic People's Republic of Korea", code: "KP", category: "country", designation: "North Korea" },
  { name: "Democratic Republic of the Congo", code: "CD", category: "country" },
  { name: "Denmark", code: "DK", category: "country" },
  { name: "Djibouti", code: "DJ", category: "country" },
  { name: "Dominica", code: "DM", category: "country" },
  { name: "Dominican Republic", code: "DO", category: "country" },
  { name: "Ecuador", code: "EC", category: "country" },
  { name: "Egypt", code: "EG", category: "country" },
  { name: "El Salvador", code: "SV", category: "country" },
  { name: "Equatorial Guinea", code: "GQ", category: "country" },
  { name: "Eritrea", code: "ER", category: "country" },
  { name: "Estonia", code: "EE", category: "country" },
  { name: "Eswatini", code: "SZ", category: "country" },
  { name: "Ethiopia", code: "ET", category: "country" },
  { name: "Fiji", code: "FJ", category: "country" },
  { name: "Finland", code: "FI", category: "country" },
  { name: "France", code: "FR", category: "country" },
  { name: "Gabon", code: "GA", category: "country" },
  { name: "Gambia", code: "GM", category: "country" },
  { name: "Georgia", code: "GE", category: "country" },
  { name: "Germany", code: "DE", category: "country" },
  { name: "Ghana", code: "GH", category: "country" },
  { name: "Greece", code: "GR", category: "country" },
  { name: "Grenada", code: "GD", category: "country" },
  { name: "Guatemala", code: "GT", category: "country" },
  { name: "Guinea", code: "GN", category: "country" },
  { name: "Guinea-Bissau", code: "GW", category: "country" },
  { name: "Guyana", code: "GY", category: "country" },
  { name: "Haiti", code: "HT", category: "country" },
  { name: "Honduras", code: "HN", category: "country" },
  { name: "Hungary", code: "HU", category: "country" },
  { name: "Iceland", code: "IS", category: "country" },
  { name: "India", code: "IN", category: "country" },
  { name: "Indonesia", code: "ID", category: "country" },
  { name: "Iran", code: "IR", category: "country" },
  { name: "Iraq", code: "IQ", category: "country" },
  { name: "Ireland", code: "IE", category: "country" },
  { name: "Israel", code: "IL", category: "country" },
  { name: "Italy", code: "IT", category: "country" },
  { name: "Jamaica", code: "JM", category: "country" },
  { name: "Japan", code: "JP", category: "country" },
  { name: "Jordan", code: "JO", category: "country" },
  { name: "Kazakhstan", code: "KZ", category: "country" },
  { name: "Kenya", code: "KE", category: "country" },
  { name: "Kiribati", code: "KI", category: "country" },
  { name: "Kuwait", code: "KW", category: "country" },
  { name: "Kyrgyzstan", code: "KG", category: "country" },
  { name: "Laos", code: "LA", category: "country" },
  { name: "Latvia", code: "LV", category: "country" },
  { name: "Lebanon", code: "LB", category: "country" },
  { name: "Lesotho", code: "LS", category: "country" },
  { name: "Liberia", code: "LR", category: "country" },
  { name: "Libya", code: "LY", category: "country" },
  { name: "Liechtenstein", code: "LI", category: "country" },
  { name: "Lithuania", code: "LT", category: "country" },
  { name: "Luxembourg", code: "LU", category: "country" },
  { name: "Madagascar", code: "MG", category: "country" },
  { name: "Malawi", code: "MW", category: "country" },
  { name: "Malaysia", code: "MY", category: "country" },
  { name: "Maldives", code: "MV", category: "country" },
  { name: "Mali", code: "ML", category: "country" },
  { name: "Malta", code: "MT", category: "country" },
  { name: "Marshall Islands", code: "MH", category: "country" },
  { name: "Mauritania", code: "MR", category: "country" },
  { name: "Mauritius", code: "MU", category: "country" },
  { name: "Mexico", code: "MX", category: "country" },
  { name: "Micronesia", code: "FM", category: "country" },
  { name: "Moldova", code: "MD", category: "country" },
  { name: "Monaco", code: "MC", category: "country" },
  { name: "Mongolia", code: "MN", category: "country" },
  { name: "Montenegro", code: "ME", category: "country" },
  { name: "Morocco", code: "MA", category: "country" },
  { name: "Mozambique", code: "MZ", category: "country" },
  { name: "Myanmar", code: "MM", category: "country" },
  { name: "Namibia", code: "NA", category: "country" },
  { name: "Nauru", code: "NR", category: "country" },
  { name: "Nepal", code: "NP", category: "country" },
  { name: "Netherlands", code: "NL", category: "country" },
  { name: "New Zealand", code: "NZ", category: "country" },
  { name: "Nicaragua", code: "NI", category: "country" },
  { name: "Niger", code: "NE", category: "country" },
  { name: "Nigeria", code: "NG", category: "country" },
  { name: "North Macedonia", code: "MK", category: "country" },
  { name: "Norway", code: "NO", category: "country" },
  { name: "Oman", code: "OM", category: "country" },
  { name: "Pakistan", code: "PK", category: "country" },
  { name: "Palau", code: "PW", category: "country" },
  { name: "Panama", code: "PA", category: "country" },
  { name: "Papua New Guinea", code: "PG", category: "country" },
  { name: "Paraguay", code: "PY", category: "country" },
  { name: "Peru", code: "PE", category: "country" },
  { name: "Philippines", code: "PH", category: "country" },
  { name: "Poland", code: "PL", category: "country" },
  { name: "Portugal", code: "PT", category: "country" },
  { name: "Qatar", code: "QA", category: "country" },
  { name: "Republic of Korea", code: "KR", category: "country", designation: "South Korea" },
  { name: "Romania", code: "RO", category: "country" },
  { name: "Russian Federation", code: "RU", category: "country", designation: "Russia" },
  { name: "Rwanda", code: "RW", category: "country" },
  { name: "Saint Kitts and Nevis", code: "KN", category: "country" },
  { name: "Saint Lucia", code: "LC", category: "country" },
  { name: "Saint Vincent and the Grenadines", code: "VC", category: "country" },
  { name: "Samoa", code: "WS", category: "country" },
  { name: "San Marino", code: "SM", category: "country" },
  { name: "Sao Tome and Principe", code: "ST", category: "country" },
  { name: "Saudi Arabia", code: "SA", category: "country" },
  { name: "Senegal", code: "SN", category: "country" },
  { name: "Serbia", code: "RS", category: "country" },
  { name: "Seychelles", code: "SC", category: "country" },
  { name: "Sierra Leone", code: "SL", category: "country" },
  { name: "Singapore", code: "SG", category: "country" },
  { name: "Slovakia", code: "SK", category: "country" },
  { name: "Slovenia", code: "SI", category: "country" },
  { name: "Solomon Islands", code: "SB", category: "country" },
  { name: "Somalia", code: "SO", category: "country" },
  { name: "South Africa", code: "ZA", category: "country" },
  { name: "South Sudan", code: "SS", category: "country" },
  { name: "Spain", code: "ES", category: "country" },
  { name: "Sri Lanka", code: "LK", category: "country" },
  { name: "Sudan", code: "SD", category: "country" },
  { name: "Suriname", code: "SR", category: "country" },
  { name: "Sweden", code: "SE", category: "country" },
  { name: "Switzerland", code: "CH", category: "country" },
  { name: "Syria", code: "SY", category: "country" },
  { name: "Tajikistan", code: "TJ", category: "country" },
  { name: "Tanzania", code: "TZ", category: "country" },
  { name: "Thailand", code: "TH", category: "country" },
  { name: "Timor-Leste", code: "TL", category: "country" },
  { name: "Togo", code: "TG", category: "country" },
  { name: "Tonga", code: "TO", category: "country" },
  { name: "Trinidad and Tobago", code: "TT", category: "country" },
  { name: "Tunisia", code: "TN", category: "country" },
  { name: "Turkiye", code: "TR", category: "country", designation: "Turkey" },
  { name: "Turkmenistan", code: "TM", category: "country" },
  { name: "Tuvalu", code: "TV", category: "country" },
  { name: "Uganda", code: "UG", category: "country" },
  { name: "Ukraine", code: "UA", category: "country" },
  { name: "United Arab Emirates", code: "AE", category: "country" },
  { name: "United Kingdom", code: "GB", category: "country", designation: "UK" },
  { name: "United States of America", code: "US", category: "country", designation: "USA" },
  { name: "Uruguay", code: "UY", category: "country" },
  { name: "Uzbekistan", code: "UZ", category: "country" },
  { name: "Vanuatu", code: "VU", category: "country" },
  { name: "Venezuela", code: "VE", category: "country" },
  { name: "Vietnam", code: "VN", category: "country" },
  { name: "Yemen", code: "YE", category: "country" },
  { name: "Zambia", code: "ZM", category: "country" },
  { name: "Zimbabwe", code: "ZW", category: "country" },
];

// All Indian Political Parties from Delegato Specification
export const INDIAN_PARTIES: PortfolioItem[] = [
  { name: "Bharatiya Janata Party", code: "BJ", category: "party", designation: "BJP" },
  { name: "Indian National Congress", code: "IN", category: "party", designation: "INC / Congress" },
  { name: "Aam Aadmi Party", code: "AA", category: "party", designation: "AAP" },
  { name: "Bahujan Samaj Party", code: "BS", category: "party", designation: "BSP" },
  { name: "Communist Party of India (Marxist)", code: "CM", category: "party", designation: "CPI(M)" },
  { name: "Communist Party of India", code: "CP", category: "party", designation: "CPI" },
  { name: "Nationalist Congress Party", code: "NC", category: "party", designation: "NCP" },
  { name: "National People's Party", code: "NP", category: "party", designation: "NPP" },
  { name: "All India Trinamool Congress", code: "TC", category: "party", designation: "TMC" },
  { name: "Samajwadi Party", code: "SP", category: "party", designation: "SP" },
  { name: "Dravida Munnetra Kazhagam", code: "DM", category: "party", designation: "DMK" },
  { name: "All India Anna Dravida Munnetra Kazhagam", code: "AD", category: "party", designation: "AIADMK" },
  { name: "Shiv Sena", code: "SS", category: "party", designation: "Shiv Sena" },
  { name: "Shiv Sena (Uddhav Balasaheb Thackeray)", code: "SU", category: "party", designation: "SS(UBT)" },
  { name: "Nationalist Congress Party (Sharadchandra Pawar)", code: "NS", category: "party", designation: "NCP(SP)" },
  { name: "Janata Dal (United)", code: "JD", category: "party", designation: "JD(U)" },
  { name: "Rashtriya Janata Dal", code: "RJ", category: "party", designation: "RJD" },
  { name: "Telugu Desam Party", code: "TD", category: "party", designation: "TDP" },
  { name: "YSR Congress Party", code: "YS", category: "party", designation: "YSRCP" },
  { name: "Biju Janata Dal", code: "BD", category: "party", designation: "BJD" },
  { name: "Bharat Rashtra Samithi", code: "BR", category: "party", designation: "BRS" },
  { name: "Jharkhand Mukti Morcha", code: "JM", category: "party", designation: "JMM" },
  { name: "Shiromani Akali Dal", code: "SD", category: "party", designation: "SAD" },
  { name: "Jammu and Kashmir National Conference", code: "JK", category: "party", designation: "JKNC" },
  { name: "Peoples Democratic Party", code: "PD", category: "party", designation: "PDP" },
  { name: "Lok Janshakti Party (Ram Vilas)", code: "LP", category: "party", designation: "LJPRV" },
  { name: "Rashtriya Lok Dal", code: "RL", category: "party", designation: "RLD" },
  { name: "Janata Dal (Secular)", code: "JS", category: "party", designation: "JD(S)" },
  { name: "Jana Sena Party", code: "JP", category: "party", designation: "JSP" },
  { name: "Tamilaga Vettri Kazhagam", code: "TV", category: "party", designation: "TVK" },
  { name: "All India Majlis-e-Ittehadul Muslimeen", code: "AM", category: "party", designation: "AIMIM" },
  { name: "Indian Union Muslim League", code: "IU", category: "party", designation: "IUML" },
  { name: "Asom Gana Parishad", code: "AG", category: "party", designation: "AGP" },
  { name: "All India United Democratic Front", code: "AF", category: "party", designation: "AIUDF" },
  { name: "Mizo National Front", code: "MF", category: "party", designation: "MNF" },
  { name: "Zoram People's Movement", code: "ZP", category: "party", designation: "ZPM" },
  { name: "Naga People's Front", code: "NF", category: "party", designation: "NPF" },
  { name: "Sikkim Krantikari Morcha", code: "SK", category: "party", designation: "SKM" },
  { name: "Sikkim Democratic Front", code: "SF", category: "party", designation: "SDF" },
  { name: "Apna Dal (Sonelal)", code: "AS", category: "party", designation: "ADS" },
  { name: "Hindustani Awam Morcha", code: "HA", category: "party", designation: "HAM" },
  { name: "Rashtriya Lok Morcha", code: "RM", category: "party", designation: "RLM" },
  { name: "Viduthalai Chiruthaigal Katchi", code: "VC", category: "party", designation: "VCK" },
  { name: "Pattali Makkal Katchi", code: "PK", category: "party", designation: "PMK" },
  { name: "Desiya Murpokku Dravida Kazhagam", code: "DK", category: "party", designation: "DMDK" },
  { name: "Kerala Congress (Mani)", code: "KC", category: "party", designation: "KC(M)" },
  { name: "Revolutionary Socialist Party", code: "RS", category: "party", designation: "RSP" },
  { name: "All India Forward Bloc", code: "FB", category: "party", designation: "AIFB" },
  { name: "Maharashtra Navnirman Sena", code: "MN", category: "party", designation: "MNS" },
  { name: "Vanchit Bahujan Aghadi", code: "VA", category: "party", designation: "VBA" },
  { name: "Azad Samaj Party (Kanshi Ram)", code: "AP", category: "party", designation: "ASP" },
  { name: "Rashtriya Loktantrik Party", code: "RT", category: "party", designation: "RLP" },
  { name: "Bharat Adivasi Party", code: "BA", category: "party", designation: "BAP" },
  { name: "Voice of the People Party", code: "VP", category: "party", designation: "VPP" },
  { name: "Independent Members", code: "IM", category: "party", designation: "Independent" },
  { name: "Nominated Members", code: "NM", category: "party", designation: "Nominated" },
];

export const REGIONAL_BODIES: PortfolioItem[] = [
  { name: "European Union", code: "EU", category: "regional", designation: "EU" },
  { name: "African Union", code: "AU", category: "regional", designation: "AU" },
];

export const INDIAN_POLITICIANS: PortfolioItem[] = [
  // Bharatiya Janata Party (BJP) - Government & Cabinet
  { name: "Narendra Modi (BJP)", code: "BJP", category: "politician", designation: "Prime Minister of India" },
  { name: "Amit Shah (BJP)", code: "BJP", category: "politician", designation: "Minister of Home Affairs" },
  { name: "Rajnath Singh (BJP)", code: "BJP", category: "politician", designation: "Minister of Defence" },
  { name: "S. Jaishankar (BJP)", code: "BJP", category: "politician", designation: "Minister of External Affairs" },
  { name: "Nirmala Sitharaman (BJP)", code: "BJP", category: "politician", designation: "Minister of Finance & Corporate Affairs" },
  { name: "Nitin Gadkari (BJP)", code: "BJP", category: "politician", designation: "Minister of Road Transport & Highways" },
  { name: "Piyush Goyal (BJP)", code: "BJP", category: "politician", designation: "Minister of Commerce & Industry" },
  { name: "Ashwini Vaishnaw (BJP)", code: "BJP", category: "politician", designation: "Minister of Railways & Electronics/IT" },
  { name: "Dharmendra Pradhan (BJP)", code: "BJP", category: "politician", designation: "Minister of Education" },
  { name: "Shivraj Singh Chouhan (BJP)", code: "BJP", category: "politician", designation: "Minister of Agriculture & Rural Development" },
  { name: "Manohar Lal Khattar (BJP)", code: "BJP", category: "politician", designation: "Minister of Power, Housing & Urban Affairs" },
  { name: "Jyotiraditya Scindia (BJP)", code: "BJP", category: "politician", designation: "Minister of Communications & DoNER" },
  { name: "Bhupender Yadav (BJP)", code: "BJP", category: "politician", designation: "Minister of Environment, Forest & Climate Change" },
  { name: "Gajendra Singh Shekhawat (BJP)", code: "BJP", category: "politician", designation: "Minister of Culture & Tourism" },
  { name: "Kiren Rijiju (BJP)", code: "BJP", category: "politician", designation: "Minister of Parliamentary Affairs & Minority Affairs" },
  { name: "Mansukh Mandaviya (BJP)", code: "BJP", category: "politician", designation: "Minister of Labour, Employment & Youth Affairs" },
  { name: "Hardeep Singh Puri (BJP)", code: "BJP", category: "politician", designation: "Minister of Petroleum & Natural Gas" },
  { name: "J.P. Nadda (BJP)", code: "BJP", category: "politician", designation: "Minister of Health & Family Welfare, BJP President" },
  { name: "Giriraj Singh (BJP)", code: "BJP", category: "politician", designation: "Minister of Textiles" },
  { name: "Anurag Thakur (BJP)", code: "BJP", category: "politician", designation: "MP, Hamirpur (Former Union Minister)" },
  { name: "Smriti Irani (BJP)", code: "BJP", category: "politician", designation: "Senior Leader & Former Union Minister" },
  { name: "Sarbananda Sonowal (BJP)", code: "BJP", category: "politician", designation: "Minister of Ports, Shipping & Waterways" },
  { name: "Pralhad Joshi (BJP)", code: "BJP", category: "politician", designation: "Minister of Consumer Affairs, Food & New Energy" },
  { name: "Jual Oram (BJP)", code: "BJP", category: "politician", designation: "Minister of Tribal Affairs" },
  { name: "C.R. Patil (BJP)", code: "BJP", category: "politician", designation: "Minister of Jal Shakti" },
  { name: "G. Kishan Reddy (BJP)", code: "BJP", category: "politician", designation: "Minister of Coal & Mines" },
  { name: "Dr. Jitendra Singh (BJP)", code: "BJP", category: "politician", designation: "MoS (I/C) Science & Technology, PMO" },
  { name: "Arjun Ram Meghwal (BJP)", code: "BJP", category: "politician", designation: "MoS (I/C) Law & Justice" },
  { name: "Rao Inderjit Singh (BJP)", code: "BJP", category: "politician", designation: "MoS (I/C) Statistics & Planning" },
  { name: "Tejasvi Surya (BJP)", code: "BJP", category: "politician", designation: "President BJYM, MP Bengaluru South" },
  { name: "Kangana Ranaut (BJP)", code: "BJP", category: "politician", designation: "MP, Mandi" },
  { name: "Bansuri Swaraj (BJP)", code: "BJP", category: "politician", designation: "MP, New Delhi" },
  { name: "Nishikant Dubey (BJP)", code: "BJP", category: "politician", designation: "MP, Godda" },
  { name: "Sambit Patra (BJP)", code: "BJP", category: "politician", designation: "MP, Puri" },
  { name: "Ravi Shankar Prasad (BJP)", code: "BJP", category: "politician", designation: "MP Patna Sahib, Former Law Minister" },
  { name: "Yogi Adityanath (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Uttar Pradesh" },
  { name: "Devendra Fadnavis (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Maharashtra" },
  { name: "Himanta Biswa Sarma (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Assam" },
  { name: "Pushkar Singh Dhami (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Uttarakhand" },
  { name: "Pramod Sawant (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Goa" },
  { name: "Mohan Charan Majhi (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Odisha" },
  { name: "Bhajan Lal Sharma (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Rajasthan" },
  { name: "Nayab Singh Saini (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Haryana" },
  { name: "Mohan Yadav (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Madhya Pradesh" },
  { name: "Vishnu Deo Sai (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Chhattisgarh" },
  { name: "Pema Khandu (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Arunachal Pradesh" },
  { name: "Manik Saha (BJP)", code: "BJP", category: "politician", designation: "Chief Minister, Tripura" },

  // NDA Coalition Allies
  { name: "N. Chandrababu Naidu (TDP)", code: "TDP", category: "politician", designation: "Chief Minister, Andhra Pradesh & TDP President" },
  { name: "Pawan Kalyan (JSP)", code: "JSP", category: "politician", designation: "Deputy Chief Minister, Andhra Pradesh & JSP Chief" },
  { name: "Kinjarapu Ram Mohan Naidu (TDP)", code: "TDP", category: "politician", designation: "Minister of Civil Aviation" },
  { name: "Nitish Kumar (JDU)", code: "JDU", category: "politician", designation: "Chief Minister, Bihar & JDU Leader" },
  { name: "Lalan Singh (JDU)", code: "JDU", category: "politician", designation: "Minister of Panchayati Raj, Fisheries & Dairying" },
  { name: "Chirag Paswan (LJPRV)", code: "LJPRV", category: "politician", designation: "Minister of Food Processing Industries & LJPRV Chief" },
  { name: "Eknath Shinde (SHS)", code: "SHS", category: "politician", designation: "Deputy Chief Minister, Maharashtra & Shiv Sena Chief" },
  { name: "Ajit Pawar (NCP)", code: "NCP", category: "politician", designation: "Deputy Chief Minister, Maharashtra & NCP Leader" },
  { name: "Praful Patel (NCP)", code: "NCP", category: "politician", designation: "Working President NCP, MP Rajya Sabha" },
  { name: "H.D. Kumaraswamy (JDS)", code: "JDS", category: "politician", designation: "Minister of Heavy Industries & Steel" },
  { name: "Jitan Ram Manjhi (HAM)", code: "HAM", category: "politician", designation: "Minister of MSME, Former CM Bihar" },
  { name: "Jayant Chaudhary (RLD)", code: "RLD", category: "politician", designation: "MoS (I/C) Skill Development, RLD Chief" },
  { name: "Ramdas Athawale (RPI-A)", code: "RPIA", category: "politician", designation: "MoS Social Justice & Empowerment" },
  { name: "Anupriya Patel (AD-S)", code: "ADS", category: "politician", designation: "MoS Health & Family Welfare, Apna Dal Chief" },
  { name: "Conrad Sangma (NPP)", code: "NPP", category: "politician", designation: "Chief Minister, Meghalaya & NPP President" },
  { name: "Neiphiu Rio (NDPP)", code: "NDPP", category: "politician", designation: "Chief Minister, Nagaland" },

  // Indian National Congress (INC) / INDIA Bloc
  { name: "Rahul Gandhi (INC)", code: "INC", category: "politician", designation: "Leader of Opposition (Lok Sabha), MP Raebareli" },
  { name: "Mallikarjun Kharge (INC)", code: "INC", category: "politician", designation: "President INC, Leader of Opposition (Rajya Sabha)" },
  { name: "Priyanka Gandhi Vadra (INC)", code: "INC", category: "politician", designation: "MP, Wayanad" },
  { name: "Shashi Tharoor (INC)", code: "INC", category: "politician", designation: "MP, Thiruvananthapuram" },
  { name: "Gaurav Gogoi (INC)", code: "INC", category: "politician", designation: "Deputy Leader of Opposition (Lok Sabha), MP Jorhat" },
  { name: "Jairam Ramesh (INC)", code: "INC", category: "politician", designation: "General Secretary In-charge Communications, MP" },
  { name: "K.C. Venugopal (INC)", code: "INC", category: "politician", designation: "General Secretary (Organisation), MP Alappuzha" },
  { name: "Sachin Pilot (INC)", code: "INC", category: "politician", designation: "General Secretary INC, Former Deputy CM Rajasthan" },
  { name: "P. Chidambaram (INC)", code: "INC", category: "politician", designation: "MP Rajya Sabha, Former Union Finance Minister" },
  { name: "Digvijaya Singh (INC)", code: "INC", category: "politician", designation: "MP Rajya Sabha, Former CM Madhya Pradesh" },
  { name: "Ashok Gehlot (INC)", code: "INC", category: "politician", designation: "Former Chief Minister, Rajasthan" },
  { name: "Siddaramaiah (INC)", code: "INC", category: "politician", designation: "Chief Minister, Karnataka" },
  { name: "D.K. Shivakumar (INC)", code: "INC", category: "politician", designation: "Deputy Chief Minister & KPCC Chief, Karnataka" },
  { name: "Revanth Reddy (INC)", code: "INC", category: "politician", designation: "Chief Minister, Telangana" },
  { name: "Sukhvinder Singh Sukhu (INC)", code: "INC", category: "politician", designation: "Chief Minister, Himachal Pradesh" },
  { name: "Deepender Singh Hooda (INC)", code: "INC", category: "politician", designation: "MP, Rohtak" },
  { name: "Manish Tewari (INC)", code: "INC", category: "politician", designation: "MP, Chandigarh" },
  { name: "Supriya Shrinate (INC)", code: "INC", category: "politician", designation: "Chairperson, Social Media & Digital Platforms" },
  { name: "Pawan Khera (INC)", code: "INC", category: "politician", designation: "Chairman, Media & Publicity Department" },
  { name: "Karti Chidambaram (INC)", code: "INC", category: "politician", designation: "MP, Sivaganga" },
  { name: "Charanjit Singh Channi (INC)", code: "INC", category: "politician", designation: "MP Jalandhar, Former CM Punjab" },
  { name: "Kumari Selja (INC)", code: "INC", category: "politician", designation: "MP, Sirsa" },
  { name: "Randeep Singh Surjewala (INC)", code: "INC", category: "politician", designation: "General Secretary INC, MP Rajya Sabha" },

  // Aam Aadmi Party (AAP)
  { name: "Arvind Kejriwal (AAP)", code: "AAP", category: "politician", designation: "AAP National Convener, Former CM Delhi" },
  { name: "Bhagwant Mann (AAP)", code: "AAP", category: "politician", designation: "Chief Minister, Punjab" },
  { name: "Atishi (AAP)", code: "AAP", category: "politician", designation: "Chief Minister, Delhi" },
  { name: "Sanjay Singh (AAP)", code: "AAP", category: "politician", designation: "MP, Rajya Sabha" },
  { name: "Raghav Chadha (AAP)", code: "AAP", category: "politician", designation: "MP, Rajya Sabha" },
  { name: "Saurabh Bharadwaj (AAP)", code: "AAP", category: "politician", designation: "Cabinet Minister, Delhi" },
  { name: "Gopal Rai (AAP)", code: "AAP", category: "politician", designation: "Cabinet Minister, Delhi" },
  { name: "Harbhajan Singh (AAP)", code: "AAP", category: "politician", designation: "MP, Rajya Sabha" },

  // Samajwadi Party (SP)
  { name: "Akhilesh Yadav (SP)", code: "SP", category: "politician", designation: "National President SP, MP Kannauj" },
  { name: "Dimple Yadav (SP)", code: "SP", category: "politician", designation: "MP, Mainpuri" },
  { name: "Ram Gopal Yadav (SP)", code: "SP", category: "politician", designation: "Secretary General SP, MP Rajya Sabha" },
  { name: "Awadhesh Prasad (SP)", code: "SP", category: "politician", designation: "MP, Faizabad (Ayodhya)" },
  { name: "Dharmendra Yadav (SP)", code: "SP", category: "politician", designation: "MP, Azamgarh" },
  { name: "Iqra Choudhary (SP)", code: "SP", category: "politician", designation: "MP, Kairana" },
  { name: "Ziaur Rahman Barq (SP)", code: "SP", category: "politician", designation: "MP, Sambhal" },
  { name: "Shivpal Singh Yadav (SP)", code: "SP", category: "politician", designation: "National General Secretary, SP" },
  { name: "Afzal Ansari (SP)", code: "SP", category: "politician", designation: "MP, Ghazipur" },

  // All India Trinamool Congress (AITC)
  { name: "Mamata Banerjee (AITC)", code: "AITC", category: "politician", designation: "Chief Minister, West Bengal & AITC Chairperson" },
  { name: "Abhishek Banerjee (AITC)", code: "AITC", category: "politician", designation: "National General Secretary, MP Diamond Harbour" },
  { name: "Mahua Moitra (AITC)", code: "AITC", category: "politician", designation: "MP, Krishnanagar" },
  { name: "Derek O'Brien (AITC)", code: "AITC", category: "politician", designation: "Leader of AITC in Rajya Sabha" },
  { name: "Kalyan Banerjee (AITC)", code: "AITC", category: "politician", designation: "Chief Whip, MP Sreerampur" },
  { name: "Kakoli Ghosh Dastidar (AITC)", code: "AITC", category: "politician", designation: "Deputy Leader Lok Sabha, MP Barasat" },
  { name: "Shatrughan Sinha (AITC)", code: "AITC", category: "politician", designation: "MP, Asansol" },
  { name: "Yusuf Pathan (AITC)", code: "AITC", category: "politician", designation: "MP, Baharampur" },
  { name: "Kirti Azad (AITC)", code: "AITC", category: "politician", designation: "MP, Bardhaman-Durgapur" },

  // Dravida Munnetra Kazhagam (DMK)
  { name: "M.K. Stalin (DMK)", code: "DMK", category: "politician", designation: "Chief Minister, Tamil Nadu & DMK President" },
  { name: "Kanimozhi Karunanidhi (DMK)", code: "DMK", category: "politician", designation: "Deputy Leader Lok Sabha, MP Thoothukkudi" },
  { name: "Dayanidhi Maran (DMK)", code: "DMK", category: "politician", designation: "MP, Chennai Central" },
  { name: "T.R. Baalu (DMK)", code: "DMK", category: "politician", designation: "Leader of DMK in Lok Sabha, MP Sriperumbudur" },
  { name: "A. Raja (DMK)", code: "DMK", category: "politician", designation: "Deputy General Secretary DMK, MP Nilgiris" },
  { name: "Udhayanidhi Stalin (DMK)", code: "DMK", category: "politician", designation: "Deputy Chief Minister, Tamil Nadu" },

  // Shiv Sena (UBT) & Nationalist Congress Party (SP)
  { name: "Uddhav Thackeray (SS-UBT)", code: "UBT", category: "politician", designation: "Shiv Sena (UBT) Chief, Former CM Maharashtra" },
  { name: "Sanjay Raut (SS-UBT)", code: "UBT", category: "politician", designation: "Leader in Rajya Sabha, Chief Spokesperson" },
  { name: "Arvind Sawant (SS-UBT)", code: "UBT", category: "politician", designation: "MP, Mumbai South" },
  { name: "Aaditya Thackeray (SS-UBT)", code: "UBT", category: "politician", designation: "MLA Worli, President Yuva Sena" },
  { name: "Priyanka Chaturvedi (SS-UBT)", code: "UBT", category: "politician", designation: "MP, Rajya Sabha" },
  { name: "Sharad Pawar (NCP-SP)", code: "NCPSP", category: "politician", designation: "President NCP (SP), Former Union Minister" },
  { name: "Supriya Sule (NCP-SP)", code: "NCPSP", category: "politician", designation: "Working President NCP (SP), MP Baramati" },
  { name: "Amol Kolhe (NCP-SP)", code: "NCPSP", category: "politician", designation: "MP, Shirur" },

  // Rashtriya Janata Dal (RJD)
  { name: "Tejashwi Yadav (RJD)", code: "RJD", category: "politician", designation: "Leader of Opposition Bihar, Former Deputy CM" },
  { name: "Lalu Prasad Yadav (RJD)", code: "RJD", category: "politician", designation: "National President RJD, Former Chief Minister" },
  { name: "Manoj Kumar Jha (RJD)", code: "RJD", category: "politician", designation: "National Spokesperson, MP Rajya Sabha" },
  { name: "Misa Bharti (RJD)", code: "RJD", category: "politician", designation: "MP, Patliputra" },

  // Left Parties (CPI-M, CPI)
  { name: "Pinarayi Vijayan (CPI-M)", code: "CPIM", category: "politician", designation: "Chief Minister, Kerala" },
  { name: "D. Raja (CPI)", code: "CPI", category: "politician", designation: "General Secretary, Communist Party of India" },
  { name: "John Brittas (CPI-M)", code: "CPIM", category: "politician", designation: "MP, Rajya Sabha" },
  { name: "Amra Ram (CPI-M)", code: "CPIM", category: "politician", designation: "MP, Sikar" },

  // Jammu & Kashmir Parties
  { name: "Omar Abdullah (JKNC)", code: "JKNC", category: "politician", designation: "Chief Minister, Jammu & Kashmir" },
  { name: "Farooq Abdullah (JKNC)", code: "JKNC", category: "politician", designation: "Patron JKNC, Former CM Jammu & Kashmir" },
  { name: "Mehbooba Mufti (JKPDP)", code: "JKPDP", category: "politician", designation: "President JKPDP, Former CM Jammu & Kashmir" },
  { name: "Aga Syed Ruhullah Mehdi (JKNC)", code: "JKNC", category: "politician", designation: "MP, Srinagar" },

  // Jharkhand Mukti Morcha (JMM)
  { name: "Hemant Soren (JMM)", code: "JMM", category: "politician", designation: "Chief Minister, Jharkhand & Executive President JMM" },
  { name: "Kalpana Soren (JMM)", code: "JMM", category: "politician", designation: "MLA Gandey, Senior Leader JMM" },
  { name: "Shibu Soren (JMM)", code: "JMM", category: "politician", designation: "President JMM, Former Union Minister" },

  // Prominent Independent & Regional Leaders
  { name: "Asaduddin Owaisi (AIMIM)", code: "AIMIM", category: "politician", designation: "President AIMIM, MP Hyderabad" },
  { name: "Imtiaz Jaleel (AIMIM)", code: "AIMIM", category: "politician", designation: "Former MP Aurangabad, State President AIMIM" },
  { name: "Chandra Shekhar Aazad (ASP-KR)", code: "ASPKR", category: "politician", designation: "National President ASP, MP Nagina" },
  { name: "Pappu Yadav (IND)", code: "IND", category: "politician", designation: "MP, Purnia" },
  { name: "Amritpal Singh (IND)", code: "IND", category: "politician", designation: "MP, Khadoor Sahib" },
  { name: "Engineer Rashid (AIP)", code: "AIP", category: "politician", designation: "MP, Baramulla" },
  { name: "Naveen Patnaik (BJD)", code: "BJD", category: "politician", designation: "President BJD, Former CM Odisha" },
  { name: "Sasmit Patra (BJD)", code: "BJD", category: "politician", designation: "Leader of BJD in Rajya Sabha" },
  { name: "K. Chandrashekar Rao (BRS)", code: "BRS", category: "politician", designation: "President BRS, Former CM Telangana" },
  { name: "K.T. Rama Rao (BRS)", code: "BRS", category: "politician", designation: "Working President BRS, Former Minister" },
  { name: "Y.S. Jagan Mohan Reddy (YSRCP)", code: "YSRCP", category: "politician", designation: "President YSRCP, Former CM Andhra Pradesh" },
  { name: "Sukhbir Singh Badal (SAD)", code: "SAD", category: "politician", designation: "President Shiromani Akali Dal" },
  { name: "Harsimrat Kaur Badal (SAD)", code: "SAD", category: "politician", designation: "MP Bathinda, Former Union Minister" },
  { name: "Lalduhoma (ZPM)", code: "ZPM", category: "politician", designation: "Chief Minister, Mizoram" },
  { name: "Prem Singh Tamang (SKM)", code: "SKM", category: "politician", designation: "Chief Minister, Sikkim" },
  { name: "Rajkumar Roat (BAP)", code: "BAP", category: "politician", designation: "MP, Banswara (Bharat Adivasi Party)" },
  { name: "Hanuman Beniwal (RLP)", code: "RLP", category: "politician", designation: "MP, Nagaur (Rashtriya Loktantrik Party)" },
  { name: "E.T. Mohammed Basheer (IUML)", code: "IUML", category: "politician", designation: "MP Malappuram, Leader IUML" },
  { name: "Thol. Thirumavalavan (VCK)", code: "VCK", category: "politician", designation: "MP Chidambaram, President VCK" },
];

export const MASTER_PORTFOLIO_LIST: PortfolioItem[] = [
  ...ALL_COUNTRIES,
  ...INDIAN_PARTIES,
  ...INDIAN_POLITICIANS,
  ...REGIONAL_BODIES,
];

/**
 * Resilient Portfolio Matcher:
 * Reconciles portfolio ID or code/slug against active committee portfolios.
 * Resolves re-added or migrated portfolios cleanly without broken raw IDs.
 */
export function findMatchingPortfolio(
  pId: string | undefined,
  committeeId: string | undefined,
  portfolios: MunPortfolio[]
): MunPortfolio | undefined {
  if (!pId) return undefined;

  // 1. Exact ID match (fastest and cleanest)
  const exact = portfolios.find((p) => p.id === pId);
  if (exact) return exact;

  // 2. Filter within committee if provided
  const commPorts = committeeId
    ? portfolios.filter((p) => p.committeeId === committeeId)
    : portfolios;

  const parts = pId.toLowerCase().split("-");
  const lastPart = parts[parts.length - 1];
  const secondLast = parts.length > 1 ? parts[parts.length - 2] : "";

  // 2a. Match by country code (e.g. "BR" from -br)
  const byCode = commPorts.find(
    (p) =>
      p.code.toLowerCase() === lastPart ||
      p.code.toLowerCase() === secondLast ||
      pId.toLowerCase().endsWith(`-${p.code.toLowerCase()}`)
  );
  if (byCode) return byCode;

  // 2b. Match by country name slug (e.g. "brazil")
  const byName = commPorts.find((p) => {
    const slug = p.countryName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      slug === lastPart ||
      slug === secondLast ||
      pId.toLowerCase().includes(`-${slug}`) ||
      pId.toLowerCase().includes(slug)
    );
  });
  if (byName) return byName;

  return undefined;
}

/**
 * Resilient Display Name Resolver:
 * Reconciles any portfolio ID or slug to human-friendly name.
 * If deleted and unknown, returns "NIL" instead of ugly raw database IDs.
 */
export function getPortfolioDisplayName(
  pId: string | undefined,
  committeeId: string | undefined,
  portfolios: MunPortfolio[]
): string {
  if (!pId) return "NIL";

  // First check if active portfolio exists
  const match = findMatchingPortfolio(pId, committeeId, portfolios);
  if (match) return match.countryName;

  const parts = pId.toLowerCase().split("-");
  const lastPart = parts[parts.length - 1];
  const secondLast = parts.length > 1 ? parts[parts.length - 2] : "";

  // Check master database to identify what country/item it was
  const found = MASTER_PORTFOLIO_LIST.find(
    (item) =>
      item.code.toLowerCase() === lastPart ||
      item.code.toLowerCase() === secondLast ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, "") === lastPart ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, "") === secondLast
  );
  if (found) return found.name;

  if (lastPart && lastPart.length <= 15 && !/^[0-9]+$/.test(lastPart)) {
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }

  return "NIL";
}
