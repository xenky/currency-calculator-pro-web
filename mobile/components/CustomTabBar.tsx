
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppIcon } from '@/components/icons/AppIcon';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import { InfoIcon } from '@/components/icons/InfoIcon';
import { SyncIcon } from '@/components/icons/SyncIcon';
import { DarkModeIcon } from '@/components/icons/DarkModeIcon';
import { LightModeIcon } from '@/components/icons/LightModeIcon';
import { useAppContext } from '@/context/AppContext';
import { fetchOfficialRates } from '@/services/calculatorService';
import { parseAndApplyFetchedRates } from '@/services/exchangeRateService';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { appSettings, setAppSettings, setExchangeRates } = useAppContext();
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const toggleDarkMode = useCallback(() => {
    setAppSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, [setAppSettings]);

  const handleUpdateRates = useCallback(async () => {
    setUpdateMessage('Actualizando tasas...');
    try {
      const cloudData = await fetchOfficialRates();
      setExchangeRates(prev => {
        const updatedOfficialRates = parseAndApplyFetchedRates(cloudData, prev.officialRates);
        return { ...prev, officialRates: updatedOfficialRates, lastCloudFetchDate: cloudData.date };
      });
      setUpdateMessage('Tasas actualizadas.');
    } catch (error) {
      console.error("Failed to fetch or process official rates:", error);
      setUpdateMessage('Error al actualizar tasas.');
    } finally {
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  }, [setExchangeRates]);

  const styles = StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#1e293b' : '#fff',
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#334155' : '#e2e8f0',
      paddingBottom: SafeAreaView.length > 0 ? 0 : 10, // Adjust for iPhone X notch
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
    },
    tabText: {
      fontSize: 12,
      marginTop: 4,
      color: isDarkMode ? '#cbd5e1' : '#475569',
    },
    activeTabText: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    updateMessageContainer: {
      position: 'absolute',
      bottom: 80, // Adjust as needed to be above the tab bar
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    updateMessageText: {
      color: 'white',
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const getIcon = ({ color, size }: { color: string; size: number }) => {
          if (route.name === 'index') {
            return <AppIcon width={size} height={size} color={color} />;
          } else if (route.name === 'history') {
            return <HistoryIcon width={size} height={size} color={color} />;
          } else if (route.name === 'about') {
            return <InfoIcon width={size} height={size} color={color} />;
          }
          return null; // Should not happen for defined routes
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {getIcon({ color: isFocused ? (isDarkMode ? '#FFFFFF' : '#000000') : (isDarkMode ? '#cbd5e1' : '#475569'), size: 24 })}
            <Text style={[styles.tabText, isFocused && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Custom Update Rates Button */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Actualizar tasas de cambio"
        onPress={handleUpdateRates}
        style={styles.tabButton}
      >
        <SyncIcon width={24} height={24} color={isDarkMode ? '#cbd5e1' : '#475569'} />
        <Text style={styles.tabText}>Actualizar</Text>
      </TouchableOpacity>

      {/* Custom Theme Button */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Cambiar tema"
        onPress={toggleDarkMode}
        style={styles.tabButton}
      >
        {isDarkMode ? (
          <LightModeIcon width={24} height={24} color={isDarkMode ? '#cbd5e1' : '#475569'} />
        ) : (
          <DarkModeIcon width={24} height={24} color={isDarkMode ? '#cbd5e1' : '#475569'} />
        )}
        <Text style={styles.tabText}>Tema</Text>
      </TouchableOpacity>

      {updateMessage && (
        <View style={styles.updateMessageContainer}>
          <Text style={styles.updateMessageText}>{updateMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CustomTabBar;
