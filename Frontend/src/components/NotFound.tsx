// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Home, AlertTriangle } from 'lucide-react';

// const NotFound: React.FC = () => {
//   const navigate = useNavigate();
//   const [isHomeHovered, setIsHomeHovered] = useState(false);
//   const [isBackHovered, setIsBackHovered] = useState(false);

//   // --- Inline CSS Styles Object ---
//   const styles = {
//     container: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '100vh', // Changed to 100vh to let the gradient fill the entire screen
//       padding: '20px',
//       background: 'linear-gradient(135deg, #8b1a42, #c23b6a, #d4567a)',
//       fontFamily: 'system-ui, -apple-system, sans-serif',
//       boxSizing: 'border-box' as const,
//     } as React.CSSProperties,

//     card: {
//       display: 'flex',
//       flexDirection: 'column' as const,
//       alignItems: 'center',
//       textAlign: 'center' as const,
//       maxWidth: '440px',
//       width: '100%',
//       backgroundColor: '#ffffff',
//       padding: '40px 30px',
//       borderRadius: '24px',
//       boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
//     },

//     iconBox: {
//       backgroundColor: '#fdf2f8', // Soft pink/rose tint
//       color: '#c23b6a',            // Matching berry/rose warning color
//       padding: '20px',
//       borderRadius: '50%',
//       marginBottom: '24px',
//       display: 'inline-flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//     } as React.CSSProperties,

//     title: {
//       fontSize: '2rem',
//       fontWeight: 700,
//       color: '#111827',
//       margin: '0 0 10px 0',
//       letterSpacing: '-0.025em',
//     },

//     message: {
//       fontSize: '0.95rem',
//       lineHeight: 1.5,
//       color: '#4b5563',
//       margin: '0 0 32px 0',
//     },

//     actions: {
//       display: 'flex',
//       flexDirection: 'row' as const,
//       alignItems: 'center',
//       gap: '16px',
//       justifyContent: 'center',
//       flexWrap: 'wrap' as const,
//     },

//     btnHome: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       // Base color uses the dark berry (#8b1a42) transitioning to the medium rose (#c23b6a) on hover
//       backgroundColor: isHomeHovered ? '#c23b6a' : '#8b1a42', 
//       color: '#ffffff',
//       fontSize: '0.95rem',
//       fontWeight: 500,
//       padding: '12px 24px',
//       border: 'none',
//       borderRadius: '12px',
//       cursor: 'pointer',
//       transform: isHomeHovered ? 'translateY(-1px)' : 'translateY(0)',
//       transition: 'all 0.2s ease',
//       boxShadow: isHomeHovered 
//         ? '0 6px 12px -1px rgba(139, 26, 66, 0.35)' 
//         : '0 4px 6px -1px rgba(139, 26, 66, 0.2)',
//     } as React.CSSProperties,

//     btnBack: {
//       background: 'none',
//       border: 'none',
//       // Hover dynamic transition to match the dark berry color
//       color: isBackHovered ? '#8b1a42' : '#6b7280', 
//       fontSize: '0.9rem',
//       fontWeight: 600,
//       cursor: 'pointer',
//       padding: '8px 12px',
//       transition: 'color 0.15s ease',
//     } as React.CSSProperties,
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         {/* Warning Icon Box */}
//         <div style={styles.iconBox}>
//           <AlertTriangle size={44} />
//         </div>

//         {/* Text Area */}
//         <h1 style={styles.title}>Oops! Page Not Found</h1>
//         <p style={styles.message}>
//           It looks like you've taken a wrong turn or entered a route that doesn't exist. 
//           Let's get you back to enjoying something delicious!
//         </p>

//         {/* Action Button Navigation */}
//         <div style={styles.actions}>
//           <button 
//             onClick={() => navigate('/')} 
//             style={styles.btnHome}
//             onMouseEnter={() => setIsHomeHovered(true)}
//             onMouseLeave={() => setIsHomeHovered(false)}
//           >
//             <Home size={18} />
//             Go to Home Page
//           </button>
          
//           <button 
//             onClick={() => navigate(-1)} 
//             style={styles.btnBack}
//             onMouseEnter={() => setIsBackHovered(true)}
//             onMouseLeave={() => setIsBackHovered(false)}
//           >
//             &larr; Go Back
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotFound;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 404 Page — cookie-themed, matches reference design:
 * pink/cream page background, white rounded card, "4[cookie]4" heading,
 * warm tan subtext, bold "Take It and Go Back →" link.
 * Fully responsive: mobile / tablet / laptop / desktop.
 */

