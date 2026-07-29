import passportIndex from './passportIndex.json';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

export interface CountryOption {
  code: string;
  country: string;
  flag: string;
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/[A-Z]/g, (letter) =>
      String.fromCodePoint(127397 + letter.charCodeAt(0)),
    );
}

/**
 * Passport countries are derived from passportIndex.json so every country
 * shown in onboarding is backed by the local visa-rules dataset.
 */
export const COUNTRY_OPTIONS: CountryOption[] = Object.keys(passportIndex)
  .map((code) => ({
    code,
    country: countries.getName(code, 'en') || code,
    flag: countryFlag(code),
  }))
  .sort((a, b) => a.country.localeCompare(b.country));

export function getCountryOption(code: string): CountryOption | undefined {
  return COUNTRY_OPTIONS.find((country) => country.code === code);
}
