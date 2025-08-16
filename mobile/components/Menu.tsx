import React from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
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
  const isDarkMode = appSettings.darkMode;

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

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
      width: '80%',
      maxWidth: 384,
      backgroundColor: isDarkMode ? '#1e293b' : '#fff',
      height: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.58,
      shadowRadius: 16.00,
      elevation: 24,
    },
    menuContent: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: isDarkMode ? '#818cf8' : '#4f46e5',
    },
    closeButton: {
      padding: 8,
      borderRadius: 9999,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: isDarkMode ? '#e2e8f0' : '#334155',
      marginBottom: 8,
    },
    button: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
      borderRadius: 8,
    },
    buttonText: {
      color: isDarkMode ? '#e2e8f0' : '#334155',
    },
    linksContainer: {
      // space-y-2 handled by adding marginBottom to children
    },
    linkButton: {
      marginBottom: 8,
    },
    icon: {
      marginRight: 12,
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <SafeAreaView style={styles.menuContainer}>
              <View style={styles.menuContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>Menú</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Cerrar menú">
                    <CloseIcon width={24} height={24} stroke={isDarkMode ? '#cbd5e1' : '#475569'} />
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tema</Text>
                  <TouchableOpacity 
                    onPress={toggleDarkMode} 
                    style={styles.button}
                    accessibilityLabel={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
                  >
                    <Text style={styles.buttonText}>{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</Text>
                    {isDarkMode ? <LightModeIcon width={20} height={20} stroke="#facc15" /> : <DarkModeIcon width={20} height={20} stroke="#64748b" />}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Secciones</Text>
                    <View style={styles.linksContainer}>
                        <TouchableOpacity 
                            onPress={handleUpdateRatesClick}
                            style={[styles.button, styles.linkButton]}
                            accessibilityLabel="Actualizar tasas de cambio"
                        >
                            <SyncIcon width={20} height={20} style={styles.icon} stroke={isDarkMode ? '#818cf8' : '#6366f1'}/>
                            <Text style={styles.buttonText}>Actualizar Tasas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => navigateTo('history')}
                            style={[styles.button, styles.linkButton]}
                            accessibilityLabel="Ver historial de operaciones"
                        >
                            <HistoryIcon width={20} height={20} style={styles.icon} stroke={isDarkMode ? '#818cf8' : '#6366f1'}/>
                            <Text style={styles.buttonText}>Ver Historial</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => navigateTo('about')}
                            style={styles.button}
                            accessibilityLabel="Ver información de la aplicación"
                        >
                            <InfoIcon width={20} height={20} style={styles.icon} stroke={isDarkMode ? '#818cf8' : '#6366f1'}/>
                            <Text style={styles.buttonText}>Acerca de</Text>
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