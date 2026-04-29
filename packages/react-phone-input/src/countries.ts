export interface Country {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
  /** Format pattern: `#` = digit, everything else is a literal separator */
  format: string;
}

export const COUNTRIES: Country[] = [
  { iso2: "US", name: "United States",     dialCode: "1",   flag: "🇺🇸", format: "(###) ###-####" },
  { iso2: "CA", name: "Canada",            dialCode: "1",   flag: "🇨🇦", format: "(###) ###-####" },
  { iso2: "GB", name: "United Kingdom",    dialCode: "44",  flag: "🇬🇧", format: "#### ######" },
  { iso2: "AU", name: "Australia",         dialCode: "61",  flag: "🇦🇺", format: "#### ### ###" },
  { iso2: "DE", name: "Germany",           dialCode: "49",  flag: "🇩🇪", format: "#### #######" },
  { iso2: "FR", name: "France",            dialCode: "33",  flag: "🇫🇷", format: "# ## ## ## ##" },
  { iso2: "IN", name: "India",             dialCode: "91",  flag: "🇮🇳", format: "##### #####" },
  { iso2: "CN", name: "China",             dialCode: "86",  flag: "🇨🇳", format: "### #### ####" },
  { iso2: "JP", name: "Japan",             dialCode: "81",  flag: "🇯🇵", format: "##-####-####" },
  { iso2: "KR", name: "South Korea",       dialCode: "82",  flag: "🇰🇷", format: "##-####-####" },
  { iso2: "BR", name: "Brazil",            dialCode: "55",  flag: "🇧🇷", format: "(##) #####-####" },
  { iso2: "MX", name: "Mexico",            dialCode: "52",  flag: "🇲🇽", format: "### ###-####" },
  { iso2: "IT", name: "Italy",             dialCode: "39",  flag: "🇮🇹", format: "### #######" },
  { iso2: "ES", name: "Spain",             dialCode: "34",  flag: "🇪🇸", format: "### ### ###" },
  { iso2: "NL", name: "Netherlands",       dialCode: "31",  flag: "🇳🇱", format: "## ### ####" },
  { iso2: "SE", name: "Sweden",            dialCode: "46",  flag: "🇸🇪", format: "##-### ## ##" },
  { iso2: "NO", name: "Norway",            dialCode: "47",  flag: "🇳🇴", format: "### ## ###" },
  { iso2: "SG", name: "Singapore",         dialCode: "65",  flag: "🇸🇬", format: "#### ####" },
  { iso2: "MY", name: "Malaysia",          dialCode: "60",  flag: "🇲🇾", format: "##-#### ####" },
  { iso2: "ID", name: "Indonesia",         dialCode: "62",  flag: "🇮🇩", format: "###-####-####" },
  { iso2: "PH", name: "Philippines",       dialCode: "63",  flag: "🇵🇭", format: "### ###-####" },
  { iso2: "TH", name: "Thailand",          dialCode: "66",  flag: "🇹🇭", format: "##-###-####" },
  { iso2: "NZ", name: "New Zealand",       dialCode: "64",  flag: "🇳🇿", format: "##-###-####" },
  { iso2: "ZA", name: "South Africa",      dialCode: "27",  flag: "🇿🇦", format: "##-###-####" },
  { iso2: "NG", name: "Nigeria",           dialCode: "234", flag: "🇳🇬", format: "###-###-####" },
  { iso2: "EG", name: "Egypt",             dialCode: "20",  flag: "🇪🇬", format: "###-####-####" },
  { iso2: "SA", name: "Saudi Arabia",      dialCode: "966", flag: "🇸🇦", format: "##-###-####" },
  { iso2: "AE", name: "UAE",               dialCode: "971", flag: "🇦🇪", format: "##-###-####" },
  { iso2: "TR", name: "Turkey",            dialCode: "90",  flag: "🇹🇷", format: "### ###-####" },
  { iso2: "PL", name: "Poland",            dialCode: "48",  flag: "🇵🇱", format: "###-###-###" },
];

export function findCountry(iso2: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso2 === iso2.toUpperCase());
}

export function digitCount(format: string): number {
  let n = 0;
  for (const ch of format) {
    if (ch === "#") n++;
  }
  return n;
}

export function applyFormat(digits: string, format: string): string {
  let di = 0;
  let out = "";
  for (const ch of format) {
    if (di >= digits.length) break;
    if (ch === "#") {
      out += digits[di++] ?? "";
    } else {
      out += ch;
    }
  }
  return out;
}
