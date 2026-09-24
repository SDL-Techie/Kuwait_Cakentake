// import React, { useEffect, useRef, useState } from "react";
// import {
//   PHONE_COUNTRIES,
//   PhoneCountry,
//   onlyPhoneDigits,
// } from "../../constants/phoneCountries";
// import "./PhoneInput.css";

// type Props = {
//   country: PhoneCountry;
//   value: string;
//   onCountryChange: (country: PhoneCountry) => void;
//   onChange: (value: string) => void;
//   id?: string;
//   required?: boolean;
//   disabled?: boolean;
//   className?: string;
//   placeholder?: string;
// };

// export default function PhoneInput({
//   country,
//   value,
//   onCountryChange,
//   onChange,
//   id,
//   required,
//   disabled,
//   className = "",
//   placeholder,
// }: Props): React.JSX.Element {
//   const [open, setOpen] = useState(false);
//   const rootRef = useRef<HTMLDivElement | null>(null);
//   const digits = onlyPhoneDigits(value).slice(0, country.localLength);

//   useEffect(() => {
//     const close = (event: MouseEvent) => {
//       if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
//     };
//     const escape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") setOpen(false);
//     };
//     document.addEventListener("mousedown", close);
//     document.addEventListener("keydown", escape);
//     return () => {
//       document.removeEventListener("mousedown", close);
//       document.removeEventListener("keydown", escape);
//     };
//   }, []);

//   const choose = (next: PhoneCountry) => {
//     onCountryChange(next);
//     onChange(onlyPhoneDigits(value).slice(0, next.localLength));
//     setOpen(false);
//   };

//   return (
//     <div ref={rootRef} className={`country-phone ${className}`.trim()}>
//       <div className={`country-phone-control ${open ? "country-phone-control-open" : ""}`}>
//         <button
//           type="button"
//           className="country-phone-trigger"
//           onClick={() => !disabled && setOpen((v) => !v)}
//           disabled={disabled}
//           aria-label="Choose country code"
//           aria-expanded={open}
//         >
//           <span className="country-phone-flag">{country.flag}</span>
//           <span className="country-phone-country">
//             <strong>{country.iso}</strong>
//             <small>{country.dialCode}</small>
//           </span>
//           <span className={`country-phone-chevron ${open ? "is-open" : ""}`}>⌄</span>
//         </button>
//         <span className="country-phone-divider" />
//         <input
//           id={id}
//           type="tel"
//           inputMode="numeric"
//           autoComplete="tel-national"
//           value={digits}
//           maxLength={country.localLength}
//           disabled={disabled}
//           required={required}
//           placeholder={placeholder || `${country.localLength}-digit mobile number`}
//           onChange={(event) =>
//             onChange(onlyPhoneDigits(event.target.value).slice(0, country.localLength))
//           }
//           className="country-phone-input"
//         />
//         <span className="country-phone-count">{digits.length}/{country.localLength}</span>
//       </div>

//       {open && (
//         <div className="country-phone-menu" role="listbox" aria-label="Country codes">
//           {PHONE_COUNTRIES.map((item) => {
//             const selected = item.iso === country.iso;
//             return (
//               <button
//                 type="button"
//                 key={item.iso}
//                 role="option"
//                 aria-selected={selected}
//                 className={`country-phone-option ${selected ? "is-selected" : ""}`}
//                 onClick={() => choose(item)}
//               >
//                 <span className="country-phone-option-flag">{item.flag}</span>
//                 <span className="country-phone-option-copy">
//                   <strong>{item.name}</strong>
//                   <small>{item.localLength}-digit mobile number</small>
//                 </span>
//                 <span className="country-phone-option-code">{item.dialCode}</span>
//                 <span className="country-phone-option-check">{selected ? "✓" : ""}</span>
//               </button>
//             );
//           })}
//         </div>
//       )}

//       <div className="country-phone-hint">
//         {country.flag} {country.name} {country.dialCode} · exactly {country.localLength} digits
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PHONE_COUNTRIES,
  PhoneCountry,
  onlyPhoneDigits,
} from "../../constants/phoneCountries";
import "./PhoneInput.css";

type Props = {
  country: PhoneCountry;
  value: string;
  onCountryChange: (country: PhoneCountry) => void;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

/* Flag as an image so it also shows on Windows (which has no flag emoji) */
function Flag({ iso, className }: { iso: string; className: string }): React.JSX.Element {
  const code = iso.toLowerCase();
  return (
    <img
      className={className}
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={24}
      height={18}
      alt=""
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}

export default function PhoneInput({
  country,
  value,
  onCountryChange,
  onChange,
  id,
  required,
  disabled,
  className = "",
  placeholder,
}: Props): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const digits = onlyPhoneDigits(value).slice(0, country.localLength);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [query]);

  const choose = (next: PhoneCountry) => {
    onCountryChange(next);
    onChange(onlyPhoneDigits(value).slice(0, next.localLength));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`country-phone ${className}`.trim()}>
      <div className={`country-phone-control ${open ? "country-phone-control-open" : ""}`}>
        <button
          type="button"
          className="country-phone-trigger"
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
          aria-label="Choose country code"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Flag iso={country.iso} className="country-phone-flag" />
          <span className="country-phone-dial">{country.dialCode}</span>
          <svg
            className={`country-phone-chevron ${open ? "is-open" : ""}`}
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <span className="country-phone-divider" />
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={digits}
          maxLength={country.localLength}
          disabled={disabled}
          required={required}
          placeholder={placeholder || `${country.localLength}-digit mobile number`}
          onChange={(event) =>
            onChange(onlyPhoneDigits(event.target.value).slice(0, country.localLength))
          }
          className="country-phone-input"
        />
        <span
          className={`country-phone-count ${
            digits.length === country.localLength ? "is-complete" : ""
          }`}
        >
          {digits.length}/{country.localLength}
        </span>
      </div>

      {open && (
        <div className="country-phone-menu">
          <div className="country-phone-search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              aria-label="Search countries"
            />
          </div>

          <div className="country-phone-list" role="listbox" aria-label="Country codes">
            {filtered.length === 0 && <div className="country-phone-empty">No country found</div>}
            {filtered.map((item) => {
              const selected = item.iso === country.iso;
              return (
                <button
                  type="button"
                  key={item.iso}
                  role="option"
                  aria-selected={selected}
                  className={`country-phone-option ${selected ? "is-selected" : ""}`}
                  onClick={() => choose(item)}
                >
                  <Flag iso={item.iso} className="country-phone-option-flag" />
                  <span className="country-phone-option-copy">
                    <strong>{item.name}</strong>
                    <small>{item.localLength}-digit mobile number</small>
                  </span>
                  <span className="country-phone-option-code">{item.dialCode}</span>
                  <span className="country-phone-option-check">{selected ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="country-phone-hint">
        <Flag iso={country.iso} className="country-phone-hint-flag" />
        <span>
          {country.name} {country.dialCode} · exactly {country.localLength} digits
        </span>
      </div>
    </div>
  );
}