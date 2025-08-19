
import React from 'react';

// A modern app icon for a currency calculator.
// This serves as the design basis for the actual PNG icons.
export const AppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="512" height="512" rx="90" fill="url(#icon-gradient)"/>
    <g style={{ mixBlendMode: 'overlay' }} opacity="0.1">
       <path d="M-10,10 L100,50 L50, 150 Z" fill="white" />
       <circle cx="450" cy="80" r="80" fill="white" />
       <rect x="50" y="400" width="150" height="150" rx="30" transform="rotate(25 125 475)" fill="white"/>
    </g>
    <g fontFamily="Arial, sans-serif" fontWeight="bold" fill="white" textAnchor="middle">
      <text x="170" y="220" fontSize="120">$</text>
      <text x="350" y="220" fontSize="120">€</text>
      <text x="170" y="380" fontSize="110">Bs</text>
      <text x="350" y="380" fontSize="120">C</text>
    </g>
    <defs>
      <linearGradient id="icon-gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4338CA"/>
        <stop offset="1" stopColor="#6D28D9"/>
      </linearGradient>
    </defs>
  </svg>
);
