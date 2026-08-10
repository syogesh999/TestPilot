const express = require('express');
const router = express.Router();
const { createRun, getRunStatus, getRunResults } = require('../controllers/runController');
const { generateAIReport, getReport } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createRun);
router.get('/:id', getRunStatus);
router.get('/:id/results', getRunResults);
router.post('/:id/ai-analysis', generateAIReport);
router.get('/:id/report', getReport);

module.exports = router;
