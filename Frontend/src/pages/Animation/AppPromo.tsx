// import { useEffect, useRef } from "react";
// import "./apppromo.css";

// const cakes = [
//   {
//     name: "Belgian Chocolate Truffle",
//     img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
//     rating: 4.6,
//     time: "2 hr delivery",
//     price: 649,
//   },
//   {
//     name: "Red Velvet Dream",
//     img: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80",
//     rating: 4.4,
//     time: "Same day",
//     price: 749,
//   },
//   {
//     name: "Vanilla Strawberry",
//     img: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=800&q=80",
//     rating: 4.3,
//     time: "2 hr delivery",
//     price: 549,
//   },
//   {
//     name: "Pistachio Rose Gateau",
//     img: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
//     rating: 4.7,
//     time: "Next day",
//     price: 899,
//   },
// ];

// export function AppPromo() {
//   const phoneRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const el = phoneRef.current;
//     if (!el) return;
//     const t = setTimeout(() => el.classList.add("is-visible"), 150);
//     return () => clearTimeout(t);
//   }, []);


//   return (
//     <section className="lp-app">
//       <div className="lp-app-text">
//         <span className="lp-app-eyebrow">GET THE APP</span>
//         <h2>Order cakes on the go with the Cake and Take app</h2>
//         <p>
//           Track deliveries in real time, save your favourites, unlock app-only
//           offers and reorder with a single tap.
//         </p>
//         <div className="lp-store-row">
//           <a
//             href="https://play.google.com/store"
//             target="_blank"
//             rel="noreferrer"
//             className="lp-store"
//           >
//             <span className="lp-store-ico">▶</span>
//             <span>
//               <small>GET IT ON</small>
//               <b>Google Play</b>
//             </span>
//           </a>
//           <a
//             href="https://www.apple.com/app-store/"
//             target="_blank"
//             rel="noreferrer"
//             className="lp-store"
//           >
//             <span className="lp-store-ico"></span>
//             <span>
//               <small>Download on the</small>
//               <b>App Store</b>
//             </span>
//           </a>
//         </div>
//       </div>
//       <div className="lp-phone-stage">
//         <div className="lp-phone-glow" />
//         <div className="lp-phone" ref={phoneRef}>
//           <div className="lp-phone-notch" />
//           <div
//             className="lp-phone-screen"
//             style={{ backgroundImage: "url(/assets/mobile_image.png)" }}
//           />
//         </div>
//       </div>
//     </section>
//   );
// }



import { useEffect, useRef } from "react";
import "./apppromo.css";
import playstoreicon from "../../../public/assets/playstore.png";
import appstoreicon from "../../../public/assets/appstore.png";

const cakes = [
  {
    name: "Belgian Chocolate Truffle",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    rating: 4.6,
    time: "2 hr delivery",
    price: 649,
  },
  {
    name: "Red Velvet Dream",
    img: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80",
    rating: 4.4,
    time: "Same day",
    price: 749,
  },
  {
    name: "Vanilla Strawberry",
    img: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=800&q=80",
    rating: 4.3,
    time: "2 hr delivery",
    price: 549,
  },
  {
    name: "Pistachio Rose Gateau",
    img: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
    rating: 4.7,
    time: "Next day",
    price: 899,
  },
];

// Real Google Play multi-color triangle logo.
const GooglePlayIcon = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"
      fill="#00d2ff"
    />
    <path
      d="M325.3 277.7l60.1 60.1L104.6 499 325.3 277.7z"
      fill="#f13a59"
    />
    <path
      d="M104.6 13c-6.5 6.8-10.4 17.4-10.4 31.2v423.6c0 13.8 3.9 24.4 10.4 31.2l1.5 1.4L361.7 256v-3L106.1 11.6l-1.5 1.4z"
      fill="#0acf83"
    />
    <path
      d="M361.7 256L104.6 499c6.4 6.7 15.1 7.5 25 1.8l254.6-146.7-22.5-98.1z"
      fill="#ffbc00"
    />
    <path
      d="M361.7 253l-22.5-98.1L384.4 174l40.4 22.9c14.1 8 14.1 21.2 0 29.2l-40.4 22.9-22.7-13z"
      fill="#ffbc00"
    />
  </svg>
);

// Real Apple logo.
const AppleIcon = () => (
  <svg viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

export function AppPromo() {
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return;
    const t = setTimeout(() => el.classList.add("is-visible"), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="lp-app">
      <div className="lp-app-text">
        <span className="lp-app-eyebrow">GET THE APP</span>
        <h2>Order cakes on the go with the Cake and Take app</h2>
        <p>
          Track deliveries in real time, save your favourites, unlock app-only
          offers and reorder with a single tap.
        </p>
        <div className="lp-store-row">
          <a
            href="https://play.google.com/store/apps/details?id=com.cakentake.app&hl=en"
            target="_blank"
            rel="noreferrer"
            className="lp-store"
          >
            {/* <span className="lp-store-ico">
              <GooglePlayIcon />
            </span>
            <span className="lp-store-text">
              <small>GET IT ON</small>
              <b>Google Play</b>
            </span> */}
            <img className="playstoreicon" src={playstoreicon} alt="Google Play" />
          </a>
          <a
            href="https://apps.apple.com/in/app/cakentake/id6815976151"
            target="_blank"
            rel="noreferrer"
            className="lp-store"
          >
            {/* <span className="lp-store-ico">
              <AppleIcon />
            </span>
            <span className="lp-store-text">
              <small>Download on the</small>
              <b>App Store</b>
            </span> */}

             <img className="appstoreicon" src={appstoreicon} alt="Google Play" />
          </a>
        </div>
      </div>
      <div className="lp-phone-stage">
        <div className="lp-phone-glow" />
        <div className="lp-phone" ref={phoneRef}>
          <div className="lp-phone-notch" />
          <div
            className="lp-phone-screen"
            style={{ backgroundImage: "url(/assets/mobile_image.png)" }}
          />
        </div>
      </div>
    </section>
  );
}