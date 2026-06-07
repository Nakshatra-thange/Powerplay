require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Routes (wired in Phase 3) ─────────────────────────────
// app.use('/api/invoices', require('./routes/invoices'));
// app.use('/api/customers', require('./routes/customers'));

// ── Fallback handlers ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;