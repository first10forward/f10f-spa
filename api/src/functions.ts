import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { EmailClient } from '@azure/communication-email';
import { AzureKeyCredential } from '@azure/core-auth';

const MEMBERSHIP_EMAIL = 'hello@first10forward.org';
const NOMINATIONS_EMAIL = 'nominations@first10forward.org';
const TRIP_INTEREST_EMAIL = 'hello@first10forward.org';
const FROM_EMAIL = 'DoNotReply@first10forward.org';

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip verification in dev mode

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

// POST /api/verify-turnstile
// Used by the nomination form to verify the token server-side before sending email
app.http('verifyTurnstile', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'verify-turnstile',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    let body: { token?: string };
    try {
      body = await request.json() as { token?: string };
    } catch {
      return { status: 400, jsonBody: { success: false, error: 'Invalid request body' } };
    }

    if (!body.token) {
      return { status: 400, jsonBody: { success: false, error: 'Missing token' } };
    }

    try {
      const success = await verifyTurnstileToken(body.token);
      return { jsonBody: { success } };
    } catch (err) {
      context.error('Turnstile verification error:', err);
      return { status: 500, jsonBody: { success: false, error: 'Verification failed' } };
    }
  },
});

// POST /api/trip-interest
// Verifies Turnstile + honeypot, then emails the submission to the team
app.http('tripInterest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'trip-interest',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    let body: {
      name?: string;
      email?: string;
      classYear?: string;
      message?: string;
      shareNameOptOut?: boolean;
      turnstileToken?: string;
      honeypot?: string;
    };

    try {
      body = await request.json() as typeof body;
    } catch {
      return { status: 400, jsonBody: { success: false, error: 'Invalid request body' } };
    }

    // Honeypot: silently succeed so bots don't know they were caught
    if (body.honeypot) {
      return { jsonBody: { success: true } };
    }

    const { name, email, classYear, message, shareNameOptOut, turnstileToken } = body;

    if (!name?.trim() || !email?.trim()) {
      return { status: 400, jsonBody: { success: false, error: 'Name and email are required' } };
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return { status: 400, jsonBody: { success: false, error: 'Invalid email address' } };
    }

    // Verify Turnstile — if secret key is configured, token is required
    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return { status: 400, jsonBody: { success: false, error: 'Security verification required' } };
      }
      const verified = await verifyTurnstileToken(turnstileToken);
      if (!verified) {
        return { status: 400, jsonBody: { success: false, error: 'Security verification failed' } };
      }
    }

    // Send email notification (best-effort — don't fail the submission if email fails)
    const endpoint = process.env.AZURE_COMMUNICATION_ENDPOINT;
    const accessKey = process.env.AZURE_COMMUNICATION_ACCESS_KEY;

    if (endpoint && accessKey) {
      try {
        const client = new EmailClient(endpoint, new AzureKeyCredential(accessKey));
        const timestamp = new Date().toLocaleString();

        const lines = [
          'New Trip Interest Submission',
          `Submitted: ${timestamp}`,
          '',
          `Name: ${name}`,
          `Email: ${email}`,
          classYear ? `Class Year: ${classYear}` : null,
          `Name sharing: ${shareNameOptOut ? 'OPT OUT — do not share name with attendees' : 'OK to share'}`,
          message ? `\nMessage:\n${message}` : null,
        ].filter(Boolean) as string[];

        const poller = await client.beginSend({
          senderAddress: FROM_EMAIL,
          content: {
            subject: `Trip Interest Signup: ${name}`,
            plainText: lines.join('\n'),
          },
          recipients: {
            to: [{ address: TRIP_INTEREST_EMAIL }],
            cc: [{ address: email }],
          },
        });
        await poller.pollUntilDone();
      } catch (err) {
        context.error('Failed to send trip interest email:', err);
      }
    }

    return { jsonBody: { success: true } };
  },
});

