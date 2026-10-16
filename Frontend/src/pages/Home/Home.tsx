// import type { FC } from 'react';
// import { useEffect, useMemo, useState } from 'react';
// import { motion } from 'framer-motion';
// import axios from 'axios';
// import CategorySlider from '../categoryslider/CategorySlider';
// import ProductCard from '../../components/ProductCard/ProductCard'; // Ensure correct path
// import './Home.css';
// import ChatWidget from '../../components/ChatWidget/ChatWidget';
// import { AppPromo } from '../Animation/AppPromo';
// import CakeHeroShowcase from '../Animation/CakeHeroShowcase';
// import { storefrontApi } from '@/src/services/directApiService';
// import { useCurrency } from '../../context/CurrencyContext';
// // import video from "../../../public/assets/banner.mp4";
// // Types for our data
// interface Product {
//   id: number;
//   name: string;
//   image_url: string;
//   price: number;
//   original_price: number;
//   currency: string;
//   category_name: string;
// }

// const IMAGE_CARDS = [
//   {
//     title: 'Signature Chocolate Cake',
//     subtitle: 'Rich dark chocolate with berry accents',
//     image: '/assets/sban1.png'
//   },
//   {
//     title: 'Vanilla Velvet Slice',
//     subtitle: 'Creamy vanilla sponge with caramel drizzle',
//     image: '/assets/sban2.png'
//   },
//   {
//     title: 'Rose Berry Delight',
//     subtitle: 'Floral notes and fresh berries in every bite',
//     image: '/assets/sban3.png'
//   },
//   {
//     title: 'Lemon Tart Creation',
//     subtitle: 'Citrus tart with buttery almond crust',
//     image: '/assets/sban4.png'
//   },
//   // {
//   //   title: 'Caramel Pecan Dream',
//   //   subtitle: 'Crunchy pecans and salted caramel glaze',
//   //   image: '/assets/sban5.png'
//   // },
//   // {
//   //   title: 'Caramel Pecan Dream',
//   //   subtitle: 'Crunchy pecans and salted caramel glaze',
//   //   image: '/assets/sban6.png'
//   // }
// ];

// // Breakpoints used to decide how many cards show per slide.
// // Keeping this centralized makes it easy to tune later.
// const getCardsPerSlide = (width: number) => {
//   if (width <= 640) return 1; // phones
//   if (width <= 1024) return 2; // tablets / small laptops
//   return 3; // laptop and up
// };

// const Home: FC = () => {
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const userId = user.id;

//   const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
//   const [cardSlide, setCardSlide] = useState(0);
//   const [cardsPerSlide, setCardsPerSlide] = useState(3);
//   const { currency, setCurrency } = useCurrency();

//   const flavors = [
//     'Dark Truffle',
//     'Vanilla Bean',
//     'Red Velvet',
//     'Pistachio',
//     'Salted Caramel',
//     'Hazelnut',
//     'Biscoff',
//     'Lemon Curd',
//     'Blueberry',
//     'Mango Passion'
//   ];

//   const cardSlides = useMemo(
//     () =>
//       Array.from(
//         { length: Math.ceil(IMAGE_CARDS.length / cardsPerSlide) },
//         (_, idx) =>
//           IMAGE_CARDS.slice(idx * cardsPerSlide, idx * cardsPerSlide + cardsPerSlide)
//       ),
//     [cardsPerSlide]
//   );

//   // const heroTextVariants = {
//   //   hidden: { opacity: 0, y: 28, skewY: 4, scale: 0.96 },
//   //   visible: {
//   //     opacity: 1,
//   //     y: 0,
//   //     skewY: 0,
//   //     scale: 1,
//   //     transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as const }
//   //   }
//   // };

//   const tickerText =
//     ' • ARTISAN CAKES • FRESHLY BAKED • PREMIUM INGREDIENTS • HANDCRAFTED WITH LOVE • FRENCH PATISSERIE • ';

