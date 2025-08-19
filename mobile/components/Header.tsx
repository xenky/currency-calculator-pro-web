
import React from 'react';
import { Pressable, View } from 'react-native';
import ".././global.css";
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
  return (
    <View className="bg-indigo-600 dark:bg-slate-800 text-white p-3 shadow-md flex-shrink-0">
      <View className="flex justify-between items-center">
        {activeView !== 'calculator' ? (
          <Pressable onPress={onNavigateBack} className="p-2 rounded-full hover:bg-indigo-700 dark:hover:bg-slate-700" accessibilityLabel="Volver">
            <ArrowLeftIcon className="w-6 h-6" />
          </Pressable>
        ) : (
          <View className="w-10"></View> // Placeholder for spacing consistency when back button is not shown
        )}
        <View className="text-xl font-semibold text-center">{headerTitle}</View>
        <Pressable onPress={onMenuToggle} className="p-2 rounded-full hover:bg-indigo-700 dark:hover:bg-slate-700" accessibilityLabel="Abrir menú">
          <MenuIcon className="w-6 h-6" />
        </Pressable>
      </View>
    </View>
  );
};