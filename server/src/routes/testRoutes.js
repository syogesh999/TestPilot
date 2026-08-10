const express = require('express');
const router = express.Router({ mergeParams: true });
const { generateTests, getTests, updateTest } = require('../controllers/testController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateTests);
router.get('/', getTests);
router.put('/:testId', updateTest);

module.exports = router;
