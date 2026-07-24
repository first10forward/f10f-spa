import { useState } from 'react';
import Turnstile from './Turnstile';
import SubmissionService from '../services/SubmissionService';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as string | undefined;

const GRADUATION_YEARS = Array.from({ length: 17 }, (_, i) => 1978 + i);

interface FormData {
  name: string;
  marriedName: string;
  classYear: string;
  email: string;
  phone: string;
  address: string;
  shareEmailOptOut: boolean;
  sharePhoneOptOut: boolean;
  shareAddressOptOut: boolean;
}

const MembershipForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    marriedName: '',
    classYear: '',
    email: '',
    phone: '',
    address: '',
    shareEmailOptOut: false,
    sharePhoneOptOut: false,
    shareAddressOptOut: false,
  });
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileUnavailable, setTurnstileUnavailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.classYear) newErrors.classYear = 'Graduating class is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleCheckbox = (field: keyof FormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!validate()) return;

    if (TURNSTILE_SITE_KEY && !turnstileToken && !turnstileUnavailable) {
      setTurnstileError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await SubmissionService.submitMembership({
        name: formData.name,
        marriedName: formData.marriedName || undefined,
        classYear: formData.classYear,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        shareEmailOptOut: formData.shareEmailOptOut,
        sharePhoneOptOut: formData.sharePhoneOptOut,
        shareAddressOptOut: formData.shareAddressOptOut,
        turnstileToken: turnstileToken ?? '',
        turnstileUnavailable,
        honeypot,
      });

      if (success) {
        setSubmitted(true);
      } else {
        alert('There was an issue submitting your form. Please try again or email us at hello@first10forward.org');
        setTurnstileResetKey(k => k + 1);
        setTurnstileToken(null);
      }
    } catch (err) {
      console.error('Membership form error:', err);
      alert('Something went wrong. Please try again.');
      setTurnstileResetKey(k => k + 1);
      setTurnstileToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="membership-success">
        <h3>Thanks, {formData.name}!</h3>
        <p>We've received your information. A confirmation has been sent to <strong>{formData.email}</strong>.</p>
      </div>
    );
  }

  return (
    <div className="membership-form">
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
          <label htmlFor="mem_company">Company (leave blank)</label>
          <input
            type="text"
            id="mem_company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mem_name">Name *</label>
          <input
            type="text"
            id="mem_name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            className={errors.name ? 'error' : ''}
            placeholder="Your full name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mem_marriedName">Married name (if applicable)</label>
          <input
            type="text"
            id="mem_marriedName"
            value={formData.marriedName}
            onChange={e => handleChange('marriedName', e.target.value)}
            placeholder="Married or legal name, if different"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mem_classYear">Graduating class *</label>
          <select
            id="mem_classYear"
            value={formData.classYear}
            onChange={e => handleChange('classYear', e.target.value)}
            className={errors.classYear ? 'error' : ''}
          >
            <option value="">Select year...</option>
            {GRADUATION_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.classYear && <span className="error-message">{errors.classYear}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mem_email">Email address *</label>
          <input
            type="email"
            id="mem_email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder="Your email address"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mem_phone">Phone number (optional)</label>
          <input
            type="tel"
            id="mem_phone"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder="Your phone number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mem_address">Mailing address (optional)</label>
          <textarea
            id="mem_address"
            value={formData.address}
            onChange={e => handleChange('address', e.target.value)}
            placeholder="Street, city, state, zip"
            rows={3}
          />
        </div>

        <fieldset className="form-group">
          <legend><strong>Sharing preferences</strong></legend>
          <p className="text-muted" style={{ fontSize: '0.9em', marginBottom: '10px' }}>
            Check any items you prefer not to share with other members.
          </p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.shareEmailOptOut}
              onChange={e => handleCheckbox('shareEmailOptOut', e.target.checked)}
            />
            {' '}Do not share my email address with other members
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.sharePhoneOptOut}
              onChange={e => handleCheckbox('sharePhoneOptOut', e.target.checked)}
            />
            {' '}Do not share my phone number with other members
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.shareAddressOptOut}
              onChange={e => handleCheckbox('shareAddressOptOut', e.target.checked)}
            />
            {' '}Do not share my mailing address with other members
          </label>
        </fieldset>

        {TURNSTILE_SITE_KEY && !turnstileUnavailable && (
          <div className="form-group">
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={token => {
                setTurnstileToken(token);
                setTurnstileError(false);
              }}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              onLoadError={() => setTurnstileUnavailable(true)}
              resetKey={turnstileResetKey}
            />
            {turnstileError && (
              <span className="error-message">Please complete the security check</span>
            )}
          </div>
        )}

        {TURNSTILE_SITE_KEY && turnstileUnavailable && (
          <div className="form-group">
            <p className="form-privacy-notice" style={{ margin: 0 }}>
              Our security check couldn't load in your browser (this can happen
              with strict tracking prevention or content blockers). Your submission
              will still be received — you can continue.
            </p>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <p className="form-privacy-notice">
          First 10 Forward will only use your information for membership purposes.
          We do not sell, share, or disclose your personal data to outside organizations.
        </p>
      </form>
    </div>
  );
};

export default MembershipForm;
