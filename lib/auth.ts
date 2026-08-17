import { mockCredentials, users as seedUsers, type MockCredential } from "@/data/users";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Address, User } from "@/types/user";

const SESSION_KEY = "electronics_session";
const USERS_KEY = "electronics_users";
const CREDENTIALS_KEY = "electronics_credentials";
const USER_OVERRIDES_KEY = "electronics_user_overrides";

interface Session {
  userId: string;
}

type UserOverrides = Record<string, Partial<Pick<User, "name" | "email" | "phone" | "addresses">>>;

function getLocalUsers(): User[] {
  return readJSON<User[]>(USERS_KEY, []);
}

function getLocalCredentials(): MockCredential[] {
  return readJSON<MockCredential[]>(CREDENTIALS_KEY, []);
}

function getAllUsers(): User[] {
  return [...seedUsers, ...getLocalUsers()];
}

function getAllCredentials(): MockCredential[] {
  return [...mockCredentials, ...getLocalCredentials()];
}

function getUserOverrides(): UserOverrides {
  return readJSON<UserOverrides>(USER_OVERRIDES_KEY, {});
}

function applyOverrides(user: User): User {
  const overrides = getUserOverrides()[user.id];
  return overrides ? { ...user, ...overrides } : user;
}

export function getCurrentUser(): User | null {
  const session = readJSON<Session | null>(SESSION_KEY, null);
  if (!session) return null;
  const user = getAllUsers().find((candidate) => candidate.id === session.userId);
  return user ? applyOverrides(user) : null;
}

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

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

function setOverrides(userId: string, updates: Partial<UserOverrides[string]>): User | null {
  const overrides = getUserOverrides();
  overrides[userId] = { ...overrides[userId], ...updates };
  writeJSON(USER_OVERRIDES_KEY, overrides);

  const user = getAllUsers().find((candidate) => candidate.id === userId);
  return user ? applyOverrides(user) : null;
}

export function updateUserProfile(
  userId: string,
  updates: { name: string; email: string; phone: string }
): User | null {
  return setOverrides(userId, updates);
}

export function updateUserAddresses(userId: string, addresses: Address[]): User | null {
  return setOverrides(userId, { addresses });
}