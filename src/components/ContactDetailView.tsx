import React from 'react';
import type { AddressBookEntry } from '../types/AddressBook';

interface ContactDetailViewProps {
  entry: AddressBookEntry;
  onEdit: () => void;
  onClose: () => void;
  onDelete: () => void;
}

const ContactDetailView: React.FC<ContactDetailViewProps> = ({
  entry,
  onEdit,
  onClose,
  onDelete
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${entry.name}? This action cannot be undone.`)) {
      onDelete();
    }
  };

  return (
    <div className="contact-detail-view">
      <div className="detail-header">
        <h2>{entry.name}</h2>
        <button onClick={onClose} className="btn btn-close" title="Close">
          ×
        </button>
      </div>
      
      <div className="detail-content">
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Full Name:</label>
              <span>{entry.name}</span>
            </div>
            <div className="detail-item">
              <label>Class Year:</label>
              <span>{entry.year}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Contact Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Email Address:</label>
              {entry.email ? (
                <div className="contact-link">
                  <a href={`mailto:${entry.email}`}>{entry.email}</a>
                  <button 
                    onClick={() => navigator.clipboard.writeText(entry.email!)}
                    className="btn btn-copy"
                    title="Copy email"
                  >
                    📋
                  </button>
                </div>
              ) : (
                <span className="no-contact">No email address provided</span>
              )}
            </div>
            <div className="detail-item">
              <label>Cell Phone:</label>
              {entry.cellPhone ? (
                <div className="contact-link">
                  <a href={`tel:${entry.cellPhone}`}>{entry.cellPhone}</a>
                  <button 
                    onClick={() => navigator.clipboard.writeText(entry.cellPhone!)}
                    className="btn btn-copy"
                    title="Copy phone number"
                  >
                    📋
                  </button>
                </div>
              ) : (
                <span className="no-contact">No phone number provided</span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Mailing Address</h3>
          <div className="detail-item address-item">
            <div className="address-text">
              {entry.mailingAddress ? (
                entry.mailingAddress.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))
              ) : (
                <div className="no-address">No mailing address provided</div>
              )}
            </div>
            {entry.mailingAddress && (
              <button 
                onClick={() => navigator.clipboard.writeText(entry.mailingAddress!)}
                className="btn btn-copy"
                title="Copy address"
              >
                📋
              </button>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>Record Information</h3>
          <div className="detail-item">
            <label>Last Updated:</label>
            <span>{formatDate(entry.lastUpdated)}</span>
          </div>
        </div>
      </div>
      
      <div className="detail-actions">
        <button onClick={onEdit} className="btn btn-primary">
          Edit Contact
        </button>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete Contact
        </button>
        <button onClick={onClose} className="btn btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
};

export default ContactDetailView;
