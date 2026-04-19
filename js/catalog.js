import { products } from "./data.js";
import { addToCart, getCart } from "./store.js";

const state = {
  sort: "alphabet-asc",
  minPrice: "",
  maxPrice: "",
  ratings: []
};

const filtersRoot = document.querySelector("#catalog-filters");
const grid = document.querySelector("#catalog-grid");
const toolbar = document.querySelector("#catalog-toolbar");

function isInCart(productId) {
  return getCart().some((item) => item.id === productId);
}

function getFilteredAndSortedProducts() {
  const minPrice = Number(state.minPrice);
  const maxPrice = Number(state.maxPrice);
  const minRating = state.ratings.length ? Math.min(...state.ratings) : 0;

  const filtered = products.filter((item) => {
    const isMinPriceOk = !state.minPrice || item.price >= minPrice;
    const isMaxPriceOk = !state.maxPrice || item.price <= maxPrice;
    const isRatingOk = item.rating >= minRating;
    return isMinPriceOk && isMaxPriceOk && isRatingOk;
  });

  const sorted = [...filtered];
  switch (state.sort) {
    case "alphabet-desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title, "ru"));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "alphabet-asc":
    default:
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }

  return sorted;
}

function renderFilters() {
  if (!filtersRoot) return;

  filtersRoot.innerHTML = `
    <div class="filter-card">
      <h3>Filters</h3>
      <div class="filter-block">
        <p class="filter-title">Rating</p>
        <label><input type="checkbox" name="rating" value="5"> 5+ Stars</label>
        <label><input type="checkbox" name="rating" value="4"> 4+ Stars</label>
        <label><input type="checkbox" name="rating" value="3"> 3+ Stars</label>
      </div>
      <div class="filter-block">
        <p class="filter-title">Price Range</p>
        <div class="range-row">
          <div>
            <small>Min</small>
            <input id="min-price" type="number" min="0" placeholder="$ 0">
          </div>
          <span>-</span>
          <div>
            <small>Max</small>
            <input id="max-price" type="number" min="0" placeholder="$ 100">
          </div>
        </div>
      </div>
    </div>
  `;

  const minPrice = filtersRoot.querySelector("#min-price");
  const maxPrice = filtersRoot.querySelector("#max-price");
  const ratingInputs = filtersRoot.querySelectorAll('input[name="rating"]');

  minPrice.value = state.minPrice;
  maxPrice.value = state.maxPrice;

  minPrice.addEventListener("input", (event) => {
    state.minPrice = event.target.value;
    renderCatalogView();
  });

  maxPrice.addEventListener("input", (event) => {
    state.maxPrice = event.target.value;
    renderCatalogView();
  });

  ratingInputs.forEach((input) => {
    input.addEventListener("change", () => {
      state.ratings = [...ratingInputs]
        .filter((item) => item.checked)
        .map((item) => Number(item.value));
      renderCatalogView();
    });
  });
}

function renderToolbar(total) {
  if (!toolbar) return;
  toolbar.innerHTML = `
    <span>${total} products</span>
    <label for="sort">Sort by:</label>
    <select id="sort">
      <option value="alphabet-asc">Name (A-Z)</option>
      <option value="alphabet-desc">Name (Z-A)</option>
      <option value="price-asc">Price (Low-High)</option>
      <option value="price-desc">Price (High-Low)</option>
    </select>
  `;
  const sort = toolbar.querySelector("#sort");
  sort.value = state.sort;
  sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderCatalogView();
  });
}

function renderCatalog() {
  const list = getFilteredAndSortedProducts();
  renderToolbar(list.length);

  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-catalog">
        <p>По выбранным фильтрам товаров не найдено.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map((item) => {
    return `
      <article class="product-card">
        <a href="./product.html?id=${item.id}" class="product-cover">
          <span class="price-chip">$${item.price.toFixed(2)}</span>
          <img src="${item.images[0]}" alt="${item.title}">
        </a>
        <div class="product-body">
          <a href="./product.html?id=${item.id}" class="product-title">${item.title}</a>
          <div class="product-meta">
            <span class="stars">★★★★★</span>
            <span class="product-rating">(${item.rating})</span>
          </div>
          <button class="btn add-to-cart" data-id="${item.id}">${isInCart(item.id) ? "Added" : "Add to cart"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCatalogView() {
  renderCatalog();
}

function bindCardActions() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart");
    if (!button) return;

    const productId = button.dataset.id;
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    addToCart(product);
    renderCatalogView();
  });

  window.addEventListener("cart:updated", renderCatalogView);
}

renderFilters();
renderCatalogView();
bindCardActions();
