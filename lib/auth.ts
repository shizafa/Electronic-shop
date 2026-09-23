import { createClient } from "@/lib/supabase/client";
import { mapAddressRow } from "@/lib/supabase/mappers";
import type { Address, User } from "@/types/user";

// Loads the profiles + addresses rows for an already-authenticated Supabase user and
// assembles them into the app's User shape. Returns null if either read fails, rather than
// defaulting to no addresses / non-admin — a failed read must never look like an empty address
// book, since saving from that state would drop the user's real addresses.
async function loadUser(userId: string, email: string): Promise<User | null> {
  const supabase = createClient();
  const [{ data: profile, error: profileError }, { data: addressRows, error: addressesError }] = await Promise.all([
    supabase.from("profiles").select("name, phone, is_admin").eq("id", userId).single(),
    supabase
      .from("addresses")
      .select("id, label, full_name, phone, city, area, address_line, is_default")
      .eq("user_id", userId)
      .order("created_at"),
  ]);
  if (profileError) {
    console.error("loadUser: profiles read failed", profileError);
    return null;
  }
  if (addressesError) {
    console.error("loadUser: addresses read failed", addressesError);
    return null;
  }

  return {
    id: userId,
    name: profile?.name ?? "",
    email,
    phone: profile?.phone ?? "",
    isAdmin: profile?.is_admin ?? false,
    addresses: (addressRows ?? []).map(mapAddressRow),
  };
}

// Returns the currently logged-in user, or null if no one is logged in
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return loadUser(user.id, user.email);
}

// Checks email/password against Supabase Auth and starts a session if they match
export async function login(email: string, password: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user?.email) return null;
  return loadUser(data.user.id, data.user.email);
}

// Creates a new account and logs the user in (a `handle_new_user` DB trigger creates
// the matching `profiles` row from the name/phone passed in below)
export async function signup(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  });
  if (error || !data.user) return null;

  return { id: data.user.id, name, email, phone, isAdmin: false, addresses: [] };
}

// Ends the current session
export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// Saves edited name/email/phone for a user. Email lives on the Supabase Auth user record,
// not `profiles`, so it goes through supabase.auth.updateUser (which by default requires
// confirming the change via email — see AGENTS notes for how to disable that if instant
// updates are preferred, matching the old mock behavior).
export async function updateUserProfile(
  userId: string,
  updates: { name: string; email: string; phone: string }
): Promise<User | null> {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.updateUser({
    email: updates.email,
    data: { name: updates.name, phone: updates.phone },
  });
  if (authError) {
    console.error("updateUserProfile: auth.updateUser failed", authError);
    return null;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name: updates.name, phone: updates.phone })
    .eq("id", userId);
  if (profileError) {
    console.error("updateUserProfile: profiles update failed", profileError);
    return null;
  }

  return loadUser(userId, authData.user?.email ?? updates.email);
}

// Changes the logged-in user's password. Re-verifies the current password via
// signInWithPassword first (Supabase's updateUser doesn't itself require it), so a stolen
// still-logged-in session can't silently take over the account.
export async function updateUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const supabase = createClient();

  const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (reauthError) {
    console.error("updateUserPassword: current password incorrect", reauthError);
    return false;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error("updateUserPassword: auth.updateUser failed", error);
    return false;
  }

  return true;
}

// Saves an updated address list for a user, taking the full next array (address-book.tsx's call
// pattern). The save_user_addresses RPC (0031) diffs it against the stored rows in one
// transaction — updates changed rows, inserts new ones, deletes only removed ones — so a failed
// save leaves the existing addresses untouched.
export async function updateUserAddresses(userId: string, addresses: Address[]): Promise<User | null> {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    console.error("updateUserAddresses: no authenticated user");
    return null;
  }

  const { error } = await supabase.rpc("save_user_addresses", {
    p_addresses: addresses.map((address) => ({
      id: address.id,
      label: address.label,
      full_name: address.fullName,
      phone: address.phone,
      city: address.city,
      area: address.area,
      address_line: address.addressLine,
      is_default: address.isDefault,
    })),
  });
  if (error) {
    console.error("updateUserAddresses: save_user_addresses failed", error);
    return null;
  }

  return loadUser(userId, userData.user.email);
}
