const HEADER_PATH = "./components/header.html";
const FOOTER_PATH = "./components/footer.html";
import { getCartCount } from "./store.js";

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

  badge.textContent = String(getCartCount());
}

async function initLayout() {
  await injectComponent("#site-header", HEADER_PATH);
  await injectComponent("#site-footer", FOOTER_PATH);
  updateCartBadge();
  window.addEventListener("cart:updated", updateCartBadge);
  window.addEventListener("storage", updateCartBadge);
}

initLayout();
