require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const { whatsappClient } = require('./whatsapp/client');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Load models
require('./models')(sequelize);

// Routes
app.use('/api/pair-code', require('./routes/pairCode'));
app.use('/api/bot', require('./routes/bot'));

// WhatsApp session initialization endpoint
app.post('/api/init-session', async (req, res) => {
  const { sessionId, phoneNumber } = req.body;
  
  try {
    await whatsappClient.initialize(sessionId, phoneNumber);
    res.json({ success: true, message: 'WhatsApp session initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
