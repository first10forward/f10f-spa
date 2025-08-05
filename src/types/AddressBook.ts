export interface IAddressBookEntry {
    id: string;
    name: string;
    year: number;
    email?: string;
    cellPhone?: string;
    mailingAddress?: string;
    lastUpdated: Date;
}

export interface ICreateAddressBookEntry {
    name: string;
    year: number;
    email?: string;
    cellPhone?: string;
    mailingAddress?: string;
}

export interface IUpdateAddressBookEntry extends Partial<ICreateAddressBookEntry> {
    id: string;
}
