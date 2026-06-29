import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeMode } from '../types';
import { CheckIcon } from './icons/CheckIcon';



interface ThemeSelectorModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onThemeSelect: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isVisible, onClose, currentTheme, onThemeSelect, isDarkMode }) => {

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
      backgroundColor: isDarkMode ? '#334155' : '#fff',
      borderRadius: 8,
      padding: 16,
      width: '80%',
      maxWidth: 300,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
      marginBottom: 16,
      textAlign: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    optionText: {
      fontSize: 16,
      color: isDarkMode ? '#cbd5e1' : '#334155',
    },
  });

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'Claro', value: 'light' },
    { label: 'Oscuro', value: 'dark' },
    { label: 'Usar tema del sistema', value: 'system' },
  ];

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Seleccionar Tema</Text>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.option}
              onPress={() => onThemeSelect(option.value)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
              {currentTheme === option.value && <CheckIcon width={24} height={24} fill={isDarkMode ? '#818cf8' : '#4f46e5'} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