// POST /api/nominate
// Verifies Turnstile + honeypot, then emails the nomination to the team
app.http('nominate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'nominate',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    let body: {
      memberName?: string;
      memberEmail?: string;
      nominee?: string;
      website?: string;
      filingName?: string;
      filingID?: string;
      mission?: string;
      attestation?: boolean;
      turnstileToken?: string;
      honeypot?: string;
    };

    try {
      body = await request.json() as typeof body;
    } catch {
      return { status: 400, jsonBody: { success: false, error: 'Invalid request body' } };
    }

    if (body.honeypot) {
      return { jsonBody: { success: true } };
    }

    const { memberName, memberEmail, nominee, website, filingName, filingID, mission, attestation, turnstileToken } = body;

    if (!memberName?.trim() || !memberEmail?.trim() || !nominee?.trim()) {
      return { status: 400, jsonBody: { success: false, error: 'Missing required fields' } };
    }

    if (!/\S+@\S+\.\S+/.test(memberEmail)) {
      return { status: 400, jsonBody: { success: false, error: 'Invalid email address' } };
    }

    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return { status: 400, jsonBody: { success: false, error: 'Security verification required' } };
      }
      const verified = await verifyTurnstileToken(turnstileToken);
      if (!verified) {
        return { status: 400, jsonBody: { success: false, error: 'Security verification failed' } };
      }
    }

    const endpoint = process.env.AZURE_COMMUNICATION_ENDPOINT;
    const accessKey = process.env.AZURE_COMMUNICATION_ACCESS_KEY;

    if (endpoint && accessKey) {
      try {
        const client = new EmailClient(endpoint, new AzureKeyCredential(accessKey));
        const timestamp = new Date().toLocaleString();

        const lines = [
          'New Organization Nomination',
          `Submitted: ${timestamp}`,
          '',
          `Nominating Member: ${memberName}`,
          `Member Email: ${memberEmail}`,
          '',
          `Organization: ${nominee}`,
          website ? `Website: ${website}` : null,
          filingName ? `501(c)(3) Filing Name: ${filingName}` : null,
          filingID ? `501(c)(3) Filing ID/EIN: ${filingID}` : null,
          mission ? `\nMission/Notes:\n${mission}` : null,
          '',
          `Personal/Professional Connection: ${attestation ? 'YES' : 'NO'}`,
        ].filter(Boolean) as string[];

        const poller = await client.beginSend({
          senderAddress: FROM_EMAIL,
          content: {
            subject: `New Nomination: ${nominee}`,
            plainText: lines.join('\n'),
          },
          recipients: {
            to: [{ address: NOMINATIONS_EMAIL }],
            cc: [{ address: memberEmail }],
          },
        });
        await poller.pollUntilDone();
      } catch (err) {
        context.error('Failed to send nomination email:', err);
      }
    }

    return { jsonBody: { success: true } };
  },
});

// POST /api/membership
app.http('membership', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'membership',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    let body: {
      name?: string;
      marriedName?: string;
      classYear?: string;
      email?: string;
      phone?: string;
      address?: string;
      shareEmailOptOut?: boolean;
      sharePhoneOptOut?: boolean;
      shareAddressOptOut?: boolean;
      turnstileToken?: string;
      honeypot?: string;
    };

    try {
      body = await request.json() as typeof body;
    } catch {
      return { status: 400, jsonBody: { success: false, error: 'Invalid request body' } };
    }

    if (body.honeypot) {
      return { jsonBody: { success: true } };
    }

    const { name, marriedName, classYear, email, phone, address,
            shareEmailOptOut, sharePhoneOptOut, shareAddressOptOut, turnstileToken } = body;

    if (!name?.trim() || !email?.trim() || !classYear) {
      return { status: 400, jsonBody: { success: false, error: 'Name, email, and class year are required' } };
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return { status: 400, jsonBody: { success: false, error: 'Invalid email address' } };
    }

    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return { status: 400, jsonBody: { success: false, error: 'Security verification required' } };
      }
      const verified = await verifyTurnstileToken(turnstileToken);
      if (!verified) {
        return { status: 400, jsonBody: { success: false, error: 'Security verification failed' } };
      }
    }

    const endpoint = process.env.AZURE_COMMUNICATION_ENDPOINT;
    const accessKey = process.env.AZURE_COMMUNICATION_ACCESS_KEY;

    if (endpoint && accessKey) {
      try {
        const client = new EmailClient(endpoint, new AzureKeyCredential(accessKey));
        const timestamp = new Date().toLocaleString();

        const lines = [
          'New Membership Form Submission',
          `Submitted: ${timestamp}`,
          '',
          `Name: ${name}`,
          marriedName ? `Married Name: ${marriedName}` : null,
          `Class Year: ${classYear}`,
          `Email: ${email}`,
          phone ? `Phone: ${phone}` : null,
          address ? `\nMailing Address:\n${address}` : null,
          '',
          'Sharing preferences:',
          `  Email: ${shareEmailOptOut ? 'OPT OUT — do not share' : 'OK to share'}`,
          `  Phone: ${sharePhoneOptOut ? 'OPT OUT — do not share' : 'OK to share'}`,
          `  Address: ${shareAddressOptOut ? 'OPT OUT — do not share' : 'OK to share'}`,
        ].filter(Boolean) as string[];

        const poller = await client.beginSend({
          senderAddress: FROM_EMAIL,
          content: {
            subject: `Membership Form: ${name} (Class of ${classYear})`,
            plainText: lines.join('\n'),
          },
          recipients: {
            to: [{ address: MEMBERSHIP_EMAIL }],
            cc: [{ address: email }],
          },
        });
        await poller.pollUntilDone();
      } catch (err) {
        context.error('Failed to send membership email:', err);
      }
    }

    return { jsonBody: { success: true } };
  },
});
