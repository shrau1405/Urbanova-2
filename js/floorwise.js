import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const floorList = document.getElementById("floorList");

function getFloorOrderValue(floorName) {
  const order = {
    "Ground": 0,
    "0": 0,
    "1st": 1,
    "First": 1,
    "2nd": 2,
    "Second": 2,
    "3rd": 3,
    "Third": 3,
  };
  return order[floorName.trim()] ?? 99;
}

async function fetchFloorCards() {
  const snapshot = await getDocs(collection(db, "shops"));
  const shops = snapshot.docs.map(doc => doc.data());

  const floorMap = {};
  shops.forEach(shop => {
    const floor = shop.floor || "Unknown";
    if (!floorMap[floor]) floorMap[floor] = [];
    floorMap[floor].push(shop.shopName);
  });

  const sortedFloors = Object.entries(floorMap).sort(
    ([a], [b]) => getFloorOrderValue(a) - getFloorOrderValue(b)
  );

  floorList.innerHTML = "";

  sortedFloors.forEach(([floor, shopNames]) => {
    const card = document.createElement("div");
    card.className = "category-card";

    card.innerHTML = `
      <div class="category-card-inner">
        <div class="category-front">
          <h3>${floor}</h3>
        </div>
        <div class="category-back">
          <h4>Shops</h4>
          <ul>
            ${shopNames.map(shop => `<li>${shop}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    floorList.appendChild(card);
  });
}

window.addEventListener("DOMContentLoaded", fetchFloorCards);
