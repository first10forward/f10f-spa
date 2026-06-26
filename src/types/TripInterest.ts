export interface ITripInterest {
  id: string;
  name: string;
  email: string;
  classYear?: string;
  message?: string;
  shareNameOptOut: boolean;
  submittedAt: Date;
}

export interface ICreateTripInterest {
  name: string;
  email: string;
  classYear?: string;
  message?: string;
  shareNameOptOut: boolean;
}
