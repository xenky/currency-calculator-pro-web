
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { AppIcon } from '@/components/icons/AppIcon';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider } from '@/context/AppContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calculadora',
            tabBarIcon: ({ color, size }) => <AppIcon width={size} height={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historial',
            tabBarIcon: ({ color, size }) => <HistoryIcon width={size} height={size} color={color} />,
          }}
        />
      </Tabs>
    </AppProvider>
  );
}
