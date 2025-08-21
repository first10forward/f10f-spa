import React from 'react';
import type { INominationsSettings } from '../services/NominationsSettingsService';
import type { INomination } from '../types/Nomination';

interface NominationsClosedMessageProps {
  settings: INominationsSettings;
  nominations: INomination[];
}

const NominationsClosedMessage: React.FC<NominationsClosedMessageProps> = ({ settings, nominations }) => {
  // Get unique nominees (in case there are duplicates)
  const uniqueNominees = Array.from(
    new Map(nominations.map(nom => [nom.nominee.toLowerCase(), nom])).values()
  ).sort((a, b) => a.nominee.localeCompare(b.nominee));

  return (
    <div className="nominations-closed">
      <div className="panel panel-info">
        <div className="panel-header">
          <h2 style={{ margin: 0, color: '#31708f' }}>
            <i className="fa fa-list" style={{ marginRight: '10px' }}></i>
            2025 Nominees
          </h2>
        </div>
        <div className="panel-body">
          {uniqueNominees.length > 0 ? (
            <div>
              <p className="text-muted" style={{ marginBottom: '25px', fontSize: '16px' }}>
                The following organizations have been nominated for the 2025 Annual Grant:
              </p>
              
              <div className="nominees-grid">
                {uniqueNominees.map((nomination, index) => (
                  <div key={nomination.id} className="nominee-card">
                    <div className="nominee-number">
                      {index + 1}
                    </div>
                    <div className="nominee-info">
                      <h4 className="nominee-name">{nomination.nominee}</h4>
                      {nomination.website && (
                        <p className="nominee-website">
                          <i className="fa fa-globe" style={{ marginRight: '5px' }}></i>
                          <a 
                            href={nomination.website.startsWith('http') ? nomination.website : `https://${nomination.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="website-link"
                          >
                            {nomination.website}
                          </a>
                        </p>
                      )}
                      {nomination.mission && (
                        <p className="nominee-mission">{nomination.mission}</p>
                      )}
                      <p className="nominee-meta">
                        <small className="text-muted">
                          Nominated by: {nomination.memberName}
                        </small>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="nominees-footer">
                <p className="text-center text-muted">
                  <strong>Total Nominees: {uniqueNominees.length}</strong>
                </p>
                <p className="text-center text-muted">
                  <small>Nominations closed on: {new Date(settings.lastUpdated).toLocaleDateString()}</small>
                </p>
              </div>
            </div>
          ) : (
            <div className="no-nominees text-center" style={{ padding: '40px 20px' }}>
              <i className="fa fa-info-circle" style={{ fontSize: '48px', color: '#5bc0de', marginBottom: '20px' }}></i>
              <h3>No Nominees Yet</h3>
              <p className="lead">
                {settings.closedMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NominationsClosedMessage;