//   // Fetch featured products whenever currency changes
//   useEffect(() => {
//     const fetchFeatured = async () => {
//       try {
//         const res = await storefrontApi.products( {
//           headers: { 'X-Currency': currency }
//         });
//         setFeaturedProducts(res.data.slice(0, 4));
//       } catch (err) {
       
//       }
//     };

//     fetchFeatured();
//   }, [currency]);



//   // Keep the number of visible cards per slide in sync with viewport width
//   useEffect(() => {
//     const updateCardsPerSlide = () => {
//       setCardsPerSlide(getCardsPerSlide(window.innerWidth));
//     };

//     updateCardsPerSlide();
//     window.addEventListener('resize', updateCardsPerSlide);
//     return () => window.removeEventListener('resize', updateCardsPerSlide);
//   }, []);

//   // Reset to a valid slide index whenever the slide count changes (e.g. on resize)
//   useEffect(() => {
//     if (cardSlide >= cardSlides.length) {
//       setCardSlide(0);
//     }
//   }, [cardSlides.length, cardSlide]);

//   // Auto-advance the card slider
//   useEffect(() => {
//     if (cardSlides.length <= 1) return;

//     const cardTimer = window.setInterval(() => {
//       setCardSlide((prev) => (prev + 1) % cardSlides.length);
//     }, 5500);

//     return () => window.clearInterval(cardTimer);
//   }, [cardSlides.length]);

//   return (
//     <div className="bakery-home">
//       {/* 1. Hero Section */}
//       {/* <section className="home-hero">
//         <div className="home-hero-overlay" />
//         <motion.div
//           className="home-hero-copy"
//           initial="hidden"
//           animate="visible"
//           variants={heroTextVariants}
//         >
//           <p className="hero-tagline">Freshly baked delights delivered with joy</p>
//           <h1 className="hero-heading">The sweetest moments start here</h1>
//         </motion.div>
//       </section> */}


//       <section className="home-hero">

// <video
//   className="hero-video"
//   autoPlay
//   muted
//   loop
//   playsInline
//   preload="auto"
// >
//   <source src="/assets/banner.mp4" type="video/mp4" />
// </video>

//   <div className="home-hero-overlay"></div>

//   {/* <motion.div
//     className="home-hero-copy"
//     initial="hidden"
//     animate="visible"
//     variants={heroTextVariants}
//   >
//     <p className="hero-tagline">
//       Freshly baked delights delivered with joy
//     </p>

//     <h1 className="hero-heading">
//       The sweetest moments start here
//     </h1>
//   </motion.div> */}

// </section>

//       {/* 2. Infinite Looping Category Text Slider */}
//       <div className="bakery-text-ticker">
//         <motion.div
//           className="ticker-content"
//           animate={{ x: ['0%', '-50%'] }}
//           transition={{ repeat: Infinity, ease: 'linear', duration: 20 }}
//         >
//           <span>{tickerText}</span>
//           <span>{tickerText}</span>
//         </motion.div>
//       </div>

//       {/* 3. Curated Dessert Card Slider */}
//       <section className="home-card-slider-section">
//         <div className="home-container">
//           <div className="section-title">
//             <h2 className="serif-title">Our Curated Dessert Picks</h2>
//             <p>Handpicked favourites, refreshed every season</p>
//           </div>
//           <div className="card-slider-window">
//             <div
//               className="card-slider-track"
//               style={{ transform: `translateX(-${cardSlide * 100}%)` }}
//             >
//               {cardSlides.map((slide, slideIndex) => (
//                 <div key={slideIndex} className="card-slide-group">
//                   {slide.map((card) => (
//                     <div key={`${card.title}-${card.image}`} className="card-slide-item">
//                       <div className="card-image-wrap">
//                         <img src={card.image} alt={card.title} loading="lazy" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>
//           {cardSlides.length > 1 && (
//             <div className="card-slider-dots">
//               {cardSlides.map((_, index) => (
//                 <button
//                   key={index}
//                   type="button"
//                   className={`card-dot ${index === cardSlide ? 'active' : ''}`}
//                   onClick={() => setCardSlide(index)}
//                   aria-label={`View card slide ${index + 1}`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </section>


