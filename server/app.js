const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');

const clubRoutes = require('./routes/clubs');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Protected test route
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, you are authenticated!` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;