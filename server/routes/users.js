const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

const router = express.Router();
router.use(protect);
router.get('/', authorize('Admin'), getUsers);

module.exports = router;
