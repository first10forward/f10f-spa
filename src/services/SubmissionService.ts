import type { ICreateTripInterest } from '../types/TripInterest';
import type { ICreateNomination } from '../types/Nomination';
import type { ICreateMembership } from '../types/Membership';

class SubmissionService {
  static async verifyTurnstile(token: string): Promise<boolean> {
    try {
      const res = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) return false;
      const data = await res.json() as { success: boolean };
      return data.success;
    } catch {
      return false;
    }
  }

  static async submitNomination(
    data: ICreateNomination & { turnstileToken: string; honeypot?: string }
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      const result = await res.json() as { success: boolean };
      return result.success;
    } catch {
      return false;
    }
  }

  static async submitMembership(
    data: ICreateMembership & { turnstileToken: string; honeypot?: string }
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      const result = await res.json() as { success: boolean };
      return result.success;
    } catch {
      return false;
    }
  }

  static async submitTripInterest(
    data: ICreateTripInterest & { turnstileToken: string; honeypot?: string; shareNameOptOut: boolean }
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/trip-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      const result = await res.json() as { success: boolean };
      return result.success;
    } catch {
      return false;
    }
  }
}

export default SubmissionService;
