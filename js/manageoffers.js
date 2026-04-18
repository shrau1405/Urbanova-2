// Import Firestore instance from firebase.js
import { db } from './firebase.js';
import { logEvent } from './logger.js'; // ✅ logging module

// Import necessary Firestore functions from Firebase CDN
import {
  collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get references to DOM elements
const offerForm = document.getElementById('offerForm');
const shopInput = document.getElementById('shopName');
const categoryInput = document.getElementById('category');
const floorInput = document.getElementById('floor');
const offerList = document.getElementById('offer-list');
const categoryFilter = document.getElementById('categoryFilter');
const floorFilter = document.getElementById('floorFilter');

// Get references to Firestore collections
let offersRef = collection(db, "offers");
let shopsRef = collection(db, "shops");

// Declare required state variables
let allOffers = [];
let currentEditId = null;
let currentDeleteId = null;

// 🟡 Append Delete Modal
const deleteModal = document.createElement("div");
deleteModal.className = "delete-modal";
deleteModal.innerHTML = `
  <div class="delete-modal-content">
    <p>Are you sure you want to delete this offer?</p>
    <button id="confirmDelete">Yes</button>
    <button id="cancelDelete">Cancel</button>
  </div>
`;
document.body.appendChild(deleteModal);

// 🟢 Append Edit Modal
const editModal = document.createElement("div");
editModal.className = "modal";
editModal.innerHTML = `
  <div class="modal-content" style="margin:auto; max-width:500px;">
    <h3>Edit Offer</h3>
    <form id="editForm">
      <input type="text" id="editShopName" placeholder="Shop Name" required />
      <input type="text" id="editCategory" placeholder="Category" required />
      <input type="text" id="editFloor" placeholder="Floor" required />
      <input type="text" id="editOfferTitle" placeholder="Offer Title" required />
      <textarea id="editDescription" placeholder="Description" required></textarea>
      <input type="date" id="editStartDate" required />
      <input type="date" id="editEndDate" required />
      <input type="text" id="editDiscount" placeholder="Discount" required />
      <div class="modal-actions">
        <button type="submit">Save</button>
        <button type="button" id="cancelEdit">Cancel</button>
      </div>
    </form>
  </div>
`;
document.body.appendChild(editModal);
editModal.style.display = "none";

// 🔁 Autofill shop category & floor based on name
async function autoFillShopDetails(shopName, isEdit = false) {
  const shopQuery = query(shopsRef, where("shopName", "==", shopName));
  const snapshot = await getDocs(shopQuery);
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    if (isEdit) {
      document.getElementById("editCategory").value = data.category || '';
      document.getElementById("editFloor").value = data.floor || '';
    } else {
      categoryInput.value = data.category || '';
      floorInput.value = data.floor || '';
    }
  } else {
    if (isEdit) {
      document.getElementById("editCategory").value = '';
      document.getElementById("editFloor").value = '';
    } else {
      categoryInput.value = '';
      floorInput.value = '';
    }
  }
}

// Listen for input in Shop Name field to auto-fill details
shopInput.addEventListener('input', () => {
  const name = shopInput.value.trim();
  if (name.length > 1) autoFillShopDetails(name);
});

// 🟢 Add Offer
offerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const offer = {
    shopName: shopInput.value.trim(),
    category: categoryInput.value.trim(),
    floor: floorInput.value.trim(),
    offerTitle: document.getElementById('offerTitle').value.trim(),
    description: document.getElementById('description').value.trim(),
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    discount: document.getElementById('discount').value.trim()
  };

  await addDoc(offersRef, offer);
  await logEvent(`Created offer for shop: ${offer.shopName}`); // ✅ log add

  offerForm.reset();
  categoryInput.value = '';
  floorInput.value = '';
  loadOffers();
});

// 🟣 Load Offers
async function loadOffers() {
  offerList.innerHTML = '';
  const snapshot = await getDocs(offersRef);
  allOffers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  renderFilterOptions();
  renderOfferTable();
}

function renderFilterOptions() {
  const categories = [...new Set(allOffers.map(o => o.category))];
  const floors = [...new Set(allOffers.map(o => o.floor))];

  categoryFilter.innerHTML = `<option value="">All Categories</option>`;
  floorFilter.innerHTML = `<option value="">All Floors</option>`;

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  floors.forEach(floor => {
    const option = document.createElement('option');
    option.value = floor;
    option.textContent = floor;
    floorFilter.appendChild(option);
  });
}

