import type { INomination, ICreateNomination, IUpdateNomination } from '../types/Nomination';
import AzureStorageService from './AzureStorageService';

export class NominationsService {
    private static readonly STORAGE_KEY = 'nominations';
    private static readonly CONTAINER_NAME = 'nominations';
    private azureService: AzureStorageService;

    constructor() {
        this.azureService = new AzureStorageService();
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    async getNominations(): Promise<INomination[]> {
        try {
            // Try Azure Storage first
            const azureData = await this.azureService.getJsonData<INomination[]>(
                NominationsService.CONTAINER_NAME,
                'nominations.json'
            );

            if (azureData && azureData.length > 0) {
                // Sync to localStorage for offline access
                localStorage.setItem(NominationsService.STORAGE_KEY, JSON.stringify(azureData));
                return azureData;
            }
        } catch (error) {
            console.log('Azure Storage not available, using localStorage:', error);
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(NominationsService.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    async addNomination(nominationData: ICreateNomination): Promise<INomination> {
        const newNomination: INomination = {
            id: this.generateId(),
            ...nominationData,
            lastUpdated: new Date()
        };

        const nominations = await this.getNominations();
        nominations.push(newNomination);

        await this.saveNominations(nominations);
        return newNomination;
    }

    async updateNomination(updateData: IUpdateNomination): Promise<INomination> {
        const nominations = await this.getNominations();
        const index = nominations.findIndex(nom => nom.id === updateData.id);

        if (index === -1) {
            throw new Error('Nomination not found');
        }

        const updatedNomination: INomination = {
            ...nominations[index],
            ...updateData,
            lastUpdated: new Date()
        };

        nominations[index] = updatedNomination;
        await this.saveNominations(nominations);
        return updatedNomination;
    }

    async deleteNomination(id: string): Promise<void> {
        const nominations = await this.getNominations();
        const filteredNominations = nominations.filter(nom => nom.id !== id);
        await this.saveNominations(filteredNominations);
    }

    async getNominationById(id: string): Promise<INomination | undefined> {
        const nominations = await this.getNominations();
        return nominations.find(nom => nom.id === id);
    }

    private async saveNominations(nominations: INomination[]): Promise<void> {
        // Save to localStorage immediately
        localStorage.setItem(NominationsService.STORAGE_KEY, JSON.stringify(nominations));

        // Try to sync to Azure Storage
        try {
            await this.azureService.saveJsonData(
                NominationsService.CONTAINER_NAME,
                'nominations.json',
                nominations
            );
        } catch (error) {
            console.log('Failed to sync to Azure Storage:', error);
            // Continue with localStorage - data is still saved locally
        }
    }

    // Search and filter methods
    async searchNominations(query: string): Promise<INomination[]> {
        const nominations = await this.getNominations();
        const lowercaseQuery = query.toLowerCase();

        return nominations.filter(nomination =>
            nomination.memberName.toLowerCase().includes(lowercaseQuery) ||
            nomination.nominee.toLowerCase().includes(lowercaseQuery) ||
            (nomination.filingName && nomination.filingName.toLowerCase().includes(lowercaseQuery)) ||
            (nomination.filingID && nomination.filingID.toLowerCase().includes(lowercaseQuery)) ||
            (nomination.mission && nomination.mission.toLowerCase().includes(lowercaseQuery))
        );
    }

    async getNominationsByMember(memberName: string): Promise<INomination[]> {
        const nominations = await this.getNominations();
        return nominations.filter(nomination =>
            nomination.memberName.toLowerCase() === memberName.toLowerCase()
        );
    }

    async clearAllNominations(): Promise<void> {
        await this.saveNominations([]);
    }

    // Import/export functionality
    async exportNominations(): Promise<string> {
        const nominations = await this.getNominations();
        return JSON.stringify(nominations, null, 2);
    }

    async importNominations(jsonData: string): Promise<void> {
        try {
            const nominations: INomination[] = JSON.parse(jsonData);

            // Validate the data structure
            if (!Array.isArray(nominations)) {
                throw new Error('Invalid data format: expected an array');
            }

            // Basic validation of nomination objects
            for (const nomination of nominations) {
                if (!nomination.id || !nomination.memberName || !nomination.nominee) {
                    throw new Error('Invalid nomination data: missing required fields');
                }
            }

            await this.saveNominations(nominations);
        } catch (error) {
            throw new Error(`Failed to import nominations: ${error}`);
        }
    }
}

export default NominationsService;
