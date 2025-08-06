export interface INomination {
    id: string;
    memberName: string,
    memberEmail: string,
    nominee: string,
    website?: string,
    filingName?: string,
    filingID?: string,
    mission?: string,
    attestation: boolean,
    lastUpdated: Date
}

export interface ICreateNomination {
    memberName: string,
    memberEmail: string,
    nominee: string,
    website?: string,
    filingName?: string,
    filingID?: string,
    mission?: string,
    attestation: boolean
}

export interface IUpdateNomination extends Partial<ICreateNomination> {
    id: string;
}