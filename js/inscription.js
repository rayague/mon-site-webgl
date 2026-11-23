import { supabase } from "./supabase.js";

const form = document.getElementById("signup-form");
const message = document.getElementById("auth-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        "https://rayague.github.io/mon-site-webgl/"
    }
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  if (data.session) {
    location.href = "profil.html";
  } else {
    message.textContent =
      "Compte créé. Vérifie ton adresse email, puis connecte-toi.";
  }
});