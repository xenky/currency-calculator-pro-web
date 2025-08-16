# Plan de Migración de Estilos: NativeWind a StyleSheet

Este documento detalla los pasos para migrar los estilos de la aplicación de NativeWind (Tailwind CSS) a la API `StyleSheet` de React Native.

## Fase 1: Limpieza del Proyecto

- [x] Desinstalar `nativewind` y `tailwindcss`.
- [x] Eliminar `tailwind.config.js`.
- [x] Limpiar `babel.config.js` de la configuración de `nativewind`.
- [x] Eliminar el archivo `.babelrc` (si existe).

## Fase 2: Migración de Componentes

El objetivo es reemplazar el prop `className` con `style={styles.myStyle}` en cada componente y definir los estilos usando `StyleSheet.create()`.

- [x] `components/Header.tsx`
- [x] `components/InputDisplay.tsx`
- [x] `components/CurrencyOutput.tsx`
- [x] `components/Keypad.tsx`
- [x] `components/NumericInputKeypad.tsx`
- [x] `components/Menu.tsx`
- [x] `components/SettingsModal.tsx`
- [x] `components/HistoryScreen.tsx`
- [x] `components/AboutScreen.tsx`
- [x] `components/icons/*.tsx` (Revisar si necesitan estilos o si son solo SVG)
- [x] `app/(tabs)/index.tsx` (El layout principal de la calculadora)
- [x] `app/(tabs)/history.tsx`
- [x] `app/settings.tsx`
- [x] `app/_layout.tsx`
- [x] `app/(tabs)/_layout.tsx`

## Fase 3: Pruebas y Ajustes

- [ ] Realizar pruebas visuales en todas las pantallas.
- [ ] Ajustar los estilos para asegurar que la apariencia sea consistente con el diseño original.
