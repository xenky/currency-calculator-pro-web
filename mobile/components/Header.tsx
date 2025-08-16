import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { ActiveView } from '../types';
import { MenuIcon } from './icons/MenuIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface HeaderProps {
  onMenuToggle: () => void;
  activeView: ActiveView;
  headerTitle: string;
  onNavigateBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle,
  activeView,
  headerTitle,
  onNavigateBack
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    root: {
      backgroundColor: isDarkMode ? '#1e293b' : '#4f46e5',
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    touchable: {
      padding: 8,
      borderRadius: 9999,
    },
    placeholder: {
      width: 40,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: '#fff',
    },
  });

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {activeView !== 'calculator' ? (
          <TouchableOpacity 
            onPress={onNavigateBack} 
            style={styles.touchable}
            accessibilityLabel="Volver"
          >
            <ArrowLeftIcon width={24} height={24} stroke="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} /> // Placeholder for spacing
        )}
        <Text style={styles.title}>{headerTitle}</Text>
        <TouchableOpacity 
          onPress={onMenuToggle} 
          style={styles.touchable}
          accessibilityLabel="Abrir menú"
        >
          <MenuIcon width={24} height={24} stroke="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
