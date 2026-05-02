const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const router = express.Router();
router.use(protect);
router.post('/', authorize('Admin'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', authorize('Admin'), deleteProject);

module.exports = router;
