/**
 * toast.js — Global toast notification component.
 * Usage: Toast.show({ type: 'success'|'error'|'warning'|'info', title, message, duration })
 */

const Toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show({ type = 'info', title, message, duration = 3500 }) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const c = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Dismiss">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));
    c.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => dismiss(toast), duration);
    }
    return toast;
  }

  function dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 350);
  }

  return { show };
})();
