import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  animate,
} from "motion/react";
import { ArrowRight, Award, Leaf, Sparkles, Star, Palette } from "lucide-react";
import "./About.css";

/* ---------- helpers ---------- */

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-50px" });
  const value = useMotionValue(0);

  useEffect(() => {
    if (!inView) {
      value.set(0);
      if (ref.current) ref.current.textContent = "0" + suffix;
      return;
    }
    const controls = animate(value, to, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.floor(v).toLocaleString() + suffix;
      },
    });
    return controls.stop;
  }, [inView, to, suffix, value]);

  return <span ref={ref}>0{suffix}</span>;
}

function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- sections ---------- */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yImg = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="hero">
      <motion.div
        className="hero-blob hero-blob-1"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="hero-blob hero-blob-2"
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="hero-inner">
        <motion.div style={{ y, opacity }} className="hero-content">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="badge"
          >
            ABOUT US
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hero-title"
          >
            Crafted with Love,
            <br />
            <span className="italic-primary">Baked with Passion</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-lead"
          >
            Welcome to our artisanal bakery where tradition meets innovation. We
            believe every celebration deserves something special.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            type="button"
          >
            Order Now <ArrowRight className="icon-sm" />
          </motion.button>
        </motion.div>

        <motion.div style={{ y: yImg, scale }} className="hero-image-wrap">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="hero-image"
          >
            <img
              src="https://i.pinimg.com/736x/66/ca/2b/66ca2b9926c1d9272b815e961a00ce8a.jpg"
              alt="Signature artisan cake"
            />
            <div className="hero-image-overlay" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="hero-badge-card"
          >
            <div className="hero-badge-row">
              <div className="hero-badge-icon">
                <Sparkles className="icon-primary" />
              </div>
              <div>
                <div className="hero-badge-title">15+ Years</div>
                <div className="hero-badge-sub">of sweet craft</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// const stats = [
//   { value: 2400, suffix: "+", label: "Happy Customers" },
//   { value: 4800, suffix: "+", label: "Cakes Delivered" },
//   { value: 15, suffix: "+", label: "Years of Craft" },
//   { value: 100, suffix: "%", label: "Fresh Ingredients" },
// ];

function Impact() {
  // return (
  //   // <section className="section">
  //   //   <div className="container">
  //   //     <Reveal>
  //   //       <h2 className="h2 h2-center">
  //   //         Our <span className="italic-primary">Impact</span>
  //   //       </h2>
  //   //     </Reveal>
  //   //     <div className="stats-grid">
  //   //       {stats.map((s, i) => (
  //   //         <Reveal key={s.label} delay={i * 0.1}>
  //   //           <motion.div whileHover={{ y: -6 }} className="stat-card">
  //   //             <div className="stat-value">
  //   //               <Counter to={s.value} suffix={s.suffix} />
  //   //             </div>
  //   //             <div className="stat-label">{s.label}</div>
  //   //           </motion.div>
  //   //         </Reveal>
  //   //       ))}
  //   //     </div>
  //   //   </div>
  //   // </section>
  // );
}

function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <section ref={ref} className="story">
      <div className="story-grid">
        <motion.div style={{ y, rotate }} className="story-img-wrap">
          <div className="story-img">
            <img
              src="https://i.pinimg.com/736x/dd/f4/97/ddf497124cd8d76b6b302bfa1c0a897a.jpg"
              alt="Our bakery kitchen"
            />
          </div>
          <div className="story-img-bg" />
        </motion.div>
        <div>
          <Reveal>
            <span className="eyebrow">OUR STORY</span>
            <h2 className="h2">
              A small family bakery with a{" "}
              <span className="italic-primary">big dream</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="story-p">
              Founded in 2010, CakeNTake started as a small family bakery with a
              big dream: to bring joy to every celebration through exceptional
              cakes.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="story-p story-p-2">
              What began as a passion for baking has grown into a trusted name
              in the community — from intimate family gatherings to grand
              corporate events.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <motion.button whileHover={{ x: 6 }} className="link-primary" type="button">
              Learn More <ArrowRight className="icon-sm" />
            </motion.button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const whyUs = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    body: "We use only the finest organic ingredients sourced from trusted suppliers worldwide.",
  },
  {
    icon: Award,
    title: "Award Winning",
    body: "Recognized for excellence in taste, design, and customer satisfaction.",
  },
  {
    icon: Palette,
    title: "Custom Designs",
    body: "Every cake is handcrafted with attention to detail and personalized to your vision.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    body: "Sustainable practices and eco-conscious packaging for every order.",
  },
];

