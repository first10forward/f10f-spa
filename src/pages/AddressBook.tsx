import React, { useState, useEffect } from 'react';
import type { AddressBookEntry, CreateAddressBookEntry } from '../types/AddressBook';
import { addressBookService } from '../services/AddressBookService';
import AddressBookForm from '../components/AddressBookForm';
import AddressBookList from '../components/AddressBookList';
import ContactDetailView from '../components/ContactDetailView';
import './AddressBook.css';

type ViewMode = 'list' | 'form' | 'detail';

const AddressBook: React.FC = () => {
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AddressBookEntry[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [editingEntry, setEditingEntry] = useState<AddressBookEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<AddressBookEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof AddressBookEntry>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileStatus, setFileStatus] = useState<{ hasFile: boolean; fileName: string | null }>({ hasFile: false, fileName: null });

  // Load entries on component mount
  useEffect(() => {
    loadEntries();
    updateFileStatus();
  }, []);

  // Filter and sort entries when dependencies change
  useEffect(() => {
    let filtered = entries;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = entries.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.email && entry.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.year.toString().includes(searchQuery) ||
        (entry.cellPhone && entry.cellPhone.includes(searchQuery)) ||
        (entry.mailingAddress && entry.mailingAddress.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue && bValue && aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue && bValue && aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEntries(filtered);
  }, [entries, searchQuery, sortBy, sortOrder]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedEntries = await addressBookService.getAllEntries();
      setEntries(loadedEntries);
    } catch (err) {
      setError('Failed to load contacts. Please try again.');
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (entryData: CreateAddressBookEntry) => {
    try {
      setLoading(true);
      setError(null);
      const newEntry = await addressBookService.createEntry(entryData);
      setEntries(prev => [...prev, newEntry]);
      setCurrentView('list');
      setEditingEntry(null);
    } catch (err) {
      setError('Failed to create contact. Please try again.');
      console.error('Error creating entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntry = async (entryData: CreateAddressBookEntry) => {
    if (!editingEntry) return;

    try {
      setLoading(true);
      setError(null);
      const updatedEntry = await addressBookService.updateEntry({
        id: editingEntry.id,
        ...entryData
      });
      
      if (updatedEntry) {
        setEntries(prev => prev.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        ));
        setCurrentView('list');
        setEditingEntry(null);
      }
    } catch (err) {
      setError('Failed to update contact. Please try again.');
      console.error('Error updating entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await addressBookService.deleteEntry(id);
      
      if (success) {
        setEntries(prev => prev.filter(entry => entry.id !== id));
        setCurrentView('list');
        setViewingEntry(null);
      }
    } catch (err) {
      setError('Failed to delete contact. Please try again.');
      console.error('Error deleting entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof AddressBookEntry) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportData = () => {
    try {
      const jsonData = addressBookService.exportToJson();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `address-book-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data.');
      console.error('Export error:', err);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        await addressBookService.importFromJson(jsonData);
        await loadEntries();
        setError(null);
      } catch (err) {
        setError('Failed to import data. Please check the file format.');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  };

  const updateFileStatus = () => {
    setFileStatus(addressBookService.getFileStatus());
  };

  const initializeFileAccess = async () => {
    try {
      setLoading(true);
      const success = await addressBookService.initializeFileAccess();
      if (success) {
        updateFileStatus();
        setError(null);
      } else {
        setError('File access not supported in this browser. Data will be saved locally only.');
      }
    } catch (err) {
      setError('Failed to initialize file access.');
      console.error('Error initializing file access:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFromFile = async () => {
    try {
      setLoading(true);
      const success = await addressBookService.loadFromExistingFile();
      if (success) {
        await loadEntries();
        updateFileStatus();
        setError(null);
      }
    } catch (err) {
      setError('Failed to load from file.');
      console.error('Error loading from file:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-book">
      <header className="address-book-header">
        <h1>Address Book</h1>
        
        {currentView === 'list' && (
          <div className="header-controls">
            <div className="search-controls">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as keyof AddressBookEntry)}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="year">Sort by Year</option>
                <option value="email">Sort by Email</option>
                <option value="lastUpdated">Sort by Last Updated</option>
              </select>
              
              <button
                onClick={() => handleSort(sortBy)}
                className="sort-toggle"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            
            <div className="action-controls">
              <button
                onClick={() => setCurrentView('form')}
                className="btn btn-primary"
              >
                Add Contact
              </button>
              
              {fileStatus.hasFile ? (
                <span className="file-status">
                  📁 Saving to: {fileStatus.fileName}
                </span>
              ) : (
                <button onClick={initializeFileAccess} className="btn btn-info">
                  Save to File
                </button>
              )}
              
              <button onClick={loadFromFile} className="btn btn-secondary">
                Load from File
              </button>
              
              <button onClick={exportData} className="btn btn-secondary">
                Export
              </button>
              
              <label className="btn btn-secondary file-input-label">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      <main className="address-book-content">
        {currentView === 'list' && (
          <AddressBookList
            entries={filteredEntries}
            onEdit={(entry) => {
              setEditingEntry(entry);
              setCurrentView('form');
            }}
            onDelete={handleDeleteEntry}
            onView={(entry) => {
              setViewingEntry(entry);
              setCurrentView('detail');
            }}
          />
        )}

        {currentView === 'form' && (
          <AddressBookForm
            entry={editingEntry || undefined}
            onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
            onCancel={() => {
              setCurrentView('list');
              setEditingEntry(null);
            }}
            isEditing={!!editingEntry}
          />
        )}

        {currentView === 'detail' && viewingEntry && (
          <ContactDetailView
            entry={viewingEntry}
            onEdit={() => {
              setEditingEntry(viewingEntry);
              setCurrentView('form');
            }}
            onDelete={() => handleDeleteEntry(viewingEntry.id)}
            onClose={() => {
              setCurrentView('list');
              setViewingEntry(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default AddressBook;
