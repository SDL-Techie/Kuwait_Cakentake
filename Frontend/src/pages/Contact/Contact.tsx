// import React, { useState } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { 
//   Mail, 
//   Phone, 
//   MapPin, 
//   Clock, 
//   Truck, 
//   ChevronDown, 
//   ChevronUp, 
//   Instagram, 
//   Facebook, 
//   Youtube, 
//   Sparkles, 
//   Send, 
//   Check, 
//   ArrowUpRight, 
//   HelpCircle, 
//   Compass
// } from "lucide-react";
// import "./Contact.css";

// export default function Contact() {
//   // Form State
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [eventType, setEventType] = useState("birthday");
//   const [message, setMessage] = useState("");
//   const [submitted, setSubmitted] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // FAQ Accordion State
//   const [openFaq, setOpenFaq] = useState<number | null>(0);

//   // Custom alert/chime triggers when form is successfully submitted
//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim() || !email.trim()) {
//       return;
//     }

//     setSubmitting(true);
//     // Simulate premium formulation baking
//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     // Play luxurious crystal bell sound (880Hz sine chime)
//     try {
//       const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
//       if (AudioCtx) {
//         const ctx = new AudioCtx();
//         const osc = ctx.createOscillator();
//         const gain = ctx.createGain();
//         osc.type = "sine";
//         osc.frequency.setValueAtTime(880, ctx.currentTime);
//         gain.gain.setValueAtTime(0, ctx.currentTime);
//         gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
//         gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
//         osc.connect(gain);
//         gain.connect(ctx.destination);
//         osc.start();
//         osc.stop(ctx.currentTime + 1.3);
//       }
//     } catch {
//       // Audio context warning ignored gracefully inside iframe
//     }

//     setSubmitting(false);
//     setSubmitted(true);
//   };

//   const handleReset = () => {
//     setName("");
//     setEmail("");
//     setPhone("");
//     setEventType("birthday");
//     setMessage("");
//     setSubmitted(false);
//   };

//   // Luxury FAQ Mock Questions & Details
//   const faqs = [
//     {
//       q: "How early should I place an order?",
//       a: "For bespoke custom cakes (especially tiered structures and personalized wedding confections), we recommend placing your commission 2 to 4 weeks in advance. This grants our culinary artisans sufficient time to design, mature, and refine your bespoke sugar flowers and fillings. For signature standard orders, 48 hours notice is sufficient."
//     },
//     {
//       q: "Can I customize my organic cake?",
//       a: "Absolutely. Our brand was founded on custom pastry creation. You can coordinate custom frosting palettes (pastel blush pinks, gold accents, rustic sage greens), sponge textures, bespoke tier sizes, or request hand-sculpted sugar flowers. Mention your exact theme in our customized planner form above, and we will formulate a personalized specimen for you."
//     },
//     {
//       q: "Do you offer same-day delivery?",
//       a: "We offer limited same-day delivery for standard boutique treats (such as fresh macarons, daily tea cupcakes, and cookies) depending on inventory levels in our Copenhagen and Kyoto flagship locations. Bespoke cakes cannot be prepared on a same-day basis due to our mandatory 12-hour cold sponge rest period."
//     },
//     {
//       q: "What payment methods do you accept?",
//       a: "We accept all premium digital credit cards, Apple Pay, Google Pay, bank wire transfers for high-end wedding installations, and localized cash options in our flagship tea rooms."
//     }
//   ];

//   return (
//     <div className="contact-page" id="studio-contact">
      
//       {/* 1. Hero Section (Parallax visual banner) */}
//       <section className="contact-hero" id="contact-hero">
        
//         {/* Full-width aesthetic background image with overlay */}
//         <div className="hero-bg-wrapper">
//           <img 
//             src="https://i.pinimg.com/736x/d6/d7/9e/d6d79ece55eaa730417377a687ecf237.jpg" 
//             alt="Artisan Cake Background"
//             className="hero-bg-img"
//             referrerPolicy="no-referrer"
//             id="hero-bg-cake-image"
//           />
//           {/* Subtle luxurious rose & wine gradient overlays */}
//           <div className="hero-bg-overlay1" />
//           <div className="hero-bg-overlay2" />
//         </div>

//         {/* Floating Pastel Decorative Elements (Cupcake, macaron, rose) */}
//         <div className="floating-container">
          
//           {/* Floating Macaron element (Left Top) */}
//           <motion.div 
//             animate={{ y: [0, -18, 0], rotate: [5, -5, 5] }}
//             transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
//             className="floating-card-left"
//           >
//             <div className="fl-glass-card">
//               <span className="fl-glass-emoji">🌸</span>
//               <div className="fl-glass-text-group">
//                 <p className="fl-title-bold">Blush Rose Specimen</p>
//                 <p className="fl-desc-light">Edible flora</p>
//               </div>
//             </div>
//           </motion.div>

