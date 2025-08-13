import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  return (
    <View className="bg-indigo-600 dark:bg-slate-800 p-3 shadow-md">
      <View className="flex-row justify-between items-center">
        {activeView !== 'calculator' ? (
          <TouchableOpacity 
            onPress={onNavigateBack} 
            className="p-2 rounded-full" 
            accessibilityLabel="Volver"
          >
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </TouchableOpacity>
        ) : (
          <View className="w-10" /> // Placeholder for spacing
        )}
        <Text className="text-xl font-semibold text-white">{headerTitle}</Text>
        <TouchableOpacity 
          onPress={onMenuToggle} 
          className="p-2 rounded-full" 
          accessibilityLabel="Abrir menú"
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
