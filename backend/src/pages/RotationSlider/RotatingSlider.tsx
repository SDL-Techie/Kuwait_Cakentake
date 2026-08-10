// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Heart, Plus, Sparkles, Scale, Compass, HelpCircle } from 'lucide-react';
// import './RotatingSlider.css';

// // Definition of the structure of each Tart Item
// interface ToppingItem {
//   type: 'strawberry' | 'grape' | 'blueberry' | 'raspberry' | 'blackberry' | 'cherry' | 'lemon' | 'meringue' | 'mint' | 'chocolate';
//   angle: number;       // Angle in degrees around the cake crown
//   radius: number;      // Distance from center of cake (0 to 220px)
//   scale: number;       // Scale multiplier for organic variation
//   rotate?: number;     // Extra rotation for specific topping angles
// }

// interface ParticledDecor {
//   type: 'strawberry' | 'grape' | 'blackberry' | 'blueberry' | 'raspberry' | 'cherry' | 'lemon' | 'meringue' | 'mint' | 'chocolate';
//   x: string;           // CSS Left positioning e.g. "12%"
//   y: string;           // CSS Top positioning e.g. "20%"
//   scale: number;       // Size scale
//   delay: number;       // Micro animation delay
// }

// interface TartOption {
//   id: string;
//   flavor: string;
//   title: string;
//   subTitle: string;
//   description: string;
//   bgColor: string;         // Pastel Color Palette matching Color Crush
//   accentColor: string;     // High contrast accent for dots & details
//   textColor: string;       // Custom primary text dark-shade
//   price: string;
//   calories: string;
//   diameter: string;
//   prepTime: string;
//   rating: string;
//   toppings: ToppingItem[];
//   ambientDecor: ParticledDecor[];
// }

// // 1. SVG Vector Topping Graphics Component
// const VectorTopping: React.FC<{ type: string; scale: number }> = ({ type, scale }) => {
//   const s = scale;
//   switch (type) {
//     case 'strawberry':
//       return (
//         <svg width={36 * s} height={36 * s} viewBox="0 0 36 36" fill="none" className="drop-shadow-sm">
//           {/* Strawberry Body */}
//           <path d="M18 4C18 4 9 9 7 19C5 29 13 33 18 33C23 33 31 29 29 19C27 9 18 4 18 4Z" fill="url(#strawberryGrad)" />
//           {/* Green sepals/stem cap */}
//           <path d="M18 2V7M18 4C16 3 11 3 13 8C15 8 18 5 18 5C18 5 21 8 23 8C25 3 20 3 18 4Z" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#40916C" />
//           {/* Golden seeds */}
//           <circle cx="14" cy="14" r="1" fill="#FCE164" opacity="0.9" />
//           <circle cx="22" cy="14" r="1" fill="#FCE164" opacity="0.9" />
//           <circle cx="12" cy="20" r="1" fill="#FCE164" opacity="0.9" />
//           <circle cx="18" cy="18" r="1" fill="#FCE164" opacity="0.9" />
//           <circle cx="24" cy="20" r="1" fill="#FCE164" opacity="0.9" />
//           <circle cx="15" cy="26" r="1" fill="#FCE164" opacity="0.9" />
//           <circle cx="21" cy="26" r="1" fill="#FCE164" opacity="0.9" />
//           {/* Glossy highlight */}
//           <path d="M25 15C26 18 26 21 24 23" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
//           <defs>
//             <radialGradient id="strawberryGrad" cx="50%" cy="40%" r="50%">
//               <stop offset="0%" stopColor="#FF4D6D" />
//               <stop offset="70%" stopColor="#C9184A" />
//               <stop offset="100%" stopColor="#800F2F" />
//             </radialGradient>
//           </defs>
//         </svg>
//       );
//     case 'grape':
//       return (
//         <svg width={26 * s} height={26 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
//           {/* Round glossy grape */}
//           <circle cx="12" cy="12" r="10" fill="url(#grapeGrad)" />
//           {/* White reflection */}
//           <circle cx="8" cy="8" r="2.5" fill="#FFF" opacity="0.6" />
//           <defs>
//             <radialGradient id="grapeGrad" cx="40%" cy="40%" r="60%">
//               <stop offset="0%" stopColor="#D8F3DC" />
//               <stop offset="40%" stopColor="#95D5B2" />
//               <stop offset="85%" stopColor="#40916C" />
//               <stop offset="100%" stopColor="#1B4332" />
//             </radialGradient>
//           </defs>
//         </svg>
//       );
//     case 'blueberry':
//       return (
//         <svg width={22 * s} height={22 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
//           {/* Dark blue berry */}
//           <circle cx="12" cy="12" r="10" fill="url(#blueberryGrad)" />
//           {/* Crown-like top structure */}
//           <path d="M12 4C13.5 5.5 15 5.5 15 7C15 8.5 13.5 8.5 12 7C10.5 8.5 9 8.5 9 7C9 5.5 10.5 5.5 12 4Z" fill="#1D3557" />
//           <path d="M10 5L12 8L14 5" stroke="#457B9D" strokeWidth="1" strokeLinecap="round" />
//           {/* Waxy bloom highlight */}
//           <path d="M6 12C6 8.5 8.5 6 12 6" stroke="#A8DADC" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
//           <defs>
//             <radialGradient id="blueberryGrad" cx="35%" cy="35%" r="65%">
//               <stop offset="0%" stopColor="#457B9D" />
//               <stop offset="65%" stopColor="#1D3557" />
//               <stop offset="100%" stopColor="#0B132B" />
//             </radialGradient>
//           </defs>
//         </svg>
//       );
//     case 'raspberry':
//       return (
//         <svg width={24 * s} height={24 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
//           {/* Textured bumpy raspberry using grouped small capsules */}
//           <path d="M12 2C8 2 6 5 6 11C6 17 9 22 12 22C15 22 18 17 18 11C18 5 16 2 12 2Z" fill="#A4133C" />
//           {/* Overlaying small drupelets */}
//           <circle cx="12" cy="6" r="3.5" fill="#FF4D6D" />
//           <circle cx="9" cy="9" r="3" fill="#D90429" />
//           <circle cx="15" cy="9" r="3" fill="#D90429" />
//           <circle cx="8" cy="13" r="3.2" fill="#C9184A" />
//           <circle cx="12" cy="12" r="3.5" fill="#FF4D6D" />
//           <circle cx="16" cy="13" r="3.2" fill="#C9184A" />
//           <circle cx="10" cy="17" r="3" fill="#A4133C" />
//           <circle cx="14" cy="17" r="3" fill="#A4133C" />
//           <circle cx="12" cy="20" r="2.5" fill="#800F2F" />
//           {/* Soft highlights */}
//           <circle cx="11.5" cy="11.5" r="1" fill="#FFF" opacity="0.5" />
//           <circle cx="8.5" cy="8.5" r="0.8" fill="#FFF" opacity="0.5" />
//         </svg>
//       );
//     case 'blackberry':
//       return (
//         <svg width={24 * s} height={24 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
//           {/* Dark blackberry with deep purplish black nodes */}
//           <path d="M12 2C8 2 6 5 6 11C6 17 9 22 12 22C15 22 18 17 18 11C18 5 16 2 12 2Z" fill="#140118" />
//           <circle cx="12" cy="6" r="3.5" fill="#3C0949" />
//           <circle cx="9" cy="9" r="3" fill="#250530" />
//           <circle cx="15" cy="9" r="3" fill="#250530" />
//           <circle cx="8" cy="13" r="3.2" fill="#1C0224" />
//           <circle cx="12" cy="12" r="3.5" fill="#3C0949" />
//           <circle cx="16" cy="13" r="3.2" fill="#1C0224" />
//           <circle cx="10" cy="17" r="3" fill="#140118" />
//           <circle cx="14" cy="17" r="3" fill="#140118" />
//           <circle cx="12" cy="20" r="2.5" fill="#08000A" />
//           {/* Glistening spots */}
//           <circle cx="11.5" cy="11.5" r="0.8" fill="#FFF" opacity="0.4" />
//           <circle cx="14.5" cy="12.5" r="0.8" fill="#FFF" opacity="0.4" />
//         </svg>
//       );
//     case 'cherry':
//       return (
//         <svg width={32 * s} height={42 * s} viewBox="0 0 32 42" fill="none" className="drop-shadow-md">
//           {/* Long thin graceful stem */}
//           <path d="M16 14C16 14 18 5 28 2" stroke="#6F5831" strokeWidth="1.5" strokeLinecap="round" />
//           {/* Cherry fruit sphere */}
//           <circle cx="14" cy="26" r="12" fill="url(#cherryGrad)" />
//           {/* Bright realistic crescent shine */}
//           <path d="M7 22C7 18 11 16 13 16" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
//           <circle cx="18" cy="22" r="1.5" fill="#FFF" opacity="0.4" />
//           <defs>
//             <radialGradient id="cherryGrad" cx="45%" cy="35%" r="65%">
//               <stop offset="0%" stopColor="#D90429" />
//               <stop offset="50%" stopColor="#7A0010" />
//               <stop offset="100%" stopColor="#3B0007" />
//             </radialGradient>
//           </defs>
//         </svg>
//       );
//     case 'lemon':
//       return (
//         <svg width={34 * s} height={34 * s} viewBox="0 0 34 34" fill="none" className="drop-shadow-sm">
//           {/* Circular Lemon Slice Wedge */}
//           <circle cx="17" cy="17" r="15" fill="#F9C74F" stroke="#F9C74F" strokeWidth="1" />
//           <circle cx="17" cy="17" r="13.5" fill="#FFF" />
//           {/* Pulp segments */}
//           <path d="M17 17L17 5C19.5 5 22 6 24 8L17 17Z" fill="#FCE164" />
//           <path d="M17 17L24 8C26 10 27 12.5 27 17L17 17Z" fill="#F9C74F" />
//           <path d="M17 17L27 17C27 19.5 26 22 24 24L17 17Z" fill="#FCE164" />
//           <path d="M17 17L24 24C22 26 19.5 27 17 27L17 17Z" fill="#F9C74F" />
//           <path d="M17 17L17 27C14.5 27 12 26 10 24L17 17Z" fill="#FCE164" />
//           <path d="M17 17L10 24C8 22 7 19.5 7 17L17 17Z" fill="#F9C74F" />
//           <path d="M17 17L7 17C7 14.5 8 12 10 10L17 17Z" fill="#FCE164" />
//           <path d="M17 17L10 10C12 8 14.5 7 17 7L17 17Z" fill="#F9C74F" />
//           {/* Inner ring line */}
//           <circle cx="17" cy="17" r="12" stroke="#FFF" strokeWidth="0.8" opacity="0.75" fill="none" />
//         </svg>
//       );
//     case 'meringue':
//       return (
//         <svg width={30 * s} height={30 * s} viewBox="0 0 30 30" fill="none" className="drop-shadow-sm">
//           {/* Swirled torched meringue peak with gradient */}
//           <path d="M15 2C15 2 11 11 10 16C9 21 11 25 15 25C19 25 21 21 20 16C19 11 15 2 15 2Z" fill="url(#meringueGrad)" />
//           <path d="M15 2C15 2 18 8 17 14C16 19 19 23 15 25" stroke="#E6BE8A" strokeWidth="0.75" strokeLinecap="round" opacity="0.6" />
//           {/* Creamy layers */}
//           <path d="M10 21C11.5 22.5 13.5 23 15 23C16.5 23 18.5 22.5 20 21" stroke="#FFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
//           <defs>
//             <radialGradient id="meringueGrad" cx="50%" cy="80%" r="70%">
//               <stop offset="0%" stopColor="#FFF" />
//               <stop offset="50%" stopColor="#FFF0E0" />
//               <stop offset="85%" stopColor="#DDB892" />
//               <stop offset="100%" stopColor="#7F5539" />
//             </radialGradient>
//           </defs>
//         </svg>
//       );
//     case 'mint':
//       return (
//         <svg width={26 * s} height={20 * s} viewBox="0 0 26 20" fill="none" className="drop-shadow-sm">
//           {/* Mint leaf with jagged edges */}
//           <path d="M1 10C1 10 7 2 13 4C19 2 25 10 25 10C25 10 19 18 13 16C7 18 1 10 1 10Z" fill="url(#mintGrad)" />
//           {/* Elegant Leaf Veins */}
//           <path d="M1 10C8 10 18 10 25 10" stroke="#1B4332" strokeWidth="1.2" opacity="0.5" />
//           <path d="M9 10L12 6" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
//           <path d="M9 10L11 14" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
//           <path d="M15 10L18 6" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
//           <path d="M15 10L17 14" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
//           <defs>
//             <linearGradient id="mintGrad" x1="0%" y1="50%" x2="100%" y2="50%">
//               <stop offset="0%" stopColor="#52B788" />
//               <stop offset="100%" stopColor="#1B4332" />
//             </linearGradient>
//           </defs>
//         </svg>
//       );
//     case 'chocolate':
//       return (
//         <svg width={22 * s} height={18 * s} viewBox="0 0 22 18" fill="none" className="drop-shadow-xs">
//           {/* Delicate Chocolate Curled Shaving */}
//           <path d="M2 14C4 6 12 2 18 4C22 6 18 12 14 14C10 16 4 16 2 14Z" stroke="#4a2c1b" strokeWidth="1.5" fill="#3D2314" />
//           <path d="M4 12C6 7 11 5 15 6" stroke="#7A4F37" strokeWidth="1" opacity="0.6" />
//         </svg>
//       );
//     default:
//       return null;
//   }
// };


