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

  private static async post(url: string, data: unknown): Promise<boolean> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        console.error(`[F10F] ${url} failed (${res.status}):`, body.error ?? body);
        return false;
      }
      const result = await res.json() as { success: boolean };
      return result.success;
    } catch (err) {
      console.error(`[F10F] ${url} threw:`, err);
      return false;
    }
  }

  static submitNomination(
    data: ICreateNomination & { turnstileToken: string; turnstileUnavailable?: boolean; honeypot?: string }
  ): Promise<boolean> {
    return SubmissionService.post('/api/nominate', data);
  }

  static submitMembership(
    data: ICreateMembership & { turnstileToken: string; turnstileUnavailable?: boolean; honeypot?: string }
  ): Promise<boolean> {
    return SubmissionService.post('/api/membership', data);
  }

  static submitTripInterest(
    data: ICreateTripInterest & { turnstileToken: string; turnstileUnavailable?: boolean; honeypot?: string; shareNameOptOut: boolean }
  ): Promise<boolean> {
    return SubmissionService.post('/api/trip-interest', data);
  }
}

export default SubmissionService;
