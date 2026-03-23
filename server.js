'use strict';

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const path = require('path');

const { pool } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const ratesRoutes = require('./routes/rates');
const entriesRoutes = require('./routes/entries');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// ── Trust proxy (needed if behind nginx/heroku etc.)
app.set('trust proxy', 1);

// ── Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS (allow frontend origin; in production tighten this)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

// ── Session (stored in PostgreSQL)
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET || 'change_me_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      sameSite: 'lax',
    },
    name: 'ledger.sid',
  })
);

// ── API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/entries', entriesRoutes);

// ── Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── SPA fallback (serve index.html for any non-API route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Central error handler (must be last)
app.use(errorHandler);

// ── Start server
app.listen(PORT, () => {
  console.log(`✅ Ledger server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
