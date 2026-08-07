import { useEffect, useRef } from "react";
import "./apppromo.css";

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
        <h2>Order cakes on the go with the CakenTake app</h2>
        <p>
          Track deliveries in real time, save your favourites, unlock app-only
          offers and reorder with a single tap.
        </p>
        <div className="lp-store-row">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
            className="lp-store"
          >
            <span className="lp-store-ico">▶</span>
            <span>
              <small>GET IT ON</small>
              <b>Google Play</b>
            </span>
          </a>
          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noreferrer"
            className="lp-store"
          >
            <span className="lp-store-ico"></span>
            <span>
              <small>Download on the</small>
              <b>App Store</b>
            </span>
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
