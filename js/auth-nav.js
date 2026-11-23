import { supabase } from "./supabase.js";

const nav = document.querySelector(".nav-links");

async function renderNavigation() {
  if (!nav) return;

  nav.querySelectorAll("[data-auth-link]").forEach((link) => link.remove());

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    nav.insertAdjacentHTML(
      "beforeend",
      '<a data-auth-link href="profil.html">Mon profil</a>',
    );
    nav.insertAdjacentHTML(
      "beforeend",
      '<a data-auth-link href="mes-annonces.html">Mes annonces</a>',
    );
    nav.insertAdjacentHTML(
      "beforeend",
      '<a data-auth-link href="#" id="logout-link">Déconnexion</a>',
    );
  } else {
    nav.insertAdjacentHTML(
      "beforeend",
      '<a data-auth-link href="connexion.html">Connexion</a>',
    );
  }

  const logout = document.getElementById("logout-link");
  if (logout) {
    logout.addEventListener("click", async (event) => {
      event.preventDefault();
      await supabase.auth.signOut();
      location.href = "index.html";
    });
  }
}

renderNavigation();
