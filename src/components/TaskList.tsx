import React from 'react';
import { Plus, Filter, CheckCircle2, Circle, User, Briefcase, Home, Clock } from 'lucide-react';
import { Task, TaskCategory } from '../App';

interface TaskListProps {
  tasks: Task[];
  activeCategory: TaskCategory | 'all';
  onCategoryChange: (category: TaskCategory | 'all') => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onNavigate: (screen: any) => void;
}

export function TaskList({ 
  tasks, 
  activeCategory, 
  onCategoryChange, 
  onTaskClick, 
  onToggleComplete,
  onNavigate 
}: TaskListProps) {
  const categories = [
    { id: 'all', name: 'Wszystkie', icon: Filter, color: '#8B5CF6' },
    { id: 'private', name: 'Private', icon: User, color: '#3B82F6' },
    { id: 'work', name: 'Work', icon: Briefcase, color: '#F59E0B' },
    { id: 'home', name: 'Home', icon: Home, color: '#10B981' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'private': return '#3B82F6';
      case 'work': return '#F59E0B';
      case 'home': return '#10B981';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Wysoki';
      case 'medium': return 'Średni';
      case 'low': return 'Niski';
      default: return priority;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Dzisiaj';
    if (dateOnly === tomorrowOnly) return 'Jutro';
    
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  const isOverdue = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-900">Zadania</h1>
          <button
            onClick={() => onNavigate('newTask')}
            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id as TaskCategory | 'all')}
                className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  backgroundColor: isActive ? category.color : '#F3F4F6',
                  color: isActive ? 'white' : '#6B7280',
                }}
              >
                <Icon size={16} />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-900 mb-2">Brak zadań</p>
            <p className="text-gray-500 text-sm max-w-xs">
              {activeCategory === 'all' 
                ? 'Dodaj pierwsze zadanie, aby rozpocząć organizację dnia'
                : 'Nie masz żadnych zadań w tej kategorii'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map(task => {
              const categoryColor = getCategoryColor(task.category);
              const priorityColor = getPriorityColor(task.priority);
              const overdue = !task.completed && isOverdue(task.dueDate);

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer"
                  style={{
                    opacity: task.completed ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task.id);
                      }}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 
                          size={24} 
                          className="text-green-500"
                          fill="currentColor"
                        />
                      ) : (
                        <Circle 
                          size={24} 
                          style={{ color: categoryColor }}
                        />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p 
                          className="text-gray-900"
                          style={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </p>
                        <div
                          className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                          style={{
                            backgroundColor: `${priorityColor}20`,
                            color: priorityColor,
                          }}
                        >
                          {getPriorityLabel(task.priority)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div 
                          className="flex items-center gap-1.5 text-sm"
                          style={{ 
                            color: overdue ? '#EF4444' : '#6B7280' 
                          }}
                        >
                          <Clock size={14} />
                          <span>{formatDate(task.dueDate)}</span>
                          {overdue && <span className="text-red-600">• Zaległe</span>}
                        </div>

                        {task.assignedUsers && task.assignedUsers.length > 0 && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <User size={14} />
                            <span>{task.assignedUsers.length} {task.assignedUsers.length === 1 ? 'osoba' : 'osób'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
