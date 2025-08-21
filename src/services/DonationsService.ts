import type { IAddressBookEntry, ICreateAddressBookEntry, IUpdateAddressBookEntry } from '../types/AddressBook';
import { jsonStorage, type JSONStorageConfig } from './UnifiedStorageService';
import { STORAGE_CONFIGS } from '../constants';

export class DonationsService {
    private static readonly STORAGE_CONFIG: JSONStorageConfig = STORAGE_CONFIGS.DONATIONS;

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async getAllDonations(): Promise<any[]> {
        return jsonStorage.loadJSON(DonationsService.STORAGE_CONFIG);
    }

    async saveDonations(donations: any[]): Promise<void> {
        await jsonStorage.saveJSON(DonationsService.STORAGE_CONFIG, donations);
    }

    async exportDonations(): Promise<string> {
        return jsonStorage.exportJSON(DonationsService.STORAGE_CONFIG);
    }

    async importDonations(jsonData: string): Promise<void> {
        await jsonStorage.importJSON(DonationsService.STORAGE_CONFIG, jsonData);
    }

    async clearAllDonations(): Promise<void> {
        await this.saveDonations([]);
    }
}

export const donationsService = new DonationsService();
