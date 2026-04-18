// Import Firestore database instance
import { db } from "./firebase.js";

// Import Firestore methods
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ✅ Import logEvent from logger.js
import { logEvent } from "./logger.js";

// DOM elements
const shopList = document.getElementById("shop-list");
const categoryFilter = document.getElementById("categoryFilter");
const floorFilter = document.getElementById("floorFilter");

// --- DELETE MODAL SETUP ---
const deleteModal = document.createElement("div");
deleteModal.className = "delete-modal";
deleteModal.style.display = "none";
deleteModal.innerHTML = `
  <div class="delete-modal-content">
    <p>Are you sure you want to delete this shop?</p>
    <button id="confirmDelete">Yes</button>
    <button id="cancelDelete">Cancel</button>
  </div>
`;
document.body.appendChild(deleteModal);

// --- EDIT MODAL SETUP ---
const editModal = document.createElement("div");
editModal.className = "modal";
editModal.style.display = "none";
editModal.innerHTML = `
  <div class="modal-content" style="margin: auto; max-width: 500px;">
    <h3>Edit Shop</h3>
    <form id="editForm">
      <input type="text" id="editShopName" required placeholder="Shop Name"/>
      <input type="text" id="editOwnerName" required placeholder="Owner Name"/>
      <input type="text" id="editCategory" required placeholder="Category"/>
      <input type="text" id="editFloor" required placeholder="Floor"/>
      <input type="text" id="editContact" required placeholder="Contact"/>
      <input type="email" id="editEmail" required placeholder="Email"/>
      <textarea id="editDescription" required placeholder="Description"></textarea>
      <div class="modal-actions">
        <button type="submit">Save</button>
        <button type="button" id="cancelEdit">Cancel</button>
      </div>
    </form>
  </div>
`;
document.body.appendChild(editModal);

let currentEditId = null;
let currentDeleteId = null;

const confirmDeleteBtn = deleteModal.querySelector("#confirmDelete");
const cancelDeleteBtn = deleteModal.querySelector("#cancelDelete");
const editForm = document.getElementById("editForm");
const cancelEditBtn = document.getElementById("cancelEdit");

function createRow(docSnap, data) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.shopName}</td>
    <td>${data.ownerName}</td>
    <td>${data.category}</td>
    <td>${data.floor}</td>
    <td>${data.contact}</td>
    <td>${data.email}</td>
    <td>${data.description}</td>
    <td>
      <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
      <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
      <button class="view-btn" data-name="${data.shopName}">View</button>
    </td>
  `;
  return row;
}

async function fetchShops() {
  const querySnapshot = await getDocs(collection(db, "shops"));
  const allData = [];
  const categories = new Set();
  const floors = new Set();

  shopList.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    data.id = docSnap.id;
    allData.push(data);
    categories.add(data.category);
    floors.add(data.floor);
  });

  const sortedCategories = [...categories].sort();
  const floorOrder = ["Ground", "1st", "2nd", "3rd", "4th"];
  const sortedFloors = [...floors].sort((a, b) => floorOrder.indexOf(a) - floorOrder.indexOf(b));

  renderFilterOptions(sortedCategories, sortedFloors);
  renderShopList(allData);

  categoryFilter.addEventListener("change", () => renderShopList(allData));
  floorFilter.addEventListener("change", () => renderShopList(allData));
}

function renderFilterOptions(categories, floors) {
  categoryFilter.innerHTML = `<option value="">All</option>`;
  categories.forEach((c) => {
    categoryFilter.innerHTML += `<option value="${c}">${c}</option>`;
  });

  floorFilter.innerHTML = `<option value="">All</option>`;
  floors.forEach((f) => {
    floorFilter.innerHTML += `<option value="${f}">${f}</option>`;
  });
}

function renderShopList(dataList) {
  const selectedCategory = categoryFilter.value;
  const selectedFloor = floorFilter.value;
  shopList.innerHTML = "";

  const filtered = dataList.filter((d) => {
    const matchCategory = selectedCategory ? d.category === selectedCategory : true;
    const matchFloor = selectedFloor ? d.floor === selectedFloor : true;
    return matchCategory && matchFloor;
  });

  if (filtered.length === 0) {
    shopList.innerHTML = `<tr><td colspan="8" style="text-align:center;">No shops match the selected filters.</td></tr>`;
    return;
  }

  filtered.forEach((data) => {
    const row = createRow({ id: data.id }, data);
    shopList.appendChild(row);
  });
}

document.addEventListener("click", async (e) => {
  // Edit
  if (e.target.matches(".edit-btn")) {
    const id = e.target.dataset.id;
    const docSnap = await getDoc(doc(db, "shops", id));
    const data = docSnap.data();
    currentEditId = id;

    document.getElementById("editShopName").value = data.shopName;
    document.getElementById("editOwnerName").value = data.ownerName;
    document.getElementById("editCategory").value = data.category;
    document.getElementById("editFloor").value = data.floor;
    document.getElementById("editContact").value = data.contact;
    document.getElementById("editEmail").value = data.email;
    document.getElementById("editDescription").value = data.description;

    editModal.style.display = "block";
  }

  // Delete
  if (e.target.matches(".delete-btn")) {
    currentDeleteId = e.target.dataset.id;
    deleteModal.style.display = "block";
  }

  // View
  if (e.target.matches(".view-btn")) {
    const name = e.target.dataset.name.toLowerCase();
    const brandLinks = {
      nike: "https://www.nike.com",
      zara: "https://www.zara.com",
      adidas: "https://www.adidas.com",
      "goodluck cafe": "https://goodluckcafe.co.in/about-us/",
      giva: "https://www.giva.co/",
      "taco bell": "https://www.tacobell.co.in/",
      "reliance digital": "https://www.reliancedigital.in/",
      max: "https://www.maxfashion.in/in/en/"
    };

    const url = brandLinks[name];
    if (url) {
      await logEvent(`Viewed website of: ${name}`);
      window.open(url, "_blank");
    } else {
      alert("Preview not available for this store.");
    }
  }
});

// Save edit
editForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!currentEditId) return;

  const updatedData = {
    shopName: document.getElementById("editShopName").value,
    ownerName: document.getElementById("editOwnerName").value,
    category: document.getElementById("editCategory").value,
    floor: document.getElementById("editFloor").value,
    contact: document.getElementById("editContact").value,
    email: document.getElementById("editEmail").value,
    description: document.getElementById("editDescription").value
  };

  await updateDoc(doc(db, "shops", currentEditId), updatedData);
  await logEvent(`Edited shop: ${updatedData.shopName}`);

  editModal.style.display = "none";
  currentEditId = null;
  fetchShops();
};

cancelEditBtn.onclick = () => {
  editModal.style.display = "none";
  currentEditId = null;
};

// Delete shop
confirmDeleteBtn.onclick = async () => {
  if (!currentDeleteId) return;

  const docRef = doc(db, "shops", currentDeleteId);
  const docSnap = await getDoc(docRef);
  const shopName = docSnap.exists() ? docSnap.data().shopName : "Unknown";

  await deleteDoc(docRef);
  await logEvent(`Deleted shop: ${shopName}`);

  deleteModal.style.display = "none";
  currentDeleteId = null;
  fetchShops();
};

cancelDeleteBtn.onclick = () => {
  deleteModal.style.display = "none";
  currentDeleteId = null;
};

window.onclick = (e) => {
  if (e.target === editModal) {
    editModal.style.display = "none";
    currentEditId = null;
  }
  if (e.target === deleteModal) {
    deleteModal.style.display = "none";
    currentDeleteId = null;
  }
};

window.onload = fetchShops;
