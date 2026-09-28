import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, dbRun, dbGet, dbAll } from './database.js';
import { authenticate, requireAdmin, JWT_SECRET } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Authentication Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await dbRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const newUser = { id: result.lastID, name, email, role: 'user' };
    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register user.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const userPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: userPayload });
  } catch (err) {
    res.status(500).json({ message: 'Failed to login.' });
  }
});

// Profile / Current User
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
});


// --- Product Routes ---

// Get all products
app.get('/api/products', async (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY id DESC';

  try {
    const products = await dbAll(sql, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve products.' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve product.' });
  }
});

// Create product (Admin Only)
app.post('/api/products', authenticate, requireAdmin, async (req, res) => {
  const { name, description, price, stock, image_url, category } = req.body;
  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Name, price, and stock are required.' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, image_url || '', category || 'Uncategorized']
    );
    const newProduct = { id: result.lastID, name, description, price, stock, image_url, category };
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product.' });
  }
});

// Update product (Admin Only)
app.put('/api/products/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, description, price, stock, image_url, category } = req.body;
  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Name, price, and stock are required.' });
  }

  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await dbRun(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ? WHERE id = ?',
      [name, description, price, stock, image_url, category, req.params.id]
    );

    res.json({ id: req.params.id, name, description, price, stock, image_url, category });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product.' });
  }
});

// Delete product (Admin Only)
app.delete('/api/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await dbRun('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});


// --- Order Routes ---

// Create Order (User Checkout)
app.post('/api/orders', authenticate, async (req, res) => {
  const { total_amount, items, shipping_address } = req.body;
  if (!total_amount || !items || !shipping_address) {
    return res.status(400).json({ message: 'Total, items, and address are required.' });
  }

  try {
    // Validate stock for each item and deduct stock
    const parsedItems = Array.isArray(items) ? items : JSON.parse(items);
    for (const item of parsedItems) {
      const product = await dbGet('SELECT * FROM products WHERE id = ?', [item.id]);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product ? product.name : 'item ' + item.id}` });
      }
    }

    // Deduct stock
    for (const item of parsedItems) {
      await dbRun('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }

    const itemsJson = JSON.stringify(parsedItems);
    const result = await dbRun(
      'INSERT INTO orders (user_id, total_amount, items, shipping_address, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, total_amount, itemsJson, shipping_address, 'pending']
    );

    res.status(201).json({ id: result.lastID, user_id: req.user.id, total_amount, status: 'pending' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order.' });
  }
});

// Get orders (Admin gets all, User gets their own)
app.get('/api/orders', authenticate, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await dbAll(`
        SELECT orders.*, users.name as user_name, users.email as user_email
        FROM orders
        JOIN users ON orders.user_id = users.id
        ORDER BY orders.id DESC
      `);
    } else {
      orders = await dbAll('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
    }

    // Parse items JSON for frontend ease
    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve orders.' });
  }
});

// Update order status (Admin Only)
app.put('/api/orders/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});


// --- Admin Stats Route ---
app.get('/api/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalSales = await dbGet("SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'");
    const totalOrders = await dbGet("SELECT COUNT(*) as count FROM orders");
    const totalProducts = await dbGet("SELECT COUNT(*) as count FROM products");
    const totalUsers = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'user'");

    res.json({
      totalSales: totalSales.total || 0,
      totalOrders: totalOrders.count || 0,
      totalProducts: totalProducts.count || 0,
      totalUsers: totalUsers.count || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve admin statistics.' });
  }
});

// Server check
app.get('/', (req, res) => {
  res.send('E-commerce API is running...');
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
