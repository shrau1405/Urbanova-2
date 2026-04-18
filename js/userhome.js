// Function to navigate to different sections/pages based on the passed identifier
function navigate(section) {
  // Switch statement to determine which page to go to
  switch (section) {
    case 'category':
      // Redirect to the category-wise details page
      window.location.href = 'categorywise.html';
      break;
    case 'shoplist':
      // Redirect to the page showing list of all shops
      window.location.href = 'shoplist.html';
      break;
    case 'offers':
      // Redirect to the product offers listing page
      window.location.href = 'listproducts.html';
      break;
    case 'compare':
      // Redirect to the product comparison page
      window.location.href = 'compare.html';
      break;
    case 'shopwise':
      // Redirect to the page that shows offers for each shop
      window.location.href = 'listoffers.html';
      break;
    case 'floorwise':
      // Redirect to the floor-wise details page
      window.location.href = 'floorwise.html';
      break;
    case 'viewshop':
      // Redirect to the view shop details page
      window.location.href = 'viewshops.html';
      break;
    default:
      // If the section does not match any case, show alert
      alert('Page under construction!');
  }
}
