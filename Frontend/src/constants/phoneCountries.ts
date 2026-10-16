// export type PhoneCountry = {
//   iso: "KW" | "AE" | "SA" | "IN" | "BH" | "QA";
//   flag: string;
//   name: string;
//   dialCode: string;
//   localLength: number;
// };

// export const PHONE_COUNTRIES: PhoneCountry[] = [
//   { iso: "KW", flag: "🇰🇼", name: "Kuwait", dialCode: "+965", localLength: 8 },
//   { iso: "AE", flag: "🇦🇪", name: "UAE", dialCode: "+971", localLength: 9 },
//   { iso: "SA", flag: "🇸🇦", name: "Saudi Arabia", dialCode: "+966", localLength: 9 },
//   { iso: "IN", flag: "🇮🇳", name: "India", dialCode: "+91", localLength: 10 },
//   { iso: "BH", flag: "🇧🇭", name: "Bahrain", dialCode: "+973", localLength: 8 },
//   { iso: "QA", flag: "🇶🇦", name: "Qatar", dialCode: "+974", localLength: 8 },
// ];

// export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

// export const onlyPhoneDigits = (value: string) => String(value || "").replace(/\D/g, "");

// export const buildInternationalPhone = (country: PhoneCountry, localNumber: string) =>
//   `${country.dialCode}${onlyPhoneDigits(localNumber).slice(0, country.localLength)}`;

// export const isCompleteLocalPhone = (country: PhoneCountry, localNumber: string) =>
//   onlyPhoneDigits(localNumber).length === country.localLength;

// export const parseStoredPhone = (value?: string | null) => {
//   const raw = String(value || "").trim();
//   let digits = onlyPhoneDigits(raw);
//   if (digits.startsWith("00")) digits = digits.slice(2);

//   for (const country of PHONE_COUNTRIES) {
//     const code = country.dialCode.replace("+", "");
//     if (digits.startsWith(code) && digits.length === code.length + country.localLength) {
//       return { country, localNumber: digits.slice(code.length) };
//     }
//   }

//   // Backwards compatibility for existing Kuwait records stored as local 8 digits.
//   if (digits.length === DEFAULT_PHONE_COUNTRY.localLength) {
//     return { country: DEFAULT_PHONE_COUNTRY, localNumber: digits };
//   }

//   return {
//     country: DEFAULT_PHONE_COUNTRY,
//     localNumber: digits.slice(0, DEFAULT_PHONE_COUNTRY.localLength),
//   };
// };



export type PhoneCountry = {
  iso: string;        // ISO 3166-1 alpha-2, used for the flag image
  name: string;
  dialCode: string;   // e.g. "+965"
  localLength: number; // required length of the national number
};

