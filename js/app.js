const HEADER_PATH = "./components/header.html";
const FOOTER_PATH = "./components/footer.html";

async function injectComponent(selector, path) {
  const target = document.querySelector(selector);
  if (!target) return;

  const response = await fetch(path);
  if (!response.ok) return;

  target.innerHTML = await response.text();
}

function updateCartBadge() {
  const badge = document.querySelector("#cart-badge");
  if (!badge) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  badge.textContent = String(count);
}

async function initLayout() {
  await injectComponent("#site-header", HEADER_PATH);
  await injectComponent("#site-footer", FOOTER_PATH);
  updateCartBadge();
}

initLayout();
