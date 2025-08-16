# Plan de Migración: Web (React) a App Móvil (React Native)

Este documento detalla los pasos para migrar la aplicación web `currency-calculator-pro` a una aplicación móvil nativa usando React Native, Expo y NativeWind.

## Fase 1: Configuración del Proyecto (Completada)

- [x] Crear un directorio `mobile` para el nuevo proyecto.
- [x] Inicializar un nuevo proyecto de React Native usando Expo con la plantilla por defecto (TypeScript).
- [x] Crear este archivo de plan de migración (`MIGRATION_PLAN.md`).

## Fase 2: Instalación de Dependencias Clave (Completada)

- [x] Instalar `nativewind` y su peer dependency `tailwindcss`.
- [x] Instalar `react-native-svg` para poder usar los iconos SVG.
- [x] Instalar `@react-navigation/native` y las dependencias necesarias para la navegación (`@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`).

## Fase 3: Configuración y Migración de Assets (Completada)

- [x] Configurar `tailwind.config.js` para NativeWind, apuntando a los archivos de la app móvil.
- [x] Configurar el `babel.config.js` para incluir el plugin de NativeWind.
- [x] Copiar los assets de imágenes desde `public/img` del proyecto web a `mobile/assets/images`.
- [x] Crear un directorio `mobile/components/icons` y recrear los componentes de iconos (`.tsx`) usando `react-native-svg`.

## Fase 4: Migración de Componentes y Pantallas (Completada)

El objetivo es reescribir cada componente de UI para que use componentes de React Native (`<View>`, `<Text>`, etc.) y clases de NativeWind.

- [x] `Header.tsx`
- [x] `InputDisplay.tsx`
- [x] `CurrencyOutput.tsx`
- [x] `NumericInputKeypad.tsx`
- [x] `Keypad.tsx`
- [x] `Menu.tsx`
- [x] `SettingsModal.tsx`
- [x] `HistoryScreen.tsx`
- [x] `AboutScreen.tsx`
- [x] `InstallPwaPrompt.tsx` (se reemplazará por una funcionalidad nativa si es necesario).

## Fase 5: Integración de Lógica y Hooks (Completada)

- [x] Copiar los servicios de `services/` al nuevo proyecto en `mobile/services/`.
- [x] Copiar los hooks de `hooks/` a `mobile/hooks/`.
- [x] Adaptar `useLocalStorage.ts` para que use `AsyncStorage` de React Native en lugar del Local Storage del navegador.

## Fase 6: Configuración de la Navegación (Completada)

- [x] Crear el navegador principal de la aplicación (probablemente un Tab Navigator) en `mobile/navigation/`.
- [x] Configurar las pestañas para las pantallas principales (Calculadora, Historial, etc.).
- [x] Implementar la navegación al modal de `Settings`.

## Fase 7: Toques Finales y Pruebas

- [ ] Realizar pruebas exhaustivas.
- [ ] Ajustar estilos y layout para diferentes tamaños de pantalla.

