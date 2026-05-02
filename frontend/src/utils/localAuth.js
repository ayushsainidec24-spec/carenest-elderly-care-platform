const LOCAL_USERS_KEY = "carenest_local_users";
const CURRENT_USER_KEY = "user";

const demoUsers = [
  {
    id: "demo-local",
    name: "Demo User",
    email: "demo@carenest.com",
    password: "demo123",
    role: "elderly",
  },
];

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    return Array.isArray(stored) ? [...demoUsers, ...stored] : demoUsers;
  } catch {
    return demoUsers;
  }
}

function writeUsers(users) {
  const customUsers = users.filter((user) => user.id !== "demo-local");
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(customUsers));
}

export function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function findLocalUser(email) {
  const normalizedEmail = normalizeEmail(email);
  return readUsers().find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

export function loginLocalUser(email, password) {
  const user = findLocalUser(email);

  if (!user) {
    return {
      error: "No account found with this email. Please sign up first, then log in.",
    };
  }

  if (String(user.password || "").trim() !== String(password || "").trim()) {
    return { error: "Incorrect password. Please try again." };
  }

  saveCurrentUser(user);
  return { user };
}

export function registerLocalUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (findLocalUser(normalizedEmail)) {
    return { error: "This email is already registered. Please log in." };
  }

  const users = readUsers();
  const user = {
    id: `local-${Date.now()}`,
    name: String(name || "").trim(),
    email: normalizedEmail,
    password: String(password || "").trim(),
    role: "elderly",
  };

  users.push(user);
  writeUsers(users);
  saveCurrentUser(user);
  return { user };
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join("")
  );
}

export function createGoogleUserFromCredential(credential) {
  try {
    const payload = JSON.parse(decodeBase64Url(String(credential).split(".")[1] || ""));
    const email = normalizeEmail(payload.email);

    if (!email) {
      return null;
    }

    const existingUser = findLocalUser(email);
    if (existingUser) {
      saveCurrentUser(existingUser);
      return existingUser;
    }

    const user = {
      id: `google-${payload.sub || Date.now()}`,
      name: payload.name || email.split("@")[0],
      email,
      password: "",
      role: "elderly",
    };

    const users = readUsers();
    users.push(user);
    writeUsers(users);
    saveCurrentUser(user);
    return user;
  } catch {
    return null;
  }
}