//           {/* Floating Artisan cake element (Right Center) */}
//           <motion.div 
//             animate={{ y: [0, 15, 0], rotate: [-4, 4, -4] }}
//             transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
//             className="floating-card-right"
//           >
//             <div className="fl-image-card">
//               <div className="fl-image-aspect">
//                 <img 
//                   src="https://i.pinimg.com/1200x/3d/3e/31/3d3e310734550f9dc5f0d0bd75092a49.jpg" 
//                   alt="Aesthetic Macaron detail"
//                   className="fl-aspect-img"
//                   referrerPolicy="no-referrer"
//                 />
//               </div>
//               <div className="fl-image-meta">
//                 <p className="fl-gold-star">★ 24K Gold Dust</p>
//                 <p className="fl-desc-light">Macaron finishes</p>
//               </div>
//             </div>
//           </motion.div>

//           {/* Floating Pastry Accent (Left bottom) */}
//           <motion.div 
//             animate={{ y: [-10, 10, -10], rotate: [0, 8, 0] }}
//             transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2 }}
//             className="floating-card-bottom-left"
//           >
//             <div className="fl-status-badge">
//               <div className="fl-status-flex">
//                 <div className="fl-ping-dot fl-ping-anim" />
//                 <span className="fl-status-lbl">
//                   Oven Heat: 170°C
//                 </span>
//               </div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Content Box */}
//         <div className="hero-content-box">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, ease: "easeOut" }}
//           >
//             {/* Elegant luxury brand pill */}
//             <div className="brand-pill-wrapper">
//               <div className="brand-pill">
//                 <Sparkles className="brand-pill-icon" size={14} />
//                 <span className="brand-pill-text">
//                   CakeNTake Boutique Bakery
//                 </span>
//               </div>
//             </div>

//             <h1 className="hero-title-main">
//               Let's Create Something <br />
//               <span className="hero-title-italic">
//                 Sweet Together
//               </span>
//             </h1>

//             <p className="hero-desc-p">
//               Whether it's a birthday, wedding, anniversary or a special celebration, CakeNTake is here to make every moment unforgettable. Drop us an inquiry to design your custom pastry dream.
//             </p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5, duration: 0.8 }}
//             className="hero-cta-btn-wrapper"
//           >
//             <button
//               onClick={() => {
//                 const el = document.getElementById("luxury-planner-form");
//                 if (el) el.scrollIntoView({ behavior: "smooth" });
//               }}
//               className="hero-cta-btn"
//               id="hero-commission-btn"
//             >
//               Configure Custom Cake
//             </button>
//           </motion.div>
//         </div>

//         {/* Soft bottom wave divider to smooth the transition */}
//         <div className="hero-bottom-wave" />
//       </section>

//       {/* 2. Contact Showcase Section (Glassmorphism Info Cards) */}
//       <section className="coordinates-section" id="contact-showcase">
        
//         <div className="section-hdr">
//           <span className="section-hdr-tag">
//             LUXURY CHANNELS
//           </span>
//           <h2 className="section-hdr-title">
//             The Confectionery Coordinates
//           </h2>
//           <div className="section-hdr-line" />
//         </div>

//         <div className="showcase-grid">
          
//           {/* Phone */}
//           <motion.div 
//             whileHover={{ y: -6 }}
//             className="showcase-card"
//           >
//             <div className="card-backdrop-orb orb-pink-var" />
//             <div className="card-icon-container bg-pink-var">
//               <Phone size={20} />
//             </div>
//             <h3 className="card-label-mono">
//               Studio Phone
//             </h3>
//             <div>
//               <span className="card-value-strong">
//                 +45 88 23 41 02
//               </span>
//               <p className="card-subtext">
//                 Kyoto & Copenhagen
//               </p>
//             </div>
//           </motion.div>

//           {/* Email */}
//           <motion.div 
//             whileHover={{ y: -6 }}
//             className="showcase-card"
//           >
//             <div className="card-backdrop-orb orb-amber-var" />
//             <div className="card-icon-container bg-amber-var">
//               <Mail size={20} />
//             </div>
//             <h3 className="card-label-mono">
//               General Letters
//             </h3>
//             <div>
//               <span className="card-value-strong">
//                 hello@cakentake.com
//               </span>
//               <p className="card-subtext">
//                 Replies under 12 hours
//               </p>
//             </div>
//           </motion.div>

//           {/* Address */}
//           <motion.div 
//             whileHover={{ y: -6 }}
//             className="showcase-card"
//           >
//             <div className="card-backdrop-orb orb-emerald-var" />
//             <div className="card-icon-container bg-emerald-var">
//               <MapPin size={20} />
//             </div>
//             <h3 className="card-label-mono">
//               Flagship Studio
//             </h3>
//             <div>
//               <span className="card-value-strong">
//                 Copenhagen, Denmark
//               </span>
//               <p className="card-subtext">
//                 Indre By Near Canal Rose
//               </p>
//             </div>
//           </motion.div>

