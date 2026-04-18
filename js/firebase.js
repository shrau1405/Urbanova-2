// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbbElLjd5TjSL65IRLv264OMaCE_fwQU4",
  authDomain: "supermall-3046c.firebaseapp.com",
  projectId: "supermall-3046c",
  storageBucket: "supermall-3046c.appspot.com",
  messagingSenderId: "514168842739",
  appId: "1:514168842739:web:d9e253daf596d4de108a86",
  measurementId: "G-XQVL4KQZTC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
