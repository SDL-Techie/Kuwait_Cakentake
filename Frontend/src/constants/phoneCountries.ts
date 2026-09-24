export type PhoneCountry = {
  iso: "KW" | "AE" | "SA" | "IN" | "BH" | "QA";
  flag: string;
  name: string;
  dialCode: string;
  localLength: number;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "KW", flag: "🇰🇼", name: "Kuwait", dialCode: "+965", localLength: 8 },
  { iso: "AE", flag: "🇦🇪", name: "UAE", dialCode: "+971", localLength: 9 },
  { iso: "SA", flag: "🇸🇦", name: "Saudi Arabia", dialCode: "+966", localLength: 9 },
  { iso: "IN", flag: "🇮🇳", name: "India", dialCode: "+91", localLength: 10 },
  { iso: "BH", flag: "🇧🇭", name: "Bahrain", dialCode: "+973", localLength: 8 },
  { iso: "QA", flag: "🇶🇦", name: "Qatar", dialCode: "+974", localLength: 8 },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export const onlyPhoneDigits = (value: string) => String(value || "").replace(/\D/g, "");

export const buildInternationalPhone = (country: PhoneCountry, localNumber: string) =>
  `${country.dialCode}${onlyPhoneDigits(localNumber).slice(0, country.localLength)}`;

export const isCompleteLocalPhone = (country: PhoneCountry, localNumber: string) =>
  onlyPhoneDigits(localNumber).length === country.localLength;

export const parseStoredPhone = (value?: string | null) => {
  const raw = String(value || "").trim();
  let digits = onlyPhoneDigits(raw);
  if (digits.startsWith("00")) digits = digits.slice(2);

  for (const country of PHONE_COUNTRIES) {
    const code = country.dialCode.replace("+", "");
    if (digits.startsWith(code) && digits.length === code.length + country.localLength) {
      return { country, localNumber: digits.slice(code.length) };
    }
  }

  // Backwards compatibility for existing Kuwait records stored as local 8 digits.
  if (digits.length === DEFAULT_PHONE_COUNTRY.localLength) {
    return { country: DEFAULT_PHONE_COUNTRY, localNumber: digits };
  }

  return {
    country: DEFAULT_PHONE_COUNTRY,
    localNumber: digits.slice(0, DEFAULT_PHONE_COUNTRY.localLength),
  };
};
