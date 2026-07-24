import { useState } from 'react';
import MembershipForm from '../components/MembershipForm';

const DUES_INFO = 'Annual membership dues are $1,000. For new members, there is a one-time $200 donation to cover operating expenses.';

const Membership = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="container" role="main">
      <div className="row">
        <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
          <div className="membership-page">
            <header className="page-header">
              <h2>Membership Information</h2>
              <p className="lead">
                Keep your contact information up to date with First 10 Forward.
              </p>
            </header>

            <MembershipForm />

            <div className="membership-dues-section">
              <div className="dues-header">
                <h4>Pay Membership Dues</h4>
                <span
                  className="dues-info-trigger"
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                  aria-label={DUES_INFO}
                >
                  <i className="fas fa-info-circle"></i>
                  {tooltipVisible && (
                    <div className="dues-info-popover" role="tooltip">
                      {DUES_INFO}
                    </div>
                  )}
                </span>
              </div>
              <p>
                Send payment via Zelle from your bank's app or website to{' '}
                <strong>treasurer@first10forward.org</strong>, or scan the QR
                code below with your bank's Zelle scanner.
              </p>
              <img
                src="/img/f10f-zelle.jpg"
                alt="Zelle QR code for treasurer@first10forward.org"
                className="zelle-qr"
                style={{ maxWidth: '240px', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