//       <section>
//         <CakeHeroShowcase/>
//       </section>

//       {/* 4. Aesthetic Category Slider */}
//       <section className="home-categories">
//         <CategorySlider />
//       </section>

//       {/* 5. Featured Products with Animation */}
//       {/* <section className="home-featured">
//         <div className="home-container">
//           <div className="section-title">
//             <h2 className="serif-title">The Bakers Selection</h2>
//             <p>Our most cherished creations this season</p>
//           </div>

//           <motion.div
//             className="featured-grid"
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.2 }}
//             variants={{
//               hidden: { opacity: 0 },
//               visible: {
//                 opacity: 1,
//                 transition: { staggerChildren: 0.2 }
//               }
//             }}
//           >
//             {featuredProducts.map((product, idx) => (
//               <ProductCard key={product.id} product={product} index={idx} isRetailer={false} userId={userId} />
//             ))}
//           </motion.div>
//         </div>
//       </section> */}

//       {/* 6. Flavor Zigzag Marquee */}
//       {/* <section className="flavor-zigzag-section">
//         <div className="zigzag-row row-left">
//           <motion.div
//             className="zigzag-track"
//             animate={{ x: [0, -1000] }}
//             transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
//           >
//             {[...flavors, ...flavors].map((f, i) => (
//               <span key={i} className="flavor-pill">
//                 {f}
//               </span>
//             ))}
//           </motion.div>
//         </div>
//         <div className="zigzag-row row-right">
//           <motion.div
//             className="zigzag-track"
//             animate={{ x: [-1000, 0] }}
//             transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
//           >
//             {[...flavors, ...flavors].map((f, i) => (
//               <span key={i} className="flavor-pill outline">
//                 {f}
//               </span>
//             ))}
//           </motion.div>
//         </div>
//       </section> */}

//       <AppPromo/>

//       <ChatWidget />
//     </div>
//   );
// };

// export default Home;



import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Cake,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Leaf,
  MessageCircle,
  PartyPopper,
  Sparkles,
  Star,
  Truck,
  Wheat,
  Clock,
  ShieldCheck,
  Bot,
  Baby,
  Briefcase,
  Flower2,
} from 'lucide-react';
import CategorySlider, { HomeProduct } from '../categoryslider/CategorySlider';
import ProductCard from '../../components/ProductCard/ProductCard';
import ChatWidget from '../../components/ChatWidget/ChatWidget';
import { AppPromo } from '../Animation/AppPromo';
import CakeHeroShowcase from '../Animation/CakeHeroShowcase';
import { storefrontApi } from '@/src/services/directApiService';
import { useCurrency } from '../../context/CurrencyContext';
import './Home.css';

/* ──────────────────────────────────────────────────────────────────────
   STATIC CONTENT
   ────────────────────────────────────────────────────────────────────── */

// "Our Curated Dessert Picks" — runs as an infinite marquee
const CURATED_PICKS = [
  { title: 'Lychee Tea Shortcake', tag: 'Signature', image: '/assets/sban1.png' },
  { title: 'Matcha Strawberry Cake', tag: 'Premium', image: '/assets/sban2.png' },
  { title: 'Signature Dessert Collection', tag: 'Collection', image: '/assets/sban3.png' },
  { title: 'Freshly Baked Croissants', tag: 'Bakery', image: '/assets/sban4.png' },
  { title: 'Cherry Chocolate Crown', tag: 'Chef’s pick', image: '/assets/sban3.jpeg' },
  { title: 'Strawberry Garden Party', tag: 'Celebration', image: '/assets/sban2.jpeg' },
  { title: 'Rose Petal Patisserie', tag: 'Romance', image: '/assets/sban4.jpeg' },
  { title: 'Berry Tea-Time Table', tag: 'Tea time', image: '/assets/sban5.jpeg' },
];

