/* toast.js — notifications flottantes, en bas à droite. */

const LIFE = 4800;
const FLASH_KEY = "eclipse-toast";
let region = null;

function host() {
  if (region) return region;
  region = document.createElement("div");
  region.className = "toasts";
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-relevant", "additions");
  document.body.append(region);
  return region;
}

/**
 * Affiche un message temporaire.
 * @param {string} message
 * @param {{ tone?: "info" | "ok" | "err", id?: string, persist?: boolean }} [options]
 *   `id` remplace un toast déjà affiché avec le même identifiant.
 *   `persist` le réaffiche sur la page suivante (après une redirection).
 */
export function toast(message, { tone = "info", id, persist = false } = {}) {
  if (persist) {
    try {
      sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, tone, id }));
    } catch {}
  }

  const stack = host();
  if (id) {
    stack.querySelector(`[data-toast-id="${CSS.escape(id)}"]`)?.remove();
  }

  const item = document.createElement("div");
  item.className = tone === "info" ? "toast" : `toast ${tone}`;
  if (id) item.dataset.toastId = id;

  const text = document.createElement("p");
  text.textContent = message;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", "Fermer la notification");
  close.textContent = "×";

  item.append(text, close);
  stack.append(item);

  let gone = false;
  const remove = () => {
    if (gone || !item.isConnected) return;
    item.classList.add("out");
    const finish = () => {
      if (gone) return;
      gone = true;
      item.remove();
    };
    item.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 400);
  };

  const timer = setTimeout(remove, LIFE);
  close.addEventListener("click", () => {
    clearTimeout(timer);
    remove();
  });

  while (stack.children.length > 3) stack.firstElementChild.remove();
}

try {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (raw) {
    sessionStorage.removeItem(FLASH_KEY);
    const saved = JSON.parse(raw);
    if (saved && typeof saved.message === "string") {
      toast(saved.message, { tone: saved.tone, id: saved.id });
    }
  }
} catch {}
