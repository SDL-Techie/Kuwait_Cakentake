import React from 'react';
import './SimpleCookieAnimation.css';

interface SimpleCookieAnimationProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const SimpleCookieAnimation: React.FC<SimpleCookieAnimationProps> = ({
  size = 'medium',
  showText = true
}) => {
  return (
    <div className="simple-cookie-container">
      <div className={`simple-cookie ${size}`}>
        <svg
          className="simple-cookie-svg"
          viewBox="0 0 160 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle - Cookie body */}
          <circle
            cx="80"
            cy="80"
            r="75"
            className="cookie-outer"
          />
          
          {/* Inner circle - creates donut effect */}
          <circle
            cx="80"
            cy="80"
            r="65"
            className="cookie-inner"
          />
          
          {/* Rotating stroke - main animation */}
          <circle
            cx="80"
            cy="80"
            r="70"
            className="rotating-stroke"
          />
          
          {/* Chocolate chips */}
          <circle cx="60" cy="60" r="4" className="chip" />
          <circle cx="100" cy="70" r="4" className="chip" />
          <circle cx="75" cy="95" r="4" className="chip" />
          <circle cx="105" cy="95" r="4" className="chip" />
          <circle cx="55" cy="100" r="3" className="chip" />
        </svg>
        
        {showText && <div className="cookie-loading-text">Loading</div>}
      </div>
    </div>
  );
};

export default SimpleCookieAnimation;