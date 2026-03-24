'use strict';

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const cors = require('cors');

const { pool } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const ratesRoutes = require('./routes/rates');
const entriesRoutes = require('./routes/entries');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

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
      maxAge: 8 * 60 * 60 * 1000,
      sameSite: 'none',
    },
    name: 'ledger.sid',
  })
);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/entries', entriesRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Ledger API is running.' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Ledger server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;