// // 2. Beautiful mock assets definitions for floating decor particles
// const RenderDecors: React.FC<{ type: string; scale: number }> = ({ type, scale }) => {
//   return (
//     <div className="natural-float relative">
//       <VectorTopping type={type} scale={scale} />
//     </div>
//   );
// };


// // 3. COMPLETE RE-CONSTRUCTED TART DATABASE (6 Luxurious Selections matching provided Pastels)
// const CAROUSEL_TARTS: TartOption[] = [
//   {
//     id: 'strawberries',
//     flavor: 'Strawberry',
//     title: 'Ruby Strawberry Tart',
//     subTitle: 'Traditional French Crème & Mountain Berries',
//     description: 'Freshly carved sweet mountain strawberries arranged in an elegant spiral canopy. Anchored with our signature buttery shortcrust pastry and filled with a thick layer of silky, organic vanilla bean pastry cream.',
//     bgColor: '#FCDCE1', // Soft Pink
//     accentColor: '#FF4D6D',
//     textColor: '#5C1D24',
//     price: '$28.50',
//     calories: '340 kcal / slice',
//     diameter: '9.5 Inches',
//     prepTime: '24 Minutes',
//     rating: '4.9 (182 reviews)',
//     ambientDecor: [
//       { type: 'strawberry', x: '10%', y: '18%', scale: 1.8, delay: 0 },
//       { type: 'strawberry', x: '18%', y: '58%', scale: 1.2, delay: 0.4 },
//       { type: 'mint', x: '5%', y: '75%', scale: 1.6, delay: 0.2 },
//       { type: 'strawberry', x: '85%', y: '15%', scale: 2.1, delay: 0.1 },
//       { type: 'mint', x: '82%', y: '50%', scale: 1.4, delay: 0.5 },
//       { type: 'strawberry', x: '90%', y: '78%', scale: 1.3, delay: 0.3 },
//     ],
//     toppings: [
//       // Double concentric circular tracks of strawberry wedges + mint leaves
//       ...Array.from({ length: 12 }).map((_, i) => ({
//         type: 'strawberry' as const,
//         angle: (i * 30),
//         radius: 175,
//         scale: 1.1,
//       })),
//       ...Array.from({ length: 8 }).map((_, i) => ({
//         type: 'strawberry' as const,
//         angle: (i * 45) + 15,
//         radius: 110,
//         scale: 0.9,
//       })),
//       ...Array.from({ length: 6 }).map((_, i) => ({
//         type: 'mint' as const,
//         angle: (i * 60) + 30,
//         radius: 140,
//         scale: 1.0,
//       })),
//       { type: 'strawberry', angle: 0, radius: 40, scale: 1.2 },
//       { type: 'strawberry', angle: 180, radius: 40, scale: 1.0 },
//       { type: 'mint', angle: 90, radius: 25, scale: 0.8 },
//     ],
//   },
//   {
//     id: 'grapes',
//     flavor: 'Grapes',
//     title: 'Emerald Vine Grape Tart',
//     subTitle: 'Premium Seedless Grapes on Chilled Custard',
//     description: 'Vibrant emerald green grapes, hand-polished and halved, resting upon a thin bed of lime-zest pastry whipped dome. A refreshing blast of tangy sweetness nested safely on crisp salted-butter crust.',
//     bgColor: '#E9ECCE', // Soft Sage Green
//     accentColor: '#40916C',
//     textColor: '#2D3F34',
//     price: '$26.80',
//     calories: '290 kcal / slice',
//     diameter: '9.0 Inches',
//     prepTime: '20 Minutes',
//     rating: '4.8 (124 reviews)',
//     ambientDecor: [
//       { type: 'grape', x: '12%', y: '25%', scale: 1.7, delay: 0.1 },
//       { type: 'mint', x: '7%', y: '62%', scale: 1.5, delay: 0.3 },
//       { type: 'grape', x: '24%', y: '80%', scale: 1.1, delay: 0.5 },
//       { type: 'grape', x: '82%', y: '18%', scale: 1.9, delay: 0.2 },
//       { type: 'grape', x: '88%', y: '52%', scale: 1.3, delay: 0.4 },
//       { type: 'mint', x: '78%', y: '78%', scale: 1.6, delay: 0.6 },
//     ],
//     toppings: [
//       ...Array.from({ length: 15 }).map((_, i) => ({
//         type: 'grape' as const,
//         angle: (i * 24),
//         radius: 180,
//         scale: 1.15,
//       })),
//       ...Array.from({ length: 10 }).map((_, i) => ({
//         type: 'grape' as const,
//         angle: (i * 36) + 12,
//         radius: 120,
//         scale: 0.95,
//       })),
//       ...Array.from({ length: 5 }).map((_, i) => ({
//         type: 'mint' as const,
//         angle: (i * 72) + 36,
//         radius: 80,
//         scale: 1.1,
//       })),
//       { type: 'grape', angle: 0, radius: 30, scale: 1.2 },
//       { type: 'grape', angle: 120, radius: 30, scale: 1.0 },
//       { type: 'grape', angle: 240, radius: 32, scale: 1.0 },
//     ],
//   },
//   {
//     id: 'berries',
//     flavor: 'Berries',
//     title: 'Velvet Forest Berries',
//     subTitle: 'Triple Forest Berries with Cocoa Crust',
//     description: 'An rich medley of sweet blackberries, tangy raspberries, and plump blueberries on a crisp shortbread crust with luxury dark chocolate ganache layers. The ultimate indulgence for true berry connoisseurs.',
//     bgColor: '#F0D9EF', // Soft Lavender
//     accentColor: '#7B341E',
//     textColor: '#421E47',
//     price: '$31.20',
//     calories: '380 kcal / slice',
//     diameter: '9.5 Inches',
//     prepTime: '28 Minutes',
//     rating: '5.0 (206 reviews)',
//     ambientDecor: [
//       { type: 'blueberry', x: '15%', y: '22%', scale: 1.8, delay: 0.2 },
//       { type: 'raspberry', x: '22%', y: '50%', scale: 1.5, delay: 0.5 },
//       { type: 'blackberry', x: '9%', y: '72%', scale: 1.6, delay: 0.1 },
//       { type: 'blackberry', x: '84%', y: '20%', scale: 1.9, delay: 0.3 },
//       { type: 'blueberry', x: '78%', y: '58%', scale: 1.3, delay: 0.6 },
//       { type: 'raspberry', x: '86%', y: '82%', scale: 1.4, delay: 0.4 },
//     ],
//     toppings: [
//       // Diverse random arrangement of blackberry, raspberry and blueberries
//       ...Array.from({ length: 8 }).map((_, i) => ({
//         type: 'blackberry' as const,
//         angle: (i * 45),
//         radius: 185,
//         scale: 1.0,
//       })),
//       ...Array.from({ length: 8 }).map((_, i) => ({
//         type: 'raspberry' as const,
//         angle: (i * 45) + 22.5,
//         radius: 175,
//         scale: 1.05,
//       })),
//       ...Array.from({ length: 12 }).map((_, i) => ({
//         type: 'blueberry' as const,
//         angle: (i * 30) + 15,
//         radius: 125,
//         scale: 1.1,
//       })),
//       ...Array.from({ length: 6 }).map((_, i) => ({
//         type: 'raspberry' as const,
//         angle: (i * 60) + 10,
//         radius: 75,
//         scale: 0.95,
//       })),
//       { type: 'blackberry', angle: 0, radius: 25, scale: 1.1 },
//       { type: 'blueberry', angle: 120, radius: 20, scale: 1.2 },
//       { type: 'raspberry', angle: 240, radius: 25, scale: 1.0 },
//     ],
//   },
//   {
//     id: 'cherries',
//     flavor: 'Cherry',
//     title: 'Gilded Cherry Truffle',
//     subTitle: 'Dark Morello Cherries & Chocolate Ganache',
//     description: 'Lustrous, deep crimson pitted Morello cherries, steeped in fine cherry nectar and resting inside a dark cacao shortbread shell. A rich ribbon of chocolate fudge truffle lies hidden beneath.',
//     bgColor: '#FFE6BB', // Soft Pastel Yellow / Peach Cream
//     accentColor: '#9B2C2C',
//     textColor: '#4D2418',
//     price: '$29.90',
//     calories: '410 kcal / slice',
//     diameter: '9.0 Inches',
//     prepTime: '25 Minutes',
//     rating: '4.9 (148 reviews)',
//     ambientDecor: [
//       { type: 'cherry', x: '18%', y: '16%', scale: 1.5, delay: 0 },
//       { type: 'chocolate', x: '5%', y: '52%', scale: 1.6, delay: 0.3 },
//       { type: 'cherry', x: '22%', y: '78%', scale: 1.1, delay: 0.4 },
//       { type: 'cherry', x: '82%', y: '24%', scale: 1.6, delay: 0.2 },
//       { type: 'chocolate', x: '90%', y: '60%', scale: 1.5, delay: 0.5 },
//       { type: 'cherry', x: '76%', y: '84%', scale: 1.3, delay: 0.1 },
//     ],
//     toppings: [
//       ...Array.from({ length: 10 }).map((_, i) => ({
//         type: 'cherry' as const,
//         angle: (i * 36) + 18,
//         radius: 175,
//         scale: 1.1,
//       })),
//       ...Array.from({ length: 8 }).map((_, i) => ({
//         type: 'chocolate' as const,
//         angle: (i * 45),
//         radius: 135,
//         scale: 1.2,
//       })),
//       ...Array.from({ length: 6 }).map((_, i) => ({
//         type: 'cherry' as const,
//         angle: (i * 60) + 30,
//         radius: 90,
//         scale: 0.95,
//       })),
//       { type: 'cherry', angle: 0, radius: 20, scale: 1.15 },
//       { type: 'chocolate', angle: 180, radius: 30, scale: 1.3 },
//     ],
//   },
//   {
//     id: 'citrus',
//     flavor: 'Citrus',
//     title: 'Sunshine Lemon Cloud',
//     subTitle: 'Zesty Lemon Curd & Torched French Meringue',
//     description: 'A dazzlingly bright lemonade curd, bursting with essential citrus oils. Piped high with organic meringue swirls, toasted until beautifully golden on the tips for an incredible marshmallow texture.',
//     bgColor: '#FFF5CC', // Light Warm Lemon Accent
//     accentColor: '#D69E2E',
//     textColor: '#4A3B12',
//     price: '$24.50',
//     calories: '270 kcal / slice',
//     diameter: '9.2 Inches',
//     prepTime: '22 Minutes',
//     rating: '4.7 (98 reviews)',
//     ambientDecor: [
//       { type: 'lemon', x: '10%', y: '20%', scale: 1.4, delay: 0.1 },
//       { type: 'meringue', x: '14%', y: '65%', scale: 1.3, delay: 0.4 },
//       { type: 'mint', x: '26%', y: '82%', scale: 1.4, delay: 0.2 },
//       { type: 'meringue', x: '88%', y: '16%', scale: 1.5, delay: 0.3 },
//       { type: 'lemon', x: '78%', y: '48%', scale: 1.3, delay: 0.6 },
//       { type: 'mint', x: '84%', y: '78%', scale: 1.6, delay: 0.5 },
//     ],
//     toppings: [
//       ...Array.from({ length: 8 }).map((_, i) => ({
//         type: 'meringue' as const,
//         angle: (i * 45),
//         radius: 175,
//         scale: 1.1,
//       })),
//       ...Array.from({ length: 8 }).map((_, i) => ({
//         type: 'lemon' as const,
//         angle: (i * 45) + 22.5,
//         radius: 135,
//         scale: 0.95,
//       })),
//       ...Array.from({ length: 6 }).map((_, i) => ({
//         type: 'meringue' as const,
//         angle: (i * 60) + 30,
//         radius: 80,
//         scale: 1.0,
//       })),
//       { type: 'lemon', angle: 90, radius: 25, scale: 1.0 },
//       { type: 'mint', angle: 270, radius: 25, scale: 1.2 },
//     ],
//   },
//   {
//     id: 'matcha',
//     flavor: 'Matcha',
//     title: 'Matcha Moss & Mint',
//     subTitle: 'Ceremonial Japanese Green Tea & Garden Mint',
//     description: 'Fine Japanese Uji Matcha powder whipped into a light, airy white chocolate cream. Paired dynamically with mint essence leaves and premium curls of ivory white chocolate for an earthy, deep aroma.',
//     bgColor: '#CDE9DC', // Soft Mint
//     accentColor: '#2F855A',
//     textColor: '#153322',
//     price: '$30.00',
//     calories: '310 kcal / slice',
//     diameter: '9.0 Inches',
//     prepTime: '26 Minutes',
//     rating: '4.9 (110 reviews)',
//     ambientDecor: [
//       { type: 'mint', x: '8%', y: '22%', scale: 1.6, delay: 0.2 },
//       { type: 'chocolate', x: '20%', y: '54%', scale: 1.5, delay: 0.4 },
//       { type: 'mint', x: '12%', y: '78%', scale: 1.3, delay: 0.1 },
//       { type: 'mint', x: '85%', y: '18%', scale: 1.5, delay: 0.3 },
//       { type: 'mint', x: '76%', y: '48%', scale: 1.4, delay: 0.5 },
//       { type: 'chocolate', x: '90%', y: '74%', scale: 1.6, delay: 0.6 },
//     ],
//     toppings: [
//       ...Array.from({ length: 10 }).map((_, i) => ({
//         type: 'mint' as const,
//         angle: (i * 36),
//         radius: 175,
//         scale: 1.25,
//       })),
//       ...Array.from({ length: 10 }).map((_, i) => ({
//         type: 'chocolate' as const,
//         angle: (i * 36) + 18,
//         radius: 130,
//         scale: 1.2,
//       })),
//       ...Array.from({ length: 5 }).map((_, i) => ({
//         type: 'mint' as const,
//         angle: (i * 72) + 36,
//         radius: 70,
//         scale: 1.1,
//       })),
//       { type: 'chocolate', angle: 0, radius: 25, scale: 1.35 },
//       { type: 'mint', angle: 180, radius: 25, scale: 1.1 },
//     ],
//   },
// ];


