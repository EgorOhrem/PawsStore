import { getCartCount } from "./store.js";

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

  badge.textContent = String(getCartCount());
}

async function initLayout() {
  await injectComponent("#site-header", HEADER_PATH);
  await injectComponent("#site-footer", FOOTER_PATH);
  updateCartBadge();
  initBurger();
  window.addEventListener("cart:updated", updateCartBadge);
  window.addEventListener("storage", updateCartBadge);
}

function initBurger() {
  const btn = document.querySelector("#burger-btn");
  const nav = document.querySelector("#main-nav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-inner")) {
      nav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

initLayout();
