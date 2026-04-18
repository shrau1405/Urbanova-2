// logger.js

// Import Firestore config and methods
import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Export the logEvent function so other files can use it
export async function logEvent(message, userEmail = "System") {
  try {
    await addDoc(collection(db, "logs"), {
      message,
      user: userEmail,
      timestamp: serverTimestamp()
    });
    console.log("✅ Logged:", message);
  } catch (err) {
    console.error("❌ Logging failed:", err);
  }
}