// const RotatingSlider: React.FC = () => {
//   const [activeIndex, setActiveIndex] = useState<number>(0);
//   const [activeSize, setActiveSize] = useState<'S' | 'M' | 'L' | 'XL'>('L');
//   const [cakeSpinEffect, setCakeSpinEffect] = useState<number>(0);
//   const isScrollingRef = useRef<boolean>(false);

//   // Active tart details
//   const activeTart = CAROUSEL_TARTS[activeIndex];

//   // Radial angles & track geometry parameters
//   const TOTAL_ITEMS = CAROUSEL_TARTS.length;
//   // Let's spread items symmetrically along the top-arc. Spacing by 35 degrees works perfectly!
//   const ANGLE_SPACING = 34; 

//   // Functions to rotate wheel
//   const handleNext = () => {
//     setActiveIndex((prev) => (prev + 1) % TOTAL_ITEMS);
//     // Add satisfying spin effect (e.g. spin cake ahead)
//     setCakeSpinEffect((prev) => prev + 360);
//   };

//   const handlePrev = () => {
//     setActiveIndex((prev) => (prev - 1 + TOTAL_ITEMS) % TOTAL_ITEMS);
//     setCakeSpinEffect((prev) => prev - 360);
//   };

//   const handleSelectIndex = (index: number) => {
//     if (index === activeIndex) return;
//     const diff = index - activeIndex;
//     setActiveIndex(index);
//     setCakeSpinEffect((prev) => prev + (diff * 120));
//   };

//   // 4. MOUSE WHEEL SCROLL ROTATION LISTENER
//   useEffect(() => {
//     const handleGlobalWheel = (e: WheelEvent) => {
//       // Cooldown timer to prevent hyperspeed skipping
//       if (isScrollingRef.current) return;

//       // Filter out horizontal or tiny mouse movements
//       if (Math.abs(e.deltaY) < 15) return;

//       if (e.deltaY > 0) {
//         handleNext();
//       } else {
//         handlePrev();
//       }

//       isScrollingRef.current = true;
//       setTimeout(() => {
//         isScrollingRef.current = false;
//       }, 850); // Composed transitional block
//     };

//     window.addEventListener('wheel', handleGlobalWheel, { passive: true });
//     return () => {
//       window.removeEventListener('wheel', handleGlobalWheel);
//     };
//   }, [activeIndex]);

