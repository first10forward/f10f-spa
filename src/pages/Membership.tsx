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
                Send payment via Zelle to{' '}
                <strong>treasurer@first10forward.org</strong>
              </p>
              <a
                href="https://zellepay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-default"
              >
                <i className="fas fa-external-link-alt"></i> Open Zelle
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
