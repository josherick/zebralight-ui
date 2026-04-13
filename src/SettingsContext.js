// @flow
import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'zebralight-ui-settings';

const DEFAULTS = {
  timeoutMultiplier: '1x',
  timeoutIndicator: 'subtle',
  hideG6G7: false,
  selectedLamp: 'H604c 18650 XHP50.2 Flood 4000K High CRI Headlamp',
};

export type SettingsType = typeof DEFAULTS;

function loadSettings(): SettingsType {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULTS, ...JSON.parse(stored) };
    }
  } catch (e) {
    // Ignore
  }
  return { ...DEFAULTS };
}

function saveSettings(settings: SettingsType): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // Ignore
  }
}

type SettingsContextType = {
  settings: SettingsType,
  updateSetting: (key: string, value: any) => void,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULTS,
  updateSetting: () => {},
});

export function SettingsProvider({
  children,
}: {
  children: React.Node,
}): React.Element<typeof SettingsContext.Provider> {
  const [settings, setSettings] = useState<SettingsType>(loadSettings);

  const updateSetting = useCallback((key: string, value: any) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  return useContext(SettingsContext);
}
