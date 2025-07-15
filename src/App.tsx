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
          <div className="container" role="main">
            <div className="row">
              <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
                <div className="home-page">
                  <header className="app-header">
                    <h1>First 10 Forward SPA</h1>
                    <p>Management tools for F10F organization data</p>
                  </header>
                  
                  <nav className="app-nav">
                    <div className="nav-cards">
                      <div className="nav-card" onClick={() => setCurrentPage('addressbook')}>
                        <h3><i className="fas fa-address-book"></i> Address Book</h3>
                        <p>Manage member contacts and information</p>
                      </div>
                      
                      <div className="nav-card coming-soon">
                        <h3><i className="fas fa-chart-bar"></i> Reports</h3>
                        <p>Generate membership and activity reports</p>
                        <span className="coming-soon-badge">Coming Soon</span>
                      </div>
                      
                      <div className="nav-card coming-soon">
                        <h3><i className="fas fa-calendar"></i> Events</h3>
                        <p>Manage annual meetings and events</p>
                        <span className="coming-soon-badge">Coming Soon</span>
                      </div>
                      
                      <div className="nav-card coming-soon">
                        <h3><i className="fas fa-dollar-sign"></i> Donations</h3>
                        <p>Track membership fees and donations</p>
                        <span className="coming-soon-badge">Coming Soon</span>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  const HugoHeader = () => (
    <>
      <header>
        <div id="top">
          <div className="container">
            <div className="row">
              <div className="col-xs-5">
                <p>Contact us at hello@first10forward.org</p>
              </div>
              <div className="col-xs-7">
                <div className="social">
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <header className="navbar-affixed-top" data-spy="affix" data-offset-top="62">
        <div className="navbar navbar-default yamm" role="navigation" id="navbar">
          <div className="container">
            <div className="navbar-header">
              <a className="navbar-brand home" href="/">
                <img src="/img/LogoNew1.png" alt="First 10 Forward logo" className="hidden-xs hidden-sm" />
                <img src="/img/LogoNew1.png" alt="First 10 Forward logo" className="visible-xs visible-sm" />
                <span className="sr-only">First 10 Forward - go to homepage</span>
              </a>
              <div className="navbar-buttons">
                <button type="button" className="navbar-toggle btn-template-main" data-toggle="collapse" data-target="#navigation">
                  <span className="sr-only">Toggle Navigation</span>
                  <i className="fas fa-align-justify"></i>
                </button>
              </div>
            </div>

            <div className="navbar-collapse collapse" id="navigation">
              <ul className="nav navbar-nav navbar-right">
                <li className="dropdown">
                  <a href="/">Home</a>
                </li>
                <li className="dropdown">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    What We Do <span className="caret"></span>
                  </a>
                  <ul className="dropdown-menu">
                    <li><a href="/mission">Our Mission</a></li>
                    <li><a href="/annual-grant">How It Works</a></li>
                    <li><a href="/nomination">Nomination Process</a></li>
                  </ul>
                </li>
                <li className="dropdown">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    About Us <span className="caret"></span>
                  </a>
                  <ul className="dropdown-menu">
                    <li><a href="/history">History</a></li>
                    <li><a href="/leadership">Leadership</a></li>
                  </ul>
                </li>
                <li className="dropdown">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    Join Us <span className="caret"></span>
                  </a>
                  <ul className="dropdown-menu">
                    <li><a href="/membership">Membership</a></li>
                    <li><a href="/annual-meeting">Annual Meeting</a></li>
                  </ul>
                </li>
                <li className="dropdown active">
                  <a href="/app">Admin Tools</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </>
  )

  return (
    <div className="app" id="all">
      <HugoHeader />
      
      <div id="content">
        {currentPage !== 'home' && (
          <div className="top-nav">
            <button className="nav-home-btn" onClick={() => setCurrentPage('home')}>
              <i className="fas fa-home"></i> Dashboard
            </button>
            <h2>{currentPage === 'addressbook' ? 'Address Book' : 'Dashboard'}</h2>
          </div>
        )}
        
        <div className="app-content">
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

export default App
