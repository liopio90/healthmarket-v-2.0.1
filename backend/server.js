const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL configuration
// Supports connection via DATABASE_URL or individual PG credentials
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

const dbConfig = connectionString 
  ? { connectionString, ssl: isProduction ? { rejectUnauthorized: false } : false }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'healthmarket',
      password: process.env.PGPASSWORD || 'postgres',
      port: parseInt(process.env.PGPORT || '5432', 10),
    };

const pool = new Pool(dbConfig);

// Initialize DB schema on startup
async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      uid VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      first_name VARCHAR(255),
      last_name_parent VARCHAR(255),
      last_name_match VARCHAR(255),
      age INTEGER,
      phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    console.log('✅ PostgreSQL "users" table is ready.');
    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database or run initialization script:', err.message);
    console.log('Ensure PostgreSQL is running and credentials in .env are correct.');
  }
}

initDb();

// Routes

// Get user profile details
app.get('/api/users/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    
    // Map snake_case database columns to camelCase for the frontend
    res.json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      firstName: user.first_name,
      lastNameParent: user.last_name_parent,
      lastNameMatch: user.last_name_match,
      age: user.age,
      phone: user.phone,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Database error fetching user profile' });
  }
});

// Create or update user profile
app.post('/api/users', async (req, res) => {
  const { uid, email, name, firstName, lastNameParent, lastNameMatch, age, phone } = req.body;
  
  if (!uid || !email || !name) {
    return res.status(400).json({ error: 'uid, email, and name are required fields' });
  }

  const query = `
    INSERT INTO users (uid, email, name, first_name, last_name_parent, last_name_match, age, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (uid) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      first_name = EXCLUDED.first_name,
      last_name_parent = EXCLUDED.last_name_parent,
      last_name_match = EXCLUDED.last_name_match,
      age = EXCLUDED.age,
      phone = EXCLUDED.phone
    RETURNING *;
  `;

  const values = [
    uid,
    email,
    name,
    firstName || null,
    lastNameParent || null,
    lastNameMatch || null,
    age ? parseInt(age, 10) : null,
    phone || null
  ];

  try {
    const result = await pool.query(query, values);
    const user = result.rows[0];
    
    console.log(`👤 User profile saved/updated: ${email}`);
    
    res.json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      firstName: user.first_name,
      lastNameParent: user.last_name_parent,
      lastNameMatch: user.last_name_match,
      age: user.age,
      phone: user.phone,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Error saving user profile:', err);
    res.status(500).json({ error: 'Database error saving user profile' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'PostgreSQL' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
});
