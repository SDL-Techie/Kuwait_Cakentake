import React from "react";

/* ── Animated baker-bot mascot (waves its arm on hover of any .baker-hover-target ancestor) ── */
interface BakerBotProps {
  size?: number;
  animate?: boolean;
}

export const BakerBot: React.FC<BakerBotProps> = ({ size = 40, animate = true }) => (
  <svg
    className={`baker-bot ${animate ? "baker-bot-animated" : ""}`}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    {/* waving arm (behind body) */}
    <g className="baker-bot-arm">
      <rect x="49" y="40" width="6" height="14" rx="3" fill="#ffffff" />
      <circle cx="52" cy="55" r="4.2" fill="#ffffff" />
    </g>

    {/* chef hat */}
    <g className="baker-bot-hat">
      <circle cx="24" cy="12" r="6.5" fill="#ffffff" />
      <circle cx="32" cy="9" r="7.5" fill="#ffffff" />
      <circle cx="40" cy="12" r="6.5" fill="#ffffff" />
      <rect x="22" y="12" width="20" height="8" rx="2" fill="#ffffff" />
      <rect x="22" y="17" width="20" height="3" rx="1.5" fill="#cfe6d3" />
    </g>

    {/* head */}
    <rect x="13" y="20" width="38" height="30" rx="13" fill="#ffffff" />
    <rect x="17.5" y="24.5" width="29" height="21" rx="9.5" fill="#1f3325" />

    {/* eyes */}
    <g className="baker-bot-eyes">
      <ellipse cx="26" cy="33.5" rx="3" ry="3.6" fill="#8fd6a0" />
      <ellipse cx="38" cy="33.5" rx="3" ry="3.6" fill="#8fd6a0" />
    </g>

    {/* smile */}
    <path d="M27 40.5c1.6 2 8.4 2 10 0" stroke="#8fd6a0" strokeWidth="2" strokeLinecap="round" />

    {/* ears */}
    <rect x="9" y="30" width="4" height="9" rx="2" fill="#cfe6d3" />
    <rect x="51" y="30" width="4" height="9" rx="2" fill="#cfe6d3" />
  </svg>
);

/* ── WhatsApp glyph (brand path) ── */
export const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default BakerBot;