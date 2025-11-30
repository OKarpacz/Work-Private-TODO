import React from 'react';
import { ArrowLeft, Calendar, TrendingUp, User, Briefcase, Home } from 'lucide-react';
import { Task, TaskCategory } from '../App';

interface WeeklyWidgetProps {
  tasks: Task[];
  hideWorkTasks: boolean;
  onNavigate: (screen: any) => void;
}

export function WeeklyWidget({ tasks, hideWorkTasks, onNavigate }: WeeklyWidgetProps) {
  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => {
      if (hideWorkTasks && t.category === 'work') return false;
      return t.dueDate === dateStr && !t.completed;
    });
  };

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'private': return '#3B82F6';
      case 'work': return '#F59E0B';
      case 'home': return '#10B981';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'private': return User;
      case 'work': return Briefcase;
      case 'home': return Home;
    }
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { weekday: 'short' }).toUpperCase();
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const getWeekStats = () => {
    const weekTasks = tasks.filter(t => {
      if (hideWorkTasks && t.category === 'work') return false;
      const taskDate = new Date(t.dueDate);
      return weekDays.some(day => 
        day.toISOString().split('T')[0] === taskDate.toISOString().split('T')[0]
      );
    });

    const completed = weekTasks.filter(t => t.completed).length;
    const total = weekTasks.length;
    const highPriority = weekTasks.filter(t => t.priority === 'high' && !t.completed).length;

    return { completed, total, highPriority };
  };

  const stats = getWeekStats();

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-gray-900 dark:text-gray-100">Widok tygodniowy</h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">Wszystkie</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">Ukończone</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{stats.completed}</p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">Priorytet</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{stats.highPriority}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="space-y-4">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const isPast = dateStr < today;

            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-600"
              >
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: isToday ? '#8B5CF6' : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p 
                        className="text-xs"
                        style={{ color: isToday ? '#E9D5FF' : undefined }}
                      >
                        {getDayName(day)}
                      </p>
                      <p 
                        className={isToday ? 'text-white' : 'text-gray-900 dark:text-gray-100'}
                      >
                        {getDayNumber(day)}
                      </p>
                    </div>
                    {isToday && (
                      <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                        <span className="text-white text-xs">Dzisiaj</span>
                      </div>
                    )}
                  </div>
                  <div className={isToday ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
                    {dayTasks.length} {dayTasks.length === 1 ? 'zadanie' : 'zadań'}
                  </div>
                </div>

                {dayTasks.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {dayTasks.map(task => {
                      const categoryColor = getCategoryColor(task.category);
                      const CategoryIcon = getCategoryIcon(task.category);

                      return (
                        <button
                          key={task.id}
                          onClick={() => onNavigate('taskDetails', task)}
                          className="w-full flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors text-left"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: categoryColor + '20' }}
                          >
                            <CategoryIcon size={16} style={{ color: categoryColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-gray-100 truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{
                                  backgroundColor: categoryColor + '20',
                                  color: categoryColor,
                                }}
                              >
                                {task.priority === 'high' ? 'Wysoki' : task.priority === 'medium' ? 'Średni' : 'Niski'}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      {isPast ? 'Brak zadań tego dnia' : 'Brak zaplanowanych zadań'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}