import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { HeartIcon } from './icons/HeartIcon';
import CoffeeCupIcon from './icons/CoffeeCupIcon';

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View className="flex-row items-start mb-1">
    <Text className="text-indigo-600 dark:text-indigo-400 text-lg mr-2">•</Text>
    <Text className="text-base text-slate-700 dark:text-slate-300 flex-1">{children}</Text>
  </View>
);

export const AboutScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <Text className="text-2xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6 text-center">
            Acerca de Calculadora de Divisas Pro
          </Text>
          
          <View className="space-y-4">
            <Text className="font-semibold text-lg text-slate-700 dark:text-slate-300">Versión: 1.1.4</Text>
            <Text className="text-base text-slate-700 dark:text-slate-300">Esta aplicación es una calculadora de divisas moderna y fácil de usar, construida para ofrecer una experiencia fluida y eficiente.</Text>

            <View>
              <Text className="font-semibold text-lg text-indigo-600 dark:text-indigo-400 mb-2">Funcionalidades Destacadas:</Text>
              <View className="ml-4">
                <ListItem>Conversión entre múltiples monedas (VES, COP, USD, EUR).</ListItem>
                <ListItem>Tasas de cambio reales obtenidas desde fuentes oficiales.</ListItem>
                <ListItem>Opción para establecer tasas de cambio manuales.</ListItem>
                <ListItem>Historial de operaciones.</ListItem>
                <ListItem>Modo claro y oscuro.</ListItem>
                <ListItem>Funcionamiento offline.</ListItem>
              </View>
            </View>
            
            <View className="my-6 border-t border-slate-300 dark:border-slate-700" />

            <View className="items-center">
              <View className="flex-row items-center">
                 <Text className="font-medium text-slate-700 dark:text-slate-300">Desarrollada con </Text>
                 <HeartIcon className="w-5 h-5 mx-1 text-red-500"/>
                 <Text className="font-medium text-slate-700 dark:text-slate-300"> y </Text>
                 <CoffeeCupIcon color='#EF4444' className="w-6 h-6 mx-1"/>
                 <Text className="font-medium text-slate-700 dark:text-slate-300"> por:</Text>
              </View>
              <Text className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mt-2">Freddy Rujano</Text>
              <Text className="text-slate-700 dark:text-slate-300">La Grita - Táchira</Text>
              <Text className="text-slate-700 dark:text-slate-300">Venezuela</Text>
            </View>

            <View className="my-6 border-t border-slate-300 dark:border-slate-700" />
            
            <Text className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
              © 2025 Todos los derechos reservados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};