//           {/* Hours */}
//           <motion.div 
//             whileHover={{ y: -6 }}
//             className="showcase-card"
//           >
//             <div className="card-backdrop-orb orb-slate-var" />
//             <div className="card-icon-container bg-yellow-var">
//               <Clock size={20} />
//             </div>
//             <h3 className="card-label-mono">
//               Oven Releases
//             </h3>
//             <div>
//               <span className="card-value-strong">
//                 07:00 – 18:00
//               </span>
//               <p className="card-subtext">
//                 Tuesday – Sunday
//               </p>
//             </div>
//           </motion.div>

//           {/* Delivery */}
//           <motion.div 
//             whileHover={{ y: -6 }}
//             className="showcase-card"
//           >
//             <div className="card-backdrop-orb orb-pink-var" />
//             <div className="card-icon-container bg-pink-var">
//               <Truck size={20} />
//             </div>
//             <h3 className="card-label-mono">
//               Serene Delivery
//             </h3>
//             <div>
//               <span className="card-value-strong">
//                 Cph & Kyoto Metro
//               </span>
//               <p className="card-subtext">
//                 Climate-Safe Vehicle
//               </p>
//             </div>
//           </motion.div>

//         </div>
//       </section>

//       {/* 3. Elegant Contact & Custom Order Form inside frosted glass card */}
//       <section className="commission-section" id="luxury-planner-form">
//         <div className="form-inner-wrapper">
          
//           <div className="form-header-block">
//             <span className="form-header-tag">
//               COMMISSION ENGINE
//             </span>
//             <h2 className="form-header-title">
//               Submit Your Sweet Request
//             </h2>
//             <p className="form-header-desc">
//               Our direct formulation process calculates options for custom tiers, edible botanicals, and real-time pâtissier schedules.
//             </p>
//           </div>

//           {/* Frosted Glass Card Container */}
//           <div className="form-glass-card">
            
//             <div className="form-accent-stripe" />
//             <div className="form-accent-orb" />

//             <AnimatePresence mode="wait">
//               {!submitted ? (
//                 <motion.form
//                   key="luxury-form"
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -15 }}
//                   transition={{ duration: 0.4 }}
//                   onSubmit={handleFormSubmit}
//                 >
                  
//                   {/* Grid fields */}
//                   <div className="form-grid-fields">
                    
//                     {/* Name: Floating label input */}
//                     <div className="input-rel-group">
//                       <input
//                         type="text"
//                         required
//                         id="form-name"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         className="form-input-element"
//                         placeholder=" "
//                       />
//                       <label 
//                         htmlFor="form-name"
//                         className="form-input-placeholder-label"
//                       >
//                         Full Name
//                       </label>
//                     </div>

//                     {/* Email: Floating label input */}
//                     <div className="input-rel-group">
//                       <input
//                         type="email"
//                         required
//                         id="form-email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="form-input-element"
//                         placeholder=" "
//                       />
//                       <label 
//                         htmlFor="form-email"
//                         className="form-input-placeholder-label"
//                       >
//                         Email Address
//                       </label>
//                     </div>

//                     {/* Phone Number: Floating label input */}
//                     <div className="input-rel-group">
//                       <input
//                         type="tel"
//                         required
//                         id="form-phone"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         className="form-input-element"
//                         placeholder=" "
//                       />
//                       <label 
//                         htmlFor="form-phone"
//                         className="form-input-placeholder-label"
//                       >
//                         Phone Number
//                       </label>
//                     </div>

//                     {/* Event Type dropdown */}
//                     <div className="input-rel-group">
//                       <span className="select-tag-title">
//                         Celebration Event Type
//                       </span>
//                       <select
//                         value={eventType}
//                         onChange={(e) => setEventType(e.target.value)}
//                         className="form-select-element"
//                       >
//                         <option value="birthday">Birthday Cake Jubilee 🎂</option>
//                         <option value="wedding">Magnificent Wedding Gala 💍</option>
//                         <option value="anniversary">Elegant Anniversary Gateau ✨</option>
//                         <option value="corporate">Private Corporate Soirée 🏢</option>
//                         <option value="party">Comfort Garden Birthday Party 🌼</option>
//                       </select>
//                       <div className="select-arrow-right">
//                         <ChevronDown size={16} />
//                       </div>
//                     </div>

//                   </div>

//                   {/* Message box */}
//                   <div className="textarea-rel-group">
//                     <textarea
//                       required
//                       id="form-msg"
//                       rows={4}
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       className="form-textarea-element"
//                       placeholder=" "
//                     />
//                     <label 
//                       htmlFor="form-msg"
//                       className="form-textarea-placeholder-label"
//                     >
//                       Bespoke Palette Wishes, Allergy Notifications & Notes...
//                     </label>
//                   </div>

//                   {/* Submit button */}
//                   <div className="submit-btn-wrapper">
//                     <button
//                       type="submit"
//                       disabled={submitting}
//                       className="form-submit-btn"
//                     >
//                       {submitting ? (
//                         <>
//                           <span className="submit-spinner" />
//                           <span>Whippings and Sponges Rest...</span>
//                         </>
//                       ) : (
//                         <>
//                           <Send size={14} />
//                           <span>Send Sweet Message</span>
//                         </>
//                       )}
//                     </button>
//                   </div>

