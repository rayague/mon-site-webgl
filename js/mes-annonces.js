import { supabase } from "./supabase.js";

const list = document.getElementById("my-annonces");
const message = document.getElementById("my-annonces-message");

const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  location.replace("connexion.html");
} else {
  loadMyAnnouncements();
}

async function loadMyAnnouncements() {
  list.replaceChildren();
  message.textContent = "Chargement…";

  const { data, error } = await supabase
    .from("annonces")
    .select("id, titre, categorie, lieu, extrait")
    .eq("owner_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    message.textContent = error.message;
    return;
  }

  message.textContent =
    data.length === 0
      ? "Tu n’as encore publié aucun bulletin."
      : "";

  data.forEach((announcement) => {
    const article = document.createElement("article");
    article.className = "form-card";

    const title = document.createElement("h2");
    title.textContent = announcement.titre;

    const meta = document.createElement("p");
    meta.className = "section-sub";
    meta.textContent =
      `${announcement.categorie} · ${announcement.lieu || "Lieu inconnu"}`;

    const excerpt = document.createElement("p");
    excerpt.textContent = announcement.extrait || "";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn ghost";
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener("click", async () => {
      if (!window.confirm("Supprimer ce bulletin définitivement ?")) return;

      const { error: deleteError } = await supabase
        .from("annonces")
        .delete()
        .eq("id", announcement.id)
        .eq("owner_id", session.user.id);

      if (deleteError) {
        message.textContent = deleteError.message;
      } else {
        await loadMyAnnouncements();
      }
    });

    article.append(title, meta, excerpt, deleteButton);
    list.append(article);
  });
}
