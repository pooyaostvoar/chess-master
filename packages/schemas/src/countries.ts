/** ISO 3166-1 alpha-2 codes blocked from profile country selection (sanctions). */
export const BLOCKED_COUNTRY_CODES = ["CU", "IR", "KP", "SY"] as const;

export const ISO_COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU",
  "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL",
  "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC",
  "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CV", "CW",
  "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH",
  "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE",
  "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU",
  "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN",
  "IO", "IQ", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM",
  "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT",
  "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM",
  "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ",
  "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM",
  "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW",
  "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG",
  "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX",
  "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR",
  "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE",
  "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

export type CountryCode = (typeof ISO_COUNTRY_CODES)[number];

export function isBlockedCountry(code: string | null | undefined): boolean {
  if (!code) return false;
  return (BLOCKED_COUNTRY_CODES as readonly string[]).includes(
    code.trim().toUpperCase()
  );
}

export function isValidCountryCode(code: string | null | undefined): boolean {
  if (!code) return true;
  const normalized = code.trim().toUpperCase();
  if (isBlockedCountry(normalized)) return false;
  return (ISO_COUNTRY_CODES as readonly string[]).includes(normalized);
}

export function getCountryFlag(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 2) return "";
  return normalized
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function getCountryName(code: string, locale = "en"): string {
  const normalized = code.trim().toUpperCase();
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(normalized) ?? normalized;
  } catch {
    return normalized;
  }
}

export type SelectableCountry = {
  code: CountryCode;
  name: string;
  flag: string;
};

export function getSelectableCountries(locale = "en"): SelectableCountry[] {
  return ISO_COUNTRY_CODES.map((code) => ({
    code,
    name: getCountryName(code, locale),
    flag: getCountryFlag(code),
  })).sort((a, b) => a.name.localeCompare(b.name, locale));
}