// [iso, name, dialCode, localLength]
const RAW: [string, string, string, number][] = [
  ["AF", "Afghanistan", "+93", 9],
  ["AL", "Albania", "+355", 9],
  ["DZ", "Algeria", "+213", 9],
  ["AS", "American Samoa", "+1684", 7],
  ["AD", "Andorra", "+376", 6],
  ["AO", "Angola", "+244", 9],
  ["AI", "Anguilla", "+1264", 7],
  ["AG", "Antigua and Barbuda", "+1268", 7],
  ["AR", "Argentina", "+54", 10],
  ["AM", "Armenia", "+374", 8],
  ["AW", "Aruba", "+297", 7],
  ["AU", "Australia", "+61", 9],
  ["AT", "Austria", "+43", 10],
  ["AZ", "Azerbaijan", "+994", 9],
  ["BS", "Bahamas", "+1242", 7],
  ["BH", "Bahrain", "+973", 8],
  ["BD", "Bangladesh", "+880", 10],
  ["BB", "Barbados", "+1246", 7],
  ["BY", "Belarus", "+375", 9],
  ["BE", "Belgium", "+32", 9],
  ["BZ", "Belize", "+501", 7],
  ["BJ", "Benin", "+229", 8],
  ["BM", "Bermuda", "+1441", 7],
  ["BT", "Bhutan", "+975", 8],
  ["BO", "Bolivia", "+591", 8],
  ["BA", "Bosnia and Herzegovina", "+387", 8],
  ["BW", "Botswana", "+267", 8],
  ["BR", "Brazil", "+55", 11],
  ["VG", "British Virgin Islands", "+1284", 7],
  ["BN", "Brunei", "+673", 7],
  ["BG", "Bulgaria", "+359", 9],
  ["BF", "Burkina Faso", "+226", 8],
  ["BI", "Burundi", "+257", 8],
  ["KH", "Cambodia", "+855", 9],
  ["CM", "Cameroon", "+237", 9],
  ["CA", "Canada", "+1", 10],
  ["CV", "Cape Verde", "+238", 7],
  ["KY", "Cayman Islands", "+1345", 7],
  ["CF", "Central African Republic", "+236", 8],
  ["TD", "Chad", "+235", 8],
  ["CL", "Chile", "+56", 9],
  ["CN", "China", "+86", 11],
  ["CO", "Colombia", "+57", 10],
  ["KM", "Comoros", "+269", 7],
  ["CG", "Congo", "+242", 9],
  ["CD", "Congo (DR)", "+243", 9],
  ["CK", "Cook Islands", "+682", 5],
  ["CR", "Costa Rica", "+506", 8],
  ["CI", "Côte d'Ivoire", "+225", 10],
  ["HR", "Croatia", "+385", 9],
  ["CU", "Cuba", "+53", 8],
  ["CW", "Curaçao", "+599", 8],
  ["CY", "Cyprus", "+357", 8],
  ["CZ", "Czech Republic", "+420", 9],
  ["DK", "Denmark", "+45", 8],
  ["DJ", "Djibouti", "+253", 8],
  ["DM", "Dominica", "+1767", 7],
  ["DO", "Dominican Republic", "+1809", 7],
  ["EC", "Ecuador", "+593", 9],
  ["EG", "Egypt", "+20", 10],
  ["SV", "El Salvador", "+503", 8],
  ["GQ", "Equatorial Guinea", "+240", 9],
  ["ER", "Eritrea", "+291", 7],
  ["EE", "Estonia", "+372", 8],
  ["SZ", "Eswatini", "+268", 8],
  ["ET", "Ethiopia", "+251", 9],
  ["FK", "Falkland Islands", "+500", 5],
  ["FO", "Faroe Islands", "+298", 6],
  ["FJ", "Fiji", "+679", 7],
  ["FI", "Finland", "+358", 9],
  ["FR", "France", "+33", 9],
  ["GF", "French Guiana", "+594", 9],
  ["PF", "French Polynesia", "+689", 8],
  ["GA", "Gabon", "+241", 8],
  ["GM", "Gambia", "+220", 7],
  ["GE", "Georgia", "+995", 9],
  ["DE", "Germany", "+49", 10],
  ["GH", "Ghana", "+233", 9],
  ["GI", "Gibraltar", "+350", 8],
  ["GR", "Greece", "+30", 10],
  ["GL", "Greenland", "+299", 6],
  ["GD", "Grenada", "+1473", 7],
  ["GP", "Guadeloupe", "+590", 9],
  ["GU", "Guam", "+1671", 7],
  ["GT", "Guatemala", "+502", 8],
  ["GN", "Guinea", "+224", 9],
  ["GW", "Guinea-Bissau", "+245", 9],
  ["GY", "Guyana", "+592", 7],
  ["HT", "Haiti", "+509", 8],
  ["HN", "Honduras", "+504", 8],
  ["HK", "Hong Kong", "+852", 8],
  ["HU", "Hungary", "+36", 9],
  ["IS", "Iceland", "+354", 7],
  ["IN", "India", "+91", 10],
  ["ID", "Indonesia", "+62", 10],
  ["IR", "Iran", "+98", 10],
  ["IQ", "Iraq", "+964", 10],
  ["IE", "Ireland", "+353", 9],
  ["IL", "Israel", "+972", 9],
  ["IT", "Italy", "+39", 10],
  ["JM", "Jamaica", "+1876", 7],
  ["JP", "Japan", "+81", 10],
  ["JO", "Jordan", "+962", 9],
  ["KZ", "Kazakhstan", "+7", 10],
  ["KE", "Kenya", "+254", 9],
  ["KI", "Kiribati", "+686", 8],
  ["XK", "Kosovo", "+383", 8],
  ["KW", "Kuwait", "+965", 8],
  ["KG", "Kyrgyzstan", "+996", 9],
  ["LA", "Laos", "+856", 10],
  ["LV", "Latvia", "+371", 8],
  ["LB", "Lebanon", "+961", 8],
  ["LS", "Lesotho", "+266", 8],
  ["LR", "Liberia", "+231", 9],
  ["LY", "Libya", "+218", 9],
  ["LI", "Liechtenstein", "+423", 7],
  ["LT", "Lithuania", "+370", 8],
  ["LU", "Luxembourg", "+352", 9],
  ["MO", "Macau", "+853", 8],
  ["MG", "Madagascar", "+261", 9],
  ["MW", "Malawi", "+265", 9],
  ["MY", "Malaysia", "+60", 9],
  ["MV", "Maldives", "+960", 7],
  ["ML", "Mali", "+223", 8],
  ["MT", "Malta", "+356", 8],
  ["MH", "Marshall Islands", "+692", 7],
  ["MQ", "Martinique", "+596", 9],
  ["MR", "Mauritania", "+222", 8],
  ["MU", "Mauritius", "+230", 8],
  ["MX", "Mexico", "+52", 10],
  ["FM", "Micronesia", "+691", 7],
  ["MD", "Moldova", "+373", 8],
  ["MC", "Monaco", "+377", 8],
  ["MN", "Mongolia", "+976", 8],
  ["ME", "Montenegro", "+382", 8],
  ["MS", "Montserrat", "+1664", 7],
  ["MA", "Morocco", "+212", 9],
  ["MZ", "Mozambique", "+258", 9],
  ["MM", "Myanmar", "+95", 9],
  ["NA", "Namibia", "+264", 9],
  ["NR", "Nauru", "+674", 7],
  ["NP", "Nepal", "+977", 10],
  ["NL", "Netherlands", "+31", 9],
  ["NC", "New Caledonia", "+687", 6],
  ["NZ", "New Zealand", "+64", 9],
  ["NI", "Nicaragua", "+505", 8],
  ["NE", "Niger", "+227", 8],
  ["NG", "Nigeria", "+234", 10],
  ["KP", "North Korea", "+850", 10],
  ["MK", "North Macedonia", "+389", 8],
  ["NO", "Norway", "+47", 8],
  ["OM", "Oman", "+968", 8],
  ["PK", "Pakistan", "+92", 10],
  ["PW", "Palau", "+680", 7],
  ["PS", "Palestine", "+970", 9],
  ["PA", "Panama", "+507", 8],
  ["PG", "Papua New Guinea", "+675", 8],
  ["PY", "Paraguay", "+595", 9],
  ["PE", "Peru", "+51", 9],
  ["PH", "Philippines", "+63", 10],
  ["PL", "Poland", "+48", 9],
  ["PT", "Portugal", "+351", 9],
  ["PR", "Puerto Rico", "+1787", 7],
  ["QA", "Qatar", "+974", 8],
  ["RE", "Réunion", "+262", 9],
  ["RO", "Romania", "+40", 9],
  ["RU", "Russia", "+7", 10],
  ["RW", "Rwanda", "+250", 9],
  ["KN", "Saint Kitts and Nevis", "+1869", 7],
  ["LC", "Saint Lucia", "+1758", 7],
  ["VC", "Saint Vincent and the Grenadines", "+1784", 7],
  ["WS", "Samoa", "+685", 7],
  ["SM", "San Marino", "+378", 10],
  ["ST", "São Tomé and Príncipe", "+239", 7],
  ["SA", "Saudi Arabia", "+966", 9],
  ["SN", "Senegal", "+221", 9],
  ["RS", "Serbia", "+381", 9],
  ["SC", "Seychelles", "+248", 7],
  ["SL", "Sierra Leone", "+232", 8],
  ["SG", "Singapore", "+65", 8],
  ["SX", "Sint Maarten", "+1721", 7],
  ["SK", "Slovakia", "+421", 9],
  ["SI", "Slovenia", "+386", 8],
  ["SB", "Solomon Islands", "+677", 7],
  ["SO", "Somalia", "+252", 8],
  ["ZA", "South Africa", "+27", 9],
  ["KR", "South Korea", "+82", 10],
  ["SS", "South Sudan", "+211", 9],
  ["ES", "Spain", "+34", 9],
  ["LK", "Sri Lanka", "+94", 9],
  ["SD", "Sudan", "+249", 9],
  ["SR", "Suriname", "+597", 7],
  ["SE", "Sweden", "+46", 9],
  ["CH", "Switzerland", "+41", 9],
  ["SY", "Syria", "+963", 9],
  ["TW", "Taiwan", "+886", 9],
  ["TJ", "Tajikistan", "+992", 9],
  ["TZ", "Tanzania", "+255", 9],
  ["TH", "Thailand", "+66", 9],
  ["TL", "Timor-Leste", "+670", 8],
  ["TG", "Togo", "+228", 8],
  ["TO", "Tonga", "+676", 7],
  ["TT", "Trinidad and Tobago", "+1868", 7],
  ["TN", "Tunisia", "+216", 8],
  ["TR", "Turkey", "+90", 10],
  ["TM", "Turkmenistan", "+993", 8],
  ["TC", "Turks and Caicos Islands", "+1649", 7],
  ["TV", "Tuvalu", "+688", 6],
  ["UG", "Uganda", "+256", 9],
  ["UA", "Ukraine", "+380", 9],
  ["AE", "United Arab Emirates", "+971", 9],
  ["GB", "United Kingdom", "+44", 10],
  ["US", "United States", "+1", 10],
  ["VI", "US Virgin Islands", "+1340", 7],
  ["UY", "Uruguay", "+598", 8],
  ["UZ", "Uzbekistan", "+998", 9],
  ["VU", "Vanuatu", "+678", 7],
  ["VA", "Vatican City", "+379", 10],
  ["VE", "Venezuela", "+58", 10],
  ["VN", "Vietnam", "+84", 9],
  ["YE", "Yemen", "+967", 9],
  ["ZM", "Zambia", "+260", 9],
  ["ZW", "Zimbabwe", "+263", 9],
];

