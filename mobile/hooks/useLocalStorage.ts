import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react--native-async-storage/async-storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          const loadedValue = JSON.parse(item);
          // If initialValue is an object, merge to preserve new keys.
          if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)) {
            setStoredValue({ ...initialValue, ...loadedValue });
          } else {
            setStoredValue(loadedValue);
          }
        }
      } catch (e) {
        console.warn(`Failed to load value for key "${key}" from async storage:`, e);
      }
    };
    loadValue();
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const save = async () => {
        try {
          const valueToStore = value instanceof Function ? value(storedValue) : value;
          setStoredValue(valueToStore);
          await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (e) {
          console.warn(`Failed to save value for key "${key}" to async storage:`, e);
        }
      };
      save();
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
