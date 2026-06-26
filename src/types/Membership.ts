export interface IMembership {
  id: string;
  name: string;
  marriedName?: string;
  classYear: string;
  email: string;
  phone?: string;
  address?: string;
  shareEmailOptOut: boolean;
  sharePhoneOptOut: boolean;
  shareAddressOptOut: boolean;
  submittedAt: Date;
}

export interface ICreateMembership {
  name: string;
  marriedName?: string;
  classYear: string;
  email: string;
  phone?: string;
  address?: string;
  shareEmailOptOut: boolean;
  sharePhoneOptOut: boolean;
  shareAddressOptOut: boolean;
}
