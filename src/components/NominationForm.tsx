import React, { useEffect } from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { CreateNomination } from '../types/Nomination';

interface NominationFormProps {
  entry?: NominationEntry;
  onSubmit: (data: CreateNominationEntry) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const NominationForm: React.FC<NominationFormProps> = ({
    entry,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const [formData, setFormData] = useState<CreateNomination>({
        memberName: '',
        nominee: '',
        filingName: '',
        filingID: '',
        mission: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateNomination, string>>>({});
    
    useEffect(() => {
    if (entry) {
        setFormData({
            memberName: entry.memberName,
            nominee: entry.nominee,
            filingName: entry.filingName,
            filingID: entry.filingID,
            mission: entry.mission
        });
    }
    }, [entry]);
    
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreateNomination, string>> = {};
        
            if (!formData.memberName.trim()) {
              newErrors.memberName = 'Nominating member name is required';
            }
            if (!formData.nominee.trim()) {
                newErrors.nominee = 'Nominee name is required';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        onSubmit(formData);
    }
    };

    const handleChange = (field: keyof CreateNomination, value: string | number) => {
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
      <h2>{isEditing ? 'Edit Nomination' : 'Submit Nomination'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="memberName">Nominating member name *</label>
          <input 
            type="text" 
            id="memberName" 
            value={formData.memberName} 
            onChange={handleChange}
            className={errors.memberName ? 'error' : ''}
            placeholder="Enter member name"
          />
          {errors.memberName && <span className="error-message">{errors.memberName}</span>}
        </div>
          
        <div className="form-group">
          <label htmlFor="nominee">Organization nominated *</label>
            <input 
            type="text" 
            name="nominee" 
            value={formData.nominee} 
            onChange={handleChange}
            className={errors.nominee ? 'error' : ''}
            placeholder="Enter "
          />
          {errors.nominee && <span className="error-message">{errors.nominee}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="filingName">Organization 501(c)(3) filing name </label>
            <input 
            type="text" 
            name="filingName" 
            value={formData.filingName} 
            onChange={handleChange}
            className={errors.filingName ? 'error' : ''}
            placeholder="Enter Organization 501(c)(3) filing name"
          />
          {errors.filingName && <span className="error-message">{errors.filingName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="filingID">Organization 501(c)(3) filing ID</label>
            <input 
            type="text" 
            name="filingID" 
            value={formData.filingID} 
            onChange={handleChange}
            className={errors.filingID ? 'error' : ''}
            placeholder="Enter "
          />
          {errors.filingID && <span className="error-message">{errors.filingID}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mission">Notes</label>
            <input 
            type="text" 
            name="mission" 
            value={formData.mission} 
            onChange={handleChange}
            className={errors.mission ? 'error' : ''}
            placeholder="Enter "
          />
          {errors.mission && <span className="error-message">{errors.mission}</span>}
        </div>
      </form>
    </div>
    )
}

export default NominationForm;