import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLC0XFzid0Pd6dnWUEAz1QizAeRnt0JVQ",
  authDomain: "kouluprojecti.firebaseapp.com",
  projectId: "kouluprojecti",
  storageBucket: "kouluprojecti.firebasestorage.app",
  messagingSenderId: "966737359193",
  appId: "1:966737359193:web:babca4cdeb78fae58f5c48",
  measurementId: "G-G9V84X6TWZ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.db = db;
window.auth = auth;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.collection = collection;
window.addDoc = addDoc;

let currentUserCart = [];
let totalCartPrice = 0;

window.addToCart = function (productName, productPrice) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login first!");
    return;
  }
  currentUserCart.push({ name: productName, price: productPrice });
  totalCartPrice += productPrice;
  saveCartToFirestore(user.uid);
  updateCartUI();
};

window.removeFromCart = function (index) {
  const user = auth.currentUser;
  if (!user) return;
  totalCartPrice -= currentUserCart[index].price;
  currentUserCart.splice(index, 1);
  saveCartToFirestore(user.uid);
  updateCartUI();
};

window.buyNow = function () {
  const user = auth.currentUser;
  if (!user) {
    alert("Login to buy!");
    return;
  }
  if (currentUserCart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  const purchasesRef = collection(db, "purchases");
  addDoc(purchasesRef, {
    userId: user.uid,
    items: currentUserCart,
    total: totalCartPrice,
    boughtAt: new Date(),
  })
    .then(() => {
      alert(`Purchase complete! Total: €${totalCartPrice}`);
      currentUserCart = [];
      totalCartPrice = 0;
      saveCartToFirestore(user.uid);
      updateCartUI();
      closeCart();
    })
    .catch((err) => alert("Error: " + err.message));
};

function saveCartToFirestore(userId) {
  const userCartRef = doc(db, "userCarts", userId);
  setDoc(userCartRef, {
    items: currentUserCart,
    total: totalCartPrice,
    lastUpdated: new Date(),
  }).catch((err) => console.log("Save error:", err));
}

function loadCartFromFirestore(userId) {
  const userCartRef = doc(db, "userCarts", userId);
  getDoc(userCartRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        currentUserCart = data.items || [];
        totalCartPrice = data.total || 0;
      } else {
        currentUserCart = [];
        totalCartPrice = 0;
      }
      updateCartUI();
    })
    .catch((err) => console.log("Load error:", err));
}

function updateCartUI() {
  document.getElementById("cart-count").innerText = currentUserCart.length;
  document.getElementById("cart-total").innerText = totalCartPrice;
  document.getElementById("modal-total").innerText = totalCartPrice;

  const container = document.getElementById("cart-items-list");
  container.innerHTML = "";
  for (let i = 0; i < currentUserCart.length; i++) {
    const item = currentUserCart[i];
    const div = document.createElement("div");
    div.innerHTML = `<span>${item.name} - €${item.price}</span>
                         <button class="remove-btn" onclick="window.removeFromCart(${i})">✖</button>`;
    container.appendChild(div);
  }
}

window.openCart = function () {
  document.getElementById("cart-modal").style.display = "block";
};
window.closeCart = function () {
  document.getElementById("cart-modal").style.display = "none";
};

window.signUp = function () {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Account created! Logged in.");
      updateAuthStatus();
      currentUserCart = [];
      totalCartPrice = 0;
      updateCartUI();
    })
    .catch((err) => alert("Sign up error: " + err.message));
};

window.signIn = function () {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      alert("Logged in!");
      updateAuthStatus();
      loadCartFromFirestore(cred.user.uid);
    })
    .catch((err) => alert("Login error: " + err.message));
};

window.signOut = function () {
  signOut(auth)
    .then(() => {
      alert("Logged out.");
      currentUserCart = [];
      totalCartPrice = 0;
      updateCartUI();
      updateAuthStatus();
    })
    .catch((err) => alert("Logout error: " + err.message));
};

function updateAuthStatus() {
  const user = auth.currentUser;
  const span = document.getElementById("auth-status");
  span.innerText = user ? `✅ ${user.email}` : "❌ Not logged in";
}

onAuthStateChanged(auth, (user) => {
  updateAuthStatus();
  if (user) {
    loadCartFromFirestore(user.uid);
  } else {
    currentUserCart = [];
    totalCartPrice = 0;
    updateCartUI();
  }
});

window.filterProducts = function (category) {
  const products = document.querySelectorAll(".product");
  for (let p of products) {
    const cat = p.getAttribute("data-category");
    p.style.display =
      category === "home" || cat === category ? "block" : "none";
  }
};

window.searchProducts = function () {
  const text = document.getElementById("search").value.toLowerCase();
  const products = document.querySelectorAll(".product");
  for (let p of products) {
    const name = p.querySelector("h3").innerText.toLowerCase();
    p.style.display = name.includes(text) ? "block" : "none";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to send a message.");
        return;
      }
      const msg = document.getElementById("contact-message").value.trim();
      if (!msg) {
        alert("Please write a message.");
        return;
      }
      const contactsRef = collection(db, "contacts");
      addDoc(contactsRef, {
        email: user.email,
        message: msg,
        time: new Date(),
      })
        .then(() => {
          alert("Message sent! Thank you bro :D");
          form.reset();
        })
        .catch((err) => alert("Error: " + err.message));
    });
  }
});
