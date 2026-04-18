// Import Firestore DB and functions from Firebase
import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get DOM elements where data will be rendered
const offerTableBody = document.getElementById("offerTableBody"); // Table where offers will be listed
const comparisonContainer = document.getElementById("comparisonContainer"); // Comparison table container
const comparisonTable = document.getElementById("comparisonTable"); // Table that shows comparison

// Store selected offers to compare
let selectedOffers = [];

// Function to fetch all offers from Firestore
async function fetchOffers() {
  // Get all documents from "offers" collection
  const snapshot = await getDocs(collection(db, "offers"));

  // Loop through each offer and render in the table
  snapshot.forEach((doc) => {
    const offer = doc.data(); // Get data from doc
    const tr = document.createElement("tr"); // Create a new table row

    // Set HTML for the row, including a checkbox to select the offer
    tr.innerHTML = `
      <td><input type="checkbox" data-id="${doc.id}"></td>
      <td>${offer.shopName}</td>
      <td>${offer.offerTitle}</td>
      <td>${offer.discount}</td>
      <td>${offer.startDate}</td>
      <td>${offer.endDate}</td>
    `;

    // Add change event listener to the checkbox
    tr.querySelector("input").addEventListener("change", (e) =>
      handleSelect(e, doc.id, offer) // Handle selection logic
    );

    // Append row to the table body
    offerTableBody.appendChild(tr);
  });
}

// Handle selection/deselection of offers
function handleSelect(event, id, offerData) {
  if (event.target.checked) {
    // If already 2 offers selected, disallow more
    if (selectedOffers.length < 2) {
      selectedOffers.push({ id, ...offerData }); // Add selected offer
    } else {
      event.target.checked = false; // Uncheck current
      alert("You can only compare 2 offers at a time."); // Alert user
    }
  } else {
    // Remove deselected offer from the array
    selectedOffers = selectedOffers.filter(o => o.id !== id);
  }

  // Update comparison UI
  renderComparison();
}

// Render comparison table if exactly 2 offers selected
function renderComparison() {
  if (selectedOffers.length === 2) {
    const [o1, o2] = selectedOffers; // Destructure selected offers

    comparisonContainer.style.display = "block"; // Show comparison container

    // Build comparison rows
    comparisonTable.innerHTML = `
      <tr>
        <td>Shop Name</td>
        <td>${o1.shopName}</td>
        <td>${o2.shopName}</td>
      </tr>
      <tr>
        <td>Offer Title</td>
        <td>${o1.offerTitle}</td>
        <td>${o2.offerTitle}</td>
      </tr>
      <tr>
        <td>Discount (%)</td>
        <td>${o1.discount}</td>
        <td>${o2.discount}</td>
      </tr>
      <tr>
        <td>Start Date</td>
        <td>${o1.startDate}</td>
        <td>${o2.startDate}</td>
      </tr>
      <tr>
        <td>End Date</td>
        <td>${o1.endDate}</td>
        <td>${o2.endDate}</td>
      </tr>
    `;
  } else {
    // If less than 2 selected, hide comparison
    comparisonContainer.style.display = "none";
    comparisonTable.innerHTML = "";
  }
}

// Fetch offers when page loads
window.onload = fetchOffers;
