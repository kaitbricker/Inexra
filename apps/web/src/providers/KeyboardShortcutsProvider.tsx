import { createContext, useContext, useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsContextType {
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (key: string) => void;
  getShortcuts: () => Shortcut[];
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const shortcuts = new Map<string, Shortcut>();

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    const key = getShortcutKey(shortcut);
    shortcuts.set(key, shortcut);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    shortcuts.delete(key);
  }, []);

  const getShortcuts = useCallback(() => {
    return Array.from(shortcuts.values());
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = getShortcutKey({
        key: event.key,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      });

      const shortcut = shortcuts.get(key);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <KeyboardShortcutsContext.Provider
      value={{ registerShortcut, unregisterShortcut, getShortcuts }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
}

function getShortcutKey(shortcut: {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}): string {
  const modifiers = [];
  if (shortcut.ctrlKey) modifiers.push('ctrl');
  if (shortcut.shiftKey) modifiers.push('shift');
  if (shortcut.altKey) modifiers.push('alt');
  return [...modifiers, shortcut.key.toLowerCase()].join('+');
}

// Predefined shortcuts
export const SHORTCUTS = {
  TOGGLE_THEME: {
    key: 'd',
    ctrlKey: true,
    description: 'Toggle dark mode',
  },
  NEW_MESSAGE: {
    key: 'n',
    ctrlKey: true,
    description: 'New message',
  },
  SEARCH: {
    key: 'f',
    ctrlKey: true,
    description: 'Search',
  },
  REFRESH: {
    key: 'r',
    ctrlKey: true,
    description: 'Refresh data',
  },
  HELP: {
    key: '?',
    description: 'Show keyboard shortcuts',
  },
} as const;
