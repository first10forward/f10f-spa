import type { AddressBookEntry, CreateAddressBookEntry, UpdateAddressBookEntry } from '../types/AddressBook';
import { STORAGE_KEYS } from '../constants';

// Type declarations for File System Access API
declare global {
    interface Window {
        showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
        showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
    }
}

interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: FilePickerAcceptType[];
}

interface OpenFilePickerOptions {
    types?: FilePickerAcceptType[];
}

interface FilePickerAcceptType {
    description: string;
    accept: Record<string, string[]>;
}

class AddressBookService {
    private fileHandle: FileSystemFileHandle | null = null;
    private readonly fileName = 'f10f-address-book.json';

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Check if File System Access API is supported
    private supportsFileSystemAccess(): boolean {
        return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
    }

    // Load from file if available, otherwise from localStorage
    private async loadEntries(): Promise<AddressBookEntry[]> {
        try {
            // First try to load from file if we have a file handle
            if (this.fileHandle) {
                const fileEntries = await this.loadFromFile();
                if (fileEntries.length > 0) {
                    return fileEntries;
                }
            }

            // Fallback to localStorage
            const data = localStorage.getItem(STORAGE_KEYS.ADDRESS_BOOK);
            if (!data) return [];

            const entries = JSON.parse(data);
            return entries.map((entry: any) => ({
                ...entry,
                lastUpdated: new Date(entry.lastUpdated)
            }));
        } catch (error) {
            console.error('Error loading address book entries:', error);
            return [];
        }
    }

    // Load entries from JSON file
    private async loadFromFile(): Promise<AddressBookEntry[]> {
        try {
            if (!this.fileHandle) return [];

            const file = await this.fileHandle.getFile();
            const text = await file.text();
            const entries = JSON.parse(text);

            return entries.map((entry: any) => ({
                ...entry,
                lastUpdated: new Date(entry.lastUpdated)
            }));
        } catch (error) {
            console.error('Error loading from file:', error);
            return [];
        }
    }

    // Save to both file and localStorage
    private async saveEntries(entries: AddressBookEntry[]): Promise<void> {
        try {
            // Always save to localStorage as backup
            localStorage.setItem(STORAGE_KEYS.ADDRESS_BOOK, JSON.stringify(entries));

            // Also save to file if we have a file handle
            if (this.fileHandle) {
                await this.saveToFile(entries);
            }
        } catch (error) {
            console.error('Error saving address book entries:', error);
            throw new Error('Failed to save address book entries');
        }
    }

    // Save entries to JSON file
    private async saveToFile(entries: AddressBookEntry[]): Promise<void> {
        try {
            if (!this.fileHandle) return;

            const writable = await this.fileHandle.createWritable();
            await writable.write(JSON.stringify(entries, null, 2));
            await writable.close();
        } catch (error) {
            console.error('Error saving to file:', error);
            // Don't throw here - localStorage is still working
        }
    }

    // Initialize file access - let user pick a file location
    async initializeFileAccess(): Promise<boolean> {
        try {
            if (!this.supportsFileSystemAccess() || !window.showSaveFilePicker) {
                console.log('File System Access API not supported');
                return false;
            }

            this.fileHandle = await window.showSaveFilePicker({
                suggestedName: this.fileName,
                types: [{
                    description: 'JSON files',
                    accept: { 'application/json': ['.json'] }
                }]
            });

            // Load existing data from localStorage and save to file
            const existingEntries = await this.getAllEntries();
            if (existingEntries.length > 0) {
                await this.saveToFile(existingEntries);
            }

            return true;
        } catch (error) {
            const err = error as Error;
            if (err.name !== 'AbortError') {
                console.error('Error initializing file access:', error);
            }
            return false;
        }
    }

    // Load from an existing file
    async loadFromExistingFile(): Promise<boolean> {
        try {
            if (!this.supportsFileSystemAccess() || !window.showOpenFilePicker) {
                return false;
            }

            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON files',
                    accept: { 'application/json': ['.json'] }
                }]
            });

            this.fileHandle = fileHandle;
            const entries = await this.loadFromFile();

            // Save to localStorage as well
            localStorage.setItem(STORAGE_KEYS.ADDRESS_BOOK, JSON.stringify(entries));

            return true;
        } catch (error) {
            const err = error as Error;
            if (err.name !== 'AbortError') {
                console.error('Error loading from file:', error);
            }
            return false;
        }
    }

    // Get file status
    getFileStatus(): { hasFile: boolean; fileName: string | null } {
        return {
            hasFile: !!this.fileHandle,
            fileName: this.fileHandle ? this.fileName : null
        };
    }

    async getAllEntries(): Promise<AddressBookEntry[]> {
        return this.loadEntries();
    }

    async getEntryById(id: string): Promise<AddressBookEntry | null> {
        const entries = await this.loadEntries();
        return entries.find(entry => entry.id === id) || null;
    }

    async createEntry(entryData: CreateAddressBookEntry): Promise<AddressBookEntry> {
        const entries = await this.loadEntries();

        const newEntry: AddressBookEntry = {
            id: this.generateId(),
            ...entryData,
            lastUpdated: new Date()
        };

        entries.push(newEntry);
        await this.saveEntries(entries);

        return newEntry;
    }

    async updateEntry(updateData: UpdateAddressBookEntry): Promise<AddressBookEntry | null> {
        const entries = await this.loadEntries();
        const index = entries.findIndex(entry => entry.id === updateData.id);

        if (index === -1) {
            return null;
        }

        const updatedEntry: AddressBookEntry = {
            ...entries[index],
            ...updateData,
            lastUpdated: new Date()
        };

        entries[index] = updatedEntry;
        await this.saveEntries(entries);

        return updatedEntry;
    }

    async deleteEntry(id: string): Promise<boolean> {
        const entries = await this.loadEntries();
        const index = entries.findIndex(entry => entry.id === id);

        if (index === -1) {
            return false;
        }

        entries.splice(index, 1);
        await this.saveEntries(entries);

        return true;
    }

    async searchEntries(query: string): Promise<AddressBookEntry[]> {
        const entries = await this.loadEntries();
        const lowercaseQuery = query.toLowerCase();

        return entries.filter(entry =>
            entry.name.toLowerCase().includes(lowercaseQuery) ||
            (entry.email && entry.email.toLowerCase().includes(lowercaseQuery)) ||
            entry.year.toString().includes(lowercaseQuery) ||
            (entry.cellPhone && entry.cellPhone.includes(query))
        );
    }

    // Utility method to export data as JSON file
    exportToJson(): string {
        const entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESS_BOOK) || '[]');
        return JSON.stringify(entries, null, 2);
    }

    // Utility method to import data from JSON
    async importFromJson(jsonData: string): Promise<void> {
        try {
            const entries = JSON.parse(jsonData);

            // Validate the data structure
            const validatedEntries = entries.map((entry: any) => ({
                ...entry,
                lastUpdated: new Date(entry.lastUpdated || new Date())
            }));

            await this.saveEntries(validatedEntries);
        } catch (error) {
            console.error('Error importing JSON data:', error);
            throw new Error('Invalid JSON data format');
        }
    }
}

export const addressBookService = new AddressBookService();
