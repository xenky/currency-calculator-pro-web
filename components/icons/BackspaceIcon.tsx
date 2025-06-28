
import React from 'react';

export const BackspaceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0L12 14.25m2.25-2.25H5.25m15.75 0a18.75 18.75 0 11-37.5 0 18.75 18.75 0 0137.5 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75L13.5 12l2.25 2.25M9.75 9.75L7.5 12l2.25 2.25" clipRule="evenodd" fillRule="evenodd" opacity="0" /> {/* Hidden part of original icon, simplified */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H7.5M12 16.5l-4.5-4.5 4.5-4.5" /> {/* Simplified backspace arrow */}
 </svg>
);
