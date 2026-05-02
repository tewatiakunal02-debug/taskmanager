const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboard = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    const projectFilter = role === 'Admin' ? {} : { members: _id };
    const taskFilter = role === 'Admin' ? {} : { assignedTo: _id };

    const projects = await Project.find(projectFilter);
    const tasks = await Task.find(taskFilter);

    const overdueTasks = tasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== 'Done');
    const completedTasks = tasks.filter((task) => task.status === 'Done');
    const pendingTasks = tasks.filter((task) => task.status !== 'Done');

    res.json({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      recentTasks: tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
      projectProgress: projects.map((project) => ({
        id: project._id,
        title: project.title,
        progress: project.progress || 0,
        status: project.status
      }))
    });
  } catch (error) {
    next(error);
  }
};
