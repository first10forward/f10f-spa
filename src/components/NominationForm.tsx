import React, { useEffect } from 'react';
import { useState } from 'react';
import type { ICreateNomination, INomination } from '../types/Nomination';
import { GRANT_YEAR } from '../constants';
import EmailService from '../services/EmailService';

interface NominationFormProps {
  entry?: INomination;
  onSubmit: (data: ICreateNomination) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface FormData extends Omit<ICreateNomination, 'attestation'> {
    attestation: boolean | null;
}

const NominationForm: React.FC<NominationFormProps> = ({
    entry,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const [formData, setFormData] = useState<FormData>({
        memberName: '',
        memberEmail: '',
        nominee: '',
        website: '',
        filingName: '',
        filingID: '',
        mission: '',
        attestation: null
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
    if (entry) {
        setFormData({
            memberName: entry.memberName,
            memberEmail: entry.memberEmail,
            nominee: entry.nominee,
            website: entry.website || '',
            filingName: entry.filingName || '',
            filingID: entry.filingID || '',
            mission: entry.mission || '',
            attestation: entry.attestation
        });
    }
    }, [entry]);
    
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        
            if (!formData.memberName.trim()) {
              newErrors.memberName = 'Nominating member name is required';
            }
            if (!formData.memberEmail.trim()) {
              newErrors.memberEmail = 'Member email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.memberEmail)) {
              newErrors.memberEmail = 'Please enter a valid email address';
            }
            if (!formData.nominee.trim()) {
                newErrors.nominee = 'Nominee name is required';
            }
            if (formData.website && formData.website.trim()) {
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                if (!urlPattern.test(formData.website.trim())) {
                    newErrors.website = 'Please enter a valid website URL';
                }
            }
            if (formData.attestation === null) {
                newErrors.attestation = 'Please select Yes or No for the connection disclosure';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            if (isEditing) {
                // For editing existing nominations, convert attestation and use the original callback
                const submissionData: ICreateNomination = {
                    ...formData,
                    attestation: formData.attestation !== null ? formData.attestation : false
                };
                onSubmit(submissionData);
            } else {
                // For new nominations, send email using Azure Communication Services
                setIsSubmitting(true);
                
                try {
                    // Convert to INomination format for the email service
                    const nominationData: INomination = {
                        ...formData,
                        attestation: formData.attestation !== null ? formData.attestation : false,
                        id: '',
                        grantYear: GRANT_YEAR.CURRENT,
                        lastUpdated: new Date()
                    };
                    
                    // Send via Azure or fallback to mailto
                    const emailSent = await EmailService.sendNomination(nominationData);
                    
                    if (emailSent) {
                        alert('Your nomination has been submitted successfully! The nominations team and you will receive a copy by email.');
                    } else {
                        alert('There was an issue sending the email automatically. Please contact us directly at nominations@first10forward.org');
                    }
                    
                    onCancel(); // Close the form
                    
                } catch (error) {
                    console.error('Error sending nomination:', error);
                    alert('Error preparing nomination email. Please try again or contact us directly.');
                } finally {
                    setIsSubmitting(false);
                }
            }
        }
    };

    const handleChange = (field: keyof FormData, value: string | number | boolean | null) => {
    setFormData(prev => ({
        ...prev,
        [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
        setErrors(prev => ({
        ...prev,
        [field]: undefined
        }));
    }
    };

    return (
    <div className="nomination-form">
      {/* <h2>{isEditing ? 'Edit Nomination' : 'Submit Nomination'}</h2> */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="memberName">Nominating member name *</label>
          <input 
            type="text" 
            id="memberName" 
            value={formData.memberName} 
            onChange={(e) => handleChange('memberName', e.target.value)}
            className={errors.memberName ? 'error' : ''}
            placeholder="Enter member name"
          />
          {errors.memberName && <span className="error-message">{errors.memberName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="memberEmail">Member email address *</label>
          <input 
            type="email" 
            id="memberEmail" 
            value={formData.memberEmail} 
            onChange={(e) => handleChange('memberEmail', e.target.value)}
            className={errors.memberEmail ? 'error' : ''}
            placeholder="Enter member email address"
          />
          {errors.memberEmail && <span className="error-message">{errors.memberEmail}</span>}
        </div>
          
        <div className="form-group">
          <label htmlFor="nominee">Organization nominated *</label>
            <input 
            type="text" 
            name="nominee" 
            value={formData.nominee} 
            onChange={(e) => handleChange('nominee', e.target.value)}
            className={errors.nominee ? 'error' : ''}
            placeholder="Enter organization name"
          />
          {errors.nominee && <span className="error-message">{errors.nominee}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="website">Organization website</label>
            <input 
            type="url" 
            name="website" 
            value={formData.website} 
            onChange={(e) => handleChange('website', e.target.value)}
            className={errors.website ? 'error' : ''}
            placeholder="Enter organization website (optional)"
          />
          {errors.website && <span className="error-message">{errors.website}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="filingName">Organization 501(c)(3) filing name </label>
            <input 
            type="text" 
            name="filingName" 
            value={formData.filingName} 
            onChange={(e) => handleChange('filingName', e.target.value)}
            className={errors.filingName ? 'error' : ''}
            placeholder="Enter Organization 501(c)(3) filing name (if different from name)"
          />
          {errors.filingName && <span className="error-message">{errors.filingName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="filingID">Organization 501(c)(3) filing ID</label>
            <input 
            type="text" 
            name="filingID" 
            value={formData.filingID} 
            onChange={(e) => handleChange('filingID', e.target.value)}
            className={errors.filingID ? 'error' : ''}
            placeholder="Enter EIN or filing ID"
          />
          {errors.filingID && <span className="error-message">{errors.filingID}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mission">Mission/Notes</label>
          <textarea 
            name="mission" 
            value={formData.mission} 
            onChange={(e) => handleChange('mission', e.target.value)}
            className={errors.mission ? 'error' : ''}
            placeholder="Enter organization mission or additional notes (optional)"
            rows={3}
          />
          {errors.mission && <span className="error-message">{errors.mission}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Does the nominator or their family have a personal or professional connection to the nominated organization? *</label>
          <div className="radio-group">
            <div className={`radio-option ${formData.attestation === true ? 'selected' : ''}`}>
              <input 
                type="radio" 
                id="attestation-yes"
                name="attestation" 
                value="true"
                checked={formData.attestation === true}
                onChange={() => handleChange('attestation', true)}
              />
              <label htmlFor="attestation-yes" className="radio-label">Yes</label>
            </div>
            <div className={`radio-option ${formData.attestation === false ? 'selected' : ''}`}>
              <input 
                type="radio" 
                id="attestation-no"
                name="attestation" 
                value="false"
                checked={formData.attestation === false}
                onChange={() => handleChange('attestation', false)}
              />
              <label htmlFor="attestation-no" className="radio-label">No</label>
            </div>
          </div>
          {errors.attestation && <span className="error-message">{errors.attestation}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : (isEditing ? 'Update Nomination' : 'Submit Nomination')}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
    )
}

export default NominationForm;