
import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface IconProps {
    width?: number;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
}

export const MenuIcon: React.FC<IconProps> = ({ width = 24, height = 24, stroke = "currentColor", strokeWidth = 1.5 }) => (
  <Svg fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={strokeWidth} width={width} height={height}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </Svg>
);
