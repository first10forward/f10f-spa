// Add admin icon to Hugo pages after page load
document.addEventListener('DOMContentLoaded', function() {
  // Find the social div in the top header
  const socialDiv = document.querySelector('#top .social');
  
  if (socialDiv) {
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
