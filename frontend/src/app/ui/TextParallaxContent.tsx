"use client"

import React, { useRef } from "react";
import { animate, inView, scroll } from "motion";
import { StickyImage } from '@/app/ui/StickyImage';
import { OverlayCopy } from '@/app/ui/OverlayCopy';

const IMG_PADDING = 12;

interface TextParallaxContentProps {
  imgUrl: string;
  subheading: string;
  heading: string;
  children: React.ReactNode;
}

export const TextParallaxContent: React.FC<TextParallaxContentProps> = ({ 
  imgUrl, 
  subheading, 
  heading, 
  children 
}) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};