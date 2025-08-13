import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BackspaceIcon } from './icons/BackspaceIcon';

interface NumericInputKeypadProps {
  onKeyPress: (key: string) => void;
}

const KEYPAD_NUMERIC_LAYOUT: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [',', '0', '⌫'],
  ['', 'C', ''],
];

export const NumericInputKeypad: React.FC<NumericInputKeypadProps> = ({ onKeyPress }) => {
  return (
    <View className="flex-row flex-wrap justify-center gap-1 p-1 mt-2 bg-indigo-100 dark:bg-transparent">
      {KEYPAD_NUMERIC_LAYOUT.flat().map((key, index) => {
        let buttonClass = "rounded shadow-sm active:shadow-inner transition-all duration-100 ease-in-out items-center justify-center w-[32%] aspect-square ";
        let textClass = "text-xl font-medium";

        if (key === '⌫') {
          buttonClass += " bg-slate-400 active:bg-slate-500 dark:bg-slate-500";
          textClass += " text-slate-800 dark:text-white";
        } else if (key === 'C') {
          buttonClass += " bg-red-400 active:bg-red-500";
          textClass += " text-white";
        } else if (key === '') {
          buttonClass += " bg-transparent shadow-none active:shadow-none";
        } else {
          buttonClass += " bg-white active:bg-slate-100 dark:bg-slate-600 dark:active:bg-slate-500";
          textClass += " text-slate-800 dark:text-white";
        }
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onKeyPress(key)}
            className={buttonClass}
            accessibilityLabel={key === '⌫' ? 'Retroceso' : key}
            disabled={key === ''}
          >
            {key === '⌫' ? <BackspaceIcon className="w-8 h-8 text-slate-800 dark:text-white" /> : <Text className={textClass}>{key}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
