const pool = require('./db');

const notify = async (userId, type, message) => {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)',
      [userId, type, message]
    );
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

module.exports = notify;