//   return (
//     <div 
//       id="rotating-slider-root"
//       className="slider-page-container md:h-screen w-full relative overflow-hidden flex flex-col justify-between"
//       style={{ backgroundColor: activeTart.bgColor }}
//     >
      
//       {/* BACKGROUND GRAPHIC ACCENTS */}
//       <div 
//         className="absolute inset-0 pointer-events-none opacity-25" 
//         style={{
//           background: `radial-gradient(circle at 50% 120%, white 0%, transparent 60%)`
//         }}
//       />

//       {/* 5. FLOATING INGREDIENTS/PARTICLES IN VIEWPORT */}
//       <AnimatePresence mode="popLayout">
//         <motion.div 
//           key={`decor-${activeIndex}`}
//           className="absolute inset-0 pointer-events-none w-full h-full"
//           initial="initial"
//           animate="animate"
//           exit="exit"
//         >
//           {activeTart.ambientDecor.map((p, idx) => (
//             <motion.div
//               key={`particle-${idx}`}
//               className="drifting-particle"
//               style={{ left: p.x, top: p.y }}
//               variants={{
//                 initial: { opacity: 0, scale: 0, y: 100, rotate: -45 },
//                 animate: { 
//                   opacity: 1, 
//                   scale: p.scale, 
//                   y: 0, 
//                   rotate: 0,
//                   transition: { 
//                     type: "spring", 
//                     stiffness: 80, 
//                     damping: 15, 
//                     delay: p.delay 
//                   } 
//                 },
//                 exit: { 
//                   opacity: 0, 
//                   scale: 0.3, 
//                   y: -100, 
//                   rotate: 45,
//                   transition: { duration: 0.4 } 
//                 }
//               }}
//             >
//               <RenderDecors type={p.type} scale={1} />
//             </motion.div>
//           ))}
//         </motion.div>
//       </AnimatePresence>


//       {/* BOUTIQUE HEADER NAVIGATION BAR */}
//       <header className="w-full relative z-50 flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-[2px]">
//         {/* Brand Logo */}
//         <div className="flex items-center gap-2 cursor-pointer">
//           <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
//             <Sparkles size={16} className="text-stone-700 animate-pulse" />
//           </div>
//           <div>
//             <h1 className="font-editorial text-xl font-bold tracking-widest text-stone-900 leading-none">LA PÂTISSERIE</h1>
//             <span className="font-mono text-[9px] font-semibold tracking-widest text-stone-500 uppercase">Artisanal Maison</span>
//           </div>
//         </div>

//         {/* Center menu links */}
//         <nav className="hidden lg:flex items-center gap-8 font-mono text-[11px] font-bold tracking-widest text-stone-800 uppercase">
//           <span className="px-3 py-1 cursor-pointer border-b-2 border-stone-800 tracking-widest">Our Tarts</span>
//           <span className="px-3 py-1 cursor-pointer hover:text-stone-950 transition">Custom Orders</span>
//           <span className="px-3 py-1 cursor-pointer hover:text-stone-950 transition">Artisan Kitchen</span>
//           <span className="px-3 py-1 cursor-pointer hover:text-stone-950 transition">Our Story</span>
//           <span className="px-3 py-1 cursor-pointer hover:text-stone-950 transition">Locations</span>
//         </nav>

//         {/* CTA buttons */}
//         <div className="flex items-center gap-4">
//           <button className="p-2.5 rounded-full bg-white/60 hover:bg-white text-stone-800 transition shadow-xs">
//             <Heart size={16} />
//           </button>
//           <button className="font-mono text-[11px] font-bold tracking-widest uppercase bg-stone-900 text-white px-5 py-3 rounded-full hover:bg-stone-850 transition shadow-lg hover:shadow-xl flex items-center gap-2">
//             <ShoppingBag size={13} />
//             <span>Order Online</span>
//           </button>
//         </div>
//       </header>


//       {/* BODY CONTENT STAGE */}
//       <main className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 px-6 md:px-12 items-center relative z-40">
        
//         {/* LEFT COLUMN: DESCRIPTION CARDS */}
//         <div className="lg:col-span-5 flex flex-col justify-center text-left py-6 lg:py-0 relative z-10">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={`info-${activeIndex}`}
//               initial={{ opacity: 0, x: -50 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 30 }}
//               transition={{ type: "spring", stiffness: 100, damping: 15 }}
//             >
//               {/* Decorative category label */}
//               <div className="flex items-center gap-2 mb-3">
//                 <span className="w-8 h-[1px] bg-stone-600/50" />
//                 <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-600">
//                   Featured Creation
//                 </span>
//                 <span className="text-[10px] bg-white/70 backdrop-blur-xs text-stone-800 font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase font-mono border border-stone-200">
//                   {activeTart.rating}
//                 </span>
//               </div>

//               {/* Title & Slogan */}
//               <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 mb-2 drop-shadow-xs">
//                 {activeTart.title}
//               </h2>
//               <h4 className="font-editorial text-lg italic text-stone-700 font-medium mb-5">
//                 {activeTart.subTitle}
//               </h4>

//               {/* Description body */}
//               <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-6 max-w-md font-sans">
//                 {activeTart.description}
//               </p>

//               {/* Nutritional / Preparation tags (Crust Pizza inspired stats card) */}
//               <div className="grid grid-cols-3 gap-3 max-w-md mb-8">
//                 <div className="bg-white/40 border border-white/60 p-3 rounded-2xl backdrop-blur-xs shadow-xs">
//                   <span className="block font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Calories</span>
//                   <span className="font-mono text-[13px] font-bold text-stone-800 flex items-center gap-1.5">
//                     <Scale size={12} className="text-stone-500" />
//                     {activeTart.calories}
//                   </span>
//                 </div>
//                 <div className="bg-white/40 border border-white/60 p-3 rounded-2xl backdrop-blur-xs shadow-xs">
//                   <span className="block font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Diameter</span>
//                   <span className="font-mono text-[13px] font-bold text-stone-800 flex items-center gap-1.5">
//                     <Compass size={12} className="text-stone-500" />
//                     {activeTart.diameter}
//                   </span>
//                 </div>
//                 <div className="bg-white/40 border border-white/60 p-3 rounded-2xl backdrop-blur-xs shadow-xs">
//                   <span className="block font-mono text-[9px] text-stone-500 uppercase tracking-widest mb-1">Baking Prep</span>
//                   <span className="font-mono text-[13px] font-bold text-stone-800 flex items-center gap-1.5">
//                     <Sparkles size={12} className="text-stone-500 animate-spin" style={{ animationDuration: '4s' }} />
//                     {activeTart.prepTime}
//                   </span>
//                 </div>
//               </div>

//               {/* Action pricing or add to bag */}
//               <div className="flex items-center gap-5">
//                 <div>
//                   <span className="block font-sans text-xs text-stone-500 font-semibold uppercase tracking-wider mb-0.5">Whole Pastry</span>
//                   <span className="font-mono text-3xl font-bold text-stone-900">{activeTart.price}</span>
//                 </div>
//                 <button 
//                   className="px-8 py-3.5 bg-stone-900 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full hover:bg-stone-800 transition duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
//                   style={{ backgroundColor: activeTart.textColor }}
//                 >
//                   <Plus size={14} />
//                   <span>Add to Order</span>
//                 </button>
//               </div>

//             </motion.div>
//           </AnimatePresence>
//         </div>


//         {/* RIGHT COLUMN: INTEGRATES HOVER WHEEL & CAROUSEL */}
//         <div className="lg:col-span-7 h-[420px] lg:h-[650px] relative flex items-end justify-center">

//           {/* SIZE OPTION SELECTOR (Like Crust Pizza) */}
//           <div className="absolute left-[5%] xl:left-[10%] top-[10%] z-50 bg-white/30 border border-white/60 p-1.5 rounded-full flex flex-col gap-2 shadow-sm backdrop-blur-md">
//             <span className="text-[8px] font-mono font-bold text-stone-600 block text-center mt-1 uppercase tracking-wider">Size</span>
//             {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
//               <button
//                 key={sz}
//                 onClick={() => setActiveSize(sz)}
//                 className={`w-9 h-9 rounded-full font-mono text-[11px] font-bold flex items-center justify-center transition-all ${
//                   activeSize === sz
//                     ? 'bg-white text-stone-900 shadow-md scale-110 border-2'
//                     : 'text-stone-700 hover:bg-white/40'
//                 }`}
//                 style={{ borderColor: activeSize === sz ? activeTart.accentColor : 'transparent' }}
//               >
//                 {sz}
//               </button>
//             ))}
//           </div>

//           {/* FLAVOR CONCENTRIC RAIL OVERLAY */}
//           {/* We rotate the entire track-container itself by -activeIndex * ANGLE_SPACING */}
//           <motion.div 
//             className="circular-track-container"
//             animate={{ rotate: -activeIndex * ANGLE_SPACING }}
//             transition={{ type: "spring", stiffness: 70, damping: 16 }}
//           >
//             {/* Fine Concentric Circles drawn natively to fit Pizza and Figma Arc style */}
//             <div className="absolute w-[800px] h-[800px] rounded-full border border-stone-900/10 pointer-events-none" />
//             <div className="absolute w-[950px] h-[950px] rounded-full border border-stone-900/15 pointer-events-none" />
//             <div className="absolute w-[1100px] h-[1100px] rounded-full border border-stone-900/20 pointer-events-none" />

//             {/* Render Flavor Node dots and radial links on the carousel */}
//             {CAROUSEL_TARTS.map((tart, index) => {
//               // Calculate specific angular vectors (0 is top-center, positive to the right)
//               const theta = index * ANGLE_SPACING;
              
//               // We rotate our individual node wrappers outward so their 0 point is correct
//               return (
//                 <div 
//                   key={tart.id} 
//                   className="rotatable-node-wrapper"
//                   style={{
//                     transform: `rotate(${theta}deg) translateY(-400px)`,
//                   }}
//                 >
//                   {/* Keep text and buttons upright relative to our page */}
//                   {/* To undo the parent rotating-track and grandparent wrappers: */}
//                   <motion.div 
//                     className="flex flex-col items-center gap-2"
//                     animate={{ rotate: (activeIndex * ANGLE_SPACING) - theta }}
//                     transition={{ type: "spring", stiffness: 70, damping: 16 }}
//                   >
                    
