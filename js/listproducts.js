// Import Firestore database reference from local firebase.js file
import { db } from './firebase.js';

// Import Firestore functions from Firebase CDN
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get reference to the table body where product offers will be inserted
const productOfferList = document.getElementById("productOfferList");

// Async function to load product offers from Firestore
async function loadProductOffers() {
  // Fetch all documents from the "product_offers" collection
  const snapshot = await getDocs(collection(db, "product_offers"));

  // Clear any existing rows inside the table body
  productOfferList.innerHTML = "";

  // If no offers are available, display a single row with a message
  if (snapshot.empty) {
    const row = document.createElement("tr"); // Create a new table row
    row.innerHTML = `<td colspan="6" style="text-align:center;">No product offers available.</td>`; // Message across all columns
    productOfferList.appendChild(row); // Add row to the table
    return; // Exit function
  }

  // Loop through each document in the snapshot
  snapshot.forEach(doc => {
    const data = doc.data(); // Get the document's data as an object
    const row = document.createElement("tr"); // Create a new table row

    // Populate row with data fields or fallback to '-' if missing
    row.innerHTML = `
      <td>${data.productName || '-'}</td>
      <td>${data.brand || '-'}</td>
      <td>${data.category || '-'}</td>
      <td>${data.discount || '-'}</td>
      <td>${data.startDate || '-'} to ${data.endDate || '-'}</td>
      <td>${data.shopName || '-'}</td>
    `;

    productOfferList.appendChild(row); // Append the row to the table body
  });
}

// Run the loadProductOffers function when the window has finished loading
window.onload = loadProductOffers;