function renderOfferTable() {
  offerList.innerHTML = '';
  const selectedCat = categoryFilter.value;
  const selectedFloor = floorFilter.value;

  const filtered = allOffers.filter(offer => {
    return (selectedCat === '' || offer.category === selectedCat) &&
           (selectedFloor === '' || offer.floor === selectedFloor);
  });

  if (filtered.length === 0) {
    offerList.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px;">No offers found for selected filters.</td></tr>`;
    return;
  }

  filtered.forEach(offer => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${offer.shopName}</td>
      <td>${offer.category}</td>
      <td>${offer.floor}</td>
      <td>${offer.offerTitle}</td>
      <td>${offer.description}</td>
      <td>${offer.startDate}</td>
      <td>${offer.endDate}</td>
      <td>${offer.discount}</td>
      <td>
        <button class="edit-btn" data-id="${offer.id}">Edit</button>
        <button class="delete-btn" data-id="${offer.id}">Delete</button>
      </td>
    `;
    offerList.appendChild(row);
  });
}

categoryFilter.addEventListener('change', renderOfferTable);
floorFilter.addEventListener('change', renderOfferTable);

// 🔘 Edit/Delete Handling
document.addEventListener('click', async (e) => {
  // 🟢 Edit
  if (e.target.matches('.edit-btn')) {
    const id = e.target.dataset.id;
    currentEditId = id;
    const docSnap = await getDocs(query(offersRef, where("__name__", "==", id)));
    if (!docSnap.empty) {
      const data = docSnap.docs[0].data();
      document.getElementById("editShopName").value = data.shopName;
      await autoFillShopDetails(data.shopName, true);
      document.getElementById("editOfferTitle").value = data.offerTitle;
      document.getElementById("editDescription").value = data.description;
      document.getElementById("editStartDate").value = data.startDate;
      document.getElementById("editEndDate").value = data.endDate;
      document.getElementById("editDiscount").value = data.discount;
      editModal.style.display = "block";

      await logEvent(`Opened edit modal for offer: ${data.offerTitle}`); // ✅ log edit open
    }
  }

  // 🔴 Delete
  if (e.target.matches('.delete-btn')) {
    currentDeleteId = e.target.dataset.id;
    deleteModal.style.display = "block";
  }
});

document.getElementById("cancelEdit").onclick = () => {
  editModal.style.display = "none";
  currentEditId = null;
};

// ✅ Save updated offer
document.getElementById("editForm").onsubmit = async (e) => {
  e.preventDefault();
  const updatedOffer = {
    shopName: document.getElementById("editShopName").value.trim(),
    category: document.getElementById("editCategory").value.trim(),
    floor: document.getElementById("editFloor").value.trim(),
    offerTitle: document.getElementById("editOfferTitle").value.trim(),
    description: document.getElementById("editDescription").value.trim(),
    startDate: document.getElementById("editStartDate").value,
    endDate: document.getElementById("editEndDate").value,
    discount: document.getElementById("editDiscount").value.trim()
  };

  const offerDoc = doc(db, "offers", currentEditId);
  await updateDoc(offerDoc, updatedOffer);
  await logEvent(`Updated offer: ${updatedOffer.offerTitle}`); // ✅ log update
  editModal.style.display = "none";
  currentEditId = null;
  loadOffers();
};

// ✅ Confirm Delete
document.getElementById("confirmDelete").onclick = async () => {
  await deleteDoc(doc(db, "offers", currentDeleteId));
  await logEvent(`Deleted offer with ID: ${currentDeleteId}`); // ✅ log delete
  deleteModal.style.display = "none";
  currentDeleteId = null;
  loadOffers();
};

document.getElementById("cancelDelete").onclick = () => {
  deleteModal.style.display = "none";
  currentDeleteId = null;
};

window.onclick = (e) => {
  if (e.target === deleteModal) deleteModal.style.display = "none";
  if (e.target === editModal) editModal.style.display = "none";
};

// ⏳ Load all offers on page load
loadOffers();
