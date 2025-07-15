export interface AddressBookEntry {
    id: string;
    name: string;
    year: number;
    email?: string;
    cellPhone?: string;
    mailingAddress?: string;
    lastUpdated: Date;
}

export interface CreateAddressBookEntry {
    name: string;
    year: number;
    email?: string;
    cellPhone?: string;
    mailingAddress?: string;
}

export interface UpdateAddressBookEntry extends Partial<CreateAddressBookEntry> {
    id: string;
}