export const PHONE_COUNTRIES: PhoneCountry[] = RAW.map(
  ([iso, name, dialCode, localLength]) => ({ iso, name, dialCode, localLength })
).sort((a, b) => a.name.localeCompare(b.name));

// CakeNTake operates in Kuwait: default to +965 (defaulting to India caused
// Kuwait numbers to be saved as "+91XXXXXXXX" — client report 13/10/2026).
export const DEFAULT_PHONE_COUNTRY: PhoneCountry =
  PHONE_COUNTRIES.find((c) => c.iso === "KW") ?? PHONE_COUNTRIES[0];

export const onlyPhoneDigits = (value: string): string => value.replace(/\D/g, "");

export const isCompleteLocalPhone = (country: PhoneCountry, value: string): boolean =>
  onlyPhoneDigits(value).length === country.localLength;

export const buildInternationalPhone = (country: PhoneCountry, value: string): string =>
  `${country.dialCode}${onlyPhoneDigits(value).slice(0, country.localLength)}`;

/**
 * Split any stored phone ("+96551234567", "96551234567", "0096551234567",
 * "51234567") into a country + local number. Local 8-digit numbers are Kuwait.
 */
export const splitStoredPhone = (value?: string | null): { country: PhoneCountry; local: string } => {
  const raw = String(value || "").trim();
  let digits = onlyPhoneDigits(raw);
  if (raw.startsWith("00")) digits = digits.slice(2);
  if (!digits) return { country: DEFAULT_PHONE_COUNTRY, local: "" };

  const kw = PHONE_COUNTRIES.find((c) => c.iso === "KW")!;
  if (digits.length === kw.localLength && !raw.startsWith("+")) {
    return { country: kw, local: digits };
  }
  // Longest dial code first so "+971" wins over "+97"; require the exact length.
  const byCode = [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of byCode) {
    const code = country.dialCode.replace("+", "");
    if (digits.startsWith(code) && digits.length === code.length + country.localLength) {
      return { country, local: digits.slice(code.length) };
    }
  }
  return { country: DEFAULT_PHONE_COUNTRY, local: digits.slice(-DEFAULT_PHONE_COUNTRY.localLength) };
};

/** Kuwait numbers must start with 2, 4, 5, 6 or 9 (landline / mobile). */
export const phoneLocalError = (country: PhoneCountry, value: string): string | null => {
  const local = onlyPhoneDigits(value);
  if (local.length !== country.localLength) {
    return `${country.name} numbers must be exactly ${country.localLength} digits`;
  }
  if (country.iso === "KW" && !/^[124569]/.test(local)) {
    return "Kuwait numbers start with 2, 4, 5, 6 or 9";
  }
  return null;
};
