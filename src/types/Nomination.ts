export interface Nomination {
    nominee: string,
    memberName: string,
    filingName: string,
    filingID?: string,
    mission?: string,
    submittedDate: string
}

export interface CreateNomination {
    nominee: string,
    memberName: string,
    filingName?: string,
    filingID?: string,
    mission?: string
}
