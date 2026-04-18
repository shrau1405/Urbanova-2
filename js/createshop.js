// Import the reusable logger function
import { logEvent } from "../js/logger.js";

// Import Firestore instance from local Firebase config
import { db } from "../js/firebase.js";

// Import Firestore methods to add a document and get timestamp
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Wait for the full DOM to load before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Get the shop registration form and message display element
  const form = document.getElementById("shop-form");
  const messageEl = document.getElementById("form-message");

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form reload
    messageEl.textContent = ""; // Clear any previous message

    // Get values from form fields and trim whitespace
    const shopName = document.getElementById("shop-name").value.trim();
    const ownerName = document.getElementById("owner-name").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const category = document.getElementById("category").value;
    const floor = document.getElementById("floor").value;
    const email = document.getElementById("email").value.trim();
    const description = document.getElementById("description").value.trim();
    const website = document.getElementById("website").value.trim(); // ✅ optional website field

    // Validate that all required fields are filled
    if (!shopName || !ownerName || !contact || !category || !floor || !email || !description) {
      messageEl.textContent = "Please fill in all fields.";
      messageEl.style.color = "red";
      setTimeout(() => (messageEl.textContent = ""), 7000); // Clear message after 7 sec
      return;
    }

    try {
      // Add a new document to the "shops" collection in Firestore
      await addDoc(collection(db, "shops"), {
        shopName,
        ownerName,
        contact,
        category,
        floor,
        email,
        description,
        website, // ✅ include website if provided
        createdAt: serverTimestamp() // Record submission time
      });

      // ✅ Log the successful action
      await logEvent(`Shop '${shopName}' created by ${ownerName}`, email);

      // Show success message, reset form, then clear message after 7 sec
      messageEl.textContent = "Shop details successfully added!";
      messageEl.style.color = "green";
      form.reset();
      setTimeout(() => (messageEl.textContent = ""), 7000);

    } catch (error) {
      // Log the failure (optional but recommended)
      await logEvent(`❌ Failed to create shop '${shopName}' by ${ownerName}`, email);

      // Handle and display any Firestore write errors
      console.error("Error adding document: ", error);
      messageEl.textContent = "Error saving shop details. Try again.";
      messageEl.style.color = "red";
      setTimeout(() => (messageEl.textContent = ""), 7000);
    }
  });
});
