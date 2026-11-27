import { supabase } from "./supabase.js";

const form = document.getElementById("login-form");
const message = document.getElementById("auth-message");

const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  location.replace("profil.html");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  const redirect = new URLSearchParams(location.search).get("redirect");
  location.href =
    redirect === "publier.html" ? "publier.html" : "profil.html";
});