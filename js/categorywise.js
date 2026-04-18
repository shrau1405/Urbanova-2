// Import the Firestore database instance from firebase.js
import { db } from './firebase.js';

// Import Firestore functions: collection to access a Firestore collection, getDocs to retrieve its documents
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get the tbody element where the category-wise rows will be inserted
const categoryList = document.getElementById("categoryList");

/**
 * Helper function to group shops based on a specific field
 * @param {Array} shops - Array of shop objects
 * @param {String} field - Field name to group by (e.g., "category")
 * @returns {Object} - Object with field values as keys and arrays of shop names as values
 */
function groupShopsByField(shops, field) {
  const grouped = {}; // Initialize empty object for grouping
  shops.forEach(shop => {
    const key = shop[field]; // Get the field value (e.g., shop.category)
    if (!grouped[key]) grouped[key] = []; // If key not present, create array
    grouped[key].push(shop.shopName); // Add shop name to the array for that key
  });
  return grouped; // Return the grouped object
}

/**
 * Fetch shop data from Firestore and render category-wise table rows
 */
async function fetchAndRenderCategoryTable() {
  // Fetch all documents from the "shops" collection
  const snapshot = await getDocs(collection(db, "shops"));

  // Extract raw data (shop objects) from snapshot
  const shops = snapshot.docs.map(doc => doc.data());

  // Group the shop data by "category" field
  const categoryMap = groupShopsByField(shops, "category");

  // Clear any existing rows in the table body
  categoryList.innerHTML = "";

  // Loop through each category and its corresponding shop names
Object.entries(categoryMap).forEach(([category, shopNames]) => {
  const card = document.createElement("div");
  card.className = "category-card";

  card.innerHTML = `
    <div class="category-card-inner">
      <div class="category-front">
        <h3>${category}</h3>
      </div>
      <div class="category-back">
        <h4>Shops</h4>
        <ul>
          ${shopNames.map(shop => `<li>${shop}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;

  categoryList.appendChild(card);
});

}

// Call the fetchAndRenderCategoryTable function when the page finishes loading
window.onload = fetchAndRenderCategoryTable;
