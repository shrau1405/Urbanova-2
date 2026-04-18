// Import Firestore DB instance from firebase config file
import { db } from './firebase.js';

// ✅ Import logging function
import { logEvent } from './logger.js';

// Import necessary Firestore methods from CDN
import {
  collection, getDocs, doc, updateDoc, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// DOM elements for toggling view and rendering tables
const viewSwitch = document.getElementById('viewSwitch');
const categoryList = document.getElementById('categoryList');
const floorList = document.getElementById('floorList');

// Track currently editing or deleting item
let currentEditId = null;
let currentType = null;
let currentDeleteType = null;

// Modal elements and buttons
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const editName = document.getElementById('editName');
const saveEditBtn = document.getElementById('saveEditBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Toggle between Category and Floor table views
viewSwitch.addEventListener('change', () => {
  const view = viewSwitch.value;
  document.getElementById('categoryTableContainer').style.display = view === 'category' ? 'block' : 'none';
  document.getElementById('floorTableContainer').style.display = view === 'floor' ? 'block' : 'none';
});

// Load shop data from Firestore and group by category and floor
async function loadData() {
  categoryList.innerHTML = '';
  floorList.innerHTML = '';

  const shopSnap = await getDocs(collection(db, 'shops'));
  const categoryMap = {};
  const floorMap = {};

  shopSnap.forEach(doc => {
    const data = doc.data();
    const category = data.category || 'Uncategorized';
    const floor = data.floor || 'Unknown';
    const shopName = data.shopName || 'Unnamed Shop';

    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push(shopName);

    if (!floorMap[floor]) floorMap[floor] = [];
    floorMap[floor].push(shopName);
  });

  for (const cat in categoryMap) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cat}</td>
      <td>${categoryMap[cat].join(', ')}</td>
      <td>
        <button class="edit-btn" data-id="${cat}" data-type="category">Edit</button>
        <button class="delete-btn" data-id="${cat}" data-type="category">Delete</button>
      </td>
    `;
    categoryList.appendChild(row);
  }

  for (const fl in floorMap) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fl}</td>
      <td>${floorMap[fl].join(', ')}</td>
      <td>
        <button class="edit-btn" data-id="${fl}" data-type="floor">Edit</button>
        <button class="delete-btn" data-id="${fl}" data-type="floor">Delete</button>
      </td>
    `;
    floorList.appendChild(row);
  }
}

// Handle clicks on Edit/Delete buttons using event delegation
document.addEventListener('click', async (e) => {
  // Edit button clicked
  if (e.target.matches('.edit-btn')) {
    currentEditId = e.target.dataset.id;
    currentType = e.target.dataset.type;
    editName.value = currentEditId;
    editModal.style.display = 'flex';

    // ✅ Log edit attempt
    await logEvent(`Edit ${currentType} modal opened for: ${currentEditId}`);
  }

  // Delete button clicked
  if (e.target.matches('.delete-btn')) {
    currentEditId = e.target.dataset.id;
    currentDeleteType = e.target.dataset.type;
    deleteModal.style.display = 'block';

    // ✅ Log delete attempt
    await logEvent(`Delete ${currentDeleteType} modal opened for: ${currentEditId}`);
  }
});

// Save inside Edit modal (not implemented)
saveEditBtn.addEventListener('click', async () => {
  closeEditModal();
  alert("Renaming categories/floors is not supported in this mode.");
});

// Confirm delete in modal (not implemented)
confirmDeleteBtn.addEventListener('click', async () => {
  closeDeleteModal();
  alert("Delete action is not implemented because it's tied to shop data.");
});

// Close modals
function closeEditModal() {
  editModal.style.display = 'none';
}

function closeDeleteModal() {
  deleteModal.style.display = 'none';
}

// Cancel buttons
document.getElementById("cancelEditBtn")?.addEventListener("click", closeEditModal);
document.getElementById("cancelDeleteBtn")?.addEventListener("click", closeDeleteModal);

// Load data on startup
loadData();
