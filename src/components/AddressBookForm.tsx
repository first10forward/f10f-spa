import React, { useState, useEffect } from 'react';
import type { AddressBookEntry, CreateAddressBookEntry } from '../types/AddressBook';
import { GRADUATION_YEARS, VALIDATION } from '../constants';

interface AddressBookFormProps {
  entry?: AddressBookEntry;
  onSubmit: (data: CreateAddressBookEntry) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const AddressBookForm: React.FC<AddressBookFormProps> = ({
  entry,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CreateAddressBookEntry>({
    name: '',
    year: 0, // No default year, will be validated
    email: '',
    cellPhone: '',
    mailingAddress: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateAddressBookEntry, string>>>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        name: entry.name,
        year: entry.year,
        email: entry.email,
        cellPhone: entry.cellPhone,
        mailingAddress: entry.mailingAddress
      });
    }
  }, [entry]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAddressBookEntry, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email is optional, but if provided, must be valid
    if (formData.email && formData.email.trim() && !VALIDATION.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Cell phone is optional - no validation required

    if (!formData.year || formData.year < GRADUATION_YEARS.MIN || formData.year > GRADUATION_YEARS.MAX) {
      newErrors.year = `Please enter a valid year between ${GRADUATION_YEARS.MIN} and ${GRADUATION_YEARS.MAX}`;
    }

    // Mailing address is now optional - no validation required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CreateAddressBookEntry, value: string | number) => {
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
    <div className="address-book-form">
      <h2>{isEditing ? 'Edit Contact' : 'Add New Contact'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'error' : ''}
            placeholder="Enter full name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="year">Year ({GRADUATION_YEARS.MIN}-{GRADUATION_YEARS.MAX}) *</label>
          <input
            type="number"
            id="year"
            value={formData.year || ''}
            onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
            className={errors.year ? 'error' : ''}
            min={GRADUATION_YEARS.MIN}
            max={GRADUATION_YEARS.MAX}
            placeholder="Enter graduation year"
          />
          {errors.year && <span className="error-message">{errors.year}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder="Enter email address (optional)"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cellPhone">Cell Phone</label>
          <input
            type="tel"
            id="cellPhone"
            value={formData.cellPhone || ''}
            onChange={(e) => handleChange('cellPhone', e.target.value)}
            className={errors.cellPhone ? 'error' : ''}
            placeholder="Enter cell phone number (optional)"
          />
          {errors.cellPhone && <span className="error-message">{errors.cellPhone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mailingAddress">Mailing Address</label>
          <textarea
            id="mailingAddress"
            value={formData.mailingAddress || ''}
            onChange={(e) => handleChange('mailingAddress', e.target.value)}
            className={errors.mailingAddress ? 'error' : ''}
            placeholder="Enter complete mailing address (optional)"
            rows={3}
          />
          {errors.mailingAddress && <span className="error-message">{errors.mailingAddress}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Contact' : 'Add Contact'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressBookForm;
