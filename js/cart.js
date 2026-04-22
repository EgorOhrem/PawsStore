import { getCart, saveCart } from "./store.js";

const TAX_RATE = 0.08;
const PROMO_CODE = "SAVE10";
const PROMO_KEY = "cartPromoCode";

const root = document.querySelector("#cart-page");

function getPromoCode() {
  return localStorage.getItem(PROMO_KEY) || "";
}

function setPromoCode(code) {
  localStorage.setItem(PROMO_KEY, code);
}

function removeItem(productId) {
  const next = getCart().filter((item) => item.id !== productId);
  saveCart(next);
}

function setQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.quantity = Math.max(1, quantity);
  saveCart(cart);
}

function totals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal > 50 ? 0 : 5;
  const preTotal = subtotal + tax + shipping;
  const promoCode = getPromoCode();
  const discount = promoCode === PROMO_CODE ? preTotal * 0.1 : 0;
  const total = preTotal - discount;
  const qualified = shipping === 0;
  return { subtotal, tax, shipping, discount, total, promoCode, qualified };
}

function renderEmpty() {
  root.innerHTML = `
    <section class="cart-empty">
      <div class="cart-empty-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 7h12v11H6zM9 7V5.8A2.8 2.8 0 0 1 11.8 3h.4A2.8 2.8 0 0 1 15 5.8V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>Your cart is empty</h1>
      <p>Discover amazing products for your furry friends!</p>
      <a href="./catalog.html" class="cart-empty-btn">Start Shopping</a>
    </section>
  `;
}

function renderFilled() {
  const cart = getCart();
  const { subtotal, tax, shipping, discount, total, promoCode, qualified } = totals(cart);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  root.innerHTML = `
    <section class="cart-head">
      <div class="cart-head-text">
        <h1>Shopping Bag</h1>
        <p>${count} items ready for checkout</p>
      </div>
      <div class="cart-steps" role="list" aria-label="Checkout progress">
        <div class="cart-step is-active" role="listitem">
          <span class="cart-step-badge" aria-hidden="true">1</span>
          <span class="cart-step-label">Cart</span>
        </div>
        <span class="cart-step-chevron" aria-hidden="true">›</span>
        <div class="cart-step" role="listitem">
          <span class="cart-step-badge" aria-hidden="true">2</span>
          <span class="cart-step-label">Checkout</span>
        </div>
        <span class="cart-step-chevron is-muted" aria-hidden="true">›</span>
        <div class="cart-step" role="listitem">
          <span class="cart-step-badge" aria-hidden="true">3</span>
          <span class="cart-step-label">Complete</span>
        </div>
      </div>
    </section>

    <section class="shipping-note">
      <span class="shipping-note-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ff7f1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12.5 2H7a2 2 0 0 0-2 2v5.5a1 1 0 0 0 .3.7l8.5 8.5a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8L12.2 2.3A1 1 0 0 0 12.5 2Z"/>
          <circle cx="9" cy="9" r="1.2" fill="#ff7f1d" stroke="none"/>
        </svg>
      </span>
      <p>Free shipping on orders over <strong>$50</strong></p>
      <strong class="qualified ${qualified ? "" : "is-muted"}">
        ${qualified ? "✓ Qualified!" : "Not qualified"}
      </strong>
    </section>

    <section class="cart-layout">
      <div class="cart-items-list">
        ${cart.map((item) => `
          <article class="cart-row">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-row-main">
              <h3>${item.title}</h3>
              <p>${item.subtitle}</p>
            </div>
            <div class="qty-control compact">
              <button type="button" data-action="dec" data-id="${item.id}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="inc" data-id="${item.id}">+</button>
            </div>
            <div class="cart-price-col">
              <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
              <small>$${item.price.toFixed(2)} each</small>
            </div>
            <button type="button" class="cart-remove" data-action="remove" data-id="${item.id}" aria-label="Remove item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 7h16"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"/>
                <path d="M9 7V4h6v3"/>
              </svg>
            </button>
          </article>
        `).join("")}
      </div>

      <aside class="cart-summary-card">
        <header>
          <h2>Order Summary</h2>
          <p>${count} items in your bag</p>
        </header>
        <div class="summary-body">
          <label>Promo Code</label>
          <form id="promo-form" class="promo-row">
            <input id="promo-input" type="text" placeholder="Enter code" value="" autocomplete="off">
            <button type="submit">Apply</button>
          </form>
          ${
            promoCode === PROMO_CODE
              ? `<p class="promo-active">SAVE10 is applied. <button type="button" class="promo-remove" data-action="remove-promo">Remove</button></p>`
              : ""
          }
          <p id="promo-message" class="promo-message"></p>

          <div class="summary-line"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>
          <div class="summary-line"><span>Tax (8%)</span><strong>$${tax.toFixed(2)}</strong></div>
          <div class="summary-line"><span>Shipping</span><strong>${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</strong></div>
          <div class="summary-line ${discount > 0 ? "" : "is-hidden"}"><span>Promo -10%</span><strong>-$${discount.toFixed(2)}</strong></div>
          <div class="summary-line total"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>

          <div class="summary-note blue">
            <strong>Delivery Time</strong>
            <p>3-5 business days</p>
          </div>
          <div class="summary-note violet">
            <strong>Shipping To</strong>
            <p>123 Main Street, NY 10001</p>
          </div>

          <button type="button" class="checkout-btn">Proceed to Checkout</button>
          <a href="./catalog.html" class="continue-link">← Continue Shopping</a>
        </div>
      </aside>
    </section>
  `;
}

function render() {
  if (!root) return;
  if (!getCart().length) {
    renderEmpty();
    return;
  }
  renderFilled();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-action=remove-promo]")) {
      setPromoCode("");
      const message = document.querySelector("#promo-message");
      if (message) {
        message.textContent = "";
        message.classList.remove("is-error");
      }
      render();
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const { action, id } = actionButton.dataset;
    if (!id) return;
    const item = getCart().find((entry) => entry.id === id);
    if (!item) return;

    if (action === "inc") setQuantity(id, item.quantity + 1);
    if (action === "dec" && item.quantity > 1) setQuantity(id, item.quantity - 1);
    if (action === "remove") removeItem(id);
    render();
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("#promo-form");
    if (!form) return;
    event.preventDefault();

    const input = form.querySelector("#promo-input");
    const code = input.value.trim().toUpperCase();
    const message = document.querySelector("#promo-message");

    if (!code) {
      message.textContent = "Введите промокод";
      message.classList.add("is-error");
      return;
    }

    if (code === PROMO_CODE) {
      setPromoCode(code);
      message.textContent = "Промокод применен: скидка 10%";
      message.classList.remove("is-error");
      render();
      return;
    }

    setPromoCode("");
    message.textContent = "Неверный промокод";
    message.classList.add("is-error");
  });

  window.addEventListener("cart:updated", render);
}

render();
bindEvents();
