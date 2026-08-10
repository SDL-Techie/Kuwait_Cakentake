import { useState } from "react";
// import pandaCake from "../../../public/assets/pandaCake.jpeg";
// import chocolateSlice from "../../../public/assets/chocolateSlice.jpeg";

interface CakeHeroShowcaseProps {
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export default function CakeHeroShowcase({
  heading = "Better cakes for more celebrations",
  subtext = "For over a decade, we've helped our customers discover new flavors, baked fresh and delivered right to their doorstep",
  ctaLabel,
  onCtaClick,
}: CakeHeroShowcaseProps) {
  const [playKey, setPlayKey] = useState(0);
  const replay = () => setPlayKey((k) => k + 1);

  return (
    <div className="chs-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito+Sans:wght@400;600;700&display=swap');

        .chs-root {
          --chs-cream: #ffffff;
          --chs-cocoa: #566072;
          --chs-accent: #ef5d63;
          --chs-line: #f4c9cb;
          box-sizing: border-box;
          width: 100%;
          background: var(--chs-cream);
          font-family: 'Nunito Sans', sans-serif;
        }
        .chs-root *, .chs-root *::before, .chs-root *::after { box-sizing: border-box; }

        .chs-stage {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          height: clamp(380px, 56vw, 560px);
          overflow: hidden;
        }

        .chs-lines { position: absolute; inset: 0; width: 100%; height: 100%; }
        .chs-lines path {
          fill: none;
          stroke: var(--chs-line);
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: chs-draw 2.2s ease-out forwards;
        }
        .chs-lines path.chs-line-right { animation-delay: 0.15s; }

        @keyframes chs-draw { to { stroke-dashoffset: 0; } }

        .chs-icon {
          position: absolute;
          opacity: 0;
          transform-origin: center;
          animation: chs-enter 0.7s ease-out forwards, chs-float 5s ease-in-out infinite;
        }
        .chs-icon svg { width: 100%; height: 100%; display: block; }
        .chs-photo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 14px 22px rgba(86, 96, 114, 0.25));
        }

        @keyframes chs-enter {
          from { opacity: 0; transform: scale(0.75) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes chs-float {
          0%, 100% { transform: translateY(0) rotate(var(--chs-rot, 0deg)); }
          50%      { transform: translateY(-12px) rotate(var(--chs-rot, 0deg)); }
        }

        .chs-cupcake {
          left: 4%; top: 22%; width: 200px; height: 200px;
          --chs-rot: -3deg;
          animation-delay: 0.1s, 0.1s;
          animation-duration: 0.7s, 4.6s;
        }
        .chs-mint {
          left: 26%; top: 8%; width: 34px; height: 34px;
          --chs-rot: 8deg;
          animation-delay: 0.35s, 0.9s;
          animation-duration: 0.6s, 3.8s;
        }
        .chs-cherry-left {
          left: 8%; top: 80%; width: 36px; height: 36px;
          --chs-rot: -10deg;
          animation-delay: 0.5s, 1.1s;
          animation-duration: 0.6s, 4.2s;
        }
        .chs-cherry-right {
          right: 10%; top: 10%; width: 32px; height: 32px;
          --chs-rot: -6deg;
          animation-delay: 0.55s, 1.3s;
          animation-duration: 0.6s, 4s;
        }
        .chs-slice {
          right: 6%; top: 40%; width: 210px; height: 210px;
          --chs-rot: 6deg;
          animation-delay: 0.3s, 0.3s;
          animation-duration: 0.7s, 4.8s;
        }

        .chs-content {
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: min(72%, 620px);
          text-align: center;
        }
        .chs-heading {
          margin: 0 0 16px;
          font-family: 'Baloo 2', sans-serif;
          font-weight: 800;
          font-size: clamp(1.9rem, 4.2vw, 3.1rem);
          line-height: 1.15;
          color: var(--chs-accent);
          opacity: 0;
          animation: chs-rise 0.7s ease-out forwards;
          animation-delay: 0.5s;
        }
        .chs-subtext {
          margin: 0 auto;
          max-width: 460px;
          font-size: clamp(0.95rem, 1.3vw, 1.08rem);
          color: var(--chs-cocoa);
          line-height: 1.6;
          opacity: 0;
          animation: chs-rise 0.7s ease-out forwards;
          animation-delay: 0.7s;
        }
        .chs-cta {
          margin-top: 22px;
          appearance: none;
          border: none;
          cursor: pointer;
          background: var(--chs-accent);
          color: #fff;
          font-family: 'Nunito Sans', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 12px 30px;
          border-radius: 999px;
          opacity: 0;
          animation: chs-rise 0.7s ease-out forwards;
          animation-delay: 0.9s;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 8px 18px rgba(239, 93, 99, 0.3);
        }
        .chs-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(239, 93, 99, 0.4); }

        @keyframes chs-rise {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .chs-replay {
          display: block;
          margin: 6px auto 0;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.78rem;
          color: var(--chs-cocoa);
          text-decoration: underline;
          text-underline-offset: 3px;
          opacity: 0.65;
        }
        .chs-replay:hover { opacity: 1; }

        @media (max-width: 640px) {
          .chs-cupcake  { width: 120px; height: 120px; left: 2%; top: 20%; }
          .chs-slice    { width: 124px; height: 124px; right: 3%; top: 46%; }
          .chs-mint     { display: none; }
          .chs-cherry-left, .chs-cherry-right { width: 24px; height: 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .chs-icon, .chs-heading, .chs-subtext, .chs-cta, .chs-lines path {
            animation: none !important;
            opacity: 1 !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>

      <div className="chs-stage" key={playKey}>
        <svg className="chs-lines" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
          <path
            className="chs-line-left"
            d="M -20,20 C 60,10 120,60 90,110 C 55,175 -30,150 10,90 C 45,40 140,50 180,110 C 230,185 150,260 90,320 C 30,380 -10,430 20,480"
          />
          <path
            className="chs-line-right"
            d="M 1220,30 C 1120,10 1050,70 1110,120 C 1160,165 1230,150 1220,100 C 1200,270 1080,360 1140,430 C 1180,475 1230,470 1210,520"
          />
        </svg>
{/* 
        <div className="chs-icon chs-cupcake">
          <img className="chs-photo" src={pandaCake} alt="Round frosted panda-themed cake" />
        </div> */}
        <div className="chs-icon chs-mint"><MintIcon /></div>
        <div className="chs-icon chs-cherry-left"><CherryIcon /></div>
        <div className="chs-icon chs-cherry-right"><CherryIcon /></div>
        {/* <div className="chs-icon chs-slice">
          <img className="chs-photo" src={chocolateSlice} alt="Slice of layered chocolate cake with sprinkles" />
        </div> */}

        <div className="chs-content">
          <h1 className="chs-heading">{heading}</h1>
          <p className="chs-subtext">{subtext}</p>
          {ctaLabel && (
            <button className="chs-cta" onClick={onCtaClick}>{ctaLabel}</button>
          )}
        </div>
      </div>

      {/* <button className="chs-replay" onClick={replay}>Replay animation</button> */}
    </div>
  );
}

function MintIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 4 C30 8 32 20 20 34 C8 20 10 8 20 4 Z" fill="#6fb37a" />
      <path d="M20 8 L20 30" stroke="#4f8f5a" strokeWidth="1.5" />
    </svg>
  );
}

function CherryIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="#ef5d63" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="#c8393f" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="4.5" fill="#fff4e8" />
      <path d="M20 20 L28 8" stroke="#4f8f5a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}