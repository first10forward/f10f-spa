import { jsonStorage } from './UnifiedStorageService';
import { STORAGE_CONFIGS, DEFAULTS } from '../constants';

export interface INominationsSettings {
    isOpen: boolean;
    closedMessage?: string;
    lastUpdated: Date;
}

export class NominationsSettingsService {
    private static readonly STORAGE_CONFIG = STORAGE_CONFIGS.NOMINATIONS_SETTINGS;

    async getSettings(): Promise<INominationsSettings> {
        try {
            const settings = await jsonStorage.loadJSON<INominationsSettings>(
                NominationsSettingsService.STORAGE_CONFIG
            );

            if (settings.length > 0) {
                const settingsData = settings[0];
                return {
                    ...settingsData,
                    lastUpdated: new Date(settingsData.lastUpdated)
                };
            }
        } catch (error) {
            console.log('Failed to load settings, using defaults:', error);
        }

        // Default settings - nominations are closed by default
        return {
            isOpen: DEFAULTS.NOMINATIONS.IS_OPEN,
            closedMessage: DEFAULTS.NOMINATIONS.CLOSED_MESSAGE,
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
            closedMessage: message || DEFAULTS.NOMINATIONS.CLOSED_MESSAGE
        });
    }

    async openNominations(): Promise<INominationsSettings> {
        return this.updateSettings({
            isOpen: true
        });
    }

    private async saveSettings(settings: INominationsSettings): Promise<void> {
        // Save as array with single settings object for consistency with JSON storage pattern
        await jsonStorage.saveJSON(NominationsSettingsService.STORAGE_CONFIG, [settings]);
    }
}

export default NominationsSettingsService;
