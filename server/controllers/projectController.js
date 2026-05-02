const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, deadline, members, status, progress } = req.body;
    if (!title || !description || !deadline) {
      return res.status(400).json({ message: 'Title, description and deadline are required' });
    }
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Deadline must be a valid date' });
    }
    const projectMembers = (members || []).filter((id) => isValidId(id));
    await Promise.all(projectMembers.map(async (memberId) => {
      const member = await User.findById(memberId);
      if (!member) {
        throw new Error('One or more members are invalid');
      }
    }));
    const project = await Project.create({
      title,
      description,
      deadline: deadlineDate,
      createdBy: req.user._id,
      members: projectMembers,
      status: status || 'Active',
      progress: progress ?? 0
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    const query = role === 'Admin'
      ? {}
      : { members: _id };
    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }
    const project = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (req.user.role !== 'Admin' && !project.members.some((member) => member._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = {};
    const { title, description, deadline, members, status, progress } = req.body;
    const isMember = project.members.some((memberId) => memberId.equals(req.user._id));

    if (req.user.role !== 'Admin') {
      if (!isMember) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (progress === undefined) {
        return res.status(403).json({ message: 'Only project members can update project progress' });
      }
      const progressValue = Number(progress);
      if (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        return res.status(400).json({ message: 'Progress must be between 0 and 100' });
      }
      updates.progress = progressValue;
    } else {
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (deadline) {
        const deadlineDate = new Date(deadline);
        if (Number.isNaN(deadlineDate.getTime())) {
          return res.status(400).json({ message: 'Deadline must be a valid date' });
        }
        updates.deadline = deadlineDate;
      }
      if (Array.isArray(members)) {
        const validMembers = members.filter(isValidId);
        updates.members = validMembers;
      }
      if (status) updates.status = status;
      if (progress !== undefined) {
        const progressValue = Number(progress);
        if (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
          return res.status(400).json({ message: 'Progress must be between 0 and 100' });
        }
        updates.progress = progressValue;
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updates, { new: true })
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
