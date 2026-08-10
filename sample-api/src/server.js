const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory mock database
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 28, role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 34, role: 'user' },
];

const products = [
  { id: 'p1', title: 'Developer Laptop', price: 1499.99, category: 'electronics', inStock: true },
  { id: 'p2', title: 'Mechanical Keyboard', price: 129.99, category: 'electronics', inStock: true },
];

// Helper Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  if (token === 'INVALID_EXPIRED_MALFORMED_TOKEN_XYZ') {
    return res.status(401).json({ success: false, message: 'Unauthorized: Expired or malformed token' });
  }
  req.user = { id: '1', email: 'admin@example.com' };
  next();
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  if (email === 'admin@example.com' && password === 'SecretPass123!') {
    return res.json({
      success: true,
      token: 'sample_jwt_token_admin_2026',
      user: { id: '1', name: 'Admin User', email: 'admin@example.com' },
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// --- USER ENDPOINTS ---
app.get('/api/users', (req, res) => {
  res.json({ success: true, count: users.length, data: users });
});

app.post('/api/users', (req, res) => {
  const { name, email, age, role } = req.body;

  // Contract validations
  if (!name) return res.status(400).json({ success: false, message: "Missing required property 'name'" });
  if (!email) return res.status(400).json({ success: false, message: "Missing required property 'email'" });

  if (typeof name !== 'string') return res.status(400).json({ success: false, message: "Property 'name' must be a string" });
  if (typeof email !== 'string') return res.status(400).json({ success: false, message: "Property 'email' must be a string" });

  if (age !== undefined) {
    if (typeof age !== 'number') return res.status(400).json({ success: false, message: "Property 'age' must be a number" });
    if (age < 18) return res.status(400).json({ success: false, message: "Property 'age' must be at least 18" });
    if (age > 100) return res.status(400).json({ success: false, message: "Property 'age' must not exceed 100" });
  }

  if (role !== undefined) {
    const allowedRoles = ['admin', 'user', 'guest'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid enum value for 'role'. Allowed: ${allowedRoles.join(', ')}` });
    }
  }

  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    age: age || 25,
    role: role || 'user',
  };

  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
});

// --- PRODUCT ENDPOINTS (Protected) ---
app.get('/api/products', authMiddleware, (req, res) => {
  res.json({ success: true, count: products.length, data: products });
});

app.post('/api/products', authMiddleware, (req, res) => {
  const { title, price, category } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ success: false, message: 'Title and price are required' });
  }
  const newProduct = {
    id: `p${products.length + 1}`,
    title,
    price: Number(price),
    category: category || 'general',
    inStock: true,
  };
  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

app.listen(PORT, () => {
  console.log(`Sample Target API running on http://localhost:${PORT}`);
});
