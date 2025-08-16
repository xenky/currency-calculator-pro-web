import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getButtonStyles = (key: string) => {
    const buttonStyles: any[] = [styles.button];
    const textStyles: any[] = [styles.text];

    if (key === '⌫') {
      buttonStyles.push(isDarkMode ? styles.darkBackspaceButton : styles.lightBackspaceButton);
    } else if (key === 'C') {
      buttonStyles.push(styles.clearButton);
      textStyles.push(styles.whiteText);
    } else if (key === '') {
      buttonStyles.push(styles.emptyButton);
    } else {
      buttonStyles.push(isDarkMode ? styles.darkNumberButton : styles.lightNumberButton);
      textStyles.push(isDarkMode ? styles.whiteText : styles.darkText);
    }

    return { button: buttonStyles, text: textStyles };
  };

  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: 4,
      marginTop: 8,
      marginRight: 48,
      marginLeft: 48,
      backgroundColor: isDarkMode ? 'transparent' : '#e0e7ff',
    },
    button: {
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      width: '32%',
      aspectRatio: 1.1,
      margin: '0.5%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 2,
    },
    text: {
      fontSize: 20,
      fontWeight: '500',
    },
    lightBackspaceButton: { backgroundColor: '#94a3b8' },
    darkBackspaceButton: { backgroundColor: '#64748b' },
    clearButton: { backgroundColor: '#f87171' },
    whiteText: { color: '#fff' },
    emptyButton: { backgroundColor: 'transparent', shadowColor: 'transparent', elevation: 0 },
    lightNumberButton: { backgroundColor: '#fff' },
    darkNumberButton: { backgroundColor: '#475569' },
    darkText: { color: '#1e293b' },
  });

  return (
    <View style={styles.root}>
      {KEYPAD_NUMERIC_LAYOUT.flat().map((key, index) => {
        const { button, text } = getButtonStyles(key);
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onKeyPress(key)}
            style={button}
            accessibilityLabel={key === '⌫' ? 'Retroceso' : key}
            disabled={key === ''}
          >
            {key === '⌫' ? <BackspaceIcon width={32} height={32} fill={isDarkMode ? '#fff' : '#1e293b'} /> : <Text style={text}>{key}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
