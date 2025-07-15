import { useState } from 'react'
import AddressBook from './pages/AddressBook'
import './App.css'

type AppPage = 'home' | 'addressbook';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'addressbook':
        return <AddressBook />
      case 'home':
      default:
        return (
          <div className="home-page">
            <header className="app-header">
              <h1>First 10 Forward SPA</h1>
              <p>A single-page application for managing F10F organization data</p>
            </header>
            
            <nav className="app-nav">
              <div className="nav-cards">
                <div className="nav-card" onClick={() => setCurrentPage('addressbook')}>
                  <h3>📇 Address Book</h3>
                  <p>Manage member contacts and information</p>
                </div>
                
                <div className="nav-card coming-soon">
                  <h3>🌐 Public Pages</h3>
                  <p>View public content from the Hugo site</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
                
                <div className="nav-card coming-soon">
                  <h3>🔐 Protected Area</h3>
                  <p>Access member-only content with Entra authentication</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>
            </nav>
          </div>
        )
    }
  }

  return (
    <div className="app">
      {currentPage !== 'home' && (
        <nav className="top-nav">
          <button 
            onClick={() => setCurrentPage('home')} 
            className="nav-home-btn"
          >
            ← Home
          </button>
          <h2>First 10 Forward</h2>
        </nav>
      )}
      
      <main className="app-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
