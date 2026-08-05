import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import axios from 'axios';
import CategorySlider from '../categoryslider/CategorySlider';
import ProductCard from '../../components/ProductCard/ProductCard'; // Ensure correct path
import './Home.css';
import ChatWidget from '../../components/ChatWidget/ChatWidget';
import { AppPromo } from '../Animation/AppPromo';
import CakeHeroShowcase from '../Animation/CakeHeroShowcase';
import { storefrontApi } from '@/src/services/directApiService';
import { useCurrency } from '../../context/CurrencyContext';
// import video from "../../../public/assets/banner.mp4";
// Types for our data
interface Product {
  id: number;
  name: string;
  image_url: string;
  price: number;
  original_price: number;
  currency: string;
  category_name: string;
}

const IMAGE_CARDS = [
  {
    title: 'Signature Chocolate Cake',
    subtitle: 'Rich dark chocolate with berry accents',
    image: '/assets/sban1.png'
  },
  {
    title: 'Vanilla Velvet Slice',
    subtitle: 'Creamy vanilla sponge with caramel drizzle',
    image: '/assets/sban2.png'
  },
  {
    title: 'Rose Berry Delight',
    subtitle: 'Floral notes and fresh berries in every bite',
    image: '/assets/sban3.png'
  },
  {
    title: 'Lemon Tart Creation',
    subtitle: 'Citrus tart with buttery almond crust',
    image: '/assets/sban4.png'
  },
  // {
  //   title: 'Caramel Pecan Dream',
  //   subtitle: 'Crunchy pecans and salted caramel glaze',
  //   image: '/assets/sban5.png'
  // },
  // {
  //   title: 'Caramel Pecan Dream',
  //   subtitle: 'Crunchy pecans and salted caramel glaze',
  //   image: '/assets/sban6.png'
  // }
];

// Breakpoints used to decide how many cards show per slide.
// Keeping this centralized makes it easy to tune later.
const getCardsPerSlide = (width: number) => {
  if (width <= 640) return 1; // phones
  if (width <= 1024) return 2; // tablets / small laptops
  return 3; // laptop and up
};

