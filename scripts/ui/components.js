// Small UI helpers (spinners, toasts)

export function spinner() {
  const div = document.createElement('div');
  div.className = 'spinner';
  div.setAttribute('role', 'status');
  div.setAttribute('aria-live', 'polite');
  div.innerHTML = '<span class="visually-hidden">Loading...</span>';
  return div;
}

export function section(titleText) {
  const sec = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.textContent = titleText;
  sec.appendChild(h2);
  return sec;
}
