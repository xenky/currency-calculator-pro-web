
import React from 'react';
import { Svg, Rect, G, Path, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

// A modern app icon for a currency calculator.
// This serves as the design basis for the actual PNG icons.
export const AppIcon: React.FC<any> = (props) => (
  <Svg width="512" height="512" viewBox="0 0 512 512" fill="none" {...props}>
    <Defs>
      <LinearGradient id="icon-gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <Stop stopColor="#4338CA"/>
        <Stop offset="1" stopColor="#6D28D9"/>
      </LinearGradient>
    </Defs>
    <Rect width="512" height="512" rx="90" fill="url(#icon-gradient)"/>
    <G opacity="0.1">
       <Path d="M-10,10 L100,50 L50, 150 Z" fill="white" />
       <Circle cx="450" cy="80" r="80" fill="white" />
       <Rect x="50" y="400" width="150" height="150" rx="30" transform="rotate(25 125 475)" fill="white"/>
    </G>
    <G textAnchor="middle">
      <SvgText fill="white" fontSize="120" fontWeight="bold" x="170" y="220">$</SvgText>
      <SvgText fill="white" fontSize="120" fontWeight="bold" x="350" y="220">€</SvgText>
      <SvgText fill="white" fontSize="110" fontWeight="bold" x="170" y="380">Bs</SvgText>
      <SvgText fill="white" fontSize="120" fontWeight="bold" x="350" y="380">C</SvgText>
    </G>
  </Svg>
);
