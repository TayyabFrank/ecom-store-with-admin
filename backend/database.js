import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'ecommerce.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initializeDatabase() {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        image_url TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        items TEXT NOT NULL, -- JSON string of ordered items
        shipping_address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create default Admin user if none exists
    const adminEmail = 'admin@ecom.com';
    const adminUser = await dbGet('SELECT * FROM users WHERE email = ?', [adminEmail]);

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('adminpassword', 10);
      await dbRun(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['System Admin', adminEmail, hashedPassword, 'admin']
      );
      console.log('Default admin account created: admin@ecom.com / adminpassword');
    }

    // Populate dummy products if empty
    const productCount = await dbGet('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
      const dummyProducts = [
        {
          name: 'Minimalist Leather Backpack',
          description: 'A premium, water-resistant full-grain leather backpack suitable for daily commuting and short travels. Features a 15-inch laptop compartment.',
          price: 129.99,
          stock: 25,
          image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
          category: 'Bags'
        },
        {
          name: 'Wireless Noise-Cancelling Headphones',
          description: 'Experience immersive audio with hybrid active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam earcups.',
          price: 199.99,
          stock: 15,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          category: 'Electronics'
        },
        {
          name: 'Mechanical Ergonomic Keyboard',
          description: 'A hot-swappable 75% mechanical keyboard with tactile brown switches, pre-lubed stabilizers, and dynamic RGB backlighting.',
          price: 89.99,
          stock: 30,
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
          category: 'Electronics'
        },
        {
          name: 'Stainless Steel Water Bottle',
          description: 'Double-walled vacuum insulated bottle that keeps your drinks cold for 24 hours or hot for 12 hours. Sweat-proof powder coat finish.',
          price: 24.99,
          stock: 50,
          image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
          category: 'Lifestyle'
        },
        {
          name: 'Premium Wool Knit Sweater',
          description: 'Crafted from 100% extrafine Merino wool, this knit sweater offers exceptional warmth, breathability, and soft texture.',
          price: 79.99,
          stock: 20,
          image_url: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?w=600',
          category: 'Apparel'
        }
      ];

      for (const p of dummyProducts) {
        await dbRun(
          'INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
          [p.name, p.description, p.price, p.stock, p.image_url, p.category]
        );
      }
      console.log('Dummy products populated.');
    }

  } catch (err) {
    console.error('Error during database initialization:', err);
  }
}

export { db, dbRun, dbGet, dbAll };