//                     {/* Flavor Text written along circular angle path */}
//                     <span 
//                       onClick={() => handleSelectIndex(index)}
//                       className={`flavor-dot-label ${index === activeIndex ? 'active text-stone-950 scale-110' : 'text-stone-600 opacity-60'}`}
//                       style={{ 
//                         transform: 'translateY(-18px)',
//                         color: index === activeIndex ? activeTart.textColor : undefined
//                       }}
//                     >
//                       {tart.flavor}
//                     </span>

//                     {/* Flavor Circle Dot Pointer */}
//                     <button
//                       onClick={() => handleSelectIndex(index)}
//                       className={`flavor-dot-button ${index === activeIndex ? 'active' : ''}`}
//                       style={{ '--accent': activeTart.accentColor } as React.CSSProperties}
//                     />

//                   </motion.div>
//                 </div>
//               );
//             })}
//           </motion.div>


//           {/* 6. CENTERPIECE CAKE VIEWING STAGE */}
//           <div className="cake-viewing-stage">
            
//             {/* Dynamic visual rings that rotate and breathe */}
//             <div className="cake-circular-frame">
//               <div className="cake-inner-accent-ring" />
//             </div>

//             {/* Glowing neon background halo aura */}
//             <div 
//               className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30 transition-all duration-1000"
//               style={{ backgroundColor: activeTart.accentColor }}
//             />

//             {/* THE ROTATING GOLDEN TART PIE ASSEMBLY */}
//             {/* When we spin, the whole assemblies rotate in sync */}
//             <motion.div 
//               className="rotating-cake-assembly drop-shadow-2xl"
//               animate={{ rotate: cakeSpinEffect }}
//               transition={{ type: "spring", stiffness: 35, damping: 12 }}
//             >
              
//               {/* Dynamic size container */}
//               <motion.div 
//                 className="w-full h-full relative"
//                 animate={{ 
//                   scale: activeSize === 'S' ? 0.8 : activeSize === 'M' ? 0.9 : activeSize === 'L' ? 1.0 : 1.1 
//                 }}
//                 transition={{ type: "spring", stiffness: 100, damping: 15 }}
//               >
//                 {/* Crust Shell Base Image */}
//                 <img
//                   src="https://i.pinimg.com/736x/d9/d1/7e/d9d17edfbadcb1a6163f3618e5a8d05d.jpg"
//                   alt="Pastry Tart Crust Shell"
//                   referrerPolicy="no-referrer"
//                   className="absolute inset-0 w-full h-full object-cover rounded-full border border-amber-900/10 pointer-events-none select-none"
//                   style={{
//                     mixBlendMode: 'normal',
//                     filter: 'brightness(1.02) contrast(1.05) drop-shadow(0px 10px 20px rgba(0,0,0,0.15))'
//                   }}
//                 />

//                 {/* Rich Glaze Shade Overlay */}
//                 <div className="absolute inset-0 rounded-full bg-radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.06) 100%) pointer-events-none" />

//                 {/* Dynamic SVG fruits and toppings generated on the rotating cake crown */}
//                 {activeTart.toppings.map((top, tIdx) => {
//                   // Toposition mathematically along circle center
//                   const radians = (top.angle * Math.PI) / 180;
//                   // Center of cake is 530px/2 = 265px
//                   const originX = 265;
//                   const originY = 265;
//                   const itemX = originX + top.radius * Math.cos(radians);
//                   const itemY = originY + top.radius * Math.sin(radians);
//                   const itemRotation = top.rotate ? top.rotate : (top.angle + 90);

//                   return (
//                     <motion.div
//                       key={`topping-${activeIndex}-${tIdx}`}
//                       className="absolute"
//                       style={{
//                         left: itemX,
//                         top: itemY,
//                         transform: `translate(-50%, -50%) rotate(${itemRotation}deg)`,
//                       }}
//                       initial={{ scale: 0, opacity: 0 }}
//                       animate={{ scale: top.scale, opacity: 1 }}
//                       transition={{ 
//                         type: "spring", 
//                         stiffness: 110, 
//                         damping: 14, 
//                         delay: tIdx * 0.015 
//                       }}
//                     >
//                       {/* Micro-hover animation on toppings */}
//                       <motion.div 
//                         whileHover={{ scale: 1.25, y: -4, rotate: 10 }}
//                         className="cursor-pointer active:scale-95"
//                       >
//                         <VectorTopping type={top.type} scale={1.05} />
//                       </motion.div>
//                     </motion.div>
//                   );
//                 })}

//               </motion.div>

//             </motion.div>

//           </div>


//           {/* 7. TRIGGER NAVIGATION BUTTONS WITH HIGH ACCURACY */}
//           <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-12">
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handlePrev}
//               className="w-14 h-14 rounded-full bg-white text-stone-800 shadow-lg hover:shadow-xl hover:bg-stone-50 transition border border-stone-200/50 flex items-center justify-center cursor-pointer group"
//             >
//               <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
//             </motion.button>

//             <span className="font-mono text-xs font-bold text-stone-800 tracking-widest bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm select-none border border-white/60">
//               <span className="text-[14px]" style={{ color: activeTart.accentColor }}>{activeIndex + 1}</span>
//               <span className="text-stone-400 mx-1.5">/</span>
//               <span>{TOTAL_ITEMS}</span>
//             </span>

//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleNext}
//               className="w-14 h-14 rounded-full bg-white text-stone-800 shadow-lg hover:shadow-xl hover:bg-stone-50 transition border border-stone-200/50 flex items-center justify-center cursor-pointer group"
//             >
//               <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
//             </motion.button>
//           </div>

//         </div>

//       </main>


//       {/* FOOTER METRIC INFORMATIONAL FOOTNOTES */}
//       <footer className="w-full relative z-40 px-6 py-6 md:px-12 flex flex-col md:flex-row items-center justify-between border-t border-black/5 backdrop-blur-[1px] gap-4">
//         {/* Helper guide */}
//         <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600/90 font-mono">
//           <HelpCircle size={13} />
//           <span>Tip: Spin the cake by scrolling your mouse, dragging, or selecting options.</span>
//         </div>

//         {/* Dynamic decorative progress indicator */}
//         <div className="flex items-center gap-2.5">
//           {CAROUSEL_TARTS.map((t, idx) => (
//             <button
//               key={t.id}
//               onClick={() => handleSelectIndex(idx)}
//               className="h-1.5 rounded-full transition-all duration-500 cursor-pointer"
//               style={{
//                 width: idx === activeIndex ? '28px' : '6px',
//                 backgroundColor: idx === activeIndex ? activeTart.textColor : '#ffffff'
//               }}
//             />
//           ))}
//         </div>

//         {/* Technical tag */}
//         <div className="hidden md:block">
//           <span className="font-mono text-[10px] text-stone-600/80 font-bold uppercase tracking-wider">
//             Premium Handcrafted Web UX — Framer Motion 12
//           </span>
//         </div>
//       </footer>

//     </div>
//   );
// };

// export default RotatingSlider;



import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ShoppingBag, Heart, Plus, Sparkles, Scale, Compass, HelpCircle } from 'lucide-react';
import './RotatingSlider.css';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ToppingItem {
  type: 'strawberry' | 'grape' | 'blueberry' | 'raspberry' | 'blackberry' | 'cherry' | 'lemon' | 'meringue' | 'mint' | 'chocolate';
  angle: number;
  radius: number;
  scale: number;
  rotate?: number;
}

interface ParticledDecor {
  type: 'strawberry' | 'grape' | 'blackberry' | 'blueberry' | 'raspberry' | 'cherry' | 'lemon' | 'meringue' | 'mint' | 'chocolate';
  x: string;
  y: string;
  scale: number;
  delay: number;
}

interface TartOption {
  id: string;
  flavor: string;
  title: string;
  subTitle: string;
  description: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  price: string;
  calories: string;
  diameter: string;
  prepTime: string;
  rating: string;
  toppings: ToppingItem[];
  ambientDecor: ParticledDecor[];
}

// ─── SVG Toppings ─────────────────────────────────────────────────────────────