//                 </motion.form>
//               ) : (
//                 <motion.div
//                   key="form-success"
//                   initial={{ opacity: 0, scale: 0.96 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.96 }}
//                   className="success-screen"
//                 >
//                   <div className="success-icon-wrapper">
//                     <Check size={28} />
//                   </div>

//                   <div>
//                     <h3 className="success-title">
//                       Your Message has been Sealed!
//                     </h3>
//                     <p className="success-desc">
//                       Thank you, <strong className="success-client-name">{name}</strong>. Our Kyoto and Copenhagen flagship bakers have heard your chime. A receipt was processed to <strong className="success-email">{email}</strong>.
//                     </p>
//                   </div>

//                   <div className="success-summary-card">
//                     <span className="success-summary-tag">
//                       FORMULATION SUMMARY
//                     </span>
//                     <div>• Client: {name}</div>
//                     <div>• Event: {eventType.toUpperCase()}</div>
//                     <div>• Status: Bake Queue Priority I</div>
//                   </div>

//                   <button
//                     onClick={handleReset}
//                     className="success-reset-btn"
//                   >
//                     Bake Another Specimen
//                   </button>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//           </div>

//         </div>
//       </section>

//       {/* 4. Interactive Map Section */}
//       <section className="maps-section" id="google-maps">
//         <div className="maps-outer-wrapper">
//           <div className="maps-framed-container">
            
//             <div className="map-viewport">
//               <iframe 
//                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2249.9722304892425!2d12.576595476645391!3d55.67634287305545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4652531393963283%3s0x46525313e9a0fcd5!2sCopenhagen!5e0!3m2!1sen!2sdk!4v1718423450!500" 
//                 className="map-iframe-el" 
//                 allowFullScreen={true} 
//                 loading="lazy" 
//                 referrerPolicy="no-referrer"
//                 title="CakeNTake Flagship Studio Map Location"
//               />
              
//               {/* Glassmorphism Map overlay float card */}
//               <div className="map-floating-overlay-card">
//                 <div className="map-float-hdr">
//                   <span className="map-float-hdr-tag">
//                     Our Primary Studio
//                   </span>
//                   <h3 className="map-float-hdr-title">
//                     Copenhagen Flagship
//                   </h3>
//                   <p className="map-float-hdr-desc">
//                     Centered elegantly in Indre By. Follow the sweet fragrance of artisan sugar rose.
//                   </p>
//                 </div>
                
//                 <a 
//                   href="https://maps.google.com" 
//                   target="_blank" 
//                   rel="noreferrer"
//                   className="map-directions-anchor-btn"
//                 >
//                   <span>Get Directions</span>
//                   <ArrowUpRight className="map-anchor-icon" />
//                 </a>
//               </div>

//             </div>

//           </div>
//         </div>
//       </section>

//       {/* 5. Social Connect Section (Luxury hover glow icons) */}
//       <section className="social-section" id="social-connect">
//         <div className="social-header-wrap">
          
//           <span className="social-wrap-tag">
//             INSTAGRAMMABLE EXPERIENCE
//           </span>
//           <h2 className="social-wrap-title">
//             Connect on Social Media
//           </h2>
//           <p className="social-wrap-desc">
//             Browse our dynamic daily flower design logs, baking diaries, and private cake unveils.
//           </p>
//         </div>

//         {/* Icons Grid in beautiful circular glass cards */}
//         <div className="social-icons-row">
          
//           {/* Instagram */}
//           <motion.a 
//             href="https://instagram.com" 
//             target="_blank" 
//             rel="noreferrer"
//             className="social-lens-circle-link insta-link-hover"
//           >
//             <Instagram className="sc-lucide-icon-pink" />
//           </motion.a>

//           {/* Facebook */}
//           <motion.a 
//             href="https://facebook.com" 
//             target="_blank" 
//             rel="noreferrer"
//             className="social-lens-circle-link fb-link-hover"
//           >
//             <Facebook className="sc-lucide-icon-charcoal" />
//           </motion.a>

//           {/* Pinterest (Custom SVG to render perfectly) */}
//           <motion.a 
//             href="https://pinterest.com" 
//             target="_blank" 
//             rel="noreferrer"
//             className="social-lens-circle-link pin-link-hover"
//           >
//             <svg 
//               viewBox="0 0 24 24" 
//               className="sc-pinterest-svg"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.305 2.641 7.977 6.414 9.531-.094-.805-.18-2.039.039-2.922.195-.836 1.258-5.328 1.258-5.328s-.32-.641-.32-1.586c0-1.492.867-2.602 1.938-2.602.914 0 1.359.688 1.359 1.508 0 .914-.586 2.297-.883 3.57-.25.107-.492.221-.734.34-.344.168-.68.355-.1.85a1.86 1.86 0 0 0 .5-.05c2.508-.828 3.516-3.531 3.516-5.836 0-4.883-3.469-8.312-8.547-8.312-5.719 0-9.086 4.289-9.086 8.734 0 1.727.664 3.578 1.492 4.586a.434.434 0 0 1 .1.422l-.555 2.266c-.09.344-.297.438-.633.281C3.109 18.063 2 15.117 2 12.289C2 7.023 6.102 3 12.594 3c5.078 0 8.82 3.617 8.82 8.258 0 5.047-3.18 9.109-7.594 9.109-1.484 0-2.883-.773-3.359-1.68l-.914 3.492c-.328 1.258-1.22 2.836-1.813 3.8.31.094.63.141.953.141c5.672 0 10.289-4.617 10.289-10.289C22.289 6.617 17.672 2 12.289 2z" />
//             </svg>
//           </motion.a>

