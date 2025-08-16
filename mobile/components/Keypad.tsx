import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { KEYPAD_LAYOUT } from '../constants';

interface KeypadProps {
  onKeyPress: (key: string) => void;
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

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getButtonStyles = (key: string) => {
    const isOperator = ['/', '*', '-', '+', '%'].includes(key);
    const isEqual = key === '=';
    const isClear = key === 'C';
    const isBackspace = key === '⌫';
    const isSpecialFn = ['( )'].includes(key);

    const buttonStyles: any[] = [styles.button];
    const textStyles: any[] = [styles.text];

    if (isEqual) {
      buttonStyles.push(styles.equalButton);
      textStyles.push(styles.whiteText);
    } else if (isOperator) {
      buttonStyles.push(isDarkMode ? styles.darkOperatorButton : styles.lightOperatorButton);
      textStyles.push(isDarkMode ? styles.whiteText : styles.darkText);
    } else if (isClear || isBackspace) {
      buttonStyles.push(styles.clearButton);
      textStyles.push(styles.whiteText);
    } else if (isSpecialFn) {
      buttonStyles.push(isDarkMode ? styles.darkSpecialFnButton : styles.lightSpecialFnButton);
      textStyles.push(isDarkMode ? styles.lightText : styles.darkText);
    } else { // Numbers and comma
      buttonStyles.push(isDarkMode ? styles.darkNumberButton : styles.lightNumberButton);
      textStyles.push(isDarkMode ? styles.whiteText : styles.darkText);
    }

    return { button: buttonStyles, text: textStyles };
  };

  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      height: '100%',
      padding: 2,
      backgroundColor: isDarkMode ? '#1e293b' : '#cbd5e1',
    },
    button: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 2,
      minWidth: '23%',
      margin: '0.5%',
    },
    text: {
      fontWeight: '500',
      fontSize: 24,
    },
    equalButton: { backgroundColor: '#4f46e5' },
    lightOperatorButton: { backgroundColor: '#94a3b8' },
    darkOperatorButton: { backgroundColor: '#475569' },
    clearButton: { backgroundColor: '#f87171' },
    lightSpecialFnButton: { backgroundColor: '#e2e8f0' },
    darkSpecialFnButton: { backgroundColor: '#64748b' },
    lightNumberButton: { backgroundColor: '#fff' },
    darkNumberButton: { backgroundColor: '#334155' },
    whiteText: { color: '#fff' },
    darkText: { color: '#1e293b' },
    lightText: { color: '#f1f5f9' },
  });

  return (
    <View style={styles.root}>
      {KEYPAD_LAYOUT.flat().map((key, index) => {
        const { button, text } = getButtonStyles(key);
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onKeyPress(key)}
            style={button}
            accessibilityLabel={getAriaLabelForKey(key)}
          >
            <Text style={text}>{key}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};