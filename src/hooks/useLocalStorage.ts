import { useState, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialValue;
      const parsed = JSON.parse(stored);
      return parsed ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  // Wrap setState to sync localStorage immediately
  const setValueAndSync = useCallback((newValue: React.SetStateAction<T>) => {
    setValue((prev) => {
      const resolved = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch (e) {
        console.error(`Failed to save ${key} to localStorage:`, e);
      }
      return resolved;
    });
  }, [key]);

  return [value, setValueAndSync];
}
