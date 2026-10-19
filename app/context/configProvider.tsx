'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

export type ConfigParameters = {
    latitude: number;
    longitude: number;
};

type ConfigContextType = {
    configValues: ConfigParameters;
    updateConfig: (newValues: ConfigParameters) => void;
}

const STORAGE_KEY = 'configValues';

const DEFAULT_CONFIG: ConfigParameters = {
    latitude: 40,
    longitude: -74
};

export function isValidLatitude(latitude: number) {
    return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(longitude: number) {
    return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

// Falls back to the defaults for missing or corrupt saved settings, so bad data can't break the page.
function parseConfig(configString: string | null): ConfigParameters {
    if (configString === null) {
        return DEFAULT_CONFIG;
    }
    try {
        const { latitude, longitude } = JSON.parse(configString);
        if (isValidLatitude(latitude) && isValidLongitude(longitude)) {
            return { latitude, longitude };
        }
    } catch {
        // Fall through to the defaults.
    }
    return DEFAULT_CONFIG;
}

// The saved settings live in localStorage, which React reads as an external store.
const listeners = new Set<() => void>();

// Holds the settings for this session when localStorage is unavailable, for example in some private browsing modes.
let fallbackConfigString: string | null = null;

function subscribe(listener: () => void) {
    listeners.add(listener);
    // Pick up changes made in other tabs.
    window.addEventListener('storage', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

function getSnapshot() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return fallbackConfigString;
    }
}

// The static export is prerendered without localStorage, so it renders the defaults.
function getServerSnapshot() {
    return null;
}

function updateConfig(newValues: ConfigParameters) {
    const configString = JSON.stringify(newValues);
    fallbackConfigString = configString;
    try {
        localStorage.setItem(STORAGE_KEY, configString);
    } catch {
        // Keep the fallback copy.
    }
    listeners.forEach(listener => listener());
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export function ConfigProvider({ children }) {
    const configString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const configValues = useMemo(() => parseConfig(configString), [configString]);

    return (
        <ConfigContext.Provider value={{ configValues, updateConfig }}>{children}</ConfigContext.Provider>
    );
}

export function useConfigContext() {
    return useContext(ConfigContext);
}
