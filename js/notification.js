let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "notification-container";
    document.body.appendChild(container);
  }
  return container;
}

export function showNotification(message, type = "success") {
  const el = document.createElement("div");
  el.className = `notification notification--${type}`;
  el.innerHTML = `
    <span class="notification-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        ${type === "remove"
          ? '<path d="M18 6L6 18M6 6l12 12"/>'
          : '<path d="M20 6L9 17l-5-5"/>'}
      </svg>
    </span>
    <span class="notification-msg">${message}</span>
  `;

  getContainer().appendChild(el);

  requestAnimationFrame(() => el.classList.add("notification--visible"));

  setTimeout(() => {
    el.classList.remove("notification--visible");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  }, 3000);
}
