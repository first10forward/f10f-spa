import TripInterestForm from '../components/TripInterestForm';

const TripInterest = () => {
  return (
    <div className="container" role="main">
      <div className="row">
        <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
          <div className="trip-interest-page">
            <header className="page-header">
              <h2>Annual Retreat Interest</h2>
              <p className="lead">
                Sign up to receive updates and details about the upcoming annual retreat.
                We'll only email you about trip-related news.
              </p>
            </header>
            <TripInterestForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripInterest;
