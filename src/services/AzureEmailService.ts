/**
 * Azure Communication Services Email Service
 * Handles sending emails through Azure Communication Services
 */

export interface EmailRequest {
    to: string[];
    cc?: string[];
    subject: string;
    htmlContent?: string;
    textContent: string;
    from?: string;
}

export class AzureEmailService {
    private static readonly DEFAULT_FROM_EMAIL = 'noreply@first10forward.org';
    private static readonly NOMINATIONS_EMAIL = 'nominations@first10forward.org';

    private endpoint: string;
    private accessKey: string;

    constructor() {
        // Get configuration from environment variables
        this.endpoint = import.meta.env.VITE_AZURE_COMMUNICATION_ENDPOINT || '';
        this.accessKey = import.meta.env.VITE_AZURE_COMMUNICATION_ACCESS_KEY || '';
    }

    /**
     * Check if Azure Communication Services is properly configured
     */
    private isConfigured(): boolean {
        return !!(this.endpoint && this.accessKey);
    }

    /**
     * Send email using Azure Communication Services
     */
    async sendEmail(emailRequest: EmailRequest): Promise<boolean> {
        if (!this.isConfigured()) {
            console.log(import.meta.env)
            console.warn('Azure Communication Services not configured, falling back to mailto');
            return false;
        }

        try {
            const url = `${this.endpoint}/emails:send?api-version=2023-03-31`;

            const emailData = {
                senderAddress: emailRequest.from || AzureEmailService.DEFAULT_FROM_EMAIL,
                content: {
                    subject: emailRequest.subject,
                    plainText: emailRequest.textContent,
                    html: emailRequest.htmlContent || emailRequest.textContent.replace(/\n/g, '<br>')
                },
                recipients: {
                    to: emailRequest.to.map(email => ({ address: email })),
                    ...(emailRequest.cc && emailRequest.cc.length > 0 && {
                        cc: emailRequest.cc.map(email => ({ address: email }))
                    })
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Azure email send failed:', response.status, errorText);
                return false;
            }

            const result = await response.json();
            console.log('Email sent successfully:', result.id);
            return true;

        } catch (error) {
            console.error('Error sending email via Azure:', error);
            return false;
        }
    }

    /**
     * Send nomination email to the nominations team
     */
    async sendNominationEmail(nominationData: {
        memberName: string;
        memberEmail: string;
        nominee: string;
        website?: string;
        filingName?: string;
        filingID?: string;
        mission?: string;
        attestation: boolean;
    }): Promise<boolean> {
        const subject = `New Nomination: ${nominationData.nominee}`;
        const textContent = this.formatNominationEmail(nominationData);
        const htmlContent = this.formatNominationEmailHtml(nominationData);

        const emailRequest: EmailRequest = {
            to: [AzureEmailService.NOMINATIONS_EMAIL],
            cc: [nominationData.memberEmail],
            subject,
            textContent,
            htmlContent,
            from: AzureEmailService.DEFAULT_FROM_EMAIL
        };

        return await this.sendEmail(emailRequest);
    }

    /**
     * Format nomination data for plain text email
     */
    private formatNominationEmail(data: {
        memberName: string;
        memberEmail: string;
        nominee: string;
        website?: string;
        filingName?: string;
        filingID?: string;
        mission?: string;
        attestation: boolean;
    }): string {
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

    /**
     * Format nomination data for HTML email
     */
    private formatNominationEmailHtml(data: {
        memberName: string;
        memberEmail: string;
        nominee: string;
        website?: string;
        filingName?: string;
        filingID?: string;
        mission?: string;
        attestation: boolean;
    }): string {
        const timestamp = new Date().toLocaleString();

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Nomination Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #2c3e50; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h2>🏆 New Organization Nomination Submitted</h2>
        <p><strong>Submitted:</strong> ${timestamp}</p>
    </div>

    <div class="section">
        <h3>📝 Submission Details</h3>
        <div class="detail-row">
            <span class="label">Nominating Member:</span> ${data.memberName}
        </div>
        <div class="detail-row">
            <span class="label">Member Email:</span> <a href="mailto:${data.memberEmail}">${data.memberEmail}</a>
        </div>
    </div>

    <div class="section">
        <h3>🏢 Organization Information</h3>
        <div class="detail-row">
            <span class="label">Organization Name:</span> ${data.nominee}
        </div>
        ${data.website ? `<div class="detail-row"><span class="label">Website:</span> <a href="${data.website.startsWith('http') ? data.website : 'https://' + data.website}" target="_blank">${data.website}</a></div>` : ''}
        ${data.filingName ? `<div class="detail-row"><span class="label">501(c)(3) Filing Name:</span> ${data.filingName}</div>` : ''}
        ${data.filingID ? `<div class="detail-row"><span class="label">501(c)(3) Filing ID/EIN:</span> ${data.filingID}</div>` : ''}
        ${data.mission ? `<div class="detail-row"><span class="label">Mission/Notes:</span><br>${data.mission.replace(/\n/g, '<br>')}</div>` : ''}
    </div>

    <div class="section">
        <h3>🔗 Connection Disclosure</h3>
        <div class="detail-row">
            <span class="label">Personal/Professional Connection:</span> 
            <strong style="color: ${data.attestation ? '#e74c3c' : '#27ae60'};">
                ${data.attestation ? 'YES' : 'NO'}
            </strong>
        </div>
    </div>

    <div class="footer">
        <p>This nomination was submitted through the <strong>First 10 Forward</strong> website.</p>
        <p>Please review and process according to organization guidelines.</p>
    </div>
</body>
</html>`;
    }
}

export default AzureEmailService;
