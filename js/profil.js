import { supabase } from "./supabase.js";
import { toast } from "./toast.js";

const form = document.getElementById("profile-form");
const message = document.getElementById("profile-message");

const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  location.replace("connexion.html");
} else {
  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("username, full_name, bio")
    .eq("id", session.user.id)
    .maybeSingle();

  if (readError) {
    message.textContent = readError.message;
    toast(readError.message, { tone: "err", id: "profile" });
  } else if (profile) {
    document.getElementById("username").value = profile.username || "";
    document.getElementById("full-name").value = profile.full_name || "";
    document.getElementById("bio").value = profile.bio || "";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!session) {
    location.replace("connexion.html");
    return;
  }

  message.textContent = "Enregistrement…";

  const updates = {
    id: session.user.id,
    username:
      document.getElementById("username").value.trim() || null,
    full_name:
      document.getElementById("full-name").value.trim() || null,
    bio: document.getElementById("bio").value.trim() || null,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(updates);

  message.textContent = error
    ? error.message
    : "Profil enregistré.";
  toast(message.textContent, { tone: error ? "err" : "ok", id: "profile" });
});
