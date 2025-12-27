import express from 'express';
import Task from '../models/Task';

const router = express.Router();

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    // Map _id to id for frontend compatibility
    const formattedTasks = tasks.map(task => ({
      ...task.toObject(),
      id: task._id.toString()
    }));
    res.json(formattedTasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// POST create a new task
router.post('/', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json({
      ...savedTask.toObject(),
      id: savedTask._id.toString()
    });
  } catch (err) {
    res.status(400).json({ message: 'Error creating task' });
  }
});

// PUT update a task
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({
      ...updatedTask.toObject(),
      id: updatedTask._id.toString()
    });
  } catch (err) {
    res.status(400).json({ message: 'Error updating task' });
  }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

export default router;