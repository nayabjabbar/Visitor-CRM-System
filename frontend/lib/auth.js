export function saveSession(token, user) {
  localStorage.setItem("crm_token", token);
  localStorage.setItem("crm_user", JSON.stringify(user));
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("crm_user");
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("crm_token"));
}

export function logout() {
  localStorage.removeItem("crm_token");
  localStorage.removeItem("crm_user");
}
