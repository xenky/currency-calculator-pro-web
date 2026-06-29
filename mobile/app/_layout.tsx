import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useAppContext } from '../context/AppContext';
import { StatusBar } from 'expo-status-bar';

function LayoutContent() {
  const { isDarkMode } = useAppContext();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <LayoutContent />
    </AppProvider>
  );
}
