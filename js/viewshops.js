// Import Firebase Firestore instance and required functions
import { db } from './firebase.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get reference to the table body where shop list will be displayed
const shopList = document.getElementById('shopList');

// Get reference to the shop details box section
const detailsBox = document.getElementById('shopDetails');

// Map to store references to all detail fields inside the details box
const fields = {
  ownerName: document.getElementById('ownerName'),   // Owner's name field
  category: document.getElementById('category'),     // Shop category field
  floor: document.getElementById('floor'),           // Shop floor field
  contact: document.getElementById('contact'),       // Contact number field
  email: document.getElementById('email'),           // Email address field
  description: document.getElementById('description')// Shop description field
};

// ===============================
// Function to load all shops from Firestore and render them in table
// ===============================
async function loadShops() {
  // Fetch all documents from 'shops' collection
  const snapshot = await getDocs(collection(db, 'shops'));

  // Clear the current table content
  shopList.innerHTML = "";

  // Loop through each document in the snapshot
  snapshot.forEach(docSnap => {
    const data = docSnap.data(); // Get document data
    const tr = document.createElement("tr"); // Create a table row

    // Populate the row with checkbox and shop name
    tr.innerHTML = `
      <td>
        <label>
          <input type="checkbox" class="shop-checkbox" value="${docSnap.id}" />
          ${data.shopName}
        </label>
      </td>
    `;

    // Append the row to the table body
    shopList.appendChild(tr);
  });
}

// ===============================
// Event listener to handle checkbox selection for shop details
// ===============================
document.addEventListener("change", async (e) => {
  // Check if the changed input is a shop checkbox
  if (e.target.classList.contains("shop-checkbox")) {
    const checkboxes = document.querySelectorAll(".shop-checkbox");

    // Uncheck all other checkboxes except the one clicked
    checkboxes.forEach(cb => {
      if (cb !== e.target) cb.checked = false;
    });

    // If the current checkbox is checked, show shop details
    if (e.target.checked) {
      const id = e.target.value; // Get selected shop document ID
      const docSnap = await getDoc(doc(db, "shops", id)); // Fetch document
      const data = docSnap.data(); // Extract data

      // Fill the details box with shop data, fallback to empty string if missing
      fields.ownerName.textContent = data.ownerName || "";
      fields.category.textContent = data.category || "";
      fields.floor.textContent = data.floor || "";
      fields.contact.textContent = data.contact || "";
      fields.email.textContent = data.email || "";
      fields.description.textContent = data.description || "";

      // Display the details box
      detailsBox.style.display = "block";
    } else {
      // Hide the details box if no checkbox is selected
      detailsBox.style.display = "none";
    }
  }
});

// ===============================
// Initial call to load all shops when page loads
// ===============================
loadShops();
