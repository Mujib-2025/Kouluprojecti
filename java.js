let cart = [];

let total = 0;

function addToCart(name, price) {
  cart.push({
    name: name,
    price: price,
  });

  total = total + price;

  updateUI();
}

function updateUI() {
  document.getElementById("cart-count").textContent = cart.length;

  document.getElementById("cart-total").textContent = total;

  document.getElementById("modal-total").textContent = total;

  let cartItems = document.getElementById("cart-items");

  cartItems.innerHTML = "";

  cart.forEach(function (item) {
    let div = document.createElement("div");

    div.textContent = item.name + " - €" + item.price;

    cartItems.appendChild(div);
  });
}

function openCart() {
  document.getElementById("cart-modal").style.display = "block";
}

function closeCart() {
  document.getElementById("cart-modal").style.display = "none";
}

function filterProducts(category) {
  let products = document.querySelectorAll(".product");

  products.forEach(function (product) {
    if (category == "home" || product.dataset.category == category) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

function searchProducts() {
  let input = document.getElementById("search").value.toLowerCase();

  let products = document.querySelectorAll(".product");

  products.forEach(function (product) {
    let name = product.querySelector("h3").textContent.toLowerCase();

    if (name.includes(input)) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}
