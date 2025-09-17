"use client"

import React, { useRef, useEffect } from "react";
import { animate, inView, scroll } from "motion";

interface OverlayCopyProps {
  subheading: string;
  heading: string;
}

export const OverlayCopy: React.FC<OverlayCopyProps> = ({ subheading, heading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Use inView to detect when the container enters the viewport
    const cleanup = inView(containerRef.current, (entry) => {
      const target = containerRef.current;
      if (!target) return;
      
      // First set the initial state
      target.style.opacity = '0';
      target.style.transform = 'translateY(-250px)';
      
      // Create the animation
      animate(
        target,
        {
          transform: 'translateY(0px)',
          opacity: 1
        },
        {
          duration: 0.5
        }
      );
      
      // Setup scroll effect
      const scrollCleanup = scroll((progress: number) => {
        if (!target) return;
        
        // Calculate scroll progress
        const rect = target.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Map scroll position to animation progress (0 to 1)
        const scrollProgress = Math.max(0, Math.min(1, 
          1 - (elementTop + elementHeight/2) / (windowHeight + elementHeight/2)
        ));
        
        // Apply scroll-based position
        target.style.transform = `translateY(${(scrollProgress * 500) - 250}px)`;
        target.style.opacity = String(scrollProgress < 0.5 
          ? scrollProgress * 2  // Fade in from 0 to 0.5
          : 2 - (scrollProgress * 2)); // Fade out from 0.5 to 1
      });
      
      return () => {
        scrollCleanup();
      };
    });

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </div>
  );
};