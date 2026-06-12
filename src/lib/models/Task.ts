import mongoose, { Schema } from 'mongoose';

export interface ISubtask {
  title: string;
  completed: boolean;
}

export interface ITask {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  subtasks: ISubtask[];
  createdAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, required: true, default: false }
});

const TaskSchema: Schema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo'
  },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: { type: String, required: true, default: 'Cá nhân', trim: true },
  dueDate: { type: Date, required: false },
  subtasks: { type: [SubtaskSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
