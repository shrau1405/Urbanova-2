// Import Firebase auth and db instances from your local firebase.js config
import { auth, db } from "./firebase.js";

// Import Firebase Authentication method
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Import Firestore methods for querying user role
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Async login function triggered on button click
async function login() {
  // Get selected role, email, and password input values
  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error"); // Error display element

  // Check for empty fields
  if (!role || !email || !password) {
    errorEl.textContent = "Please fill all fields.";
    return;
  }

  try {
    // Step 1: Sign in using Firebase Authentication
    await signInWithEmailAndPassword(auth, email, password);

    // Step 2: Query Firestore to get role info for the user
    const rolesRef = collection(db, "roles"); // Reference to roles collection
    const q = query(rolesRef, where("email", "==", email)); // Query roles where email matches
    const snapshot = await getDocs(q); // Execute the query

    // If no matching document found in roles collection
    if (snapshot.empty) {
      errorEl.textContent = "No role found for this user.";
      return;
    }

    // Variable to store matched role
    let matchedRole = null;

    // Loop through results to find exact role match
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.role === role) {
        matchedRole = data.role;
      }
    });

    // If role in Firestore doesn't match selected role
    if (!matchedRole) {
      errorEl.textContent = "Incorrect role selected.";
      return;
    }

    // Redirect based on user role
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "merchant") {
      window.location.href = "merchant.html";
    } else if (role === "customer") {
      window.location.href = "customer.html";
    } else if (role === "user") {
      window.location.href = "userhome.html"; // Redirect user to homepage/dashboard
    } else {
      errorEl.textContent = "Role not recognized."; // Fallback for unknown role
    }

  } catch (error) {
    // Catch authentication or database errors
    errorEl.textContent = "Invalid credentials or role.";
    console.error("Login error:", error); // Log error to console for debugging
  }
}

// Expose the login function to global window scope so it can be called from HTML
window.login = login;
