import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  category: 'private' | 'work' | 'home';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  assignedUsers?: string[];
  createdAt: string;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['private', 'work', 'home'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  dueDate: { type: String, required: true },
  completed: { type: Boolean, default: false },
  assignedUsers: { type: [String], default: [] },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
});

export default mongoose.model<ITask>('Task', TaskSchema);