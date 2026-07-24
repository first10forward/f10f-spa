import { useEffect, useRef, useState } from 'react';
import Turnstile from './Turnstile';
import SubmissionService from '../services/SubmissionService';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as string | undefined;

const GRADUATION_YEARS = Array.from({ length: 17 }, (_, i) => 1978 + i);

interface FormData {
  name: string;
  email: string;
  classYear: string;
  message: string;
  shareNameOptOut: boolean;
}

const TripInterestForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    classYear: '',
    message: '',
    shareNameOptOut: false,
  });
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileUnavailable, setTurnstileUnavailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submitInFlightRef = useRef(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
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

  const doSubmit = async (token: string | null, unavailable: boolean) => {
    console.log('[F10F] tripInterest doSubmit called', { hasToken: !!token, unavailable, inFlight: submitInFlightRef.current });
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setIsSubmitting(true);
    try {
      const success = await SubmissionService.submitTripInterest({
        name: formData.name,
        email: formData.email,
        classYear: formData.classYear || undefined,
        message: formData.message || undefined,
        shareNameOptOut: formData.shareNameOptOut,
        turnstileToken: token ?? '',
        turnstileUnavailable: unavailable,
        honeypot,
      });
      console.log('[F10F] tripInterest submit result', { success });

      if (success) {
        setSubmitted(true);
      } else {
        alert(
          'There was an issue submitting your request. Please try again or email us at hello@first10forward.org'
        );
        setTurnstileResetKey(k => k + 1);
        setTurnstileToken(null);
      }
    } catch (err) {
      console.error('Trip interest submission error:', err);
      alert('Something went wrong. Please try again.');
      setTurnstileResetKey(k => k + 1);
      setTurnstileToken(null);
    } finally {
      setIsSubmitting(false);
      setPendingSubmit(false);
      submitInFlightRef.current = false;
    }
  };

  // If the user clicked Submit before Turnstile finished, fire the submission
  // as soon as a token arrives or the widget is declared unavailable.
  useEffect(() => {
    console.log('[F10F] tripInterest state', { pendingSubmit, hasToken: !!turnstileToken, turnstileUnavailable });
    if (!pendingSubmit) return;
    if (turnstileToken || turnstileUnavailable) {
      void doSubmit(turnstileToken, turnstileUnavailable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSubmit, turnstileToken, turnstileUnavailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[F10F] tripInterest handleSubmit', { hasToken: !!turnstileToken, turnstileUnavailable });

    // Honeypot: silently pretend to succeed so bots don't know they were caught
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!validate()) return;

    // Turnstile not ready yet — queue the submission and wait for it to resolve
    if (TURNSTILE_SITE_KEY && !turnstileToken && !turnstileUnavailable) {
      setTurnstileError(false);
      setPendingSubmit(true);
      return;
    }

    await doSubmit(turnstileToken, turnstileUnavailable);
  };

  if (submitted) {
    return (
      <div className="trip-interest-success">
        <h3>You're on the list!</h3>
        <p>
          Thanks for your interest. We'll send trip details to{' '}
          <strong>{formData.email}</strong> as plans come together.
        </p>
      </div>
    );
  }

  return (
    <div className="trip-interest-form">
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — hidden from real users, bots fill it in */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
          <label htmlFor="ti_phone">Phone number (leave blank)</label>
          <input
            type="text"
            id="ti_phone"
            name="phone"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ti_name">Name *</label>
          <input
            type="text"
            id="ti_name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            className={errors.name ? 'error' : ''}
            placeholder="Your full name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ti_email">Email address *</label>
          <input
            type="email"
            id="ti_email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder="Your email address"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ti_classYear">Class year (optional)</label>
          <select
            id="ti_classYear"
            value={formData.classYear}
            onChange={e => handleChange('classYear', e.target.value)}
          >
            <option value="">Select year...</option>
            {GRADUATION_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ti_message">Message (optional)</label>
          <textarea
            id="ti_message"
            value={formData.message}
            onChange={e => handleChange('message', e.target.value)}
            placeholder="Questions, dietary restrictions, or anything else we should know..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.shareNameOptOut}
              onChange={e => handleCheckbox('shareNameOptOut', e.target.checked)}
            />
            {' '}Please do not share my name with other attendees
          </label>
        </div>

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
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || pendingSubmit}>
            {pendingSubmit ? 'Verifying…' : isSubmitting ? 'Submitting...' : 'Sign Me Up'}
          </button>
        </div>

        <p className="form-privacy-notice">
          First 10 Forward will only use your information to send you updates about this trip.
          We do not sell, share, or disclose your personal data to outside organizations.
        </p>
      </form>
    </div>
  );
};

export default TripInterestForm;
