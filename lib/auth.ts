import { mockCredentials, users as seedUsers, type MockCredential } from "@/data/users";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Address, User } from "@/types/user";

const SESSION_KEY = "electronics_session";
const USERS_KEY = "electronics_users";
const CREDENTIALS_KEY = "electronics_credentials";
const USER_OVERRIDES_KEY = "electronics_user_overrides";

// Holds which user id is currently "logged in"
interface Session {
  userId: string;
}

// Per-user edits (profile/address changes) layered on top of the read-only seed data
type UserOverrides = Record<string, Partial<Pick<User, "name" | "email" | "phone" | "addresses">>>;

function getLocalUsers(): User[] {
  return readJSON<User[]>(USERS_KEY, []);
}

function getLocalCredentials(): MockCredential[] {
  return readJSON<MockCredential[]>(CREDENTIALS_KEY, []);
}

// Combines built-in seed users with any users signed up locally in this browser
function getAllUsers(): User[] {
  return [...seedUsers, ...getLocalUsers()];
}

// Combines built-in seed credentials with any signed up locally in this browser
function getAllCredentials(): MockCredential[] {
  return [...mockCredentials, ...getLocalCredentials()];
}

function getUserOverrides(): UserOverrides {
  return readJSON<UserOverrides>(USER_OVERRIDES_KEY, {});
}

// Merges any saved profile/address edits on top of the base user record
function applyOverrides(user: User): User {
  const overrides = getUserOverrides()[user.id];
  return overrides ? { ...user, ...overrides } : user;
}

// Returns the currently logged-in user, or null if no one is logged in
export function getCurrentUser(): User | null {
  const session = readJSON<Session | null>(SESSION_KEY, null);
  if (!session) return null;
  const user = getAllUsers().find((candidate) => candidate.id === session.userId);
  return user ? applyOverrides(user) : null;
}

// Checks email/password against known credentials and starts a session if they match
export function login(email: string, password: string): User | null {
  const credential = getAllCredentials().find(
    (candidate) =>
      candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password
  );
  if (!credential) return null;

  const user = getAllUsers().find((candidate) => candidate.id === credential.userId);
  if (!user) return null;

  writeJSON(SESSION_KEY, { userId: user.id });
  return applyOverrides(user);
}

// Creates a new account (if the email isn't already used) and logs the user in
export function signup(name: string, email: string, phone: string, password: string): User | null {
  const emailTaken = getAllCredentials().some(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase()
  );
  if (emailTaken) return null;

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone,
    addresses: [],
  };

  writeJSON(USERS_KEY, [...getLocalUsers(), newUser]);
  writeJSON(CREDENTIALS_KEY, [...getLocalCredentials(), { email, password, userId: newUser.id }]);
  writeJSON(SESSION_KEY, { userId: newUser.id });

  return newUser;
}

// Ends the current session by clearing it from localStorage
export function logout(): void {
  if (typeof window === "undefined") return; // no localStorage on the server
  window.localStorage.removeItem(SESSION_KEY);
}

// Shared helper to save a partial update into that user's overrides
function setOverrides(userId: string, updates: Partial<UserOverrides[string]>): User | null {
  const overrides = getUserOverrides();
  overrides[userId] = { ...overrides[userId], ...updates };
  writeJSON(USER_OVERRIDES_KEY, overrides);

  const user = getAllUsers().find((candidate) => candidate.id === userId);
  return user ? applyOverrides(user) : null;
}

// Saves edited name/email/phone for a user
export function updateUserProfile(
  userId: string,
  updates: { name: string; email: string; phone: string }
): User | null {
  return setOverrides(userId, updates);
}

// Saves an updated address list for a user
export function updateUserAddresses(userId: string, addresses: Address[]): User | null {
  return setOverrides(userId, { addresses });
}