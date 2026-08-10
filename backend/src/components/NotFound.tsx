import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [isHomeHovered, setIsHomeHovered] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);

  // --- Inline CSS Styles Object ---
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh', // Changed to 100vh to let the gradient fill the entire screen
      padding: '20px',
      background: 'linear-gradient(135deg, #8b1a42, #c23b6a, #d4567a)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    card: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      maxWidth: '440px',
      width: '100%',
      backgroundColor: '#ffffff',
      padding: '40px 30px',
      borderRadius: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    },

    iconBox: {
      backgroundColor: '#fdf2f8', // Soft pink/rose tint
      color: '#c23b6a',            // Matching berry/rose warning color
      padding: '20px',
      borderRadius: '50%',
      marginBottom: '24px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,

    title: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#111827',
      margin: '0 0 10px 0',
      letterSpacing: '-0.025em',
    },

    message: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
      color: '#4b5563',
      margin: '0 0 32px 0',
    },

    actions: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
    },

    btnHome: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      // Base color uses the dark berry (#8b1a42) transitioning to the medium rose (#c23b6a) on hover
      backgroundColor: isHomeHovered ? '#c23b6a' : '#8b1a42', 
      color: '#ffffff',
      fontSize: '0.95rem',
      fontWeight: 500,
      padding: '12px 24px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transform: isHomeHovered ? 'translateY(-1px)' : 'translateY(0)',
      transition: 'all 0.2s ease',
      boxShadow: isHomeHovered 
        ? '0 6px 12px -1px rgba(139, 26, 66, 0.35)' 
        : '0 4px 6px -1px rgba(139, 26, 66, 0.2)',
    } as React.CSSProperties,

    btnBack: {
      background: 'none',
      border: 'none',
      // Hover dynamic transition to match the dark berry color
      color: isBackHovered ? '#8b1a42' : '#6b7280', 
      fontSize: '0.9rem',
      fontWeight: 600,
      cursor: 'pointer',
      padding: '8px 12px',
      transition: 'color 0.15s ease',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Warning Icon Box */}
        <div style={styles.iconBox}>
          <AlertTriangle size={44} />
        </div>

        {/* Text Area */}
        <h1 style={styles.title}>Oops! Page Not Found</h1>
        <p style={styles.message}>
          It looks like you've taken a wrong turn or entered a route that doesn't exist. 
          Let's get you back to enjoying something delicious!
        </p>

        {/* Action Button Navigation */}
        <div style={styles.actions}>
          <button 
            onClick={() => navigate('/')} 
            style={styles.btnHome}
            onMouseEnter={() => setIsHomeHovered(true)}
            onMouseLeave={() => setIsHomeHovered(false)}
          >
            <Home size={18} />
            Go to Home Page
          </button>
          
          <button 
            onClick={() => navigate(-1)} 
            style={styles.btnBack}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
          >
            &larr; Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;