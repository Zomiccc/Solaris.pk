// --- Imports ---
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// --- Config ---
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = "supersecretkey"; // ⚠️ Move to env var in production

// --- Middleware ---
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../client/build")));

// Logger (optional but useful)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Database Setup ---
const db = new sqlite3.Database(path.join(__dirname, "store.db"), (err) => {
  if (err) return console.error("DB connection error:", err.message);
  console.log("Connected to SQLite database.");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    stock INTEGER,
    image TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT,
    customer_name TEXT,
    address TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Insert default admin if not exists
  db.get("SELECT * FROM admin WHERE username = ?", ["zahra00"], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync("sol.pk", 10);
      db.run("INSERT INTO admin (username, password) VALUES (?, ?)", [
        "zahra00",
        hash,
      ]);
    }
  });
});

// --- Multer Setup (for uploads) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// --- Routes ---

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Get all products (public)
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Place an order (public)
app.post("/api/orders", (req, res) => {
  const { items, customer_name, address, phone } = req.body;
  if (!items || !customer_name || !address || !phone) {
    return res.status(400).json({ error: "Missing fields" });
  }
  db.run(
    "INSERT INTO orders (items, customer_name, address, phone) VALUES (?, ?, ?, ?)",
    [JSON.stringify(items), customer_name, address, phone],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ orderId: this.lastID });
    }
  );
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM admin WHERE username = ?", [username], (err, row) => {
    if (err || !row) return res.status(401).json({ error: "Invalid credentials" });
    if (!bcrypt.compareSync(password, row.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: row.id, username: row.username },
      SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token });
  });
});

// Middleware: Auth check
function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Admin: Add product
app.post("/api/admin/products", auth, upload.single("image"), (req, res) => {
  const { name, description, price, stock } = req.body;
  const image = req.file ? req.file.filename : null;
  if (!name || !price || !stock) {
    return res.status(400).json({ error: "Missing fields" });
  }
  db.run(
    "INSERT INTO products (name, description, price, stock, image) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, stock, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ productId: this.lastID });
    }
  );
});

// Admin: Delete product
app.delete("/api/admin/products/:id", auth, (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Admin: Edit product
app.put("/api/admin/products/:id", auth, (req, res) => {
  const { name, description, price, stock } = req.body;
  db.run(
    "UPDATE products SET name=?, description=?, price=?, stock=? WHERE id=?",
    [name, description, price, stock, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Admin: View orders
app.get("/api/admin/orders", auth, (req, res) => {
  db.all("SELECT * FROM orders ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = rows.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }));
    res.json(orders);
  });
});

// --- Serve React frontend ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