const VectorTopping: React.FC<{ type: string; scale: number }> = ({ type, scale }) => {
  const s = scale;
  switch (type) {
    case 'strawberry':
      return (
        <svg width={36 * s} height={36 * s} viewBox="0 0 36 36" fill="none" className="drop-shadow-sm">
          <path d="M18 4C18 4 9 9 7 19C5 29 13 33 18 33C23 33 31 29 29 19C27 9 18 4 18 4Z" fill="url(#strawberryGrad)" />
          <path d="M18 2V7M18 4C16 3 11 3 13 8C15 8 18 5 18 5C18 5 21 8 23 8C25 3 20 3 18 4Z" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#40916C" />
          <circle cx="14" cy="14" r="1" fill="#FCE164" opacity="0.9" />
          <circle cx="22" cy="14" r="1" fill="#FCE164" opacity="0.9" />
          <circle cx="12" cy="20" r="1" fill="#FCE164" opacity="0.9" />
          <circle cx="18" cy="18" r="1" fill="#FCE164" opacity="0.9" />
          <circle cx="24" cy="20" r="1" fill="#FCE164" opacity="0.9" />
          <circle cx="15" cy="26" r="1" fill="#FCE164" opacity="0.9" />
          <circle cx="21" cy="26" r="1" fill="#FCE164" opacity="0.9" />
          <path d="M25 15C26 18 26 21 24 23" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <defs>
            <radialGradient id="strawberryGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FF4D6D" />
              <stop offset="70%" stopColor="#C9184A" />
              <stop offset="100%" stopColor="#800F2F" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'grape':
      return (
        <svg width={26 * s} height={26 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
          <circle cx="12" cy="12" r="10" fill="url(#grapeGrad)" />
          <circle cx="8" cy="8" r="2.5" fill="#FFF" opacity="0.6" />
          <defs>
            <radialGradient id="grapeGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#D8F3DC" />
              <stop offset="40%" stopColor="#95D5B2" />
              <stop offset="85%" stopColor="#40916C" />
              <stop offset="100%" stopColor="#1B4332" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'blueberry':
      return (
        <svg width={22 * s} height={22 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
          <circle cx="12" cy="12" r="10" fill="url(#blueberryGrad)" />
          <path d="M12 4C13.5 5.5 15 5.5 15 7C15 8.5 13.5 8.5 12 7C10.5 8.5 9 8.5 9 7C9 5.5 10.5 5.5 12 4Z" fill="#1D3557" />
          <path d="M10 5L12 8L14 5" stroke="#457B9D" strokeWidth="1" strokeLinecap="round" />
          <path d="M6 12C6 8.5 8.5 6 12 6" stroke="#A8DADC" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <defs>
            <radialGradient id="blueberryGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#457B9D" />
              <stop offset="65%" stopColor="#1D3557" />
              <stop offset="100%" stopColor="#0B132B" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'raspberry':
      return (
        <svg width={24 * s} height={24 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
          <path d="M12 2C8 2 6 5 6 11C6 17 9 22 12 22C15 22 18 17 18 11C18 5 16 2 12 2Z" fill="#A4133C" />
          <circle cx="12" cy="6" r="3.5" fill="#FF4D6D" />
          <circle cx="9" cy="9" r="3" fill="#D90429" />
          <circle cx="15" cy="9" r="3" fill="#D90429" />
          <circle cx="8" cy="13" r="3.2" fill="#C9184A" />
          <circle cx="12" cy="12" r="3.5" fill="#FF4D6D" />
          <circle cx="16" cy="13" r="3.2" fill="#C9184A" />
          <circle cx="10" cy="17" r="3" fill="#A4133C" />
          <circle cx="14" cy="17" r="3" fill="#A4133C" />
          <circle cx="12" cy="20" r="2.5" fill="#800F2F" />
          <circle cx="11.5" cy="11.5" r="1" fill="#FFF" opacity="0.5" />
          <circle cx="8.5" cy="8.5" r="0.8" fill="#FFF" opacity="0.5" />
        </svg>
      );
    case 'blackberry':
      return (
        <svg width={24 * s} height={24 * s} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
          <path d="M12 2C8 2 6 5 6 11C6 17 9 22 12 22C15 22 18 17 18 11C18 5 16 2 12 2Z" fill="#140118" />
          <circle cx="12" cy="6" r="3.5" fill="#3C0949" />
          <circle cx="9" cy="9" r="3" fill="#250530" />
          <circle cx="15" cy="9" r="3" fill="#250530" />
          <circle cx="8" cy="13" r="3.2" fill="#1C0224" />
          <circle cx="12" cy="12" r="3.5" fill="#3C0949" />
          <circle cx="16" cy="13" r="3.2" fill="#1C0224" />
          <circle cx="10" cy="17" r="3" fill="#140118" />
          <circle cx="14" cy="17" r="3" fill="#140118" />
          <circle cx="12" cy="20" r="2.5" fill="#08000A" />
          <circle cx="11.5" cy="11.5" r="0.8" fill="#FFF" opacity="0.4" />
          <circle cx="14.5" cy="12.5" r="0.8" fill="#FFF" opacity="0.4" />
        </svg>
      );
    case 'cherry':
      return (
        <svg width={32 * s} height={42 * s} viewBox="0 0 32 42" fill="none" className="drop-shadow-md">
          <path d="M16 14C16 14 18 5 28 2" stroke="#6F5831" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="14" cy="26" r="12" fill="url(#cherryGrad)" />
          <path d="M7 22C7 18 11 16 13 16" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <circle cx="18" cy="22" r="1.5" fill="#FFF" opacity="0.4" />
          <defs>
            <radialGradient id="cherryGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#D90429" />
              <stop offset="50%" stopColor="#7A0010" />
              <stop offset="100%" stopColor="#3B0007" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'lemon':
      return (
        <svg width={34 * s} height={34 * s} viewBox="0 0 34 34" fill="none" className="drop-shadow-sm">
          <circle cx="17" cy="17" r="15" fill="#F9C74F" stroke="#F9C74F" strokeWidth="1" />
          <circle cx="17" cy="17" r="13.5" fill="#FFF" />
          <path d="M17 17L17 5C19.5 5 22 6 24 8L17 17Z" fill="#FCE164" />
          <path d="M17 17L24 8C26 10 27 12.5 27 17L17 17Z" fill="#F9C74F" />
          <path d="M17 17L27 17C27 19.5 26 22 24 24L17 17Z" fill="#FCE164" />
          <path d="M17 17L24 24C22 26 19.5 27 17 27L17 17Z" fill="#F9C74F" />
          <path d="M17 17L17 27C14.5 27 12 26 10 24L17 17Z" fill="#FCE164" />
          <path d="M17 17L10 24C8 22 7 19.5 7 17L17 17Z" fill="#F9C74F" />
          <path d="M17 17L7 17C7 14.5 8 12 10 10L17 17Z" fill="#FCE164" />
          <path d="M17 17L10 10C12 8 14.5 7 17 7L17 17Z" fill="#F9C74F" />
          <circle cx="17" cy="17" r="12" stroke="#FFF" strokeWidth="0.8" opacity="0.75" fill="none" />
        </svg>
      );
    case 'meringue':
      return (
        <svg width={30 * s} height={30 * s} viewBox="0 0 30 30" fill="none" className="drop-shadow-sm">
          <path d="M15 2C15 2 11 11 10 16C9 21 11 25 15 25C19 25 21 21 20 16C19 11 15 2 15 2Z" fill="url(#meringueGrad)" />
          <path d="M15 2C15 2 18 8 17 14C16 19 19 23 15 25" stroke="#E6BE8A" strokeWidth="0.75" strokeLinecap="round" opacity="0.6" />
          <path d="M10 21C11.5 22.5 13.5 23 15 23C16.5 23 18.5 22.5 20 21" stroke="#FFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          <defs>
            <radialGradient id="meringueGrad" cx="50%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#FFF" />
              <stop offset="50%" stopColor="#FFF0E0" />
              <stop offset="85%" stopColor="#DDB892" />
              <stop offset="100%" stopColor="#7F5539" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'mint':
      return (
        <svg width={26 * s} height={20 * s} viewBox="0 0 26 20" fill="none" className="drop-shadow-sm">
          <path d="M1 10C1 10 7 2 13 4C19 2 25 10 25 10C25 10 19 18 13 16C7 18 1 10 1 10Z" fill="url(#mintGrad)" />
          <path d="M1 10C8 10 18 10 25 10" stroke="#1B4332" strokeWidth="1.2" opacity="0.5" />
          <path d="M9 10L12 6" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
          <path d="M9 10L11 14" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
          <path d="M15 10L18 6" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
          <path d="M15 10L17 14" stroke="#1B4332" strokeWidth="1" opacity="0.4" />
          <defs>
            <linearGradient id="mintGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#52B788" />
              <stop offset="100%" stopColor="#1B4332" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'chocolate':
      return (
        <svg width={22 * s} height={18 * s} viewBox="0 0 22 18" fill="none" className="drop-shadow-xs">
          <path d="M2 14C4 6 12 2 18 4C22 6 18 12 14 14C10 16 4 16 2 14Z" stroke="#4a2c1b" strokeWidth="1.5" fill="#3D2314" />
          <path d="M4 12C6 7 11 5 15 6" stroke="#7A4F37" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
};

const RenderDecors: React.FC<{ type: string; scale: number }> = ({ type, scale }) => (
  <div className="natural-float" style={{ position: 'relative' }}>
    <VectorTopping type={type} scale={scale} />
  </div>
);

// ─── Tart Data ────────────────────────────────────────────────────────────────

const CAROUSEL_TARTS: TartOption[] = [
  {
    id: 'strawberries',
    flavor: 'Strawberry',
    title: 'Ruby Strawberry Tart',
    subTitle: 'Traditional French Crème & Mountain Berries',
    description: 'Freshly carved sweet mountain strawberries arranged in an elegant spiral canopy. Anchored with our signature buttery shortcrust pastry and filled with a thick layer of silky, organic vanilla bean pastry cream.',
    bgColor: '#FCDCE1',
    accentColor: '#FF4D6D',
    textColor: '#5C1D24',
    price: '$28.50',
    calories: '340 kcal / slice',
    diameter: '9.5 Inches',
    prepTime: '24 Minutes',
    rating: '4.9 (182 reviews)',
    ambientDecor: [
      { type: 'strawberry', x: '10%', y: '18%', scale: 1.8, delay: 0 },
      { type: 'strawberry', x: '18%', y: '58%', scale: 1.2, delay: 0.4 },
      { type: 'mint', x: '5%', y: '75%', scale: 1.6, delay: 0.2 },
      { type: 'strawberry', x: '85%', y: '15%', scale: 2.1, delay: 0.1 },
      { type: 'mint', x: '82%', y: '50%', scale: 1.4, delay: 0.5 },
      { type: 'strawberry', x: '90%', y: '78%', scale: 1.3, delay: 0.3 },
    ],
    toppings: [
      ...Array.from({ length: 12 }).map((_, i) => ({ type: 'strawberry' as const, angle: i * 30, radius: 175, scale: 1.1 })),
      ...Array.from({ length: 8 }).map((_, i) => ({ type: 'strawberry' as const, angle: i * 45 + 15, radius: 110, scale: 0.9 })),
      ...Array.from({ length: 6 }).map((_, i) => ({ type: 'mint' as const, angle: i * 60 + 30, radius: 140, scale: 1.0 })),
      { type: 'strawberry' as const, angle: 0, radius: 40, scale: 1.2 },
      { type: 'strawberry' as const, angle: 180, radius: 40, scale: 1.0 },
      { type: 'mint' as const, angle: 90, radius: 25, scale: 0.8 },
    ],
  },
  {
    id: 'grapes',
    flavor: 'Grapes',
    title: 'Emerald Vine Grape Tart',
    subTitle: 'Premium Seedless Grapes on Chilled Custard',
    description: 'Vibrant emerald green grapes, hand-polished and halved, resting upon a thin bed of lime-zest pastry whipped dome. A refreshing blast of tangy sweetness nested safely on crisp salted-butter crust.',
    bgColor: '#E9ECCE',
    accentColor: '#40916C',
    textColor: '#2D3F34',
    price: '$26.80',
    calories: '290 kcal / slice',
    diameter: '9.0 Inches',
    prepTime: '20 Minutes',
    rating: '4.8 (124 reviews)',
    ambientDecor: [
      { type: 'grape', x: '12%', y: '25%', scale: 1.7, delay: 0.1 },
      { type: 'mint', x: '7%', y: '62%', scale: 1.5, delay: 0.3 },
      { type: 'grape', x: '24%', y: '80%', scale: 1.1, delay: 0.5 },
      { type: 'grape', x: '82%', y: '18%', scale: 1.9, delay: 0.2 },
      { type: 'grape', x: '88%', y: '52%', scale: 1.3, delay: 0.4 },
      { type: 'mint', x: '78%', y: '78%', scale: 1.6, delay: 0.6 },
    ],
    toppings: [
      ...Array.from({ length: 15 }).map((_, i) => ({ type: 'grape' as const, angle: i * 24, radius: 180, scale: 1.15 })),
      ...Array.from({ length: 10 }).map((_, i) => ({ type: 'grape' as const, angle: i * 36 + 12, radius: 120, scale: 0.95 })),
      ...Array.from({ length: 5 }).map((_, i) => ({ type: 'mint' as const, angle: i * 72 + 36, radius: 80, scale: 1.1 })),
      { type: 'grape' as const, angle: 0, radius: 30, scale: 1.2 },
      { type: 'grape' as const, angle: 120, radius: 30, scale: 1.0 },
      { type: 'grape' as const, angle: 240, radius: 32, scale: 1.0 },
    ],
  },
  {
    id: 'berries',
    flavor: 'Berries',
    title: 'Velvet Forest Berries',
    subTitle: 'Triple Forest Berries with Cocoa Crust',
    description: 'An rich medley of sweet blackberries, tangy raspberries, and plump blueberries on a crisp shortbread crust with luxury dark chocolate ganache layers. The ultimate indulgence for true berry connoisseurs.',
    bgColor: '#F0D9EF',
    accentColor: '#7B341E',
    textColor: '#421E47',
    price: '$31.20',
    calories: '380 kcal / slice',
    diameter: '9.5 Inches',
    prepTime: '28 Minutes',
    rating: '5.0 (206 reviews)',
    ambientDecor: [
      { type: 'blueberry', x: '15%', y: '22%', scale: 1.8, delay: 0.2 },
      { type: 'raspberry', x: '22%', y: '50%', scale: 1.5, delay: 0.5 },
      { type: 'blackberry', x: '9%', y: '72%', scale: 1.6, delay: 0.1 },
      { type: 'blackberry', x: '84%', y: '20%', scale: 1.9, delay: 0.3 },
      { type: 'blueberry', x: '78%', y: '58%', scale: 1.3, delay: 0.6 },
      { type: 'raspberry', x: '86%', y: '82%', scale: 1.4, delay: 0.4 },
    ],
    toppings: [
      ...Array.from({ length: 8 }).map((_, i) => ({ type: 'blackberry' as const, angle: i * 45, radius: 185, scale: 1.0 })),
      ...Array.from({ length: 8 }).map((_, i) => ({ type: 'raspberry' as const, angle: i * 45 + 22.5, radius: 175, scale: 1.05 })),
      ...Array.from({ length: 12 }).map((_, i) => ({ type: 'blueberry' as const, angle: i * 30 + 15, radius: 125, scale: 1.1 })),
      ...Array.from({ length: 6 }).map((_, i) => ({ type: 'raspberry' as const, angle: i * 60 + 10, radius: 75, scale: 0.95 })),
      { type: 'blackberry' as const, angle: 0, radius: 25, scale: 1.1 },
      { type: 'blueberry' as const, angle: 120, radius: 20, scale: 1.2 },
      { type: 'raspberry' as const, angle: 240, radius: 25, scale: 1.0 },
    ],
  },
  {
    id: 'cherries',
    flavor: 'Cherry',
    title: 'Gilded Cherry Truffle',
    subTitle: 'Dark Morello Cherries & Chocolate Ganache',
    description: 'Lustrous, deep crimson pitted Morello cherries, steeped in fine cherry nectar and resting inside a dark cacao shortbread shell. A rich ribbon of chocolate fudge truffle lies hidden beneath.',
    bgColor: '#FFE6BB',
    accentColor: '#9B2C2C',
    textColor: '#4D2418',
    price: '$29.90',
    calories: '410 kcal / slice',
    diameter: '9.0 Inches',
    prepTime: '25 Minutes',
    rating: '4.9 (148 reviews)',
    ambientDecor: [
      { type: 'cherry', x: '18%', y: '16%', scale: 1.5, delay: 0 },
      { type: 'chocolate', x: '5%', y: '52%', scale: 1.6, delay: 0.3 },
      { type: 'cherry', x: '22%', y: '78%', scale: 1.1, delay: 0.4 },
      { type: 'cherry', x: '82%', y: '24%', scale: 1.6, delay: 0.2 },
      { type: 'chocolate', x: '90%', y: '60%', scale: 1.5, delay: 0.5 },
      { type: 'cherry', x: '76%', y: '84%', scale: 1.3, delay: 0.1 },
    ],
    toppings: [
      ...Array.from({ length: 10 }).map((_, i) => ({ type: 'cherry' as const, angle: i * 36 + 18, radius: 175, scale: 1.1 })),
      ...Array.from({ length: 8 }).map((_, i) => ({ type: 'chocolate' as const, angle: i * 45, radius: 135, scale: 1.2 })),
      ...Array.from({ length: 6 }).map((_, i) => ({ type: 'cherry' as const, angle: i * 60 + 30, radius: 90, scale: 0.95 })),
      { type: 'cherry' as const, angle: 0, radius: 20, scale: 1.15 },
      { type: 'chocolate' as const, angle: 180, radius: 30, scale: 1.3 },
    ],
  },
  {
    id: 'citrus',
    flavor: 'Citrus',
    title: 'Sunshine Lemon Cloud',
    subTitle: 'Zesty Lemon Curd & Torched French Meringue',
    description: 'A dazzlingly bright lemonade curd, bursting with essential citrus oils. Piped high with organic meringue swirls, toasted until beautifully golden on the tips for an incredible marshmallow texture.',
    bgColor: '#FFF5CC',
    accentColor: '#D69E2E',
    textColor: '#4A3B12',
    price: '$24.50',
    calories: '270 kcal / slice',
    diameter: '9.2 Inches',
    prepTime: '22 Minutes',
    rating: '4.7 (98 reviews)',
    ambientDecor: [
      { type: 'lemon', x: '10%', y: '20%', scale: 1.4, delay: 0.1 },
      { type: 'meringue', x: '14%', y: '65%', scale: 1.3, delay: 0.4 },
      { type: 'mint', x: '26%', y: '82%', scale: 1.4, delay: 0.2 },
      { type: 'meringue', x: '88%', y: '16%', scale: 1.5, delay: 0.3 },
      { type: 'lemon', x: '78%', y: '48%', scale: 1.3, delay: 0.6 },
      { type: 'mint', x: '84%', y: '78%', scale: 1.6, delay: 0.5 },
    ],
    toppings: [
      ...Array.from({ length: 8 }).map((_, i) => ({ type: 'meringue' as const, angle: i * 45, radius: 175, scale: 1.1 })),
      ...Array.from({ length: 8 }).map((_, i) => ({ type: 'lemon' as const, angle: i * 45 + 22.5, radius: 135, scale: 0.95 })),
      ...Array.from({ length: 6 }).map((_, i) => ({ type: 'meringue' as const, angle: i * 60 + 30, radius: 80, scale: 1.0 })),
      { type: 'lemon' as const, angle: 90, radius: 25, scale: 1.0 },
      { type: 'mint' as const, angle: 270, radius: 25, scale: 1.2 },
    ],
  },
  {
    id: 'matcha',
    flavor: 'Matcha',
    title: 'Matcha Moss & Mint',
    subTitle: 'Ceremonial Japanese Green Tea & Garden Mint',
    description: 'Fine Japanese Uji Matcha powder whipped into a light, airy white chocolate cream. Paired dynamically with mint essence leaves and premium curls of ivory white chocolate for an earthy, deep aroma.',
    bgColor: '#CDE9DC',
    accentColor: '#2F855A',
    textColor: '#153322',
    price: '$30.00',
    calories: '310 kcal / slice',
    diameter: '9.0 Inches',
    prepTime: '26 Minutes',
    rating: '4.9 (110 reviews)',
    ambientDecor: [
      { type: 'mint', x: '8%', y: '22%', scale: 1.6, delay: 0.2 },
      { type: 'chocolate', x: '20%', y: '54%', scale: 1.5, delay: 0.4 },
      { type: 'mint', x: '12%', y: '78%', scale: 1.3, delay: 0.1 },
      { type: 'mint', x: '85%', y: '18%', scale: 1.5, delay: 0.3 },
      { type: 'mint', x: '76%', y: '48%', scale: 1.4, delay: 0.5 },
      { type: 'chocolate', x: '90%', y: '74%', scale: 1.6, delay: 0.6 },
    ],
    toppings: [
      ...Array.from({ length: 10 }).map((_, i) => ({ type: 'mint' as const, angle: i * 36, radius: 175, scale: 1.25 })),
      ...Array.from({ length: 10 }).map((_, i) => ({ type: 'chocolate' as const, angle: i * 36 + 18, radius: 130, scale: 1.2 })),
      ...Array.from({ length: 5 }).map((_, i) => ({ type: 'mint' as const, angle: i * 72 + 36, radius: 70, scale: 1.1 })),
      { type: 'chocolate' as const, angle: 0, radius: 25, scale: 1.35 },
      { type: 'mint' as const, angle: 180, radius: 25, scale: 1.1 },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const RotatingSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeSize, setActiveSize] = useState<'S' | 'M' | 'L' | 'XL'>('L');
  const [cakeSpinEffect, setCakeSpinEffect] = useState<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  const activeTart = CAROUSEL_TARTS[activeIndex];
  const TOTAL_ITEMS = CAROUSEL_TARTS.length;
  const ANGLE_SPACING = 34;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TOTAL_ITEMS);
    setCakeSpinEffect((prev) => prev + 360);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TOTAL_ITEMS) % TOTAL_ITEMS);
    setCakeSpinEffect((prev) => prev - 360);
  };

  const handleSelectIndex = (index: number) => {
    if (index === activeIndex) return;
    const diff = index - activeIndex;
    setActiveIndex(index);
    setCakeSpinEffect((prev) => prev + diff * 120);
  };

  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;
      if (Math.abs(e.deltaY) < 15) return;
      if (e.deltaY > 0) { handleNext(); } else { handlePrev(); }
      isScrollingRef.current = true;
      setTimeout(() => { isScrollingRef.current = false; }, 850);
    };
    window.addEventListener('wheel', handleGlobalWheel, { passive: true });
    return () => { window.removeEventListener('wheel', handleGlobalWheel); };
  }, [activeIndex]);

  const sizeScale = activeSize === 'S' ? 0.8 : activeSize === 'M' ? 0.9 : activeSize === 'L' ? 1.0 : 1.1;

  return (
    <div
      className="slider-page-container"
      style={{ backgroundColor: activeTart.bgColor }}
    >
      {/* Background radial overlay */}
      <div className="bg-radial-overlay" />

      {/* Floating ambient particles */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`decor-${activeIndex}`}
          className="ambient-layer"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {activeTart.ambientDecor.map((p, idx) => (
            <motion.div
              key={`particle-${idx}`}
              className="drifting-particle"
              style={{ left: p.x, top: p.y }}
              variants={{
                initial: { opacity: 0, scale: 0, y: 100, rotate: -45 },
                animate: {
                  opacity: 1, scale: p.scale, y: 0, rotate: 0,
                  transition: { type: 'spring', stiffness: 80, damping: 15, delay: p.delay },
                },
                exit: { opacity: 0, scale: 0.3, y: -100, rotate: 45, transition: { duration: 0.4 } },
              }}
            >
              <RenderDecors type={p.type} scale={1} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── HEADER ─────────────────────────────────────────── */}
      {/* <header className="rs-header">
        <div className="rs-logo">
          <div className="rs-logo-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="rs-logo-name">LA PÂTISSERIE</h1>
            <span className="rs-logo-sub">Artisanal Maison</span>
          </div>
        </div>

        <nav className="rs-nav">
          <span style={{ borderBottom: `2px solid #292524` }}>Our Tarts</span>
          <span>Custom Orders</span>
          <span>Artisan Kitchen</span>
          <span>Our Story</span>
          <span>Locations</span>
        </nav>

        <div className="rs-header-actions">
          <button className="rs-heart-btn"><Heart size={16} /></button>
          <button className="rs-order-btn">
            <ShoppingBag size={13} />
            <span>Order Online</span>
          </button>
        </div>
      </header> */}

      {/* ── MAIN GRID ──────────────────────────────────────── */}
      <main className="rs-main">

        {/* LEFT: Info panel */}
        <div className="rs-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${activeIndex}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
              {/* Category row */}
              <div className="rs-category-row">
                <span className="rs-category-line" />
                <span className="rs-category-label">Featured Creation</span>
                <span className="rs-rating-badge">{activeTart.rating}</span>
              </div>

              {/* Title */}
              <h2 className="rs-title">{activeTart.title}</h2>
              <h4 className="rs-subtitle">{activeTart.subTitle}</h4>
              {/* <p className="rs-description">{activeTart.description}</p> */}

              {/* Stats */}
              {/* <div className="rs-stats-grid">
                <div className="rs-stat-card">
                  <span className="rs-stat-label">Calories</span>
                  <span className="rs-stat-value">
                    <Scale size={12} />
                    {activeTart.calories}
                  </span>
                </div>
                <div className="rs-stat-card">
                  <span className="rs-stat-label">Diameter</span>
                  <span className="rs-stat-value">
                    <Compass size={12} />
                    {activeTart.diameter}
                  </span>
                </div>
                <div className="rs-stat-card">
                  <span className="rs-stat-label">Baking Prep</span>
                  <span className="rs-stat-value">
                    <Sparkles size={12} className="rs-sparkle-spin" />
                    {activeTart.prepTime}
                  </span>
                </div>
              </div> */}

              {/* Price + CTA */}
              <div className="rs-price-row">
                {/* <div>
                  <span className="rs-price-label">Whole Pastry</span>
                  <span className="rs-price-value">{activeTart.price}</span>
                </div> */}
                <button
                  className="rs-add-btn"
                  style={{ backgroundColor: activeTart.textColor }}
                >
                  <Plus size={14} />
                  <span>Add to Order</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT: Cake wheel */}
        <div className="rs-right">

          {/* Size selector */}
          <div className="rs-size-selector">
            <span className="rs-size-title">Size</span>
            {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setActiveSize(sz)}
                className={`rs-size-btn${activeSize === sz ? ' active' : ''}`}
                style={{ borderColor: activeSize === sz ? activeTart.accentColor : 'transparent' }}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Circular flavor track */}
          <motion.div
            className="circular-track-container"
            animate={{ rotate: -activeIndex * ANGLE_SPACING }}
            transition={{ type: 'spring', stiffness: 70, damping: 16 }}
          >
            <div className="ring-800" />
            <div className="ring-950" />
            <div className="ring-1100" />

            {CAROUSEL_TARTS.map((tart, index) => {
              const theta = index * ANGLE_SPACING;
              return (
                <div
                  key={tart.id}
                  className="rotatable-node-wrapper"
                  style={{ transform: `rotate(${theta}deg) translateY(-400px)` }}
                >
                  <motion.div
                    className="node-inner"
                    animate={{ rotate: activeIndex * ANGLE_SPACING - theta }}
                    transition={{ type: 'spring', stiffness: 70, damping: 16 }}
                  >
                    <span
                      onClick={() => handleSelectIndex(index)}
                      className={`flavor-dot-label${index === activeIndex ? ' active' : ''}`}
                      style={{ color: index === activeIndex ? activeTart.textColor : undefined }}
                    >
                      {tart.flavor}
                    </span>
                    <button
                      onClick={() => handleSelectIndex(index)}
                      className={`flavor-dot-button${index === activeIndex ? ' active' : ''}`}
                      style={{ '--accent': activeTart.accentColor } as React.CSSProperties}
                    />
                  </motion.div>
                </div>
              );
            })}
          </motion.div>

          {/* Cake stage */}
          <div className="cake-viewing-stage">
            <div className="cake-circular-frame">
              <div className="cake-inner-accent-ring" />
            </div>

            {/* Glow halo */}
            <div
              className="cake-glow-halo"
              style={{ backgroundColor: activeTart.accentColor }}
            />

            {/* Spinning cake assembly */}
            <motion.div
              className="rotating-cake-assembly"
              animate={{ rotate: cakeSpinEffect }}
              transition={{ type: 'spring', stiffness: 35, damping: 12 }}
            >
              <motion.div
                className="cake-size-wrapper"
                animate={{ scale: sizeScale }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                <img
                  // src="https://i.pinimg.com/736x/d9/d1/7e/d9d17edfbadcb1a6163f3618e5a8d05d.jpg"
                  src="https://i.pinimg.com/1200x/90/0c/96/900c969a1e246b1259a8d1cd4464b7f6.jpg"
                  alt="Pastry Tart Crust Shell"
                  referrerPolicy="no-referrer"
                  className="cake-base-img"
                />
                <div className="cake-shade-overlay" />

                {activeTart.toppings.map((top, tIdx) => {
                  const radians = (top.angle * Math.PI) / 180;
                  const originX = 265;
                  const originY = 265;
                  const itemX = originX + top.radius * Math.cos(radians);
                  const itemY = originY + top.radius * Math.sin(radians);
                  const itemRotation = top.rotate ? top.rotate : top.angle + 90;

                  return (
                    <motion.div
                      key={`topping-${activeIndex}-${tIdx}`}
                      className="topping-wrapper"
                      style={{
                        left: itemX,
                        top: itemY,
                        transform: `translate(-50%, -50%) rotate(${itemRotation}deg)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: top.scale, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 110, damping: 14, delay: tIdx * 0.015 }}
                    >
                      <motion.div whileHover={{ scale: 1.25, y: -4, rotate: 10 }}>
                        <VectorTopping type={top.type} scale={1.05} />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>

          {/* Nav buttons */}
          <div className="rs-nav-buttons">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="rs-nav-btn"
            >
              <ChevronLeft size={24} />
            </motion.button>

            <span className="rs-counter">
              <span className="rs-counter-num" style={{ color: activeTart.accentColor }}>{activeIndex + 1}</span>
              <span className="rs-counter-sep">/</span>
              <span>{TOTAL_ITEMS}</span>
            </span>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="rs-nav-btn"
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>

        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      {/* <footer className="rs-footer">
        <div className="rs-footer-tip">
          <HelpCircle size={13} />
          <span>Tip: Spin the cake by scrolling your mouse, dragging, or selecting options.</span>
        </div>

        <div className="rs-footer-dots">
          {CAROUSEL_TARTS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => handleSelectIndex(idx)}
              className="rs-footer-dot"
              style={{
                width: idx === activeIndex ? '28px' : '6px',
                backgroundColor: idx === activeIndex ? activeTart.textColor : '#ffffff',
              }}
            />
          ))}
        </div>

        <span className="rs-footer-tag">
          Premium Handcrafted Web UX — Framer Motion 12
        </span>
      </footer> */}
    </div>
  );
};

export default RotatingSlider;