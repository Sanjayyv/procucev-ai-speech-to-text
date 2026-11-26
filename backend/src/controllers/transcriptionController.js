
const pool = require('../config/db');

// CREATE transcription
const createTranscription = async (req, res) => {
  try {
    const {
      title,
      transcript,
      language,
      durationSeconds,
    } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Transcript cannot be empty',
      });
    }

    const result = await pool.query(
      `INSERT INTO transcriptions
       (user_id, title, transcript, language, duration_seconds)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user.userId,
        title?.trim() || 'Untitled Transcription',
        transcript.trim(),
        language || null,
        Number.isInteger(durationSeconds) && durationSeconds >= 0
          ? durationSeconds
          : 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Transcription saved successfully',
      transcription: result.rows[0],
    });
  } catch (error) {
    console.error('Save transcription error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to save transcription',
    });
  }
};

// READ all transcriptions belonging to logged-in user
const getTranscriptions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, transcript, language,
              duration_seconds, created_at, updated_at
       FROM transcriptions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      transcriptions: result.rows,
    });
  } catch (error) {
    console.error('Get transcriptions error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch transcription history',
    });
  }
};

// UPDATE a transcription
const updateTranscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, transcript } = req.body;

    if (typeof transcript !== 'string' || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Transcript cannot be empty',
      });
    }

    const result = await pool.query(
      `UPDATE transcriptions
       SET title = $1,
           transcript = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [
        typeof title === 'string' && title.trim()
          ? title.trim()
          : 'Untitled Transcription',
        transcript.trim(),
        id,
        req.user.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transcription not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transcription updated successfully',
      transcription: result.rows[0],
    });
  } catch (error) {
    console.error('Update transcription error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to update transcription',
    });
  }
};

// DELETE a transcription
const deleteTranscription = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM transcriptions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transcription not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transcription deleted successfully',
    });
  } catch (error) {
    console.error('Delete transcription error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete transcription',
    });
  }
};

module.exports = {
  createTranscription,
  getTranscriptions,
  updateTranscription,
  deleteTranscription,
};
