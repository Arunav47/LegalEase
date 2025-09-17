"use client"

import React, { useRef, useEffect } from "react";
import { animate, inView, scroll } from "motion";

interface StickyImageProps {
  imgUrl: string;
}

export const StickyImage: React.FC<StickyImageProps> = ({ imgUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const IMG_PADDING = 12;

  useEffect(() => {
    if (!containerRef.current || !imageRef.current || !overlayRef.current) return;

    // Use inView to detect when the element enters viewport
    const cleanup = inView(containerRef.current, () => {
      // Simple scroll-linked animation
      const unsubscribe = scroll((progress: number) => {
        // Calculate scroll progress
        const element = containerRef.current;
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Progress goes from 0 to 1 as element moves from bottom to top of viewport
        const scrollProgress = 1 - Math.max(0, Math.min(1, (elementTop + elementHeight) / (windowHeight + elementHeight)));
        
        // Apply animations based on scroll progress
        if (imageRef.current) {
          // Scale down as we scroll
          imageRef.current.style.transform = `scale(${1 - (scrollProgress * 0.15)})`;
        }
        
        if (overlayRef.current) {
          // Fade in overlay
          overlayRef.current.style.opacity = String(scrollProgress);
        }
      });
      
      return () => {
        unsubscribe();
      };
    });

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING
      }}
    >
      <div
        ref={imageRef}
        style={{ width: '100%', height: '100%' }}
      />
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-neutral-950/70"
        style={{ opacity: 0 }}
      />
    </div>
  );
};