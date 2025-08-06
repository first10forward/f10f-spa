/**
 * Azure Storage Service for handling blob storage operations
 * Provides a cloud storage backend with localStorage fallback
 */

export class AzureStorageService {
    private accountName: string;
    private sasToken: string;
    private containerName: string;

    constructor() {
        // Get configuration from environment variables
        this.accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME || '';
        this.sasToken = import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN || '';
        this.containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'f10f-data';
    }

    /**
     * Check if Azure Storage is properly configured
     */
    private isConfigured(): boolean {
        return !!(this.accountName && this.sasToken);
    }

    /**
     * Get the blob URL for a specific container and filename
     */
    private getBlobUrl(containerName: string, fileName: string): string {
        return `https://${this.accountName}.blob.core.windows.net/${containerName}/${fileName}`;
    }

    /**
     * Retrieve JSON data from Azure Blob Storage
     */
    async getJsonData<T>(containerName: string, fileName: string): Promise<T | null> {
        if (!this.isConfigured()) {
            throw new Error('Azure Storage not configured');
        }

        try {
            const url = `${this.getBlobUrl(containerName, fileName)}?${this.sasToken}`;
            const response = await fetch(url);

            if (response.status === 404) {
                // File doesn't exist yet - this is normal for new containers
                return null;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch from Azure Storage: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            console.error('Error fetching from Azure Storage:', error);
            throw error;
        }
    }

    /**
     * Save JSON data to Azure Blob Storage
     */
    async saveJsonData<T>(containerName: string, fileName: string, data: T): Promise<void> {
        if (!this.isConfigured()) {
            throw new Error('Azure Storage not configured');
        }

        try {
            const url = `${this.getBlobUrl(containerName, fileName)}?${this.sasToken}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-ms-blob-type': 'BlockBlob'
                },
                body: JSON.stringify(data, null, 2)
            });

            if (!response.ok) {
                throw new Error(`Failed to save to Azure Storage: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error saving to Azure Storage:', error);
            throw error;
        }
    }

    /**
     * Delete a blob from Azure Storage
     */
    async deleteBlob(containerName: string, fileName: string): Promise<void> {
        if (!this.isConfigured()) {
            throw new Error('Azure Storage not configured');
        }

        try {
            const url = `${this.getBlobUrl(containerName, fileName)}?${this.sasToken}`;

            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (!response.ok && response.status !== 404) {
                throw new Error(`Failed to delete from Azure Storage: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting from Azure Storage:', error);
            throw error;
        }
    }

    /**
     * Check if a blob exists in Azure Storage
     */
    async blobExists(containerName: string, fileName: string): Promise<boolean> {
        if (!this.isConfigured()) {
            return false;
        }

        try {
            const url = `${this.getBlobUrl(containerName, fileName)}?${this.sasToken}`;
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('Error checking blob existence:', error);
            return false;
        }
    }
}

export default AzureStorageService;
