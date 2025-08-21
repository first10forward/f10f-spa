// Application constants
export const GRADUATION_YEARS = {
    MIN: 1978,
    MAX: 1994
} as const;

export const GRANT_YEAR = {
    CURRENT: 2025
} as const;

// Validation constants
export const VALIDATION = {
    EMAIL_REGEX: /\S+@\S+\.\S+/,
    PHONE_FORMATS: {
        // Add phone format validation patterns if needed
    }
} as const;

// Storage keys
export const STORAGE_KEYS = {
    ADDRESS_BOOK: 'addressbook_entries'
} as const;

// JSON Storage Configurations for services
export const STORAGE_CONFIGS = {
    ADDRESS_BOOK: {
        containerName: 'f10f-data',
        fileName: 'addressbook.json',
        localStorageKey: 'addressbook_entries'
    },
    NOMINATIONS: {
        containerName: 'f10f-data',
        fileName: 'nominations.json',
        localStorageKey: 'nominations'
    },
    NOMINATIONS_SETTINGS: {
        containerName: 'f10f-data',
        fileName: 'settings.json',
        localStorageKey: 'settings'
    },
    DONATIONS: {
        containerName: 'f10f-data',
        fileName: 'donations.json',
        localStorageKey: 'donations'
    }
} as const;

// Default messages and settings
export const DEFAULTS = {
    NOMINATIONS: {
        CLOSED_MESSAGE: 'Nominations are currently closed. Please check back later.',
        IS_OPEN: false
    }
} as const;

// UI constants
export const UI = {
    ITEMS_PER_PAGE: 50,
    SEARCH_DEBOUNCE_MS: 300
} as const;
