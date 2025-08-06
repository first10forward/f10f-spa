import React from 'react';
import type { INomination } from '../types/Nomination';

interface NominationListProps {
  entries: INomination[];
  onEdit: (entry: INomination) => void;
  onDelete: (id: string) => void;
  onView: (entry: INomination) => void;
}

const NominationList: React.FC<NominationListProps> = ({
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

  // if (entries.length === 0) {
  //   return (
  //     <div className="nomination-list empty">
  //       <p>No nominations found. Add your first nomination to get started!</p>
  //     </div>
  //   );
  // }

  return (
    <div className="nomination-list">
      <div className="list-header">
        <h3>Nominations ({entries.length})</h3>
      </div>
      
      <div className="list-container">
        {entries.map((entry) => (
          <div key={entry.id} className="nomination-card">
            <div className="nomination-details">
              <div className="nomination-info">
                <span className="info-label">Member:</span>
                <a href={`mailto:${entry.memberName}`} className="info-value memberName">
                  {entry.memberName}
                </a>
              </div>

              <div className="nomination-info">
                <span className="info-label">Nominee:</span>
                <a href={`tel:${entry.nominee}`} className="info-value nominee">
                  {entry.nominee}
                </a>
              </div>

              <div className="nomination-info">
                <span className="info-label">Filing Name:</span>
                <span className="info-value address" title={entry.filingName || 'No address provided'}>
                  {entry.filingName ? entry.filingName : 'No filing name provided'}
                </span>
              </div>

              <div className="nomination-info">
                <span className="info-label">Filing ID:</span>
                <span className="info-value address" title={entry.filingID || 'No address provided'}>
                  {entry.filingID ? entry.filingID : 'No filing ID provided'}
                </span>
              </div>
              
              <div className="nomination-info">
                <span className="info-label">Last Updated:</span>
                <span className="info-value date">
                  {formatDate(entry.lastUpdated)}
                </span>
              </div>
            </div>
            
            <div className="nomination-actions">
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
                title="Edit nomination"
              >
                Edit
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${entry.nominee}?`)) {
                    onDelete(entry.id);
                  }
                }}
                className="btn btn-danger btn-sm"
                title="Delete nomination"
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

export default NominationList;
