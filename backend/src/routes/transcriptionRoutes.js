
const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');

const {
  createTranscription,
  getTranscriptions,
  updateTranscription,
  deleteTranscription,
} = require('../controllers/transcriptionController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', createTranscription);
router.get('/', getTranscriptions);
router.put('/:id', updateTranscription);
router.delete('/:id', deleteTranscription);

module.exports = router;