const Home: FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cardSlide, setCardSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);
  const { currency, setCurrency } = useCurrency();

  const flavors = [
    'Dark Truffle',
    'Vanilla Bean',
    'Red Velvet',
    'Pistachio',
    'Salted Caramel',
    'Hazelnut',
    'Biscoff',
    'Lemon Curd',
    'Blueberry',
    'Mango Passion'
  ];

  const cardSlides = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(IMAGE_CARDS.length / cardsPerSlide) },
        (_, idx) =>
          IMAGE_CARDS.slice(idx * cardsPerSlide, idx * cardsPerSlide + cardsPerSlide)
      ),
    [cardsPerSlide]
  );

  // const heroTextVariants = {
  //   hidden: { opacity: 0, y: 28, skewY: 4, scale: 0.96 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     skewY: 0,
  //     scale: 1,
  //     transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as const }
  //   }
  // };

  const tickerText =
    ' • ARTISAN CAKES • FRESHLY BAKED • PREMIUM INGREDIENTS • HANDCRAFTED WITH LOVE • FRENCH PATISSERIE • ';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch featured products whenever currency changes
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await storefrontApi.products( {
          headers: { 'X-Currency': currency }
        });
        setFeaturedProducts(res.data.slice(0, 4));
      } catch (err) {
       
      }
    };

    fetchFeatured();
  }, [currency]);



  // Keep the number of visible cards per slide in sync with viewport width
  useEffect(() => {
    const updateCardsPerSlide = () => {
      setCardsPerSlide(getCardsPerSlide(window.innerWidth));
    };

    updateCardsPerSlide();
    window.addEventListener('resize', updateCardsPerSlide);
    return () => window.removeEventListener('resize', updateCardsPerSlide);
  }, []);

  // Reset to a valid slide index whenever the slide count changes (e.g. on resize)
  useEffect(() => {
    if (cardSlide >= cardSlides.length) {
      setCardSlide(0);
    }
  }, [cardSlides.length, cardSlide]);

  // Auto-advance the card slider
  useEffect(() => {
    if (cardSlides.length <= 1) return;

    const cardTimer = window.setInterval(() => {
      setCardSlide((prev) => (prev + 1) % cardSlides.length);
    }, 5500);

    return () => window.clearInterval(cardTimer);
  }, [cardSlides.length]);

  return (
    <div className="bakery-home">
      {/* 1. Hero Section */}
      {/* <section className="home-hero">
        <div className="home-hero-overlay" />
        <motion.div
          className="home-hero-copy"
          initial="hidden"
          animate="visible"
          variants={heroTextVariants}
        >
          <p className="hero-tagline">Freshly baked delights delivered with joy</p>
          <h1 className="hero-heading">The sweetest moments start here</h1>
        </motion.div>
      </section> */}


      <section className="home-hero">

<video
  className="hero-video"
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
>
  <source src="/assets/banner.mp4" type="video/mp4" />
</video>

  <div className="home-hero-overlay"></div>

  {/* <motion.div
    className="home-hero-copy"
    initial="hidden"
    animate="visible"
    variants={heroTextVariants}
  >
    <p className="hero-tagline">
      Freshly baked delights delivered with joy
    </p>

    <h1 className="hero-heading">
      The sweetest moments start here
    </h1>
  </motion.div> */}

</section>

      {/* 2. Infinite Looping Category Text Slider */}
      <div className="bakery-text-ticker">
        <motion.div
          className="ticker-content"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 20 }}
        >
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </motion.div>
      </div>

      {/* 3. Curated Dessert Card Slider */}
      <section className="home-card-slider-section">
        <div className="home-container">
          <div className="section-title">
            <h2 className="serif-title">Our Curated Dessert Picks</h2>
            <p>Handpicked favourites, refreshed every season</p>
          </div>
          <div className="card-slider-window">
            <div
              className="card-slider-track"
              style={{ transform: `translateX(-${cardSlide * 100}%)` }}
            >
              {cardSlides.map((slide, slideIndex) => (
                <div key={slideIndex} className="card-slide-group">
                  {slide.map((card) => (
                    <div key={`${card.title}-${card.image}`} className="card-slide-item">
                      <div className="card-image-wrap">
                        <img src={card.image} alt={card.title} loading="lazy" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {cardSlides.length > 1 && (
            <div className="card-slider-dots">
              {cardSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`card-dot ${index === cardSlide ? 'active' : ''}`}
                  onClick={() => setCardSlide(index)}
                  aria-label={`View card slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>


      <section>
        <CakeHeroShowcase/>
      </section>

      {/* 4. Aesthetic Category Slider */}
      <section className="home-categories">
        <CategorySlider />
      </section>

      {/* 5. Featured Products with Animation */}
      <section className="home-featured">
        <div className="home-container">
          <div className="section-title">
            <h2 className="serif-title">The Bakers Selection</h2>
            <p>Our most cherished creations this season</p>
          </div>

          <motion.div
            className="featured-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
          >
            {featuredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} isRetailer={false} userId={userId} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Flavor Zigzag Marquee */}
      <section className="flavor-zigzag-section">
        <div className="zigzag-row row-left">
          <motion.div
            className="zigzag-track"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          >
            {[...flavors, ...flavors].map((f, i) => (
              <span key={i} className="flavor-pill">
                {f}
              </span>
            ))}
          </motion.div>
        </div>
        <div className="zigzag-row row-right">
          <motion.div
            className="zigzag-track"
            animate={{ x: [-1000, 0] }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          >
            {[...flavors, ...flavors].map((f, i) => (
              <span key={i} className="flavor-pill outline">
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <AppPromo/>

      <div className="home-back-to-top-wrapper">
        <button
          type="button"
          className="home-back-to-top-btn"
          onClick={scrollToTop}
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      </div>

      <ChatWidget />
    </div>
  );
};

export default Home;
