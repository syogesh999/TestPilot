const express = require('express');
const router = express.Router({ mergeParams: true });
const { importSpec, getSpec, getEndpoints } = require('../controllers/specController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/specs', importSpec);
router.get('/specs', getSpec);
router.get('/endpoints', getEndpoints);

module.exports = router;
