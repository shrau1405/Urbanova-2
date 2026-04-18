import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const offerList = document.getElementById("offerList");
const tableContainer = document.querySelector(".table-container"); // grab table container to show/hide
const shopPosters = document.getElementById("shopPosters");

let allOffers = [];

// ==========================
// LOAD OFFERS
// ==========================
async function loadOffers() {
  const snapshot = await getDocs(collection(db, "offers"));
  allOffers = snapshot.docs.map(doc => doc.data());
  tableContainer.style.display = "none"; // hide table initially
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable(filteredOffers) {
  tableContainer.style.display = "block"; // show table when called

  offerList.innerHTML = filteredOffers.length === 0
    ? `<tr><td colspan="8" style="padding:20px;text-align:center;">No offers available.</td></tr>`
    : filteredOffers.map(o => `
        <tr>
          <td>${o.shopName}</td>
          <td>${o.category}</td>
          <td>${o.floor}</td>
          <td>${o.offerTitle}</td>
          <td>${o.description}</td>
          <td>${o.startDate}</td>
          <td>${o.endDate}</td>
          <td>${o.discount}</td>
        </tr>
      `).join("");
}

// ==========================
// SHOW SHOP POSTERS
// ==========================
function showPosters() {
  const postersData = [
    { name: "MAX", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsDSr2x00OC8LXD9y8UJc0DR5aCuL78_J9YA&s" },
    { name: "Nike", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvW8ycBErh7GDnE4cflQ3QwEgnrQOvnWas6w&s" },
    { name: "Crossword", src: "https://pbs.twimg.com/media/FwypdWdaEAEY_j4.jpg" },
    { name: "GIVA", src: "https://public-data.phoenixnhance.com/newsFeedDetails/2023/6/22/40332736187-147-2023-6-22.jpeg" },
  ];

  shopPosters.innerHTML = postersData.map(p => `
    <div class="shop-poster" data-shop="${p.name}">
      <img src="${p.src}" alt="${p.name} Offer" />
    </div>
  `).join("");

  document.querySelectorAll(".shop-poster").forEach(poster => {
    poster.addEventListener("click", () => {
      const shopName = poster.dataset.shop;
      const filtered = allOffers.filter(o => o.shopName.toLowerCase() === shopName.toLowerCase());
      renderTable(filtered);
    });
  });
}

// ==========================
// PAGE LOAD
// ==========================
window.onload = () => {
  showPosters();
  loadOffers();
};
