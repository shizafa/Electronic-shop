import { createClient } from "@/lib/supabase/client";
import type { Address, User } from "@/types/user";

interface AddressRow {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  city: string;
  area: string;
  address_line: string;
  is_default: boolean;
}

function mapAddressRow(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    area: row.area,
    addressLine: row.address_line,
    isDefault: row.is_default,
  };
}

// Loads the profiles + addresses rows for an already-authenticated Supabase user and
// assembles them into the app's User shape.
async function loadUser(userId: string, email: string): Promise<User> {
  const supabase = createClient();
  const [{ data: profile }, { data: addressRows }] = await Promise.all([
    supabase.from("profiles").select("name, phone, is_admin").eq("id", userId).single(),
    supabase
      .from("addresses")
      .select("id, label, full_name, phone, city, area, address_line, is_default")
      .eq("user_id", userId)
      .order("created_at"),
  ]);

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

// Saves an updated address list for a user. Replaces all rows rather than diffing,
// mirroring the old mock's "send the full next array" call pattern from address-book.tsx.
export async function updateUserAddresses(userId: string, addresses: Address[]): Promise<User | null> {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    console.error("updateUserAddresses: no authenticated user");
    return null;
  }

  const { error: deleteError } = await supabase.from("addresses").delete().eq("user_id", userId);
  if (deleteError) {
    console.error("updateUserAddresses: delete failed", deleteError);
    return null;
  }

  if (addresses.length > 0) {
    const { error: insertError } = await supabase.from("addresses").insert(
      addresses.map((address) => ({
        user_id: userId,
        label: address.label,
        full_name: address.fullName,
        phone: address.phone,
        city: address.city,
        area: address.area,
        address_line: address.addressLine,
        is_default: address.isDefault,
      }))
    );
    if (insertError) {
      console.error("updateUserAddresses: insert failed", insertError);
      return null;
    }
  }

  return loadUser(userId, userData.user.email);
}