function WhyChooseUs() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">WHY CHOOSE US</span>
            <h2 className="h2">
              Sweet things, done <span className="italic-primary">right</span>.
            </h2>
          </div>
        </Reveal>
        <div className="why-grid">
          {whyUs.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="why-card"
                >
                  <div className="why-card-glow" />
                  <div className="why-icon-wrap">
                    <Icon className="icon-md" />
                  </div>
                  <h3 className="why-title">{f.title}</h3>
                  <p className="why-body">{f.body}</p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const values = [
  { n: "01", title: "Quality First", body: "We never compromise on ingredient quality or baking standards." },
  { n: "02", title: "Customer Focus", body: "Your satisfaction is our ultimate measure of success." },
  { n: "03", title: "Innovation", body: "Constantly exploring new flavors and design possibilities." },
  { n: "04", title: "Sustainability", body: "Committed to environmentally responsible practices." },
];

function CoreValues() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const smoothX = useSpring(x, { stiffness: 60, damping: 20 });

  return (
    <section ref={ref} className="values">
      <motion.div style={{ x: smoothX }} className="values-bg-text">
        Values · Values · Values · Values · Values
      </motion.div>
      <div className="container" style={{ position: "relative" }}>
        <Reveal>
          <h2 className="h2">
            Our Core <span className="italic-primary">Values</span>
          </h2>
        </Reveal>
        <div className="values-grid">
          {values.map((v, i) => (
            <Reveal key={v.n} delay={i * 0.1}>
              <motion.div whileHover={{ y: -6 }} className="value-card">
                <div className="value-num">{v.n}</div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-body">{v.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const processSteps = [
  { n: "01", title: "Consultation", body: "We discuss your vision, preferences, and dietary requirements." },
  { n: "02", title: "Design", body: "Our team creates a design concept tailored to your event." },
  { n: "03", title: "Baking", body: "Fresh ingredients are carefully baked using traditional methods." },
  { n: "04", title: "Delivery", body: "Your cake arrives perfect and ready to celebrate." },
];

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const line = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section ref={ref} className="section">
      <div className="container-narrow">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">OUR PROCESS</span>
            <h2 className="h2">
              From vision to <span className="italic-primary">celebration</span>.
            </h2>
          </div>
        </Reveal>
        <div className="process-wrap">
          <div className="process-line-bg" />
          <motion.div style={{ height: line }} className="process-line-fg" />
          <div className="process-list">
            {processSteps.map((p, i) => (
              <Reveal key={p.n} delay={0.05}>
                <div className={`process-row ${i % 2 === 1 ? "process-row-alt" : ""}`}>
                  <div className="process-card">
                    <div className="process-num">{p.n}</div>
                    <h3 className="process-title">{p.title}</h3>
                    <p className="process-body">{p.body}</p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="process-node"
                  >
                    <div className="process-dot" />
                  </motion.div>
                  <div className="process-spacer" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "The cake was absolutely stunning and tasted even better than it looked! Their team went above and beyond to make our wedding special.",
    name: "Sarah Mitchell",
    role: "Wedding Client",
    initials: "SM",
  },
  {
    quote:
      "I've ordered multiple times. The quality is consistent, the designs are creative, and customer service is always excellent.",
    name: "John Davis",
    role: "Corporate Client",
    initials: "JD",
  },
  {
    quote:
      "My daughter's birthday cake was perfect! She loved the flavors and the design was exactly what I imagined.",
    name: "Amy Kumar",
    role: "Birthday Client",
    initials: "AK",
  },
];

function Testimonials() {
  return (
    <section className="section section-muted">
      <div className="container">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">TESTIMONIALS</span>
            <h2 className="h2">
              What our <span className="italic-primary">customers</span> say.
            </h2>
          </div>
        </Reveal>
        <div className="tst-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              <motion.div whileHover={{ y: -8 }} className="tst-card">
                <div className="tst-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="tst-star" />
                  ))}
                </div>
                <p className="tst-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="tst-person">
                  <div className="tst-avatar">{t.initials}</div>
                  <div>
                    <div className="tst-name">{t.name}</div>
                    <div className="tst-role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 1.05]);

  return (
    <section ref={ref} className="cta">
      <motion.div style={{ y, scale }} className="cta-inner">
        <div className="cta-card">
          <motion.div
            className="cta-blob"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <Reveal>
            <h2 className="cta-title">
              Ready to create something{" "}
              <span className="italic-primary">special?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="cta-lead">
              Get in touch with our team to start planning your perfect cake.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="cta-actions">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                style={{ marginTop: 0 }}
                type="button"
              >
                Get Started <ArrowRight className="icon-sm" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-outline"
                type="button"
              >
                Contact Us
              </motion.button>
            </div>
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- page ---------- */

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <main className="about-main">
      <motion.div style={{ scaleX: progress }} className="progress-bar" />
      <Hero />
      <Impact />
      <Story />
      <WhyChooseUs />
      <CoreValues />
      <Process />
      <Testimonials />
      <CTA />
    </main>
  );
}