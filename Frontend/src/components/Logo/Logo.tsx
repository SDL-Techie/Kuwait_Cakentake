// import React from 'react';

// const Logo: React.FC<{ className?: string }> = ({ className }) => {
//   return (
//     <div className={`rasi-logo-wrapper ${className}`}>
//       {/* <svg 
//         width="40" 
//         height="40" 
//         viewBox="0 0 100 100" 
//         fill="none" 
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <circle cx="50" cy="50" r="48" stroke="#5D2E0C" strokeWidth="4" fill="#FFF9F5"/>
//         <path 
//           d="M30 70V30H50C60 30 65 35 65 42.5C65 50 60 55 50 55H40V70H30ZM40 45H50C55 45 55 40 55 40C55 35 50 35 50 35H40V45Z" 
//           fill="#5D2E0C"
//         />
//         <path 
//           d="M55 55L70 75" 
//           stroke="#5D2E0C" 
//           strokeWidth="6" 
//           strokeLinecap="round"
//         />
//         <path 
//           d="M75 30C75 30 85 35 85 45C85 55 75 60 75 60" 
//           stroke="#D4AF37" 
//           strokeWidth="3" 
//           strokeLinecap="round"
//         />
//       </svg> */}
//       <img className="rasi-logo-img" style={{ width: '40px', height: '40px' }} src="/assets/logo.png" alt="Rasi Bakery Logo"/>
//       <div className="rasi-logo-text">
//         {/* <span className="rasi-logo-main">RASI</span>
//         <span className="rasi-logo-sub">BAKERY</span>
//         <span className="rasi-logo-sub">RAJAGIRI</span> */}
//             <span className="rasi-logo-main">RAJAGIRI</span>
//         <span className="rasi-logo-sub">RASI BAKERY</span>
//         {/* <span className="rasi-logo-sub">BAKERY</span> */}
//       </div>
//     </div>
//   );
// };

// export default Logo;


import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Decorative left scroll */}
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '18px',
            letterSpacing: '0.16em',
            opacity: 0.6,
            color: '#df9595'
          }}>
            ❧
          </span>
          
          {/* Main Brand Script */}
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '24px',
            fontStyle: 'italic',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: '#4e3629',
            transition: 'color 0.3s ease',
            marginTop: '2px'
          }}>
            Cakentake
          </span>
          
          {/* Decorative right scroll */}
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '18px',
            letterSpacing: '0.16em',
            opacity: 0.6,
            color: '#df9595'
          }}>
            ☙
          </span>
        </div>
        
        {/* Sub-label */}
        <span style={{
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          fontFamily: 'monospace',
          color: 'rgba(223, 149, 149, 0.8)',
          marginTop: '-2px',
          fontWeight: 500
        }}>
          Haute Pâtisserie
        </span>
      </div>
    </Link>
  );
}