const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status, progress, assignedTo, projectId } = req.body;
    if (!title || !description || !dueDate || !projectId) {
      return res.status(400).json({ message: 'Title, description, due date, and project are required' });
    }
    if (!isValidId(projectId)) {
      return res.status(400).json({ message: 'Valid project id is required' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
      return res.status(400).json({ message: 'Due date must be valid' });
    }
    if (assignedTo && !isValidId(assignedTo)) {
      return res.status(400).json({ message: 'Assigned user id must be valid' });
    }
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }
    let taskProgress = 0;
    if (progress !== undefined) {
      const progressValue = Number(progress);
      if (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        return res.status(400).json({ message: 'Progress must be between 0 and 100' });
      }
      taskProgress = progressValue;
    }
    const task = await Task.create({
      title,
      description,
      priority: priority || 'Medium',
      dueDate: due,
      status: status || 'Todo',
      progress: taskProgress,
      assignedTo: assignedTo || undefined,
      projectId,
      createdBy: req.user._id
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (role !== 'Admin') {
      filter.assignedTo = _id;
    }
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    const task = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title description')
      .populate('createdBy', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'Admin' && (!task.assignedTo || !task.assignedTo._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const { title, description, priority, dueDate, status, assignedTo, progress } = req.body;
    if (req.user.role !== 'Admin' && (!task.assignedTo || !task.assignedTo.equals(req.user._id))) {
      return res.status(403).json({ message: 'Only assigned members can update their tasks' });
    }
    if (assignedTo && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admin can assign tasks' });
    }
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) {
      const due = new Date(dueDate);
      if (Number.isNaN(due.getTime())) {
        return res.status(400).json({ message: 'Due date must be valid' });
      }
      task.dueDate = due;
    }
    if (progress !== undefined) {
      const progressValue = Number(progress);
      if (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        return res.status(400).json({ message: 'Progress must be between 0 and 100' });
      }
      if (req.user.role !== 'Admin' && (!task.assignedTo || !task.assignedTo.equals(req.user._id))) {
        return res.status(403).json({ message: 'Only assigned members can update their task progress' });
      }
      task.progress = progressValue;
    }
    if (status) {
      if (req.user.role === 'Admin') {
        task.status = status;
      } else if (task.assignedTo && task.assignedTo.equals(req.user._id)) {
        task.status = status;
      } else {
        return res.status(403).json({ message: 'Not allowed to update this status' });
      }
    }
    if (assignedTo) {
      if (!isValidId(assignedTo)) {
        return res.status(400).json({ message: 'Assigned user id must be valid' });
      }
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
      task.assignedTo = assignedTo;
    }
    await task.save();
    const updated = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
