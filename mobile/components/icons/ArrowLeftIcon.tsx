
import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface IconProps {
    width?: number;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
}

export const ArrowLeftIcon: React.FC<IconProps> = ({ width = 24, height = 24, stroke = "currentColor", strokeWidth = 1.5 }) => (
  <Svg fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={strokeWidth} width={width} height={height}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </Svg>
);
