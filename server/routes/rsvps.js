const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST rsvp to an event
router.post('/:eventId', authenticate, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (event.rows.length === 0) return res.status(404).json({ error: 'Event not found' });

    const e = event.rows[0];

    // Check members only
    if (e.members_only) {
      const member = await pool.query(
        'SELECT id FROM club_members WHERE club_id = $1 AND user_id = $2',
        [e.club_id, userId]
      );
      if (member.rows.length === 0) return res.status(403).json({ error: 'This event is for club members only' });
    }

    // Check capacity
    if (e.capacity) {
      const count = await pool.query('SELECT COUNT(*) FROM rsvps WHERE event_id = $1', [eventId]);
      if (parseInt(count.rows[0].count) >= e.capacity) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    // Check already rsvpd
    const existing = await pool.query(
      'SELECT id FROM rsvps WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Already RSVP\'d to this event' });

    await pool.query(
      'INSERT INTO rsvps (event_id, user_id) VALUES ($1, $2)',
      [eventId, userId]
    );

    res.status(201).json({ message: 'RSVP successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE cancel rsvp
router.delete('/:eventId', authenticate, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    await pool.query(
      'DELETE FROM rsvps WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );
    res.json({ message: 'RSVP cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;