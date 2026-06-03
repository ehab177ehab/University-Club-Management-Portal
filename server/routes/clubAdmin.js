const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const notify = require('../config/notify');
const router = express.Router();

// GET club admin's own club
router.get('/my-club', authenticate, authorize('club_admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(cm.id) as member_count
      FROM clubs c
      JOIN club_admins ca ON c.id = ca.club_id
      LEFT JOIN club_members cm ON c.id = cm.club_id
      WHERE ca.user_id = $1
      GROUP BY c.id
    `, [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No club found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET club's events
router.get('/my-club/events', authenticate, authorize('club_admin'), async (req, res) => {
  try {
    const clubResult = await pool.query(
      'SELECT club_id FROM club_admins WHERE user_id = $1',
      [req.user.id]
    );
    if (clubResult.rows.length === 0) return res.status(404).json({ error: 'No club found' });
    const clubId = clubResult.rows[0].club_id;

    const result = await pool.query(`
      SELECT e.*, COUNT(r.id) as rsvp_count
      FROM events e
      LEFT JOIN rsvps r ON e.id = r.event_id
      WHERE e.club_id = $1
      GROUP BY e.id
      ORDER BY e.date DESC
    `, [clubId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET RSVPs for an event
router.get('/my-club/events/:eventId/rsvps', authenticate, authorize('club_admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, r.created_at
      FROM users u
      JOIN rsvps r ON u.id = r.user_id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `, [req.params.eventId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create event
router.post('/my-club/events', authenticate, authorize('club_admin'), async (req, res) => {
  const { title, description, date, location, capacity, members_only } = req.body;
  try {
    const clubResult = await pool.query(
      'SELECT club_id FROM club_admins WHERE user_id = $1',
      [req.user.id]
    );
    if (clubResult.rows.length === 0) return res.status(404).json({ error: 'No club found' });
    const clubId = clubResult.rows[0].club_id;

    const result = await pool.query(`
      INSERT INTO events (club_id, title, description, date, location, capacity, members_only, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [clubId, title, description, date, location, capacity || null, members_only || false, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// PATCH update event
router.patch('/my-club/events/:eventId', authenticate, authorize('club_admin'), async (req, res) => {
  const { title, description, date, location, capacity, members_only } = req.body;
  try {
    const result = await pool.query(`
      UPDATE events SET
        title = $1, description = $2, date = $3,
        location = $4, capacity = $5, members_only = $6
      WHERE id = $7 RETURNING *
    `, [title, description, date, location, capacity || null, members_only, req.params.eventId]);

    // Notify all RSVPd students
    const rsvpUsers = await pool.query(
      'SELECT user_id FROM rsvps WHERE event_id = $1',
      [req.params.eventId]
    );
    for (const row of rsvpUsers.rows) {
      await notify(row.user_id, 'event_update', `"${result.rows[0].title}" has been updated. Check the event page for details.`);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE event
router.delete('/my-club/events/:eventId', authenticate, authorize('club_admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.eventId]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET club members
router.get('/my-club/members', authenticate, authorize('club_admin'), async (req, res) => {
  try {
    const clubResult = await pool.query(
      'SELECT club_id FROM club_admins WHERE user_id = $1',
      [req.user.id]
    );
    if (clubResult.rows.length === 0) return res.status(404).json({ error: 'No club found' });
    const clubId = clubResult.rows[0].club_id;

    const result = await pool.query(`
      SELECT u.id, u.name, u.email, cm.joined_at
      FROM users u
      JOIN club_members cm ON u.id = cm.user_id
      WHERE cm.club_id = $1
      ORDER BY cm.joined_at DESC
    `, [clubId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



// DELETE remove member
router.delete('/my-club/members/:userId', authenticate, authorize('club_admin'), async (req, res) => {
  const clubResult = await pool.query(
    'SELECT club_id FROM club_admins WHERE user_id = $1',
    [req.user.id]
  );
  const clubId = clubResult.rows[0].club_id;

  // Prevent admin from removing themselves
  if (req.params.userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot remove yourself from your own club' });
  }

  try {
    await pool.query(
      'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2',
      [clubId, req.params.userId]
    );
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;