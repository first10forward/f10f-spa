import AzureStorageService from './AzureStorageService';

export interface INominationsSettings {
    isOpen: boolean;
    closedMessage?: string;
    lastUpdated: Date;
}

export class NominationsSettingsService {
    private static readonly STORAGE_KEY = 'nominations-settings';
    private static readonly CONTAINER_NAME = 'nominations';
    private static readonly SETTINGS_FILE = 'settings.json';
    private azureService: AzureStorageService;

    constructor() {
        this.azureService = new AzureStorageService();
    }

    async getSettings(): Promise<INominationsSettings> {
        try {
            // Try Azure Storage first
            const azureData = await this.azureService.getJsonData<INominationsSettings>(
                NominationsSettingsService.CONTAINER_NAME,
                NominationsSettingsService.SETTINGS_FILE
            );

            if (azureData) {
                // Sync to localStorage for offline access
                localStorage.setItem(NominationsSettingsService.STORAGE_KEY, JSON.stringify(azureData));
                return azureData;
            }
        } catch (error) {
            console.log('Azure Storage not available for settings, using localStorage:', error);
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(NominationsSettingsService.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }

        // Default settings - nominations are closed by default
        return {
            isOpen: false,
            closedMessage: 'Nominations are currently closed. Please check back later.',
            lastUpdated: new Date()
        };
    }

    async updateSettings(settings: Partial<INominationsSettings>): Promise<INominationsSettings> {
        const currentSettings = await this.getSettings();

        const updatedSettings: INominationsSettings = {
            ...currentSettings,
            ...settings,
            lastUpdated: new Date()
        };

        await this.saveSettings(updatedSettings);
        return updatedSettings;
    }

    async closeNominations(message?: string): Promise<INominationsSettings> {
        return this.updateSettings({
            isOpen: false,
            closedMessage: message || 'Nominations are currently closed. Please check back later.'
        });
    }

    async openNominations(): Promise<INominationsSettings> {
        return this.updateSettings({
            isOpen: true
        });
    }

    private async saveSettings(settings: INominationsSettings): Promise<void> {
        // Save to localStorage immediately
        localStorage.setItem(NominationsSettingsService.STORAGE_KEY, JSON.stringify(settings));

        // Try to sync to Azure Storage
        try {
            await this.azureService.saveJsonData(
                NominationsSettingsService.CONTAINER_NAME,
                NominationsSettingsService.SETTINGS_FILE,
                settings
            );
        } catch (error) {
            console.log('Failed to sync settings to Azure Storage:', error);
            // Continue with localStorage - data is still saved locally
        }
    }
}

export default NominationsSettingsService;
