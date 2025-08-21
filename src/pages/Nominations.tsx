import React, { useState, useEffect } from 'react';
import NominationForm from '../components/NominationForm';
import NominationList from '../components/NominationList';
import NominationsAdminControls from '../components/NominationsAdminControls';
import NominationsClosedMessage from '../components/NominationsClosedMessage';
import type { INomination, ICreateNomination } from '../types/Nomination';
import type { INominationsSettings } from '../services/NominationsSettingsService';
import NominationsService from '../services/NominationsService';
import NominationsSettingsService from '../services/NominationsSettingsService';
import './Nominations.css';

const Nominations: React.FC = () => {
  const [nominations, setNominations] = useState<INomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNomination, setEditingNomination] = useState<INomination | undefined>();
  const [viewingNomination, setViewingNomination] = useState<INomination | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionsBar] = useState(false); // Hide search and add button for now
  const [settings, setSettings] = useState<INominationsSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  const nominationsService = new NominationsService();
  const settingsService = new NominationsSettingsService();

  useEffect(() => {
    loadNominations();
    loadSettings();
  }, []);

  // Listen for direct navigation to form
  useEffect(() => {
    const handleShowForm = () => {
      setShowForm(true);
      setEditingNomination(undefined);
      setViewingNomination(undefined);
    };

    window.addEventListener('show-nomination-form', handleShowForm);
    
    return () => {
      window.removeEventListener('show-nomination-form', handleShowForm);
    };
  }, []);

  const loadNominations = async () => {
    try {
      setLoading(true);
      const data = await nominationsService.getNominations();
      setNominations(data);
    } catch (error) {
      console.error('Failed to load nominations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await settingsService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleAddNomination = async (nominationData: ICreateNomination) => {
    // Check if nominations are closed
    if (!settings?.isOpen) {
      alert('Nominations are currently closed.');
      return;
    }

    try {
      const newNomination = await nominationsService.addNomination(nominationData);
      setNominations(prev => [...prev, newNomination]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add nomination:', error);
      alert('Failed to add nomination. Please try again.');
    }
  };

  const handleUpdateNomination = async (nominationData: ICreateNomination) => {
    if (!editingNomination) return;
    
    try {
      const updatedNomination = await nominationsService.updateNomination({
        id: editingNomination.id,
        ...nominationData
      });
      
      setNominations(prev => 
        prev.map(nom => nom.id === updatedNomination.id ? updatedNomination : nom)
      );
      setEditingNomination(undefined);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update nomination:', error);
      alert('Failed to update nomination. Please try again.');
    }
  };

  const handleDeleteNomination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this nomination?')) {
      return;
    }

    try {
      await nominationsService.deleteNomination(id);
      setNominations(prev => prev.filter(nom => nom.id !== id));
    } catch (error) {
      console.error('Failed to delete nomination:', error);
      alert('Failed to delete nomination. Please try again.');
    }
  };

  const handleEdit = (nomination: INomination) => {
    setEditingNomination(nomination);
    setShowForm(true);
    setViewingNomination(undefined);
  };

  const handleView = (nomination: INomination) => {
    setViewingNomination(nomination);
    setShowForm(false);
    setEditingNomination(undefined);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNomination(undefined);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await nominationsService.searchNominations(query);
        setNominations(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadNominations();
    }
  };

  const filteredNominations = searchQuery 
    ? nominations 
    : nominations;

  const handleToggleNominations = async (isOpen: boolean, message?: string) => {
    try {
      setSettingsLoading(true);
      const updatedSettings = isOpen 
        ? await settingsService.openNominations()
        : await settingsService.closeNominations(message);
      
      setSettings(updatedSettings);
      
      // Close the form if nominations are being closed
      if (!isOpen) {
        setShowForm(false);
        setEditingNomination(undefined);
      }
    } catch (error) {
      console.error('Failed to update nominations status:', error);
      alert('Failed to update nominations status. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Check if user is admin (this is a simple check - you might want to implement proper authentication)
  const isAdmin = () => {
    // For now, just check if there are any nominations (meaning user has access to data)
    // In a real app, you'd check user permissions/roles
    return nominations.length >= 0; // Always true for now, but you can modify this logic
  };

  return (
    <div className="nominations-page">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="page-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1>Submit Nomination</h1>
                  <p className="text-muted">Nominate an organization for the 2025 Annual Grant</p>
                </div>
                {isAdmin() && settings && (
                  <div>
                    <button
                      className="btn btn-link btn-sm"
                      onClick={() => setShowAdminControls(!showAdminControls)}
                      style={{ textDecoration: 'none' }}
                    >
                      <i className={`fa fa-cog ${showAdminControls ? 'fa-spin' : ''}`}></i> Admin
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Controls */}
            {showAdminControls && isAdmin() && settings && (
              <NominationsAdminControls
                settings={settings}
                onToggleNominations={handleToggleNominations}
                loading={settingsLoading}
              />
            )}

            {/* Show closed message if nominations are closed */}
            {settings && !settings.isOpen ? (
              <NominationsClosedMessage settings={settings} nominations={nominations} />
            ) : (
              <>
                {/* Search and Actions */}
                {showActionsBar && (
                  <div className="actions-bar">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search nominations..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                          />
                          <span className="input-group-addon">
                            <i className="fa fa-search"></i>
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6 text-right">
                        <button 
                          className="btn btn-primary"
                          onClick={() => setShowForm(true)}
                        >
                          <i className="fa fa-plus"></i> Add Nomination
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                {showForm && (
                  <div className="form-section">
                    <NominationForm
                      entry={editingNomination}
                      onSubmit={editingNomination ? handleUpdateNomination : handleAddNomination}
                      onCancel={handleCancelForm}
                      isEditing={!!editingNomination}
                    />
                  </div>
                )}

                {/* Detail View */}
                {viewingNomination && (
                  <div className="detail-view">
                    <div className="panel panel-default">
                      <div className="panel-header">
                        <h3>Nomination Details</h3>
                        <button 
                          className="btn btn-sm btn-default"
                          onClick={() => setViewingNomination(undefined)}
                        >
                          <i className="fa fa-times"></i>
                        </button>
                      </div>
                      <div className="panel-body">
                        <div className="row">
                          <div className="col-md-6">
                            <strong>Nominating Member:</strong> {viewingNomination.memberName}
                          </div>
                          <div className="col-md-6">
                            <strong>Member Email:</strong> {viewingNomination.memberEmail}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <strong>Nominee Organization:</strong> {viewingNomination.nominee}
                          </div>
                          <div className="col-md-6">
                            <strong>Website:</strong> {viewingNomination.website ? 
                              <a href={viewingNomination.website.startsWith('http') ? viewingNomination.website : `https://${viewingNomination.website}`} target="_blank" rel="noopener noreferrer">
                                {viewingNomination.website}
                              </a> : 'N/A'}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <strong>Filing Name:</strong> {viewingNomination.filingName || 'N/A'}
                          </div>
                          <div className="col-md-6">
                            <strong>Filing ID:</strong> {viewingNomination.filingID || 'N/A'}
                          </div>
                        </div>
                        {viewingNomination.mission && (
                          <div className="row">
                            <div className="col-md-12">
                              <strong>Mission/Notes:</strong><br />
                              {viewingNomination.mission}
                            </div>
                          </div>
                        )}
                        <div className="row">
                          <div className="col-md-12">
                            <strong>Personal/Professional Connection:</strong> 
                            <span style={{color: viewingNomination.attestation ? '#d9534f' : '#5cb85c', fontWeight: 'bold', marginLeft: '8px'}}>
                              {viewingNomination.attestation ? 'YES' : 'NO'}
                            </span>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <strong>Last Updated:</strong> {new Date(viewingNomination.lastUpdated).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* List */}
                <div className="list-section">
                  <NominationList
                    entries={filteredNominations}
                    onEdit={handleEdit}
                    onDelete={handleDeleteNomination}
                    onView={handleView}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nominations;
