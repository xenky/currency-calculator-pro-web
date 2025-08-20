
import React from 'react';
import { Pressable, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { ActiveView } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { MenuIcon } from './icons/MenuIcon';

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

  const containerStyle = [
    styles.container,
    isDarkMode ? styles.containerDark : styles.containerLight
  ];

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.pressable,
    pressed ? (isDarkMode ? styles.pressablePressedDark : styles.pressablePressedLight) : null
  ];

  const iconColor = '#FFFFFF';

  return (
    <View style={containerStyle}>
      <View style={styles.innerContainer}>
        {activeView !== 'calculator' ? (
          <Pressable onPress={onNavigateBack} style={pressableStyle} accessibilityLabel="Volver">
            <ArrowLeftIcon stroke={iconColor} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.title}>{headerTitle}</Text>
        <Pressable onPress={onMenuToggle} style={pressableStyle} accessibilityLabel="Abrir menú">
          <MenuIcon stroke={iconColor} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
    flexShrink: 0,
  },
  containerLight: {
    backgroundColor: '#4338CA', // indigo-600
  },
  containerDark: {
    backgroundColor: '#1e293b', // slate-800
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pressable: {
    padding: 8,
    borderRadius: 9999,
  },
  pressablePressedLight: {
    backgroundColor: '#3730a3', // indigo-700
  },
  pressablePressedDark: {
    backgroundColor: '#334155', // slate-700
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});