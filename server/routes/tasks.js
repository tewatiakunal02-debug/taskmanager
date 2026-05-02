const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();
router.use(protect);
router.post('/', authorize('Admin'), createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', authorize('Admin'), deleteTask);

module.exports = router;
