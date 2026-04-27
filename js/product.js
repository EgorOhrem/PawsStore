import { products } from "./data.js";
import { addToCart, getCart } from "./store.js";
import { showNotification } from "./notification.js";

const pageRoot = document.querySelector("#product-page");
const searchParams = new URLSearchParams(window.location.search);
const requestedId = searchParams.get("id");

const product = products.find((item) => item.id === requestedId) || products[0];

// вычисляем один раз — они не меняются
const related = products.filter((item) => item.id !== product.id).slice(0, 3);
const breadcrumbs = ["Home", product.subtitle, product.title];
const breadcrumbLinks = ["./catalog.html", "./catalog.html", null];

let activeImage = 0;
let quantity = 1;

function isInCart(productId) {
  return getCart().some((item) => item.id === productId);
}

function starsMarkup(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return [1, 2, 3, 4, 5].map((starIndex) => {
    if (starIndex <= fullStars) return '<span class="is-full">★</span>';
    if (starIndex === fullStars + 1 && hasHalf) return '<span class="is-half">★</span>';
    return '<span class="is-empty">★</span>';
  }).join("");
}

function renderProductPage() {
  if (!pageRoot || !product) return;

  pageRoot.innerHTML = `
    <nav class="product-breadcrumbs">
      ${breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const href = breadcrumbLinks[index];
        if (!isLast && href) {
          return `<a class="crumb crumb-link" href="${href}">${crumb}</a>`;
        }
        return `<span class="crumb is-active">${crumb}</span>`;
      }).join("<span class='crumb-sep'>›</span>")}
    </nav>

    <article class="product-layout">
      <section class="product-media">
        <div class="product-media-main">
          <img src="${product.images[activeImage]}" alt="${product.title}">
          <button type="button" class="media-arrow media-arrow-prev" data-role="prev-image" aria-label="Previous image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button type="button" class="media-arrow media-arrow-next" data-role="next-image" aria-label="Next image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="media-dots">
          ${product.images.map((image, index) => `
            <button type="button" class="media-dot ${index === activeImage ? "is-active" : ""}" data-role="go-image" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>
          `).join("")}
        </div>
      </section>

      <section class="product-content">
        <p class="product-category-chip">${product.subtitle}</p>
        <h1>${product.title}</h1>
        <div class="product-rating-row">
          <div class="rating-stars">${starsMarkup(product.rating)}</div>
          <p>${product.rating.toFixed(1)} out of 5 stars</p>
        </div>
        <p class="product-main-price">$${product.price.toFixed(2)}</p>

        <section class="key-highlights">
          <h3>Key Highlights</h3>
          <ul>
            ${(product.highlights || []).map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>

        <section class="product-description-block">
          <h3>Description</h3>
          <p>${product.description || ""}</p>
        </section>

        <div class="qty-row">
          <span>Quantity:</span>
          <div class="qty-control">
            <button type="button" data-role="qty-dec">−</button>
            <span>${quantity}</span>
            <button type="button" data-role="qty-inc">+</button>
          </div>
        </div>

        <button type="button" class="btn add-cart-wide" data-role="add">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4h2l2.1 10.2a1 1 0 0 0 1 .8h10.8a1 1 0 0 0 1-.8L22 7H7"></path>
            <circle cx="10" cy="20" r="1.4"></circle>
            <circle cx="18" cy="20" r="1.4"></circle>
          </svg>
          ${isInCart(product.id) ? "Add More to Cart" : "Add to Cart"}
        </button>

        <section class="tech-specs">
          <h3>
            <span class="tech-icon">⬢</span>
            Technical Specifications
          </h3>
          <div class="tech-grid">
            ${(product.specs || []).map(([key, value]) => `
              <article class="tech-item">
                <p>${key}</p>
                <strong>${value}</strong>
              </article>
            `).join("")}
          </div>
        </section>
      </section>
    </article>

    <section class="related-products">
      <div class="related-head">
        <h2>Related Products</h2>
      </div>
      <div class="related-grid">
        ${related.map((item) => `
          <article class="related-card">
            <a href="./product.html?id=${item.id}">
              <img src="${item.images[0]}" alt="${item.title}">
            </a>
            <div class="related-body">
              <p>${item.subtitle}</p>
              <a href="./product.html?id=${item.id}">${item.title}</a>
              <div class="related-meta">
                <span>$${item.price.toFixed(2)}</span>
                <small>${item.rating.toFixed(1)}</small>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-role="prev-image"]')) {
      activeImage = activeImage === 0 ? product.images.length - 1 : activeImage - 1;
      renderProductPage();
      return;
    }

    if (event.target.closest('[data-role="next-image"]')) {
      activeImage = activeImage === product.images.length - 1 ? 0 : activeImage + 1;
      renderProductPage();
      return;
    }

    const dot = event.target.closest('[data-role="go-image"]');
    if (dot) {
      activeImage = Number(dot.dataset.index || 0);
      renderProductPage();
      return;
    }

    if (event.target.closest('[data-role="qty-dec"]')) {
      quantity = Math.max(1, quantity - 1);
      renderProductPage();
      return;
    }

    if (event.target.closest('[data-role="qty-inc"]')) {
      quantity += 1;
      renderProductPage();
      return;
    }

    const addButton = event.target.closest('[data-role="add"]');
    if (addButton) {
      for (let i = 0; i < quantity; i += 1) {
        addToCart(product);
      }
      showNotification(`Added ${quantity > 1 ? quantity + "x " : ""}${product.title} to cart`);
      quantity = 1;
      renderProductPage();
    }
  });

  window.addEventListener("cart:updated", () => {
    const addBtn = pageRoot?.querySelector('[data-role="add"]');
    if (addBtn) {
      addBtn.textContent = isInCart(product.id) ? "Add More to Cart" : "Add to Cart";
    }
  });
}

renderProductPage();
bindEvents();
