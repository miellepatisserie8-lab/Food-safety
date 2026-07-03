import Guide from "../components/Guide";
import React, { useEffect, useMemo, useState } from "react";

const ALLERGENS = [
  ["Celery", "芹菜"], ["Cereals containing gluten", "含麩質穀物"], ["Crustaceans", "甲殼類"],
  ["Eggs", "蛋類"], ["Fish", "魚類"], ["Lupin", "羽扇豆"], ["Milk", "奶類"],
  ["Molluscs", "軟體動物"], ["Mustard", "芥末"], ["Peanuts", "花生"],
  ["Sesame", "芝麻"], ["Soybeans", "大豆"], ["Sulphur dioxide / sulphites", "二氧化硫 / 亞硫酸鹽"],
  ["Tree nuts", "堅果"],
];

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
const STORAGE_KEY = "mielle_fs_products_v2";

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to seed
  }
  return SEED_PRODUCTS.map(([name, category, contains, may]) => ({
    id: newId(),
    name,
    category,
    contains,
    may,
  }));
}

export default function Allergens({ onBack }) {
  const [products, setProducts] = useState(loadProducts);
  const [editingId, setEditingId] = useState(null); // null | "new" | product id
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formContains, setFormContains] = useState([]);
  const [formMay, setFormMay] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const startAdd = () => {
    setEditingId("new");
    setFormName("");
    setFormCategory("");
    setFormContains([]);
    setFormMay([]);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormCategory(p.category || "");
    setFormContains(p.contains || []);
    setFormMay(p.may || []);
  };

  const cancelForm = () => {
    setEditingId(null);
    setFormName("");
    setFormCategory("");
    setFormContains([]);
    setFormMay([]);
  };

  const toggleContains = (en) => {
    setFormContains((cur) => (cur.includes(en) ? cur.filter((a) => a !== en) : [...cur, en]));
    setFormMay((cur) => cur.filter((a) => a !== en));
  };

  const toggleMay = (en) => {
    setFormMay((cur) => (cur.includes(en) ? cur.filter((a) => a !== en) : [...cur, en]));
    setFormContains((cur) => cur.filter((a) => a !== en));
  };

  const saveForm = () => {
    const name = formName.trim();
    if (!name) return;
    const category = formCategory.trim();
    if (editingId === "new") {
      setProducts((cur) => [...cur, { id: newId(), name, category, contains: formContains, may: formMay }]);
    } else {
      setProducts((cur) =>
        cur.map((p) => (p.id === editingId ? { ...p, name, category, contains: formContains, may: formMay } : p))
      );
    }
    cancelForm();
  };

  const removeProduct = (id) => {
    if (window.confirm("Remove this product from the list?")) {
      setProducts((cur) => cur.filter((p) => p.id !== id));
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        p.contains.some((a) => a.toLowerCase().includes(q)) ||
        p.may.some((a) => a.toLowerCase().includes(q))
    );
  }, [products, query]);

  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Back</button>
      <h2>Allergens 過敏原</h2>
      <p className="lead">
        The 14 allergens under Natasha's Law. Always check the current bilingual allergen sheets for each dish,
        and request a spec sheet from every dim sum supplier before switching products.
      </p>
      <Guide id="allergens" />
      {ALLERGENS.map(([en, zh]) => (
        <div className="card" key={en} style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>{en}</strong>
          <span>{zh}</span>
        </div>
      ))}
      <div className="warn">
        If a customer declares an allergy: stop, check the allergen sheet, and confirm with the kitchen lead before serving. Never guess.
      </div>

      <div className="section-title">Products & dishes</div>
      <p className="lead" style={{ marginTop: -6 }}>
        Quick on-the-spot reference for which allergens each product contains, loaded from the full menu allergen sheets.
        Saved on this device — the official signed record is still the allergen matrix spreadsheets on file.
      </p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        style={{ marginBottom: 12 }}
      />

      {filtered.length === 0 && editingId !== "new" && (
        <div className="empty">No products match "{query}".</div>
      )}

      {filtered.map((p) =>
        editingId === p.id ? (
          <ProductForm
            key={p.id}
            name={formName}
            setName={setFormName}
            category={formCategory}
            setCategory={setFormCategory}
            contains={formContains}
            may={formMay}
            toggleContains={toggleContains}
            toggleMay={toggleMay}
            onSave={saveForm}
            onCancel={cancelForm}
          />
        ) : (
          <div className="card" key={p.id}>
            <div className="product-card-head">
              <div>
                <strong>{p.name}</strong>
                {p.category && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{p.category}</div>}
              </div>
              <div className="product-actions">
                <button onClick={() => startEdit(p)}>Edit</button>
                <button className="danger" onClick={() => removeProduct(p.id)}>Remove</button>
              </div>
            </div>
            <div className="chip-row">
              {p.contains.length === 0 && p.may.length === 0 ? (
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>No allergens listed</span>
              ) : (
                <>
                  {p.contains.map((a) => (
                    <span className="allergen-chip" key={"c" + a}>{a}</span>
                  ))}
                  {p.may.map((a) => (
                    <span className="allergen-chip maybe" key={"m" + a}>may: {a}</span>
                  ))}
                </>
              )}
            </div>
          </div>
        )
      )}

      {editingId === "new" && (
        <ProductForm
          name={formName}
          setName={setFormName}
          category={formCategory}
          setCategory={setFormCategory}
          contains={formContains}
          may={formMay}
          toggleContains={toggleContains}
          toggleMay={toggleMay}
          onSave={saveForm}
          onCancel={cancelForm}
        />
      )}

      {editingId === null && (
        <button className="btn ghost" onClick={startAdd}>+ Add product</button>
      )}
    </div>
  );
}

function ProductForm({ name, setName, category, setCategory, contains, may, toggleContains, toggleMay, onSave, onCancel }) {
  return (
    <div className="card">
      <label className="fl">Product or dish name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Egg tart" />
      <label className="fl">Category (optional)</label>
      <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Cakes, Dim Sum, Cocktail" />

      <label className="fl">Contains</label>
      <div className="allergen-check-grid">
        {ALLERGENS.map(([en]) => (
          <label key={"c" + en}>
            <input type="checkbox" checked={contains.includes(en)} onChange={() => toggleContains(en)} />
            {en}
          </label>
        ))}
      </div>

      <label className="fl">May contain (cross-contact)</label>
      <div className="allergen-check-grid">
        {ALLERGENS.map(([en]) => (
          <label key={"m" + en}>
            <input type="checkbox" checked={may.includes(en)} onChange={() => toggleMay(en)} />
            {en}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button className="btn" style={{ marginTop: 0 }} onClick={onSave} disabled={!name.trim()}>
          Save
        </button>
        <button className="btn ghost" style={{ marginTop: 0 }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