const CookieGraphic: React.FC = () => (
  <svg
    viewBox="0 0 140 140"
    width="clamp(72px, 14vw, 120px)"
    height="clamp(72px, 14vw, 120px)"
    style={{ display: 'block', overflow: 'visible' }}
    aria-hidden="true"
  >
    {/* ── crumbs above the cookie ── */}
    <g>
      <path
        d="M22 24c3-6 11-9 17-6 5 2 7 8 4 13-3 4-10 6-15 3-5-2-8-7-6-10z"
        fill="#5b3a2e"
      />
      <circle cx="18" cy="18" r="2.4" fill="#3d2418" />
      <circle cx="32" cy="30" r="2" fill="#3d2418" />
    </g>
    <g>
      <path
        d="M112 20c4-5 12-6 17-2 4 3 5 9 1 13-4 4-11 4-16 0-4-3-5-8-2-11z"
        fill="#5b3a2e"
      />
      <circle cx="122" cy="16" r="2.2" fill="#3d2418" />
      <circle cx="110" cy="26" r="2" fill="#3d2418" />
    </g>

    {/* ── main cookie body with a bite taken out (top-right) ── */}
    <mask id="biteMask">
      <rect x="0" y="0" width="140" height="140" fill="white" />
      <circle cx="108" cy="42" r="26" fill="black" />
    </mask>

    <g mask="url(#biteMask)">
      {/* irregular cookie edge using several overlapping circles for a hand-made look */}
      <circle cx="70" cy="80" r="54" fill="#6b4534" />
      <circle cx="30" cy="60" r="14" fill="#6b4534" />
      <circle cx="112" cy="90" r="16" fill="#6b4534" />
      <circle cx="90" cy="125" r="14" fill="#6b4534" />
      <circle cx="40" cy="118" r="15" fill="#6b4534" />

      {/* chocolate chips */}
      <circle cx="48" cy="55" r="5" fill="#2e1a10" />
      <circle cx="62" cy="90" r="6" fill="#2e1a10" />
      <circle cx="88" cy="65" r="4.5" fill="#2e1a10" />
      <circle cx="95" cy="105" r="5" fill="#2e1a10" />
      <circle cx="40" cy="95" r="4" fill="#2e1a10" />
      <circle cx="75" cy="45" r="3.5" fill="#2e1a10" />
    </g>

    {/* ── visible wafer/marshmallow bit at the bite line ── */}
    <rect x="88" y="70" width="9" height="20" rx="2" fill="#f4e6cf" transform="rotate(8 92 80)" />
  </svg>
);

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [isLinkHovered, setIsLinkHovered] = useState(false);

  const styles: { [key: string]: React.CSSProperties } = {
    page: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7e7de',
      padding: 'clamp(16px, 4vw, 40px)',
      boxSizing: 'border-box',
      fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    card: {
      width: '100%',
      maxWidth: '760px',
      background: '#ffffff',
      borderRadius: 'clamp(18px, 3vw, 28px)',
      boxShadow: '0 25px 60px -15px rgba(90, 50, 30, 0.25)',
      padding: 'clamp(36px, 8vw, 72px) clamp(20px, 6vw, 60px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
    headingRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'clamp(4px, 1.5vw, 14px)',
      marginBottom: 'clamp(20px, 4vw, 32px)',
    },
    digit: {
      fontSize: 'clamp(3.2rem, 12vw, 6rem)',
      fontWeight: 800,
      color: '#241a16',
      lineHeight: 1,
      letterSpacing: '-0.02em',
    },
    message: {
      fontSize: 'clamp(1rem, 2.4vw, 1.3rem)',
      lineHeight: 1.5,
      color: '#c98a4b',
      fontWeight: 500,
      margin: '0 0 clamp(20px, 4vw, 28px) 0',
      maxWidth: '32ch',
    },
    link: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      fontWeight: 700,
      color: isLinkHovered ? '#c23b6a' : '#241a16',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 4px',
      transition: 'color 0.2s ease, transform 0.2s ease',
      transform: isLinkHovered ? 'translateX(3px)' : 'translateX(0)',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headingRow}>
          <span style={styles.digit}>4</span>
          <CookieGraphic />
          <span style={styles.digit}>4</span>
        </div>

        <p style={styles.message}>
          The page you are looking for is missing, but here&rsquo;s a cookie for you.
        </p>

        <button
          onClick={() => navigate(-1)}
          style={styles.link}
          onMouseEnter={() => setIsLinkHovered(true)}
          onMouseLeave={() => setIsLinkHovered(false)}
        >
          Take It and Go Back <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;