// The 6 app layouts — replaces the old flavour marquee, loops infinitely
const APP_SCREENS = [
  { title: 'Sign in in seconds', text: 'A calm, secure login that picks up right where you left off.', image: '/assets/showcase/login.png' },
  { title: 'Bakery highlights', text: 'Seasonal banners, categories and curated collections up front.', image: '/assets/showcase/home.png' },
  { title: 'Your sweet profile', text: 'Orders, wishlist and saved addresses — all in one place.', image: '/assets/showcase/profile.png' },
  { title: 'Every cake in detail', text: 'Sizes, pricing and stock shown clearly before you add to cart.', image: '/assets/showcase/product.png' },
  { title: 'Track every order', text: 'Live status, payment state and a full order breakdown.', image: '/assets/showcase/orders.png' },
  { title: 'AI bakery assistant', text: 'Ask for suggestions, sizes and messages — even by voice.', image: '/assets/showcase/assistant.png' },
];

const TICKER_ITEMS = [
  'Artisan cakes',
  'Freshly baked daily',
  'Premium ingredients',
  'Handcrafted with love',
  'Custom celebration cakes',
  'Same-day treats',
  'Pistachio perfection',
];

const PROMISES = [
  { icon: Wheat, title: 'Baked fresh daily', text: 'Every sponge, cream and glaze is prepared in small batches each morning.' },
  { icon: ChefHat, title: 'Made to order', text: 'Your cake is finished only after you order, so it reaches you at its best.' },
  { icon: ShieldCheck, title: 'Quality checked', text: 'Each order is inspected before hand-off — texture, finish and message.' },
  { icon: Truck, title: 'Careful delivery', text: 'Choose a delivery slot or pick-up time that fits your celebration.' },
];

const OCCASIONS = [
  { icon: PartyPopper, title: 'Birthdays', text: 'Bright, joyful cakes for every age.' },
  { icon: Heart, title: 'Anniversaries', text: 'Elegant layers for the two of you.' },
  { icon: Flower2, title: 'Weddings', text: 'Tiered showpieces, crafted to order.' },
  { icon: Baby, title: 'Baby showers', text: 'Soft pastels and sweet surprises.' },
  { icon: Briefcase, title: 'Corporate', text: 'Platters and boxes for the whole team.' },
  { icon: Gift, title: 'Gifting', text: 'Dessert boxes that say thank you.' },
];

const STEPS = [
  { icon: Cake, title: 'Choose', text: 'Browse categories or ask our AI assistant for ideas.' },
  { icon: Sparkles, title: 'Personalise', text: 'Pick the size, flavour and add a custom message.' },
  { icon: ChefHat, title: 'We bake', text: 'Our bakers prepare your order fresh in the kitchen.' },
  { icon: Truck, title: 'Enjoy', text: 'Track it live until it reaches your celebration.' },
];

/* ──────────────────────────────────────────────────────────────────────
   SMALL HELPERS
   ────────────────────────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** Counts up from 0 once the number scrolls into view. */
const CountUp: FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

/** Section heading used across the page. */
const SectionHead: FC<{ eyebrow: string; title: string; text?: string; light?: boolean }> = ({
  eyebrow,
  title,
  text,
  light,
}) => (
  <motion.div
    className={`hm-head ${light ? 'is-light' : ''}`}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    variants={fadeUp}
  >
    <span className="hm-eyebrow">
      <Leaf size={13} /> {eyebrow}
    </span>
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </motion.div>
);

/* ──────────────────────────────────────────────────────────────────────
   APP SCREENS — infinite, auto-sliding coverflow (6 layouts)
   ────────────────────────────────────────────────────────────────────── */

