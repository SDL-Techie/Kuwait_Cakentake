import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./CookieAnimation.css";

// 1. Export the CookieItem interface so it can be imported in pages/layouts
export interface CookieItem {
  id: string;
  name: string;
  bgColor: string;          // Can be a dynamic Hex value like "#e6d5bc" or a class name
  imageSrc: string;         // Img URL or local public asset path
}

export interface CookieAnimationProps {
  /**
   * The list of cookies/pies to slide and animate through.
   */
  items: CookieItem[];
  
  /**
   * Optional callback when the slide active index changes.
   */
  onIndexChange?: (index: number) => void;
  
  /**
   * Transition duration lock in milliseconds (prevents rapid scrollwheel triggers).
   * Default is 850ms.
   */
  transitionLockDuration?: number;

  /**
   * Auto rotation speed of the active cookie/pie in seconds.
   * Default is 28 seconds.
   */
  rotationSpeed?: number;

  /**
   * Vertical levitation/floating height in pixels.
   * Default is 18px.
   */
  floatHeight?: number;

  /**
   * Duration of one full floating cycle (up & down) in seconds.
   * Default is 3.2 seconds.
   */
  floatDuration?: number;
}

/**
 * CookieAnimation is a fully immersive interactive presentation slider.
 * It is fully styled with independent CSS, completely free of Tailwind CSS!
 * 
 * Simply drop this into any section of your landing page or a full screen area!
 */
export function CookieAnimation({
  items,
  onIndexChange,
  transitionLockDuration = 850,
  rotationSpeed = 28,
  floatHeight = 18,
  floatDuration = 3.2
}: CookieAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = down/next, -1 = up/prev
  const isTransitioning = useRef(false);
  const touchStartRef = useRef<number | null>(null);

  const activeItem = items[currentIndex];

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  // Handle arrow keys and space triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
        isTransitioning.current = true;
        setTimeout(() => {
          isTransitioning.current = false;
        }, transitionLockDuration);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        isTransitioning.current = true;
        setTimeout(() => {
          isTransitioning.current = false;
        }, transitionLockDuration);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length, transitionLockDuration]);

  // Handle high precision wheel scroll delta slide triggers
  // useEffect(() => {
  //   const handleWheel = (e: WheelEvent) => {
  //     // Prevents page bounce during transitions
  //     // e.preventDefault();
  //     if (isTransitioning.current) return;

  //     if (Math.abs(e.deltaY) > 12) {
  //       if (e.deltaY > 0) {
  //         setDirection(1);
  //         setCurrentIndex((prev) => (prev + 1) % items.length);
  //       } else {
  //         setDirection(-1);
  //         setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  //       }
  //       isTransitioning.current = true;
  //       setTimeout(() => {
  //         isTransitioning.current = false;
  //       }, transitionLockDuration);
  //     }
  //   };

  //   // window.addEventListener("wheel", handleWheel, { passive: false });
  //   // return () => window.removeEventListener("wheel", handleWheel);
  // }, [items.length, transitionLockDuration]);

  useEffect(() => {
  const container = containerRef.current;

  if (!container) return;

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (isTransitioning.current) return;

    if (Math.abs(e.deltaY) > 12) {
      if (e.deltaY > 0) {
        setDirection(1);
        setCurrentIndex(prev => (prev + 1) % items.length);
      } else {
        setDirection(-1);
        setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
      }

      isTransitioning.current = true;

      setTimeout(() => {
        isTransitioning.current = false;
      }, transitionLockDuration);
    }
  };

  container.addEventListener("wheel", handleWheel, {
    passive: false,
  });

  return () => {
    container.removeEventListener("wheel", handleWheel);
  };
}, [items.length, transitionLockDuration]);

  // Swipe gesture triggers (Mobile devices)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null || isTransitioning.current) return;

    const currentY = e.touches[0].clientY;
    const diffY = touchStartRef.current - currentY;

    if (Math.abs(diffY) > 40) {
      if (diffY > 0) {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
      } else {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      }
      isTransitioning.current = true;
      touchStartRef.current = null;
      setTimeout(() => {
        isTransitioning.current = false;
      }, transitionLockDuration);
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // 1:1 replica of the transition bezier values
  const slideVariants = {
    initial: (dir: number) => ({
      y: dir > 0 ? "100%" : "-100%",
    }),
    animate: {
      y: "0%",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? "-100%" : "100%",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  // Supports both standard Tailwind class values and direct hex values
  const isHexOrColor = activeItem.bgColor.startsWith("#") || activeItem.bgColor.startsWith("rgb") || activeItem.bgColor.startsWith("hsl");
  const inlineBgStyle = isHexOrColor ? { backgroundColor: activeItem.bgColor } : undefined;
  const classBgName = isHexOrColor ? "" : activeItem.bgColor;

  return (
    <div
      ref={containerRef}
      className="cookie-animation-fullscreen-box"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          // variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={inlineBgStyle}
          className={`cookie-animation-slide ${classBgName}`}
        >
          {/* Background rotating typography repeating HAPPY PI DAY */}
          <div className="cookie-text-wall">
            <div className="cookie-text-stack">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`cookie-text-row ${idx === 5 ? "opaque-row" : ""}`}
                >
                  {/* {idx % 2 === 0 ? "HAPPY" : "PI DAY"} */}
                       {idx % 2 === 0
        ? "HAPPY HAPPY HAPPY HAPPY HAPPY HAPPY HAPPY HAPPY"
        : "PI DAY PI DAY PI DAY PI DAY PI DAY PI DAY PI DAY"}
                </div>
              ))}
            </div>
          </div>

          {/* Central floating/rotating state wrapper */}
          <div className="cookie-stage-wrapper">
            <div className="cookie-pie-container">
              <motion.div
                animate={{
                  y: [0, -floatHeight, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  y: {
                    duration: floatDuration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                  rotate: {
                    duration: rotationSpeed,
                    ease: "linear",
                    repeat: Infinity,
                  },
                }}
                className="cookie-floater"
              >
                {/* 3D Drop shadow layer */}
                <div className="cookie-shadow" />

                {/* Main cropped layout */}
                <img
                  src={activeItem.imageSrc}
                  alt={activeItem.name}
                  referrerPolicy="no-referrer"
                  className="cookie-image"
                />
              </motion.div>
            </div>
          </div>

          {/* Micro dots overlays */}
          <div className="cookie-dots-pagination">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`cookie-dot ${currentIndex === idx ? "active-dot" : ""}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* User interaction indicator panel */}
          <div className="cookie-instructions">
            <span>Scroll, Swipe or Key ↕</span>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}