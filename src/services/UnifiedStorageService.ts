/**
 * Simple JSON Storage Utility
 * Provides consistent storage patterns for all services
 */

import AzureStorageService from './AzureStorageService';

export interface JSONStorageConfig {
    containerName: string;
    fileName: string;
    localStorageKey: string;
}

export class JSONStorageService {
    private azureService: AzureStorageService;

    constructor() {
        this.azureService = new AzureStorageService();
    }

    /**
     * Load JSON data with Azure Storage + localStorage fallback
     */
    async loadJSON<T>(config: JSONStorageConfig): Promise<T[]> {
        try {
            // Try Azure Storage first
            const azureData = await this.azureService.getJsonData<T[]>(
                config.containerName,
                config.fileName
            );

            if (azureData && Array.isArray(azureData)) {
                // Sync to localStorage for offline access
                localStorage.setItem(config.localStorageKey, JSON.stringify(azureData));
                return azureData;
            }
        } catch (error) {
            console.log('Azure Storage not available, using localStorage:', error);
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(config.localStorageKey);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save JSON data to both Azure Storage and localStorage
     */
    async saveJSON<T>(config: JSONStorageConfig, data: T[]): Promise<void> {
        // Save to localStorage immediately
        localStorage.setItem(config.localStorageKey, JSON.stringify(data));

        // Try to sync to Azure Storage
        try {
            await this.azureService.saveJsonData(
                config.containerName,
                config.fileName,
                data
            );
        } catch (error) {
            console.log('Failed to sync to Azure Storage:', error);
            // Continue - localStorage save was successful
        }
    }

    /**
     * Export data as JSON string
     */
    async exportJSON(config: JSONStorageConfig): Promise<string> {
        const data = await this.loadJSON(config);
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON string
     */
    async importJSON<T>(config: JSONStorageConfig, jsonData: string): Promise<void> {
        const data = JSON.parse(jsonData);
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON format: expected an array');
        }
        await this.saveJSON(config, data);
    }
}

// Export a singleton instance for use across services
export const jsonStorage = new JSONStorageService();
