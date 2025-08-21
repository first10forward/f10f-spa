import type { IAddressBookEntry, ICreateAddressBookEntry, IUpdateAddressBookEntry } from '../types/AddressBook';
import { jsonStorage, type JSONStorageConfig } from './UnifiedStorageService';
import { STORAGE_CONFIGS } from '../constants';

export class AddressBookService {
    private static readonly STORAGE_CONFIG: JSONStorageConfig = STORAGE_CONFIGS.ADDRESS_BOOK;

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async getAllEntries(): Promise<IAddressBookEntry[]> {
        const entries = await jsonStorage.loadJSON<IAddressBookEntry>(AddressBookService.STORAGE_CONFIG);
        return entries.map(entry => ({
            ...entry,
            lastUpdated: new Date(entry.lastUpdated)
        }));
    }

    async getEntryById(id: string): Promise<IAddressBookEntry | null> {
        const entries = await this.getAllEntries();
        return entries.find(entry => entry.id === id) || null;
    }

    async createEntry(entryData: ICreateAddressBookEntry): Promise<IAddressBookEntry> {
        const entries = await this.getAllEntries();

        const newEntry: IAddressBookEntry = {
            id: this.generateId(),
            ...entryData,
            lastUpdated: new Date()
        };

        entries.push(newEntry);
        await this.saveEntries(entries);

        return newEntry;
    }

    async updateEntry(updateData: IUpdateAddressBookEntry): Promise<IAddressBookEntry | null> {
        const entries = await this.getAllEntries();
        const index = entries.findIndex(entry => entry.id === updateData.id);

        if (index === -1) {
            return null;
        }

        const updatedEntry: IAddressBookEntry = {
            ...entries[index],
            ...updateData,
            lastUpdated: new Date()
        };

        entries[index] = updatedEntry;
        await this.saveEntries(entries);

        return updatedEntry;
    }

    async deleteEntry(id: string): Promise<boolean> {
        const entries = await this.getAllEntries();
        const index = entries.findIndex(entry => entry.id === id);

        if (index === -1) {
            return false;
        }

        entries.splice(index, 1);
        await this.saveEntries(entries);

        return true;
    }

    async searchEntries(query: string): Promise<IAddressBookEntry[]> {
        const entries = await this.getAllEntries();
        const lowercaseQuery = query.toLowerCase();

        return entries.filter(entry =>
            entry.name.toLowerCase().includes(lowercaseQuery) ||
            (entry.email && entry.email.toLowerCase().includes(lowercaseQuery)) ||
            entry.year.toString().includes(lowercaseQuery) ||
            (entry.cellPhone && entry.cellPhone.includes(query))
        );
    }

    private async saveEntries(entries: IAddressBookEntry[]): Promise<void> {
        await jsonStorage.saveJSON(AddressBookService.STORAGE_CONFIG, entries);
    }

    // Import/export functionality
    async exportEntries(): Promise<string> {
        return jsonStorage.exportJSON(AddressBookService.STORAGE_CONFIG);
    }

    async importEntries(jsonData: string): Promise<void> {
        await jsonStorage.importJSON(AddressBookService.STORAGE_CONFIG, jsonData);
    }

    async clearAllEntries(): Promise<void> {
        await this.saveEntries([]);
    }
}

export const addressBookService = new AddressBookService();
