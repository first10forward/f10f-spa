/**
 * Email Service
 * Handles email functionality for the application
 */

import type { INomination } from '../types/Nomination';
import AzureEmailService from './AzureEmailService';

export class EmailService {
    private static azureEmailService = new AzureEmailService();
    private static readonly NOMINATIONS_EMAIL = 'nominations@first10forward.org';

    /**
     * Send nomination email - tries Azure first, falls back to mailto
     */
    static async sendNomination(nomination: INomination): Promise<boolean> {
        try {
            // Try Azure Communication Services first
            const azureSuccess = await this.azureEmailService.sendNominationEmail({
                memberName: nomination.memberName,
                memberEmail: nomination.memberEmail,
                nominee: nomination.nominee,
                website: nomination.website,
                filingName: nomination.filingName,
                filingID: nomination.filingID,
                mission: nomination.mission,
                attestation: nomination.attestation
            });

            if (azureSuccess) {
                console.log('Email sent successfully via Azure Communication Services');
                return true;
            }

            // Fall back to mailto if Azure fails or isn't configured
            console.log('Falling back to mailto method');
            return await this.sendViaMailto(nomination);

        } catch (error) {
            console.error('Error sending nomination email:', error);
            // Try mailto as final fallback
            return await this.sendViaMailto(nomination);
        }
    }

    /**
     * Send nomination email using mailto link with CC to member (fallback method)
     */
    private static async sendViaMailto(nomination: INomination): Promise<boolean> {
        try {
            const subject = `New Nomination: ${nomination.nominee}`;
            const body = this.formatNominationEmail(nomination);

            // Create mailto link with CC to member
            const mailtoLink = `mailto:${this.NOMINATIONS_EMAIL}?cc=${encodeURIComponent(nomination.memberEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Try to use Web Share API first (if available and supported)
            if (navigator.share && typeof navigator.canShare === 'function') {
                try {
                    const shareData = {
                        title: subject,
                        text: body,
                        url: `mailto:${this.NOMINATIONS_EMAIL}?cc=${encodeURIComponent(nomination.memberEmail)}`
                    };

                    if (navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                        return true;
                    }
                } catch (shareError) {
                    // Fall back to mailto if share fails
                    console.log('Web Share failed, falling back to mailto:', shareError);
                }
            }

            // Open mailto link
            window.open(mailtoLink, '_blank');
            return true;

        } catch (error) {
            console.error('Error sending nomination email via mailto:', error);
            return false;
        }
    }

    /**
     * Format the nomination data into a readable email body
     */
    private static formatNominationEmail(data: INomination): string {
        const timestamp = new Date().toLocaleString();

        return `New Organization Nomination Submitted

Submission Details:
==================
Submitted: ${timestamp}
Nominating Member: ${data.memberName}
Member Email: ${data.memberEmail}

Organization Information:
========================
Organization Name: ${data.nominee}
${data.website ? `Website: ${data.website}` : ''}
${data.filingName ? `501(c)(3) Filing Name: ${data.filingName}` : ''}
${data.filingID ? `501(c)(3) Filing ID/EIN: ${data.filingID}` : ''}
${data.mission ? `Mission/Notes: ${data.mission}` : ''}

Connection Disclosure:
=====================
Personal/Professional Connection: ${data.attestation ? 'YES' : 'NO'}

---
This nomination was submitted through the First 10 Forward website.
Please review and process according to organization guidelines.`;
    }
}

export default EmailService;
