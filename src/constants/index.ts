// Application constants
export const GRADUATION_YEARS = {
    MIN: 1978,
    MAX: 1994
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

// UI constants
export const UI = {
    ITEMS_PER_PAGE: 50,
    SEARCH_DEBOUNCE_MS: 300
} as const;
