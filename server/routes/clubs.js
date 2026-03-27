const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all clubs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clubs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single club
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clubs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Club not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create club (super_admin only)
router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  const { name, description, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clubs (name, description, image_url, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, image_url, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE club (super_admin only)
router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM clubs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Club deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;