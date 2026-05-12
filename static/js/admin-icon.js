// Add admin icon to Hugo pages after page load
document.addEventListener('DOMContentLoaded', function() {
  // Find the social div in the top header
  const socialDiv = document.querySelector('#top .social');
  
  if (socialDiv) {
    // // Create the party link
    // const partyLink = document.createElement('a');
    // partyLink.href = '/annual-meeting-details';
    // partyLink.className = 'party-link';
    // partyLink.title = 'Party!';
    // partyLink.innerHTML = '<div class="mini-icon"><img class="img-fluid" src="img/icons/party.svg" alt="Itinerary"><i class="img/icons/party.svg"></i></div>';

    // // Add the link to the social div
    // socialDiv.appendChild(partyLink);

    // Create the HH link
    const hhLink = document.createElement('a');
    hhLink.href = '/annual-meeting';
    hhLink.className = 'hh-link';
    hhLink.title = 'Happy Hour!';
    hhLink.innerHTML = '<div class="mini-icon"><img class="img-fluid" src="img/icons/cheers.svg" alt="Happy Hour!"><i class="img/icons/cheers.svg"></i></div>';

    // Add the link to the social div
    socialDiv.appendChild(hhLink);

    // Create the admin link
    const adminLink = document.createElement('a');
    adminLink.href = '/app';
    adminLink.className = 'admin-link';
    adminLink.title = 'Admin Tools';
    adminLink.innerHTML = '<i class="fas fa-cog"></i>';
    
    // Add the link to the social div
    socialDiv.appendChild(adminLink);

  }
});
