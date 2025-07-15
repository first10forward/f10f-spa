import React from 'react';
import type { AddressBookEntry } from '../types/AddressBook';

interface AddressBookListProps {
  entries: AddressBookEntry[];
  onEdit: (entry: AddressBookEntry) => void;
  onDelete: (id: string) => void;
  onView: (entry: AddressBookEntry) => void;
}

const AddressBookList: React.FC<AddressBookListProps> = ({
  entries,
  onEdit,
  onDelete,
  onView
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    // Truncate long addresses for display
    return address.length > 50 ? address.substring(0, 50) + '...' : address;
  };

  if (entries.length === 0) {
    return (
      <div className="address-book-list empty">
        <p>No contacts found. Add your first contact to get started!</p>
      </div>
    );
  }

  return (
    <div className="address-book-list">
      <div className="list-header">
        <h3>Contacts ({entries.length})</h3>
      </div>
      
      <div className="list-container">
        {entries.map((entry) => (
          <div key={entry.id} className="contact-card">
            <div className="contact-header">
              <h4 className="contact-name">{entry.name}</h4>
              <span className="contact-year">Class of {entry.year}</span>
            </div>
            
            <div className="contact-details">
              <div className="contact-info">
                <span className="info-label">Email:</span>
                {entry.email ? (
                  <a href={`mailto:${entry.email}`} className="info-value email">
                    {entry.email}
                  </a>
                ) : (
                  <span className="info-value no-contact">No email provided</span>
                )}
              </div>
              
              <div className="contact-info">
                <span className="info-label">Phone:</span>
                {entry.cellPhone ? (
                  <a href={`tel:${entry.cellPhone}`} className="info-value phone">
                    {entry.cellPhone}
                  </a>
                ) : (
                  <span className="info-value no-contact">No phone provided</span>
                )}
              </div>
              
              <div className="contact-info">
                <span className="info-label">Address:</span>
                <span className="info-value address" title={entry.mailingAddress || 'No address provided'}>
                  {entry.mailingAddress ? formatAddress(entry.mailingAddress) : 'No address provided'}
                </span>
              </div>
              
              <div className="contact-info">
                <span className="info-label">Last Updated:</span>
                <span className="info-value date">
                  {formatDate(entry.lastUpdated)}
                </span>
              </div>
            </div>
            
            <div className="contact-actions">
              <button 
                onClick={() => onView(entry)}
                className="btn btn-info btn-sm"
                title="View details"
              >
                View
              </button>
              <button 
                onClick={() => onEdit(entry)}
                className="btn btn-primary btn-sm"
                title="Edit contact"
              >
                Edit
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${entry.name}?`)) {
                    onDelete(entry.id);
                  }
                }}
                className="btn btn-danger btn-sm"
                title="Delete contact"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressBookList;
