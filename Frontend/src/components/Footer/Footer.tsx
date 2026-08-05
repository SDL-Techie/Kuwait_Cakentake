// import React from 'react';
// import './Footer.css';

// const Footer = () => {
//   const linkSections = [
//     {
//       title: "Quick Links",
//       links: [
//         { label: "Home", href: "/" },
//         { label: "Store", href: "/products" },
//         { label: "About", href: "/about" },
//         { label: "Contact", href: "/contact" }
//       ],
//     },
//     {
//       title: "Policy Info",
//       links: [
//         { label: "Terms & Conditions", href: "/terms" },
//         { label: "Privacy Policy", href: "/privacy" }
//       ],
//     }
//   ];

//   return (
//     <footer className="footer">
//       <div className="footer-container">
        
//         {/* --- Main Navigation Section --- */}
//         <div className="footer-content">
          
//           {/* Brand & Branches Info */}
//           <div className="footer-column branch-info-section">
//             <h4>Our Branches</h4>
//             <div className="branch-location">
//               <strong>Kuwait:</strong>
//               <p>No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait</p>
//             </div>
           
//           </div>

//           {/* Dynamic Link Subsections */}
//           {linkSections.map((section, index) => (
//             <div className="footer-column" key={index}>
//               <h4>{section.title}</h4>
//               <ul>
//                 {section.links.map((link, i) => (
//                   <li key={i}><a href={link.href}>{link.label}</a></li>
//                 ))}
//               </ul>
//             </div>
//           ))}

//           {/* Subscribe Section */}
//           <div className="footer-column subscribe-section">
//             <h4>Subscribe Now</h4>
//             <p>Get updates on delicious promotions and exclusive coupon offers.</p>
//             <div className="subscribe-box">
//               <span className="mail-icon">✉️</span>
//               <input type="email" placeholder="Enter email address" />
//               <button type="button">➔</button>
//             </div>
//           </div>
//         </div>

//         <hr className="footer-divider" />

//         {/* --- Bottom Social, Copyright & Payments Bar --- */}
//         <div className="footer-bottom">
//           <div className="social-icons">
//             <a href="https://Facebook.com/CakeNTakeKWT" aria-label="Facebook" target="_blank" rel="noreferrer">Facebook</a>
//             <a href="https://instagram.com/cakentakekw" aria-label="Instagram" target="_blank" rel="noreferrer">Instagram</a>
//             <a href="https://www.youtube.com/@cakentakekw" aria-label="Youtube" target="_blank" rel="noreferrer">Youtube</a>
//           </div>

//           <div className="copyright">
//             Copyright © 2026 Cake N Take | Developed by SDL Creative Groups Private Limited. All Rights Reserved.
//           </div>

//           <div className="payment-logos">
//             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
//             <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" alt="RuPay" />
//             <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg" alt="Diners Club" />
//             <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" />
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };


// export default Footer;



import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const linkSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "Store", href: "/products" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" }
      ],
    },
    {
      title: "Policy Info",
      links: [
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" }
      ],
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* --- Main Navigation Section --- */}
        <div className="footer-content">
          
          {/* Brand & Branches Info */}
          <div className="footer-column branch-info-section">
            <h4>Our Branches</h4>
            <div className="branch-location">
              <strong>Kuwait:</strong>
              <p>No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait</p>
            </div>
           
          </div>

          {/* Dynamic Link Subsections */}
          {linkSections.map((section, index) => (
            <div className="footer-column" key={index}>
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link, i) => (
                  <li key={i}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}

          {/* Subscribe Section */}
          <div className="footer-column subscribe-section">
            <h4>Subscribe Now</h4>
            <p>Get updates on delicious promotions and exclusive coupon offers.</p>
            <div className="subscribe-box">
              <span className="mail-icon">✉️</span>
              <input type="email" placeholder="Enter email address" />
              <button type="button">➔</button>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* --- Bottom Social, Copyright & Payments Bar --- */}
        <div className="footer-bottom">
          <div className="social-icons">
            <a href="https://Facebook.com/CakeNTakeKWT" aria-label="Facebook" target="_blank" rel="noreferrer">
              <Facebook size={18} />
            </a>
            <a href="https://instagram.com/cakentakekw" aria-label="Instagram" target="_blank" rel="noreferrer">
              <Instagram size={18} />
            </a>
            <a href="https://www.youtube.com/@cakentakekw" aria-label="Youtube" target="_blank" rel="noreferrer">
              <Youtube size={18} />
            </a>
          </div>

          <div className="copyright">
            Copyright © 2026 Cake N Take | Developed by{" "}
            <a href="https://www.sdlcreativegroups.com" target="_blank" rel="noreferrer">
              SDL Creative Groups Private Limited
            </a>
            . All Rights Reserved.
          </div>

          <div className="payment-logos">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" alt="RuPay" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg" alt="Diners Club" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;