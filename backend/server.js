const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const webpush = require('web-push');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_CONTACT || 'mailto:soporte@healthmarket.local',
    vapidPublicKey,
    vapidPrivateKey,
  );
}

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
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      subscription JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

app.get('/api/push/public-key', (req, res) => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(503).json({ error: 'El servidor no tiene claves VAPID configuradas.' });
  }
  res.json({ publicKey: vapidPublicKey });
});

app.post('/api/push/subscribe', async (req, res) => {
  const { subscription } = req.body;
  const endpoint = subscription?.endpoint;
  const keys = subscription?.keys;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'La suscripción push no es válida.' });
  }

  try {
    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, subscription, updated_at)
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (endpoint) DO UPDATE SET
         subscription = EXCLUDED.subscription,
         updated_at = CURRENT_TIMESTAMP`,
      [endpoint, JSON.stringify(subscription)],
    );
    res.status(201).json({ subscribed: true });
  } catch (err) {
    console.error('Error saving push subscription:', err);
    res.status(500).json({ error: 'No se pudo guardar la suscripción push.' });
  }
});

app.delete('/api/push/subscribe', async (req, res) => {
  const { endpoint } = req.body;
  if (typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Falta el endpoint de la suscripción.' });
  }

  try {
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ subscribed: false });
  } catch (err) {
    console.error('Error removing push subscription:', err);
    res.status(500).json({ error: 'No se pudo eliminar la suscripción push.' });
  }
});

app.post('/api/push/test', async (req, res) => {
  const { endpoint } = req.body;
  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(503).json({ error: 'Configura VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en el backend.' });
  }
  if (typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Falta el endpoint de la suscripción.' });
  }

  try {
    const result = await pool.query(
      'SELECT subscription FROM push_subscriptions WHERE endpoint = $1',
      [endpoint],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró una suscripción para este dispositivo.' });
    }

    await webpush.sendNotification(result.rows[0].subscription, JSON.stringify({
      title: 'Health Market',
      body: 'Las notificaciones push están activas en este dispositivo.',
      url: '/',
    }));
    res.status(202).json({ sent: true });
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]).catch(() => {});
      return res.status(410).json({ error: 'La suscripción caducó. Activa las notificaciones nuevamente.' });
    }
    console.error('Error sending test push:', err);
    res.status(502).json({ error: 'No se pudo enviar la notificación push de prueba.' });
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
