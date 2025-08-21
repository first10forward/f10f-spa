import React, { useState } from 'react';
import type { INominationsSettings } from '../services/NominationsSettingsService';

interface NominationsAdminControlsProps {
  settings: INominationsSettings;
  onToggleNominations: (isOpen: boolean, message?: string) => Promise<void>;
  loading?: boolean;
}

const NominationsAdminControls: React.FC<NominationsAdminControlsProps> = ({
  settings,
  onToggleNominations,
  loading = false
}) => {
  const [customMessage, setCustomMessage] = useState(settings.closedMessage || '');
  const [showMessageInput, setShowMessageInput] = useState(false);

  const handleToggle = async () => {
    if (settings.isOpen) {
      // Closing nominations
      if (showMessageInput) {
        await onToggleNominations(false, customMessage);
        setShowMessageInput(false);
      } else {
        setShowMessageInput(true);
      }
    } else {
      // Opening nominations
      await onToggleNominations(true);
    }
  };

  const handleQuickClose = async () => {
    await onToggleNominations(false, 'Nominations are currently closed. Please check back later.');
  };

  const handleCancelMessage = () => {
    setShowMessageInput(false);
    setCustomMessage(settings.closedMessage || '');
  };

  return (
    <div className="admin-controls">
      <div className="panel panel-warning">
        <div className="panel-header">
          <h4>
            <i className="fa fa-cog"></i> Admin Controls
          </h4>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-8">
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge ${settings.isOpen ? 'badge-success' : 'badge-danger'}`}>
                  {settings.isOpen ? 'Open' : 'Closed'}
                </span>
              </p>
              {!settings.isOpen && (
                <p>
                  <strong>Message:</strong> {settings.closedMessage}
                </p>
              )}
              <p className="text-muted">
                <small>Last updated: {new Date(settings.lastUpdated).toLocaleString()}</small>
              </p>
            </div>
            <div className="col-md-4 text-right">
              {settings.isOpen ? (
                <div>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={handleQuickClose}
                    disabled={loading}
                    style={{ marginRight: '8px' }}
                  >
                    <i className="fa fa-times-circle"></i> Quick Close
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={handleToggle}
                    disabled={loading}
                  >
                    <i className="fa fa-edit"></i> Close with Message
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={handleToggle}
                  disabled={loading}
                >
                  <i className="fa fa-check-circle"></i> Open Nominations
                </button>
              )}
            </div>
          </div>

          {showMessageInput && (
            <div className="message-input-section" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
              <div className="form-group">
                <label htmlFor="closedMessage">
                  <strong>Closed Message:</strong>
                </label>
                <textarea
                  id="closedMessage"
                  className="form-control"
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter a message to display when nominations are closed..."
                />
              </div>
              <div className="text-right">
                <button
                  className="btn btn-default btn-sm"
                  onClick={handleCancelMessage}
                  disabled={loading}
                  style={{ marginRight: '8px' }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={handleToggle}
                  disabled={loading || !customMessage.trim()}
                >
                  <i className="fa fa-times-circle"></i> Close Nominations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NominationsAdminControls;
