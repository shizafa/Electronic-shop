// One-time (but safe to re-run) seed script: loads the fixture data under scripts/seed-data/
// (the original mock catalog + demo users + demo orders) into Supabase.
//
// Run with: npm run seed

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

import { categories } from "./seed-data/categories";
import { airConditionerProducts } from "./seed-data/products/air-conditioners";
import { mobilePhoneProducts } from "./seed-data/products/mobile-phones";
import { televisionProducts } from "./seed-data/products/televisions";
import { orders } from "./seed-data/orders";
import { users, mockCredentials } from "./seed-data/users";
import type { Product } from "../types/product";

const allProducts: Product[] = [...airConditionerProducts, ...televisionProducts, ...mobilePhoneProducts];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedCategories() {
  const rows = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    thumbnail_url: c.thumbnailUrl,
    banner_url: c.bannerUrl,
    is_active: c.isActive,
    display_order: c.displayOrder,
    installation_required: c.installationRequired,
  }));
  const { error } = await supabase.from("categories").upsert(rows);
  if (error) throw new Error(`categories: ${error.message}`);
  console.log(`✓ ${rows.length} categories`);

  const specRows = categories.flatMap((c) =>
    c.specFields.map((s, index) => ({
      id: s.id,
      category_id: c.id,
      label_key: s.labelKey,
      unit: s.unit ?? null,
      type: s.type,
      options: s.options ?? null,
      filterable: s.filterable,
      show_in_compare: s.showInCompare,
      sort_order: index,
    })),
  );
  const { error: specError } = await supabase.from("spec_fields").upsert(specRows);
  if (specError) throw new Error(`spec_fields: ${specError.message}`);
  console.log(`✓ ${specRows.length} spec_fields`);
}

async function seedProducts() {
  const productRows = allProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    category_id: p.categoryId,
    name: p.name,
    brand: p.brand,
    description: p.description,
    images: p.images,
    specs: p.specs,
    variant_axes: p.variantAxes,
    featured: p.featured ?? false,
  }));
  const { error } = await supabase.from("products").upsert(productRows);
  if (error) throw new Error(`products: ${error.message}`);
  console.log(`✓ ${productRows.length} products`);

  const variantRows = allProducts.flatMap((p) =>
    p.variants.map((v) => ({
      id: v.id,
      product_id: v.productId,
      sku: v.sku,
      axis_values: v.axisValues,
      price: v.price,
      compare_at_price: v.compareAtPrice ?? null,
      stock: v.stock,
      low_stock_threshold: v.lowStockThreshold,
      images: v.images ?? null,
    })),
  );
  const { error: variantError } = await supabase.from("variants").upsert(variantRows);
  if (variantError) throw new Error(`variants: ${variantError.message}`);
  console.log(`✓ ${variantRows.length} variants`);
}

// Returns a map from the old mock user id (e.g. "user-ayesha") to the real Supabase auth UUID.
async function seedDemoUsers(): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();

  for (const user of users) {
    const credential = mockCredentials.find((c) => c.userId === user.id);
    if (!credential) {
      console.warn(`No mock credential for ${user.id}, skipping`);
      continue;
    }

    let authUserId: string;
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: credential.password,
      email_confirm: true,
      user_metadata: { name: user.name, phone: user.phone },
    });

    if (createError) {
      if (!createError.message.toLowerCase().includes("already been registered")) {
        throw new Error(`create user ${user.email}: ${createError.message}`);
      }
      // Already seeded in a previous run — look up the existing auth user id.
      const { data: list, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw new Error(`list users: ${listError.message}`);
      const existing = list.users.find((u) => u.email === user.email);
      if (!existing) throw new Error(`user ${user.email} reported as duplicate but not found`);
      authUserId = existing.id;
      console.log(`↺ ${user.email} already exists, reusing`);
    } else {
      authUserId = created.user.id;
      console.log(`✓ created auth user ${user.email}`);
    }

    idMap.set(user.id, authUserId);

    const addressRows = user.addresses.map((a) => ({
      user_id: authUserId,
      label: a.label,
      full_name: a.fullName,
      phone: a.phone,
      city: a.city,
      area: a.area,
      address_line: a.addressLine,
      is_default: a.isDefault,
    }));
    // Addresses have no natural unique key to upsert on — only insert if this user has none yet.
    const { count } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", authUserId);
    if (!count) {
      const { error: addrError } = await supabase.from("addresses").insert(addressRows);
      if (addrError) throw new Error(`addresses for ${user.email}: ${addrError.message}`);
    }
  }

  console.log(`✓ ${idMap.size} demo users`);
  return idMap;
}

async function seedOrders(idMap: Map<string, string>) {
  for (const order of orders) {
    const userId = idMap.get(order.userId);
    if (!userId) {
      console.warn(`No auth user for order ${order.orderNumber} (userId ${order.userId}), skipping`);
      continue;
    }

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .upsert(
        {
          order_number: order.orderNumber,
          user_id: userId,
          status: order.status,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          subtotal: order.subtotal,
          shipping_fee: order.shippingFee,
          total: order.total,
          shipping_address: order.shippingAddress,
          billing_address: order.billingAddress,
          installation: order.installation ?? null,
          courier: order.courier ?? null,
          placed_at: order.placedAt,
        },
        { onConflict: "order_number" },
      )
      .select("id")
      .single();
    if (orderError) throw new Error(`order ${order.orderNumber}: ${orderError.message}`);

    // Re-running would duplicate items/history since they have no unique key — skip if already present.
    const { count: itemCount } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderRow.id);
    if (!itemCount) {
      const itemRows = order.items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        sku: item.sku,
        image: item.image,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        category_name: item.categoryName,
        installation_required: item.installationRequired,
      }));
      const { error: itemError } = await supabase.from("order_items").insert(itemRows);
      if (itemError) throw new Error(`order_items for ${order.orderNumber}: ${itemError.message}`);

      const historyRows = order.statusHistory.map((h) => ({
        order_id: orderRow.id,
        status: h.status,
        changed_at: h.changedAt,
      }));
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert(historyRows);
      if (historyError)
        throw new Error(`order_status_history for ${order.orderNumber}: ${historyError.message}`);
    }
  }
  console.log(`✓ ${orders.length} orders`);
}

async function main() {
  await seedCategories();
  await seedProducts();
  const idMap = await seedDemoUsers();
  await seedOrders(idMap);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