//           {/* Youtube */}
//           <motion.a 
//             href="https://youtube.com" 
//             target="_blank" 
//             rel="noreferrer"
//             className="social-lens-circle-link yt-link-hover"
//           >
//             <Youtube className="sc-lucide-icon-red" />
//           </motion.a>

//         </div>

//         <p className="social-footer-hashtag">
//           #CakeNTakeBoutique • Share your visual confections
//         </p>
//       </section>

//       {/* 6. FAQ Section (Smooth accordion answers) */}
//       <section className="faq-section" id="contact-faq">
//         <div className="faq-inner-wrapper">
          
//           <div className="faq-header-block">
//             <span className="faq-header-tag">
//               ACQUISITION DETAILS
//             </span>
//             <h2 className="faq-header-title">
//               Frequently Asked Questions
//             </h2>
//             <p className="faq-header-desc">
//               Find answers to design preparations, sameday options, and premium deliveries.
//             </p>
//           </div>

//           {/* Accordion List */}
//           <div className="faq-accordion-rows">
//             {faqs.map((item, index) => {
//               const isOpen = openFaq === index;
//               return (
//                 <div 
//                   key={index} 
//                   className="faq-row-item"
//                 >
//                   <button
//                     onClick={() => setOpenFaq(isOpen ? null : index)}
//                     className="faq-accordion-trigger-btn"
//                   >
//                     <span className="faq-trigger-left-flex">
//                       <HelpCircle className="faq-help-icon" />
//                       <span>{item.q}</span>
//                     </span>
//                     <span className="faq-trigger-btn-chev">
//                       {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                     </span>
//                   </button>

//                   <AnimatePresence initial={false}>
//                     {isOpen && (
//                       <motion.div
//                         initial={{ height: 0, opacity: 0 }}
//                         animate={{ height: "auto", opacity: 1 }}
//                         exit={{ height: 0, opacity: 0 }}
//                         transition={{ duration: 0.35, ease: "easeOut" }}
//                       >
//                         <div className="faq-answer-inner-panel">
//                           {item.a}
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               );
//             })}
//           </div>

//         </div>
//       </section>

//     </div>
//   );
// }





import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  Instagram, 
  Facebook, 
  Youtube, 
  Sparkles, 
  Send, 
  Check, 
  ArrowUpRight, 
  HelpCircle, 
  Compass
} from "lucide-react";
import "./Contact.css";

// ─── Centralized business contact data ─────────────────────────────────────
const BUSINESS = {
  email: "Sales@cakentake.com",
  phones: ["60450097", "60395057", "97526285"],
  address: "No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait",
  addressShort: "Hawally, Kuwait",
  hours: "9:00 AM – 10:00 PM",
  hoursDays: "Open Daily",
  mapsQuery: "No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait",
};

