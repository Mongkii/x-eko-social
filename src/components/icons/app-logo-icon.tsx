// src/components/icons/app-logo-icon.tsx
import type { SVGProps } from 'react';

export function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
  const tealColor = "#50A8C8"; 
  const darkBlueColor = "#2A4B6A"; 
  const whiteColor = "#FFFFFF";

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath id="ekoLogoInnerCircleClip">
          {/* Clip path for the inner colored content area */}
          <circle cx="50" cy="50" r="43" />
        </clipPath>
      </defs>

      {/* Background Layers - Clipped to inner circle shape */}
      <g clipPath="url(#ekoLogoInnerCircleClip)">
        {/* Dark Blue Layer (covers the whole inner circle as a base) */}
        <rect x="0" y="0" width="100" height="100" fill={darkBlueColor} />
        
        {/* Teal "Sky" Layer. 
            Path draws the top semi-circle of the main content circle, 
            then a Bezier curve forms the "horizon" making the bottom edge of the sky.
        */}
        <path
          d="M7,50 A43,43 0 0,1 93,50 C85,25 15,25 7,50 Z"
          fill={tealColor}
        />
      </g>
      
      {/* Icon Elements: Speech Bubble with Dot + Sound Waves */}
      {/* Speech Bubble shape (Combined circle and pointer) */}
      <path 
        d="M34 32 C27.925 32 23 36.925 23 43 C23 47.328 25.851 51.017 29.688 52.836 L34 58 L38.312 52.836 C42.149 51.017 45 47.328 45 43 C45 36.925 40.075 32 34 32 Z"
        fill={whiteColor}
      />
      {/* Inner Dot of the speech bubble */}
      <circle cx="34" cy="43" r="4" fill={darkBlueColor} />

      {/* Sound Waves */}
      <path d="M49,37 A7,7 0 0,1 49,49" stroke={whiteColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M55,34 A11,11 0 0,1 55,52" stroke={whiteColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Text "eko" */}
      <text 
        x="50" 
        y="80" 
        fontFamily="Verdana, Geneva, sans-serif" // A common bold sans-serif font
        fontSize="19" 
        fontWeight="bold" 
        fill={whiteColor} 
        textAnchor="middle"
      >
        eko
      </text>

      {/* Outermost White Border */}
      <circle cx="50" cy="50" r="45.5" stroke={whiteColor} strokeWidth="5" fill="none" />
    </svg>
  );
}