const AppScreensCarousel: FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = APP_SCREENS.length;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % total), 3200);
    return () => window.clearInterval(id);
  }, [paused, total]);

  // Signed distance from the active slide, wrapped so the loop never ends.
  const offsetOf = (i: number) => {
    let d = (i - active + total) % total;
    if (d > total / 2) d -= total;
    return d;
  };

  return (
    <div
      className="hm-screens"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="hm-screens-stage">
        {APP_SCREENS.map((s, i) => {
          const d = offsetOf(i);
          const abs = Math.abs(d);
          const hidden = abs > 2;
          return (
            <button
              key={s.image}
              type="button"
              className={`hm-screen ${d === 0 ? 'is-center' : ''}`}
              onClick={() => setActive(i)}
              aria-label={s.title}
              style={{
                transform: `translateX(calc(${d} * var(--hm-screen-step))) scale(${1 - abs * 0.14}) rotateY(${d * -14}deg)`,
                zIndex: 10 - abs,
                opacity: hidden ? 0 : 1 - abs * 0.22,
                pointerEvents: hidden ? 'none' : 'auto',
                filter: d === 0 ? 'none' : `saturate(${1 - abs * 0.2})`,
              }}
            >
              <img src={s.image} alt={s.title} loading="lazy" draggable={false} />
            </button>
          );
        })}
      </div>

      <div className="hm-screens-caption">
        <button className="hm-round-btn" onClick={() => setActive((a) => (a - 1 + total) % total)} aria-label="Previous screen">
          <ChevronLeft size={18} />
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="hm-screens-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <h4>{APP_SCREENS[active].title}</h4>
            <p>{APP_SCREENS[active].text}</p>
          </motion.div>
        </AnimatePresence>
        <button className="hm-round-btn" onClick={() => setActive((a) => (a + 1) % total)} aria-label="Next screen">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="hm-screens-dots">
        {APP_SCREENS.map((_, i) => (
          <button
            key={i}
            className={i === active ? 'is-active' : ''}
            onClick={() => setActive(i)}
            aria-label={`Show screen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────
   HOME
   ────────────────────────────────────────────────────────────────────── */

const Home: FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const isRetailer = String(user.role || '').toLowerCase() === 'retailer';

  const { currency } = useCurrency();
  const [allProducts, setAllProducts] = useState<HomeProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Subtle parallax on the hero copy
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // One fetch feeds the category rows, the featured grid and the stats
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setProductsLoading(true);
      try {
        const res = await storefrontApi.products({ headers: { 'X-Currency': currency } });
        const d = res.data;
        const list: HomeProduct[] = Array.isArray(d) ? d : d?.products || [];
        if (!cancelled) setAllProducts(list);
      } catch (err) {
        console.error('Home products error', err);
        if (!cancelled) setAllProducts([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const featuredProducts = useMemo(() => allProducts.slice(0, 4), [allProducts]);

  const categoryCount = useMemo(() => {
    const ids = new Set<number>();
    allProducts.forEach((p) => {
      const id = p.category?.id ?? p.category_id;
      if (id !== undefined && id !== null) ids.add(Number(id));
    });
    return ids.size;
  }, [allProducts]);

  const scrollToDelicacies = () => {
    const el = document.getElementById('our-delicacies');
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  };

  return (
    <div className="bakery-home hm-root">
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="home-hero hm-hero" ref={heroRef}>
        <video className="hero-video" autoPlay muted loop playsInline preload="auto">
          <source src="/assets/banner.mp4" type="video/mp4" />
        </video>
        <div className="home-hero-overlay hm-hero-overlay" />

        <motion.div className="hm-hero-copy" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.span
            className="hm-hero-badge"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={14} /> Signature bakery experience
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            More than cakes —<br />
            <em>moments made sweeter</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            Freshly crafted. Beautifully delivered.
          </motion.p>
          <motion.div
            className="hm-hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button className="hm-btn hm-btn-light" onClick={scrollToDelicacies}>
              Shop by category <ArrowRight size={16} />
            </button>
            <button className="hm-btn hm-btn-ghost" onClick={() => navigate('/products')}>
              View all cakes
            </button>
          </motion.div>
        </motion.div>

        <div className="hm-hero-scroll" aria-hidden>
          <span />
        </div>
      </section>

      {/* ── 2. TICKER ───────────────────────────────────────────── */}
      {/* <div className="hm-ticker" aria-hidden>
        <div className="hm-ticker-track">
          {[0, 1].map((copy) => (
            <div className="hm-ticker-group" key={copy}>
              {TICKER_ITEMS.map((t) => (
                <span key={`${copy}-${t}`}>
                  <Leaf size={14} /> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div> */}

      {/* ── 3. OUR CURATED DESSERT PICKS — infinite marquee ─────── */}
      <section className="hm-curated">
        <SectionHead
          eyebrow="Handpicked"
          title="Our Curated Dessert Picks"
          text="Handpicked favourites, refreshed every season. Hover to pause."
        />
        <div className="hm-marquee">
          <div className="hm-marquee-track">
            {[0, 1].map((copy) => (
              <div className="hm-marquee-group" key={copy} aria-hidden={copy === 1}>
                {CURATED_PICKS.map((card) => (
                  <figure key={`${copy}-${card.image}`} className="hm-pick">
                    <img src={card.image} alt={copy === 0 ? card.title : ''} loading="lazy" draggable={false} />
                    <figcaption>
                      <span>{card.tag}</span>
                      <strong>{card.title}</strong>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. OUR PROMISE ──────────────────────────────────────── */}
      <section className="hm-promise">
        <div className="hm-container">
          <SectionHead
            eyebrow="Why CakeNTake"
            title="Crafted for the moments you’ll remember"
            text="Small-batch baking, honest ingredients and a team that treats every order like a celebration."
          />
          <div className="hm-promise-grid">
            {PROMISES.map((p, i) => (
              <motion.div
                key={p.title}
                className="hm-promise-card"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                whileHover={{ y: -8 }}
              >
                <span className="hm-icon-bubble">
                  <p.icon size={22} />
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SHOWCASE ─────────────────────────────────────────── */}
      {/* <section>
        <CakeHeroShowcase />
      </section> */}

      {/* ── 6. OUR DELICACIES — click a category, stay on this page ── */}
      <section className="home-categories">
        <CategorySlider
          products={allProducts}
          productsLoading={productsLoading}
          userId={userId}
          isRetailer={isRetailer}
        />
      </section>

      {/* ── 7. STORY + LIVE STATS ───────────────────────────────── */}
      {/* <section className="hm-story">
        <div className="hm-container hm-story-grid">
          <motion.div
            className="hm-story-media"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <img src="/assets/ban1.jpeg" alt="Cherry chocolate cake" loading="lazy" />
            <div className="hm-story-float">
              <Star size={16} fill="currentColor" /> Baked fresh for you
            </div>
          </motion.div>

          <motion.div
            className="hm-story-copy"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className="hm-eyebrow">
              <Leaf size={13} /> Our story
            </span>
            <h2>From our oven to your table</h2>
            <p>
              CakeNTake began with a simple idea: celebration cakes should taste as good as they look. We bake with
              real butter, fresh cream and carefully chosen flavours — pistachio, chocolate, berries and more — and
              finish every order by hand.
            </p>
            <p>
              Whether it is a quiet treat for one or a tiered cake for a hundred guests, our kitchen gives it the
              same attention to detail.
            </p>

            <div className="hm-stats">
              <div>
                <strong>
                  <CountUp value={allProducts.length} />
                </strong>
                <span>Treats on the menu</span>
              </div>
              <div>
                <strong>
                  <CountUp value={categoryCount} />
                </strong>
                <span>Categories</span>
              </div>
              <div>
                <strong>
                  <CountUp value={100} suffix="%" />
                </strong>
                <span>Made to order</span>
              </div>
              <div>
                <strong>
                  <CountUp value={24} suffix="/7" />
                </strong>
                <span>AI assistant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* ── 8. THE BAKERS SELECTION ─────────────────────────────── */}
      <section className="home-featured hm-featured">
        <div className="home-container">
          <SectionHead eyebrow="Bestsellers" title="The Bakers Selection" text="Our most cherished creations this season" />
          <motion.div
            className="featured-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
          >
            {featuredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product as any} index={idx} isRetailer={isRetailer} userId={userId} />
            ))}
          </motion.div>
          <div className="hm-center">
            <button className="hm-btn hm-btn-dark" onClick={() => navigate('/products')}>
              Browse the full menu <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 9. OCCASIONS ────────────────────────────────────────── */}
      <section className="hm-occasions">
        <div className="hm-container">
          <SectionHead
            eyebrow="Celebrate"
            title="A cake for every occasion"
            text="Tell us what you are celebrating — we will help you find the perfect centrepiece."
          />
          <div className="hm-occasion-grid">
            {OCCASIONS.map((o, i) => (
              <motion.button
                key={o.title}
                type="button"
                className="hm-occasion"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                whileHover={{ scale: 1.03 }}
                onClick={scrollToDelicacies}
              >
                <span className="hm-occasion-icon">
                  <o.icon size={26} />
                </span>
                <strong>{o.title}</strong>
                <small>{o.text}</small>
                <ArrowRight className="hm-occasion-arrow" size={16} />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. HOW IT WORKS ────────────────────────────────────── */}
      <section className="hm-steps">
        <div className="hm-container">
          <SectionHead eyebrow="Simple & sweet" title="How ordering works" light />
          <div className="hm-steps-grid">
            <motion.span
              className="hm-steps-line"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                className="hm-step"
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
              >
                <span className="hm-step-num">{i + 1}</span>
                <span className="hm-step-icon">
                  <s.icon size={24} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. APP LAYOUTS — replaces the flavour marquee ──────── */}
      <section className="hm-app">
        <div className="hm-container">
          <SectionHead
            eyebrow="CakeNTake app"
            title="Your sweet journey in one place"
            text="Browse, order, track and chat with our AI bakery assistant — all from your phone."
          />
          <AppScreensCarousel />
          {/* <div className="hm-app-chips">
            <span>
              <Bot size={15} /> LLM powered assistant
            </span>
            <span>
              <Clock size={15} /> Live order tracking
            </span>
            <span>
              <MessageCircle size={15} /> Voice chat support
            </span>
          </div> */}
        </div>
      </section>

      {/* ── 12. CUSTOM CAKE CTA ─────────────────────────────────── */}
      {/* <section className="hm-cta">
        <motion.div
          className="hm-cta-card"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hm-cta-copy">
            <span className="hm-eyebrow is-light">
              <Sparkles size={13} /> Custom creations
            </span>
            <h2>Dreaming of something one-of-a-kind?</h2>
            <p>Share your theme, size and message — our bakers and AI assistant will help you design it.</p>
            <div className="hm-hero-ctas">
              <button className="hm-btn hm-btn-light" onClick={() => navigate('/contact')}>
                Talk to us <ArrowRight size={16} />
              </button>
              <button className="hm-btn hm-btn-ghost" onClick={() => navigate('/products')}>
                Explore cakes
              </button>
            </div>
          </div>
          <div className="hm-cta-art" aria-hidden>
            <img src="/assets/ban3.jpeg" alt="" loading="lazy" />
          </div>
        </motion.div>
      </section> */}

      <AppPromo />
      <ChatWidget />
    </div>
  );
};

export default Home;