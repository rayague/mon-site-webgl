/* toast.js — notifications flottantes, en bas à droite. */

const LIFE = 4800;
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
 * @param {{ tone?: "info" | "ok" | "err", id?: string }} [options]
 *   `id` remplace un toast déjà affiché avec le même identifiant.
 */
export function toast(message, { tone = "info", id } = {}) {
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
