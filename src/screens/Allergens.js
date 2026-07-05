import Guide from "../components/Guide";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { loadSharedProducts, newId } from "../products";

const ALLERGENS = [
  ["Celery", "芹菜"], ["Cereals containing gluten", "含麩質穀物"], ["Crustaceans", "甲殼類"],
  ["Eggs", "蛋類"], ["Fish", "魚類"], ["Lupin", "羽扇豆"], ["Milk", "奶類"],
  ["Molluscs", "軟體動物"], ["Mustard", "芥末"], ["Peanuts", "花生"],
  ["Sesame", "芝麻"], ["Soybeans", "大豆"], ["Sulphur dioxide / sulphites", "二氧化硫 / 亞硫酸鹽"],
  ["Tree nuts", "堅果"],
];

export default function Allergens({ onBack, showToast }) {
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState("loading"); // loading | sheet | cache | seed
  const [editingId, setEditingId] = useState(null); // null | "new" | product id
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formContains, setFormContains] = useState([]);
  const [formMay, setFormMay] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    loadSharedProducts().then(({ products, source, migrated }) => {
      if (!live) return;
      setProducts(products);
      setSource(source);
      if (migrated && showToast) showToast(`Moved ${migrated} product(s) from this device to the shared list ✅`);
    });
    return () => { live = false; };
  }, []);

  const readOnly = source !== "sheet";

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

  const saveForm = async () => {
    const name = formName.trim();
    if (!name) return;
    const category = formCategory.trim();
    const record = {
      id: editingId === "new" ? newId() : editingId,
      name, category, contains: formContains, may: formMay,
    };
    // optimistic update, then persist to the shared Sheet
    setProducts((cur) =>
      editingId === "new" ? [...cur, record] : cur.map((p) => (p.id === editingId ? { ...p, ...record } : p))
    );
    cancelForm();
    try {
      await api.saveProduct(record);
      showToast && showToast("Saved to the shared list ✅");
    } catch (e) {
      showToast && showToast("Not saved — " + e.message);
      const { products: fresh } = await loadSharedProducts();
      setProducts(fresh);
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Remove this product from the shared list on every device?")) return;
    setProducts((cur) => cur.filter((p) => p.id !== id));
    try {
      await api.deleteProduct(id);
      showToast && showToast("Removed ✅");
    } catch (e) {
      showToast && showToast("Not removed — " + e.message);
      const { products: fresh } = await loadSharedProducts();
      setProducts(fresh);
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
        Shared across every device — saved to the Google Sheet (Allergen_Products tab). The official signed record is
        still the allergen matrix spreadsheets on file.
      </p>

      {source === "loading" && <div className="empty small">Loading the shared product list…</div>}
      {readOnly && source !== "loading" && (
        <div className="warn small">
          Offline — showing the last saved copy. Adding and editing needs a connection.
        </div>
      )}

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
              {!readOnly && (
                <div className="product-actions">
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button className="danger" onClick={() => removeProduct(p.id)}>Remove</button>
                </div>
              )}
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

      {editingId === null && !readOnly && (
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