export default function Contact() {
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("birthday");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Custom alert/chime triggers when form is successfully submitted
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }

    setSubmitting(true);
    // Simulate premium formulation baking
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Play luxurious crystal bell sound (880Hz sine chime)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.3);
      }
    } catch {
      // Audio context warning ignored gracefully inside iframe
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setEventType("birthday");
    setMessage("");
    setSubmitted(false);
  };

  // Luxury FAQ Mock Questions & Details
  const faqs = [
    {
      q: "How early should I place an order?",
      a: "For bespoke custom cakes (especially tiered structures and personalized wedding confections), we recommend placing your commission 2 to 4 weeks in advance. This grants our culinary artisans sufficient time to design, mature, and refine your bespoke sugar flowers and fillings. For signature standard orders, 48 hours notice is sufficient."
    },
    {
      q: "Can I customize my organic cake?",
      a: "Absolutely. Our brand was founded on custom pastry creation. You can coordinate custom frosting palettes (pastel blush pinks, gold accents, rustic sage greens), sponge textures, bespoke tier sizes, or request hand-sculpted sugar flowers. Mention your exact theme in our customized planner form above, and we will formulate a personalized specimen for you."
    },
    {
      q: "Do you offer same-day delivery?",
      a: "We offer limited same-day delivery for standard boutique treats (such as fresh macarons, daily tea cupcakes, and cookies) depending on inventory levels at our Hawally flagship location. Bespoke cakes cannot be prepared on a same-day basis due to our mandatory 12-hour cold sponge rest period."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all premium digital credit cards, Apple Pay, Google Pay, bank wire transfers for high-end wedding installations, and localized cash options in our flagship tea room."
    }
  ];

  return (
    <div className="contact-page" id="studio-contact">
      
      {/* 1. Hero Section (Parallax visual banner) */}
      <section className="contact-hero" id="contact-hero">
        
        {/* Full-width aesthetic background image with overlay */}
        <div className="hero-bg-wrapper">
          <img 
            src="https://i.pinimg.com/736x/d6/d7/9e/d6d79ece55eaa730417377a687ecf237.jpg" 
            alt="Artisan Cake Background"
            className="hero-bg-img"
            referrerPolicy="no-referrer"
            id="hero-bg-cake-image"
          />
          {/* Subtle luxurious rose & wine gradient overlays */}
          <div className="hero-bg-overlay1" />
          <div className="hero-bg-overlay2" />
        </div>

        {/* Floating Pastel Decorative Elements (Cupcake, macaron, rose) */}
        <div className="floating-container">
          
          {/* Floating Macaron element (Left Top) */}
          <motion.div 
            animate={{ y: [0, -18, 0], rotate: [5, -5, 5] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="floating-card-left"
          >
            <div className="fl-glass-card">
              <span className="fl-glass-emoji">🌸</span>
              <div className="fl-glass-text-group">
                <p className="fl-title-bold">Blush Rose Specimen</p>
                <p className="fl-desc-light">Edible flora</p>
              </div>
            </div>
          </motion.div>

          {/* Floating Artisan cake element (Right Center) */}
          <motion.div 
            animate={{ y: [0, 15, 0], rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="floating-card-right"
          >
            <div className="fl-image-card">
              <div className="fl-image-aspect">
                <img 
                  src="https://i.pinimg.com/1200x/3d/3e/31/3d3e310734550f9dc5f0d0bd75092a49.jpg" 
                  alt="Aesthetic Macaron detail"
                  className="fl-aspect-img"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="fl-image-meta">
                <p className="fl-gold-star">★ 24K Gold Dust</p>
                <p className="fl-desc-light">Macaron finishes</p>
              </div>
            </div>
          </motion.div>

          {/* Floating Pastry Accent (Left bottom) */}
          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2 }}
            className="floating-card-bottom-left"
          >
            <div className="fl-status-badge">
              <div className="fl-status-flex">
                <div className="fl-ping-dot fl-ping-anim" />
                <span className="fl-status-lbl">
                  Oven Heat: 170°C
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Box */}
        <div className="hero-content-box">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Elegant luxury brand pill */}
            <div className="brand-pill-wrapper">
              <div className="brand-pill">
                <Sparkles className="brand-pill-icon" size={14} />
                <span className="brand-pill-text">
                  CakeNTake Boutique Bakery
                </span>
              </div>
            </div>

            <h1 className="hero-title-main">
              Let's Create Something <br />
              <span className="hero-title-italic">
                Sweet Together
              </span>
            </h1>

            <p className="hero-desc-p">
              Whether it's a birthday, wedding, anniversary or a special celebration, CakeNTake is here to make every moment unforgettable. Drop us an inquiry to design your custom pastry dream.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hero-cta-btn-wrapper"
          >
            <button
              onClick={() => {
                const el = document.getElementById("luxury-planner-form");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hero-cta-btn"
              id="hero-commission-btn"
            >
              Configure Custom Cake
            </button>
          </motion.div>
        </div>

        {/* Soft bottom wave divider to smooth the transition */}
        <div className="hero-bottom-wave" />
      </section>

      {/* 2. Contact Showcase Section (Glassmorphism Info Cards) */}
      <section className="coordinates-section" id="contact-showcase">
        
        <div className="section-hdr">
          <span className="section-hdr-tag">
            LUXURY CHANNELS
          </span>
          <h2 className="section-hdr-title">
            The Confectionery Coordinates
          </h2>
          <div className="section-hdr-line" />
        </div>

        <div className="showcase-grid">
          
          {/* Phone */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="showcase-card"
          >
            <div className="card-backdrop-orb orb-pink-var" />
            <div className="card-icon-container bg-pink-var">
              <Phone size={20} />
            </div>
            <h3 className="card-label-mono">
              Studio Phone
            </h3>
            <div>
              {BUSINESS.phones.map((num, i) => (
                <span key={num} className="card-value-strong" style={{ display: "block" }}>
                  {num}
                  {i < BUSINESS.phones.length - 1 ? "" : ""}
                </span>
              ))}
              <p className="card-subtext">
                {BUSINESS.addressShort}
              </p>
            </div>
          </motion.div>

          {/* Email */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="showcase-card"
          >
            <div className="card-backdrop-orb orb-amber-var" />
            <div className="card-icon-container bg-amber-var">
              <Mail size={20} />
            </div>
            <h3 className="card-label-mono">
              General Letters
            </h3>
            <div>
              <span className="card-value-strong">
                {BUSINESS.email}
              </span>
              <p className="card-subtext">
                Replies under 12 hours
              </p>
            </div>
          </motion.div>

          {/* Address */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="showcase-card"
          >
            <div className="card-backdrop-orb orb-emerald-var" />
            <div className="card-icon-container bg-emerald-var">
              <MapPin size={20} />
            </div>
            <h3 className="card-label-mono">
              Flagship Studio
            </h3>
            <div>
              <span className="card-value-strong">
                {BUSINESS.address}
              </span>
            </div>
          </motion.div>

          {/* Hours */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="showcase-card"
          >
            <div className="card-backdrop-orb orb-slate-var" />
            <div className="card-icon-container bg-yellow-var">
              <Clock size={20} />
            </div>
            <h3 className="card-label-mono">
              Oven Releases
            </h3>
            <div>
              <span className="card-value-strong">
                {BUSINESS.hours}
              </span>
              <p className="card-subtext">
                {BUSINESS.hoursDays}
              </p>
            </div>
          </motion.div>

          {/* Delivery */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="showcase-card"
          >
            <div className="card-backdrop-orb orb-pink-var" />
            <div className="card-icon-container bg-pink-var">
              <Truck size={20} />
            </div>
            <h3 className="card-label-mono">
              Serene Delivery
            </h3>
            <div>
              <span className="card-value-strong">
                Hawally & Greater Kuwait
              </span>
              <p className="card-subtext">
                Climate-Safe Vehicle
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. Elegant Contact & Custom Order Form inside frosted glass card */}
      <section className="commission-section" id="luxury-planner-form">
        <div className="form-inner-wrapper">
          
          <div className="form-header-block">
            <span className="form-header-tag">
              COMMISSION ENGINE
            </span>
            <h2 className="form-header-title">
              Submit Your Sweet Request
            </h2>
            <p className="form-header-desc">
              Our direct formulation process calculates options for custom tiers, edible botanicals, and real-time pâtissier schedules.
            </p>
          </div>

          {/* Frosted Glass Card Container */}
          <div className="form-glass-card">
            
            <div className="form-accent-stripe" />
            <div className="form-accent-orb" />

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="luxury-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleFormSubmit}
                >
                  
                  {/* Grid fields */}
                  <div className="form-grid-fields">
                    
                    {/* Name: Floating label input */}
                    <div className="input-rel-group">
                      <input
                        type="text"
                        required
                        id="form-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input-element"
                        placeholder=" "
                      />
                      <label 
                        htmlFor="form-name"
                        className="form-input-placeholder-label"
                      >
                        Full Name
                      </label>
                    </div>

                    {/* Email: Floating label input */}
                    <div className="input-rel-group">
                      <input
                        type="email"
                        required
                        id="form-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input-element"
                        placeholder=" "
                      />
                      <label 
                        htmlFor="form-email"
                        className="form-input-placeholder-label"
                      >
                        Email Address
                      </label>
                    </div>

                    {/* Phone Number: Floating label input */}
                    <div className="input-rel-group">
                      <input
                        type="tel"
                        required
                        id="form-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input-element"
                        placeholder=" "
                      />
                      <label 
                        htmlFor="form-phone"
                        className="form-input-placeholder-label"
                      >
                        Phone Number
                      </label>
                    </div>

                    {/* Event Type dropdown */}
                    <div className="input-rel-group">
                      <span className="select-tag-title">
                        Celebration Event Type
                      </span>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="form-select-element"
                      >
                        <option value="birthday">Birthday Cake Jubilee 🎂</option>
                        <option value="wedding">Magnificent Wedding Gala 💍</option>
                        <option value="anniversary">Elegant Anniversary Gateau ✨</option>
                        <option value="corporate">Private Corporate Soirée 🏢</option>
                        <option value="party">Comfort Garden Birthday Party 🌼</option>
                      </select>
                      <div className="select-arrow-right">
                        <ChevronDown size={16} />
                      </div>
                    </div>

                  </div>

                  {/* Message box */}
                  <div className="textarea-rel-group">
                    <textarea
                      required
                      id="form-msg"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="form-textarea-element"
                      placeholder=" "
                    />
                    <label 
                      htmlFor="form-msg"
                      className="form-textarea-placeholder-label"
                    >
                      Bespoke Palette Wishes, Allergy Notifications & Notes...
                    </label>
                  </div>

                  {/* Submit button */}
                  <div className="submit-btn-wrapper">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="form-submit-btn"
                    >
                      {submitting ? (
                        <>
                          <span className="submit-spinner" />
                          <span>Whippings and Sponges Rest...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Send Sweet Message</span>
                        </>
                      )}
                    </button>
                  </div>

                </motion.form>
              ) : (
                <motion.div
                  key="form-success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="success-screen"
                >
                  <div className="success-icon-wrapper">
                    <Check size={28} />
                  </div>

                  <div>
                    <h3 className="success-title">
                      Your Message has been Sealed!
                    </h3>
                    <p className="success-desc">
                      Thank you, <strong className="success-client-name">{name}</strong>. Our Hawally flagship bakers have heard your chime. A receipt was processed to <strong className="success-email">{email}</strong>.
                    </p>
                  </div>

                  <div className="success-summary-card">
                    <span className="success-summary-tag">
                      FORMULATION SUMMARY
                    </span>
                    <div>• Client: {name}</div>
                    <div>• Event: {eventType.toUpperCase()}</div>
                    <div>• Status: Bake Queue Priority I</div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="success-reset-btn"
                  >
                    Bake Another Specimen
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* 4. Interactive Map Section */}
      <section className="maps-section" id="google-maps">
        <div className="maps-outer-wrapper">
          <div className="maps-framed-container">
            
            <div className="map-viewport">
              <iframe 
                src={`https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.mapsQuery)}&output=embed`}
                className="map-iframe-el" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer"
                title="CakeNTake Flagship Studio Map Location"
              />
              
              {/* Glassmorphism Map overlay float card */}
              <div className="map-floating-overlay-card">
                <div className="map-float-hdr">
                  <span className="map-float-hdr-tag">
                    Our Primary Studio
                  </span>
                  <h3 className="map-float-hdr-title">
                    Hawally Flagship
                  </h3>
                  <p className="map-float-hdr-desc">
                    No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait.
                  </p>
                </div>
                
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.mapsQuery)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="map-directions-anchor-btn"
                >
                  <span>Get Directions</span>
                  <ArrowUpRight className="map-anchor-icon" />
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Social Connect Section (Luxury hover glow icons) */}
      <section className="social-section" id="social-connect">
        <div className="social-header-wrap">
          
          <span className="social-wrap-tag">
            INSTAGRAMMABLE EXPERIENCE
          </span>
          <h2 className="social-wrap-title">
            Connect on Social Media
          </h2>
          <p className="social-wrap-desc">
            Browse our dynamic daily flower design logs, baking diaries, and private cake unveils.
          </p>
        </div>

        {/* Icons Grid in beautiful circular glass cards */}
        <div className="social-icons-row">
          
          {/* Instagram */}
          <motion.a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noreferrer"
            className="social-lens-circle-link insta-link-hover"
          >
            <Instagram className="sc-lucide-icon-pink" />
          </motion.a>

          {/* Facebook */}
          <motion.a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noreferrer"
            className="social-lens-circle-link fb-link-hover"
          >
            <Facebook className="sc-lucide-icon-charcoal" />
          </motion.a>

          {/* Pinterest (Custom SVG to render perfectly) */}
          <motion.a 
            href="https://pinterest.com" 
            target="_blank" 
            rel="noreferrer"
            className="social-lens-circle-link pin-link-hover"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="sc-pinterest-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.305 2.641 7.977 6.414 9.531-.094-.805-.18-2.039.039-2.922.195-.836 1.258-5.328 1.258-5.328s-.32-.641-.32-1.586c0-1.492.867-2.602 1.938-2.602.914 0 1.359.688 1.359 1.508 0 .914-.586 2.297-.883 3.57-.25.107-.492.221-.734.34-.344.168-.68.355-.1.85a1.86 1.86 0 0 0 .5-.05c2.508-.828 3.516-3.531 3.516-5.836 0-4.883-3.469-8.312-8.547-8.312-5.719 0-9.086 4.289-9.086 8.734 0 1.727.664 3.578 1.492 4.586a.434.434 0 0 1 .1.422l-.555 2.266c-.09.344-.297.438-.633.281C3.109 18.063 2 15.117 2 12.289C2 7.023 6.102 3 12.594 3c5.078 0 8.82 3.617 8.82 8.258 0 5.047-3.18 9.109-7.594 9.109-1.484 0-2.883-.773-3.359-1.68l-.914 3.492c-.328 1.258-1.22 2.836-1.813 3.8.31.094.63.141.953.141c5.672 0 10.289-4.617 10.289-10.289C22.289 6.617 17.672 2 12.289 2z" />
            </svg>
          </motion.a>

          {/* Youtube */}
          <motion.a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noreferrer"
            className="social-lens-circle-link yt-link-hover"
          >
            <Youtube className="sc-lucide-icon-red" />
          </motion.a>

        </div>

        <p className="social-footer-hashtag">
          #CakeNTakeBoutique • Share your visual confections
        </p>
      </section>

      {/* 6. FAQ Section (Smooth accordion answers) */}
      <section className="faq-section" id="contact-faq">
        <div className="faq-inner-wrapper">
          
          <div className="faq-header-block">
            <span className="faq-header-tag">
              ACQUISITION DETAILS
            </span>
            <h2 className="faq-header-title">
              Frequently Asked Questions
            </h2>
            <p className="faq-header-desc">
              Find answers to design preparations, sameday options, and premium deliveries.
            </p>
          </div>

          {/* Accordion List */}
          <div className="faq-accordion-rows">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="faq-row-item"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="faq-accordion-trigger-btn"
                  >
                    <span className="faq-trigger-left-flex">
                      <HelpCircle className="faq-help-icon" />
                      <span>{item.q}</span>
                    </span>
                    <span className="faq-trigger-btn-chev">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <div className="faq-answer-inner-panel">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}