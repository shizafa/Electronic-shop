import { mockCredentials, users as seedUsers, type MockCredential } from "@/data/users";
import { readJSON, writeJSON } from "@/lib/storage";
import type { User } from "@/types/user";

const SESSION_KEY = "electronics_session";
const USERS_KEY = "electronics_users";
const CREDENTIALS_KEY = "electronics_credentials";

interface Session {
  userId: string;
}

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

export function getCurrentUser(): User | null {
  const session = readJSON<Session | null>(SESSION_KEY, null);
  if (!session) return null;
  return getAllUsers().find((user) => user.id === session.userId) ?? null;
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
  return user;
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