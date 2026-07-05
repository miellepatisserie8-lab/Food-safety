// Shared product / allergen data store — v3.0
// -------------------------------------------------------------
// v2.2 kept the "Products & dishes" list only in each device's
// localStorage. From v3.0 the list lives in the Google Sheet
// (Allergen_Products tab) so every device sees the same list and
// it is centrally backed up. This module:
//   1. loads products from the backend,
//   2. seeds the Sheet once from SEED_PRODUCTS if it is empty,
//   3. migrates any extra products a device added under v2.2,
//   4. keeps a localStorage cache so the list still opens offline.
// The Orders module reads the same list for allergen chips.

import { api } from "./api";

const SEED_PRODUCTS = [
  ["Biscoff Tart", "Tarts", ["Cereals containing gluten", "Soybeans", "Milk", "Tree nuts"], []],
  ["Fruits Berry Tart", "Tarts", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Strawberry Tart", "Tarts", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Passion Fruit Tart", "Tarts", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Pistachio Tart", "Tarts", ["Cereals containing gluten", "Eggs", "Milk", "Tree nuts"], []],
  ["Paris Brest / Wheel Choux", "Choux", ["Cereals containing gluten", "Eggs", "Milk", "Tree nuts"], []],
  ["Strawberry Puff", "Choux", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["2-Mixed Cakes Party Collection", "Party Sets", ["Cereals containing gluten", "Eggs", "Milk"], ["Peanuts", "Tree nuts", "Sesame"]],
  ["Jelly Cat Christmas Tree", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Mont Blanc Chestnut", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Ube Purple Yam Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Blueberry Cheesecake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Orange Chocolate Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Chocolate Labubu", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Oreo Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Black Sesame Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Matcha Labubu", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Capybara Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Bubble Barbie Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Monster Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Taro Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Fresh Mango Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Ferrero Chocolate Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Barbie Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Strawberry Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Taro Labubu", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Black Forest Heart Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["6 Red Velvet Heart", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Tiramisu Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Chestnut Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Fresh Mango Heart Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Doraemon Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Wine Barrel Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["2- Mixed Cakes Party Collection", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Matcha Slice Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], ["Peanuts", "Tree nuts"]],
  ["Matcha swirl Swiss Roll", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Orange Chiffon Sando Cake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["Orange Chiffon Mini Shortcake", "Cakes", ["Cereals containing gluten", "Eggs", "Milk"], []],
  ["6-Mixed Puff Party Collection", "Party Sets", ["Cereals containing gluten", "Eggs", "Milk"], ["Peanuts", "Tree nuts"]],
  ["Earl Grey Spritz", "Cocktail", ["Sulphur dioxide / sulphites"], []],
  ["Jasmine 75", "Cocktail", ["Sulphur dioxide / sulphites"], []],
  ["Lychee Oolong Cooler", "Cocktail", ["Sulphur dioxide / sulphites"], []],
  ["Matcha White Russian", "Cocktail", ["Milk", "Sulphur dioxide / sulphites"], []],
  ["Yuzu Margarita", "Cocktail", ["Sulphur dioxide / sulphites"], []],
  ["Sichuan Spice Paloma", "Cocktail", ["Sulphur dioxide / sulphites"], ["Mustard"]],
  ["Ginger Lemongrass Mule", "Cocktail", ["Sulphur dioxide / sulphites"], []],
  ["Plum Negroni", "Cocktail", ["Sulphur dioxide / sulphites"], []],
  ["Espresso Martini", "Cocktail", ["Sulphur dioxide / sulphites"], []],
  ["Black Sesame Old Fashioned", "Cocktail", ["Sesame", "Sulphur dioxide / sulphites"], ["Tree nuts"]],
  ["Jasmine Elderflower Spritz", "Mocktail", [], ["Sulphur dioxide / sulphites"]],
  ["Yuzu Lemonade", "Mocktail", [], []],
  ["Lychee Rose Soda", "Mocktail", [], []],
  ["Matcha Latte (Non-Alcoholic)", "Mocktail / Hot", ["Milk"], []],
  ["Passion Fruit & Mango Fizz", "Mocktail", [], []],
  ["Ginger & Honey Lemonade", "Mocktail", [], []],
  ["House White Wine (Glass)", "Wine", ["Sulphur dioxide / sulphites"], []],
  ["House Red Wine (Glass)", "Wine", ["Sulphur dioxide / sulphites"], []],
  ["Prosecco / Sparkling Wine", "Wine", ["Sulphur dioxide / sulphites"], []],
  ["Orange Wine (Glass)", "Wine", ["Sulphur dioxide / sulphites"], []],
  ["Dessert Wine / Pedro Ximénez", "Wine", ["Sulphur dioxide / sulphites"], []],
  ["Plum Wine", "Wine / Spirit", ["Sulphur dioxide / sulphites"], []],
  ["Gin (House Pour)", "Spirit", ["Sulphur dioxide / sulphites"], ["Tree nuts"]],
  ["Vodka (House Pour)", "Spirit", ["Sulphur dioxide / sulphites"], []],
  ["Tequila / Mezcal", "Spirit", ["Sulphur dioxide / sulphites"], []],
  ["Bourbon / Whisky", "Spirit", ["Sulphur dioxide / sulphites"], []],
  ["Campari / Aperitivo", "Spirit / Liqueur", ["Sulphur dioxide / sulphites"], []],
  ["Coffee Liqueur (Kahlúa style)", "Liqueur", ["Sulphur dioxide / sulphites"], []],
  ["Fresh Lime (Wedge / Juice)", "Garnish", [], []],
  ["Fresh Lemon (Slice / Twist)", "Garnish", [], []],
  ["Fresh Orange (Slice / Peel)", "Garnish", [], []],
  ["Fresh Passion Fruit", "Garnish", [], []],
  ["Fresh Mango (Slice / Purée)", "Garnish / Ingredient", [], []],
  ["Lychee (Fresh / Tinned)", "Garnish", [], ["Sulphur dioxide / sulphites"]],
  ["Fresh Mint (Sprig)", "Garnish", [], []],
  ["Dehydrated Citrus Wheel", "Garnish", [], ["Sulphur dioxide / sulphites"]],
  ["Edible Flowers", "Garnish", [], []],
  ["Salt Rim (Fine Sea Salt)", "Garnish", [], []],
  ["Coffee Beans (3-bean garnish)", "Garnish", [], []],
  ["Sesame Seeds (Black/White)", "Garnish", ["Sesame"], []],
  ["Coconut Flakes", "Garnish / Ingredient", [], ["Tree nuts"]],
  ["Prawn Dumplings (Har Gow)", "Dim Sum", ["Cereals containing gluten", "Crustaceans", "Soybeans"], ["Milk", "Sesame"]],
  ["Siu Mai (Pork & Prawn Dumpling)", "Dim Sum", ["Cereals containing gluten", "Crustaceans", "Soybeans"], ["Fish", "Milk", "Sesame"]],
  ["Goldfish Dumpling", "Dim Sum", ["Cereals containing gluten", "Crustaceans", "Soybeans"], ["Milk", "Sesame"]],
  ["Prawn & Chive Dumpling", "Dim Sum", ["Cereals containing gluten", "Crustaceans", "Soybeans"], ["Milk", "Celery", "Sesame"]],
  ["Spring Roll", "Fried", ["Cereals containing gluten", "Soybeans"], ["Milk", "Sesame"]],
  ["Spicy Seaweed Roll", "Rolled", ["Cereals containing gluten", "Soybeans"], ["Fish", "Sesame", "Molluscs"]],
  ["Seaweed Roll", "Rolled", ["Cereals containing gluten", "Soybeans"], ["Fish", "Sesame", "Molluscs"]],
  ["Xiao Long Bao (Shanghai Soup Dumpling)", "Dim Sum", ["Cereals containing gluten", "Soybeans"], ["Milk", "Sesame"]],
  ["Chicken Skewers", "Skewers / Grilled", ["Soybeans", "Sesame"], ["Milk", "Mustard"]],
  ["Prawn Toast", "Fried", ["Cereals containing gluten", "Crustaceans", "Eggs", "Soybeans", "Sesame"], ["Milk"]],
  ["Mini Mandu (Korean Dumpling)", "Dim Sum / Korean", ["Cereals containing gluten", "Soybeans"], ["Eggs", "Milk", "Sesame"]],
  ["Chicken Gyoza", "Pan-fried", ["Cereals containing gluten", "Soybeans", "Sesame"], ["Milk", "Celery"]],
  ["Handbag Pastry", "Pastry / Baked", ["Cereals containing gluten", "Eggs", "Milk"], ["Soybeans", "Sesame"]],
  ["Orange Bun", "Baked Bun", ["Cereals containing gluten", "Eggs", "Milk"], ["Soybeans"]],
  ["Korean Bun (Soboro / Cream Bun)", "Baked Bun / Korean", ["Cereals containing gluten", "Eggs", "Milk"], ["Soybeans", "Tree nuts", "Sesame"]],
  ["Olives", "Bar Snack / Nibbles", ["Sulphur dioxide / sulphites"], []],
  ["Cheese Platter", "Bar Snack / Sharing", ["Cereals containing gluten", "Milk"], ["Sulphur dioxide / sulphites"]],
  ["Wonton Soup", "Soup / Noodles", ["Cereals containing gluten", "Crustaceans", "Soybeans"], ["Fish", "Milk", "Celery", "Sesame"]],
  ["Water Dumplings (Shui Jiao)", "Dim Sum / Boiled", ["Cereals containing gluten", "Soybeans"], ["Milk", "Sesame"]],
];
const LEGACY_KEY = "mielle_fs_products_v2";   // v2.2 on-device list
const CACHE_KEY = "mielle_fs_products_cache"; // v3.0 offline read cache
const MIGRATED_KEY = "mielle_fs_products_migrated";

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function seedList() {
  return SEED_PRODUCTS.map(([name, category, contains, may]) => ({
    id: "seed-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    category,
    contains,
    may,
  }));
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt cache */
  }
  return null;
}

function cacheProducts(products) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
  } catch {
    /* storage full — cache is optional */
  }
}

// One-off: push any products this device added under v2.2 (beyond the
// seeds) into the shared Sheet, so nothing staff typed is lost.
async function migrateLegacyExtras(sheetProducts) {
  if (localStorage.getItem(MIGRATED_KEY)) return [];
  const legacy = readJson(LEGACY_KEY);
  localStorage.setItem(MIGRATED_KEY, "1");
  if (!Array.isArray(legacy)) return [];
  const seedNames = new Set(SEED_PRODUCTS.map(([n]) => n.toLowerCase()));
  const sheetNames = new Set(sheetProducts.map((p) => (p.name || "").toLowerCase()));
  const extras = legacy.filter(
    (p) => p && p.name && !seedNames.has(p.name.toLowerCase()) && !sheetNames.has(p.name.toLowerCase())
  );
  for (const p of extras) {
    try {
      await api.saveProduct({
        id: newId(),
        name: p.name,
        category: p.category || "",
        contains: p.contains || [],
        may: p.may || [],
        staff: "v2.2 device migration",
      });
    } catch {
      // If one fails, un-mark so we retry next load rather than lose it.
      localStorage.removeItem(MIGRATED_KEY);
      break;
    }
  }
  return extras;
}

// Load the shared list. Returns { products, source } where source is
// "sheet" (live), or "cache"/"seed" when the backend is unreachable —
// callers show a small offline notice and disable editing for those.
export async function loadSharedProducts() {
  try {
    const res = await api.getProducts();
    let products = Array.isArray(res.products) ? res.products : [];
    if (!res.seeded && products.length === 0) {
      await api.seedProducts(seedList());
      const again = await api.getProducts();
      products = Array.isArray(again.products) ? again.products : seedList();
    }
    const extras = await migrateLegacyExtras(products);
    if (extras.length) {
      const again = await api.getProducts();
      products = Array.isArray(again.products) ? again.products : products;
    }
    cacheProducts(products);
    return { products, source: "sheet", migrated: extras.length };
  } catch {
    const cached = readJson(CACHE_KEY);
    if (cached) return { products: cached, source: "cache", migrated: 0 };
    return { products: seedList(), source: "seed", migrated: 0 };
  }
}

// Fast synchronous read for screens that just need chips (Orders):
// cache first, seeds as fallback. Callers may refresh via loadSharedProducts.
export function productsFromCache() {
  return readJson(CACHE_KEY) || seedList();
}

// Case-insensitive lookup used for allergen chips on orders. Shopify
// titles that exactly match a product name get chips automatically.
export function findProductByName(products, name) {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();
  return products.find((p) => (p.name || "").trim().toLowerCase() === n) || null;
}
