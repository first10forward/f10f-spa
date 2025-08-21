import type { INomination, ICreateNomination, IUpdateNomination } from '../types/Nomination';
import { jsonStorage, type JSONStorageConfig } from './UnifiedStorageService';
import { STORAGE_CONFIGS, GRANT_YEAR } from '../constants';

export class NominationsService {
    private static readonly STORAGE_CONFIG: JSONStorageConfig = STORAGE_CONFIGS.NOMINATIONS;

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    async getNominations(): Promise<INomination[]> {
        const nominations = await jsonStorage.loadJSON<INomination>(NominationsService.STORAGE_CONFIG);
        return nominations.map(nom => ({
            ...nom,
            lastUpdated: new Date(nom.lastUpdated)
        }));
    }

    async addNomination(nominationData: ICreateNomination): Promise<INomination> {
        const newNomination: INomination = {
            id: this.generateId(),
            ...nominationData,
            grantYear: GRANT_YEAR.CURRENT,
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
        await jsonStorage.saveJSON(NominationsService.STORAGE_CONFIG, nominations);
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

    // Import/export functionality
    async exportNominations(): Promise<string> {
        return jsonStorage.exportJSON(NominationsService.STORAGE_CONFIG);
    }

    async importNominations(jsonData: string): Promise<void> {
        await jsonStorage.importJSON(NominationsService.STORAGE_CONFIG, jsonData);
    }

    async clearAllNominations(): Promise<void> {
        await this.saveNominations([]);
    }
}

export default NominationsService;
