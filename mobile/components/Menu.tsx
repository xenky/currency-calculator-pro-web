import React from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { AppSettings, ActiveView } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { DarkModeIcon } from './icons/DarkModeIcon';
import { LightModeIcon } from './icons/LightModeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { InfoIcon } from './icons/InfoIcon';
import { SyncIcon } from './icons/SyncIcon';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  appSettings: AppSettings;
  onAppSettingsChange: (settings: AppSettings) => void;
  setActiveView: (view: ActiveView) => void;
  onUpdateRates: () => void;
}

export const Menu: React.FC<MenuProps> = ({ isOpen, onClose, appSettings, onAppSettingsChange, setActiveView, onUpdateRates }) => {

  const toggleDarkMode = () => {
    onClose();
    onAppSettingsChange({ ...appSettings, darkMode: !appSettings.darkMode });
  };

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    onClose();
  };

  const handleUpdateRatesClick = () => {
    onUpdateRates();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50">
          <TouchableWithoutFeedback>
            <SafeAreaView className="w-4/5 max-w-sm bg-white dark:bg-slate-800 h-full shadow-xl">
              <View className="p-5">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">Menú</Text>
                  <TouchableOpacity onPress={onClose} className="p-2 rounded-full" accessibilityLabel="Cerrar menú">
                    <CloseIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </TouchableOpacity>
                </View>

                {/* Dark Mode Toggle */}
                <View className="mb-6">
                  <Text className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Tema</Text>
                  <TouchableOpacity 
                    onPress={toggleDarkMode} 
                    className="w-full flex-row items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                    accessibilityLabel={`Cambiar a modo ${appSettings.darkMode ? 'claro' : 'oscuro'}`}
                  >
                    <Text className="text-slate-700 dark:text-slate-200">{appSettings.darkMode ? 'Modo Oscuro' : 'Modo Claro'}</Text>
                    {appSettings.darkMode ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5 text-slate-500" />}
                  </TouchableOpacity>
                </View>
                
                {/* Navigation Links */}
                <View className="mb-6">
                    <Text className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Secciones</Text>
                    <View className="space-y-2">
                        <TouchableOpacity 
                            onPress={handleUpdateRatesClick}
                            className="w-full flex-row items-center px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                            accessibilityLabel="Actualizar tasas de cambio"
                        >
                            <SyncIcon className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400"/>
                            <Text className="text-slate-700 dark:text-slate-200">Actualizar Tasas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => navigateTo('history')}
                            className="w-full flex-row items-center px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                            accessibilityLabel="Ver historial de operaciones"
                        >
                            <HistoryIcon className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400"/>
                            <Text className="text-slate-700 dark:text-slate-200">Ver Historial</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => navigateTo('about')}
                            className="w-full flex-row items-center px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                            accessibilityLabel="Ver información de la aplicación"
                        >
                            <InfoIcon className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400"/>
                            <Text className="text-slate-700 dark:text-slate-200">Acerca de</Text>
                        </TouchableOpacity>
                    </View>
                </View>
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};