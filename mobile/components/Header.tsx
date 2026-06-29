import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { MenuIcon } from './icons/MenuIcon';
import { useAppContext } from '../context/AppContext';
import { Colors } from '../constants/Colors';

interface HeaderProps {
  onMenuToggle: () => void;
  activeView: string; // ActiveView type is not directly used here, so using string
  headerTitle: string;
  onNavigateBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  activeView,
  headerTitle,
  onNavigateBack
}) => {
  const { isDarkMode } = useAppContext();

  const containerStyle = [
    styles.container,
    isDarkMode ? styles.containerDark : styles.containerLight
  ];

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.pressable,
    pressed ? (isDarkMode ? styles.pressablePressedDark : styles.pressablePressedLight) : null
  ];

  const iconColor = isDarkMode ? Colors.dark.text : Colors.light.text;

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
        <Text style={[styles.title, { color: iconColor }]}>{headerTitle}</Text>
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
    backgroundColor: Colors.light.background,
  },
  containerDark: {
    backgroundColor: Colors.dark.background,
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
    backgroundColor: '#E0E0E0', // A slightly darker shade of light background
  },
  pressablePressedDark: {
    backgroundColor: '#2C2C2C', // A slightly darker shade of dark background
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default Header;