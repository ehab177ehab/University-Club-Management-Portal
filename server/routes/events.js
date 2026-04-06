const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all upcoming events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.name as club_name, c.image_url as club_image
      FROM events e
      JOIN clubs c ON e.club_id = c.id
      WHERE e.status = 'upcoming'
      ORDER BY e.date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.name as club_name, c.image_url as club_image
      FROM events e
      JOIN clubs c ON e.club_id = c.id
      WHERE e.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create event (club_admin or super_admin)
router.post('/', authenticate, authorize('club_admin', 'super_admin'), async (req, res) => {
  const { club_id, title, description, date, location, capacity, members_only } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO events (club_id, title, description, date, location, capacity, members_only, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [club_id, title, description, date, location, capacity, members_only, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH update event status
router.patch('/:id/status', authenticate, authorize('club_admin', 'super_admin'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE events SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE event
router.delete('/:id', authenticate, authorize('club_admin', 'super_admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;