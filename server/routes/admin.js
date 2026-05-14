const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET platform stats
router.get('/stats', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const [clubs, users, events, rsvps] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM clubs'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM events'),
      pool.query('SELECT COUNT(*) FROM rsvps'),
    ]);
    res.json({
      clubs: parseInt(clubs.rows[0].count),
      users: parseInt(users.rows[0].count),
      events: parseInt(events.rows[0].count),
      rsvps: parseInt(rsvps.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all users
router.get('/users', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
     c.name as club_name, c.id as club_id
     FROM users u
     LEFT JOIN club_admins ca ON u.id = ca.user_id
     LEFT JOIN clubs c ON ca.club_id = c.id
     ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH promote user to club_admin
router.patch('/users/:id/promote', authenticate, authorize('super_admin'), async (req, res) => {
  const { club_id } = req.body;
  const userId = req.params.id;
  try {
    const existing = await pool.query(
  'SELECT id FROM club_admins WHERE club_id = $1',
  [club_id]
     );
if (existing.rows.length > 0) {
  return res.status(400).json({ error: 'This club already has an admin. Remove the current admin first.' });
     }
    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['club_admin', userId]
    );
    await pool.query(
      'INSERT INTO club_admins (club_id, user_id) VALUES ($1, $2) ON CONFLICT (club_id, user_id) DO NOTHING',
      [club_id, userId]
    );
    res.json({ message: 'User promoted to club admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH demote club_admin back to student
router.patch('/users/:id/demote', authenticate, authorize('super_admin'), async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['student', userId]
    );
    await pool.query(
      'DELETE FROM club_admins WHERE user_id = $1',
      [userId]
    );
    res.json({ message: 'User demoted to student' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE user
router.delete('/users/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;