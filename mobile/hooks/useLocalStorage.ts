import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue instanceof Function ? initialValue() : initialValue);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading AsyncStorage key "${key}":`, error);
      }
    };

    loadStoredValue();
  }, [key]);

  useEffect(() => {
    const saveValue = async () => {
        try {
            const valueToStore = storedValue;
            await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting AsyncStorage key "${key}":`, error);
        }
    };

    saveValue();
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}