import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import { HeartIcon } from './icons/HeartIcon';
import { CoffeeCupIcon } from './icons/CoffeeCupIcon';

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    bullet: {
      color: isDarkMode ? '#818cf8' : '#4f46e5',
      fontSize: 18,
      marginRight: 8,
    },
    content: {
      fontSize: 16,
      color: isDarkMode ? '#cbd5e1' : '#334155',
      flex: 1,
    },
  });

  return (
    <View style={styles.root}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.content}>{children}</Text>
    </View>
  );
};

export const AboutScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
    },
    scrollViewContent: {
      padding: 16,
    },
    container: {
      backgroundColor: isDarkMode ? '#1e293b' : '#fff',
      padding: 24,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: isDarkMode ? '#818cf8' : '#4338ca',
      marginBottom: 24,
      textAlign: 'center',
    },
    content: {
      // space-y-4 handled by adding marginBottom to children
    },
    version: {
      fontWeight: '600',
      fontSize: 18,
      color: isDarkMode ? '#cbd5e1' : '#334155',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: isDarkMode ? '#cbd5e1' : '#334155',
      marginBottom: 16,
    },
    featuresTitle: {
      fontWeight: '600',
      fontSize: 18,
      color: isDarkMode ? '#818cf8' : '#4f46e5',
      marginBottom: 8,
    },
    featuresList: {
      marginLeft: 16,
      marginBottom: 16,
    },
    divider: {
      marginVertical: 24,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#334155' : '#e2e8f0',
    },
    developerInfo: {
      alignItems: 'center',
    },
    developerInfoLine: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    developerInfoText: {
      fontWeight: '500',
      color: isDarkMode ? '#cbd5e1' : '#334155',
    },
    developerName: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#818cf8' : '#4338ca',
      marginTop: 8,
    },
    developerLocation: {
      color: isDarkMode ? '#cbd5e1' : '#334155',
    },
    copyright: {
      textAlign: 'center',
      fontSize: 12,
      color: isDarkMode ? '#94a3b8' : '#64748b',
      paddingTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Acerca de Calculadora de Divisas Pro
          </Text>
          
          <View style={styles.content}>
            <Text style={styles.version}>Versión: 1.1.4</Text>
            <Text style={styles.description}>Esta aplicación es una calculadora de divisas moderna y fácil de usar, construida para ofrecer una experiencia fluida y eficiente.</Text>

            <View>
              <Text style={styles.featuresTitle}>Funcionalidades Destacadas:</Text>
              <View style={styles.featuresList}>
                <ListItem>Conversión entre múltiples monedas (VES, COP, USD, EUR).</ListItem>
                <ListItem>Tasas de cambio reales obtenidas desde fuentes oficiales.</ListItem>
                <ListItem>Opción para establecer tasas de cambio manuales.</ListItem>
                <ListItem>Historial de operaciones.</ListItem>
                <ListItem>Modo claro y oscuro.</ListItem>
                <ListItem>Funcionamiento offline.</ListItem>
              </View>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.developerInfo}>
              <View style={styles.developerInfoLine}>
                 <Text style={styles.developerInfoText}>Desarrollada con </Text>
                 <HeartIcon width={20} height={20} style={{ marginHorizontal: 4 }} fill="#ef4444"/>
                 <Text style={styles.developerInfoText}> y </Text>
                 <CoffeeCupIcon width={24} height={24} style={{ marginHorizontal: 4 }} color="#EF4444"/>
                 <Text style={styles.developerInfoText}> por:</Text>
              </View>
              <Text style={styles.developerName}>Freddy Rujano</Text>
              <Text style={styles.developerLocation}>La Grita - Táchira</Text>
              <Text style={styles.developerLocation}>Venezuela</Text>
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.copyright}>
              © 2025 Todos los derechos reservados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};