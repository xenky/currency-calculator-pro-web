import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { KEYPAD_LAYOUT } from '../constants';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  className?: string;
}

const getAriaLabelForKey = (key: string): string => {
  switch (key) {
    case 'C': return 'Borrar todo';
    case '( )': return 'Paréntesis';
    case '%': return 'Porcentaje';
    case '/': return 'Dividir';
    case '*': return 'Multiplicar';
    case '-': return 'Restar';
    case '+': return 'Sumar';
    case ',': return 'Coma decimal';
    case '=': return 'Igual';
    case '⌫': return 'Retroceso';
    default: return key;
  }
};

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, className }) => {
  return (
    <View className={`flex-row flex-wrap h-full p-0.5 bg-slate-300 dark:bg-slate-800 ${className || ''}`}>
      {KEYPAD_LAYOUT.flat().map((key, index) => {
        const isOperator = ['/', '*', '-', '+', '%'].includes(key);
        const isEqual = key === '=';
        const isClear = key === 'C';
        const isBackspace = key === '⌫';
        const isSpecialFn = ['( )'].includes(key);

        let buttonClass = 'flex-1 items-center justify-center rounded-sm min-w-[24%] m-[0.5%]';
        let textClass = 'font-medium text-2xl';

        if (isEqual) {
          buttonClass += ' bg-indigo-600 active:bg-indigo-700';
          textClass += ' text-white';
        } else if (isOperator) {
          buttonClass += " bg-slate-400 active:bg-slate-500 dark:bg-slate-600 dark:active:bg-slate-500";
          textClass += " text-slate-800 dark:text-white";
        } else if (isClear || isBackspace) {
           buttonClass += ' bg-red-400 active:bg-red-500';
           textClass += ' text-white';
        } else if (isSpecialFn) {
            buttonClass += " bg-slate-200 active:bg-slate-300 dark:bg-slate-500 dark:active:bg-slate-400";
            textClass += " text-slate-700 dark:text-slate-100";
        }
         else { // Numbers and comma
          buttonClass += " bg-white active:bg-slate-100 dark:bg-slate-700 dark:active:bg-slate-600";
          textClass += " text-slate-800 dark:text-white";
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={() => onKeyPress(key)}
            className={buttonClass}
            accessibilityLabel={getAriaLabelForKey(key)}
          >
            <Text className={textClass}>{key}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
