import React from 'react';
import { ArrowLeft, Edit2, Trash2, CheckCircle2, Circle, User, Calendar, Flag, Tag } from 'lucide-react';
import { Task, TaskCategory } from '../App';

interface TaskDetailsProps {
  task: Task;
  onBack: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

export function TaskDetails({ task, onBack, onEdit, onDelete, onToggleComplete }: TaskDetailsProps) {
  const getCategoryInfo = (category: TaskCategory) => {
    switch (category) {
      case 'private':
        return { name: 'Private', color: '#3B82F6', bgColor: '#EFF6FF' };
      case 'work':
        return { name: 'Work', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'home':
        return { name: 'Home', color: '#10B981', bgColor: '#D1FAE5' };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { name: 'Wysoki', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'medium':
        return { name: 'Średni', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'low':
        return { name: 'Niski', color: '#10B981', bgColor: '#D1FAE5' };
      default:
        return { name: priority, color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const categoryInfo = getCategoryInfo(task.category);
  const priorityInfo = getPriorityInfo(task.priority);

  const handleDelete = () => {
    if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
      onDelete(task.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      
      <div 
        className="p-6 pb-8 dark:bg-opacity-40"
        style={{ backgroundColor: categoryInfo.bgColor }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(task)}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Edit2 size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-600/20 transition-colors"
            >
              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 flex-shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 
                size={32} 
                className="text-green-500"
                fill="currentColor"
              />
            ) : (
              <Circle 
                size={32} 
                style={{ color: categoryInfo.color }}
                strokeWidth={2}
              />
            )}
          </button>

          <div className="flex-1">
            <h1 
              className="text-gray-900 dark:text-gray-100 mb-2"
              style={{
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </h1>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                backgroundColor: categoryInfo.color,
                color: 'white',
              }}
            >
              <Tag size={14} />
              {categoryInfo.name}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <div className="space-y-6">

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
              <Calendar size={20} />
              <span>Termin</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-gray-900 dark:text-gray-100">{formatDate(task.dueDate)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
              <Flag size={20} />
              <span>Priorytet</span>
            </div>
            <div 
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{
                backgroundColor: priorityInfo.bgColor,
                color: priorityInfo.color,
              }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: priorityInfo.color }}
              />
              <span>{priorityInfo.name}</span>
            </div>
          </div>

          {task.assignedUsers && task.assignedUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
                <User size={20} />
                <span>Przypisani użytkownicy</span>
              </div>
              <div className="space-y-2">
                {task.assignedUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-3"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: categoryInfo.color + '20',
                        color: categoryInfo.color,
                      }}
                    >
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-900 dark:text-gray-200">{user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
              <Edit2 size={20} />
              <span>Opis</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {task.description || 'Brak opisu'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Utworzono: {formatDate(task.createdAt)}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
