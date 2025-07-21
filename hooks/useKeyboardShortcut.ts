
import { useEffect } from 'react';

type Shortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
};

export const useKeyboardShortcut = (shortcuts: Shortcut[], options?: { disabled?: boolean }) => {
  const { disabled = false } = options || {};

  useEffect(() => {
    if (disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = (s.ctrlKey ?? false) === event.ctrlKey;
        const shiftMatch = (s.shiftKey ?? false) === event.shiftKey;
        const altMatch = (s.altKey ?? false) === event.altKey;
        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, disabled]);
};
