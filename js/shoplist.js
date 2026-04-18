// Import Firestore database reference from firebase.js
import { db } from './firebase.js';

// Import necessary Firestore functions from CDN
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get references to filter dropdowns and shop list table body
const categoryFilter = document.getElementById("categoryFilter"); // Dropdown to filter by category
const floorFilter = document.getElementById("floorFilter");       // Dropdown to filter by floor
const shopList = document.getElementById("shopList");             // Table body to display shops

// Initialize array to store all shop data from Firestore
let allShops = [];

// Function to render shop table based on provided data (filtered or full)
function renderShopTable(dataList) {
  shopList.innerHTML = ""; // Clear existing table rows

  // Get selected values from filters
  const selectedCategory = categoryFilter.value;
  const selectedFloor = floorFilter.value;

  // Filter shop data based on selected category and floor
  const filtered = dataList.filter(shop => {
    const matchesCategory = selectedCategory === "" || shop.category === selectedCategory; // Match or allow all
    const matchesFloor = selectedFloor === "" || shop.floor === selectedFloor;             // Match or allow all
    return matchesCategory && matchesFloor; // Only include if both filters match
  });

  // If no shops match, show "No shops found" message
  if (filtered.length === 0) {
    shopList.innerHTML = `<tr><td colspan="7" style="text-align:center;">No shops found.</td></tr>`;
    return; // Exit the function
  }

  // Create table row for each filtered shop
  filtered.forEach(shop => {
    const row = document.createElement("tr"); // Create new table row
    row.innerHTML = `
      <td>${shop.shopName}</td>
      <td>${shop.ownerName}</td>
      <td>${shop.category}</td>
      <td>${shop.floor}</td>
      <td>${shop.contact}</td>
      <td>${shop.email}</td>
      <td>${shop.description}</td>
    `;
    shopList.appendChild(row); // Append row to the table body
  });
}

// Function to populate the filter dropdowns with unique category and floor values
function populateFilters() {
  // Get unique categories using Set
  const categories = [...new Set(allShops.map(s => s.category))];

  // Get unique floors using Set
  let floors = [...new Set(allShops.map(s => s.floor))];

  // Define custom order for floors
  const floorOrder = ["Ground", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

  // Sort floor values based on the custom floorOrder array
  floors.sort((a, b) => {
    const indexA = floorOrder.indexOf(a); // Find index of floor A
    const indexB = floorOrder.indexOf(b); // Find index of floor B

    // If both not found in floorOrder, sort alphabetically
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    
    // If A is not found but B is, place B before A
    if (indexA === -1) return 1;

    // If B is not found but A is, place A before B
    if (indexB === -1) return -1;

    // Otherwise, sort based on their indices in the order array
    return indexA - indexB;
  });

  // Add default "All" option for both filters
  categoryFilter.innerHTML = `<option value="">All Categories</option>`;
  floorFilter.innerHTML = `<option value="">All Floors</option>`;

  // Populate category filter dropdown with options
  categories.forEach(c => {
    const opt = document.createElement("option"); // Create new option
    opt.value = c;                                // Set option value
    opt.textContent = c;                          // Set display text
    categoryFilter.appendChild(opt);              // Append to dropdown
  });

  // Populate floor filter dropdown with options
  floors.forEach(f => {
    const opt = document.createElement("option"); // Create new option
    opt.value = f;                                // Set option value
    opt.textContent = f;                          // Set display text
    floorFilter.appendChild(opt);                 // Append to dropdown
  });
}

// Async function to load shop data from Firestore
async function loadShops() {
  const snapshot = await getDocs(collection(db, "shops")); // Get all documents in "shops" collection

  // Convert Firestore documents to plain objects and store in allShops
  allShops = snapshot.docs.map(doc => doc.data());

  populateFilters();            // Populate dropdowns after data is loaded
  renderShopTable(allShops);   // Render the full shop list initially
}

// Attach change event listeners to both filters to re-render table when selection changes
categoryFilter.addEventListener("change", () => renderShopTable(allShops)); // When category changes
floorFilter.addEventListener("change", () => renderShopTable(allShops));    // When floor changes

// Initial data loading when script runs
loadShops();
