import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Task, TaskCategory } from '../App';

interface YearlyViewProps {
  tasks: Task[];
  hideWorkTasks: boolean;
  onNavigate: (screen: any, task?: any) => void;
}

export function YearlyView({ tasks, hideWorkTasks, onNavigate }: YearlyViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getTasksForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => {
      if (hideWorkTasks && t.category === 'work') return false;
      return t.dueDate === dateStr;
    });
  };

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'private': return '#3B82F6';
      case 'work': return '#F59E0B';
      case 'home': return '#10B981';
    }
  };

  const getCategoryName = (category: TaskCategory) => {
    switch (category) {
      case 'private': return 'Private';
      case 'work': return 'Work';
      case 'home': return 'Home';
    }
  };

  const handleDayClick = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = getTasksForDate(year, month, day);
    
    if (dayTasks.length > 0) {
      setSelectedDate(dateStr);
      setSelectedDateTasks(dayTasks);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-6 pb-4 bg-gradient-to-r from-purple-500 to-indigo-600">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white">Widok roczny</h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentYear(currentYear - 1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h2 className="text-white text-xl">{currentYear}</h2>
          <button
            onClick={() => setCurrentYear(currentYear + 1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="grid grid-cols-1 gap-4">
          {monthNames.map((monthName, monthIndex) => {
            const daysInMonth = getDaysInMonth(currentYear, monthIndex);
            const firstDay = getFirstDayOfMonth(currentYear, monthIndex);
            const days = [];

            for (let i = 0; i < firstDay; i++) {
              days.push(<div key={`empty-${i}`} className="aspect-square" />);
            }

            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const dayTasks = getTasksForDate(currentYear, monthIndex, day);
              const hasHighPriority = dayTasks.some(t => t.priority === 'high' && !t.completed);

              days.push(
                <button
                  key={day}
                  onClick={() => handleDayClick(currentYear, monthIndex, day)}
                  className={`aspect-square p-1 rounded-lg transition-colors ${
                    isToday ? 'bg-purple-100 dark:bg-purple-900/30' : ''
                  } ${dayTasks.length > 0 ? 'hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-center mb-1">
                    {day}
                  </div>
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayTasks.slice(0, 3).map((task, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(task.category) }}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    )}
                  </div>
                </button>
              );
            }

            return (
              <div key={monthIndex} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                <h3 className="text-center mb-3 text-gray-900 dark:text-gray-100">
                  {monthName}
                </h3>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(day => (
                    <div key={day} className="text-xs text-center text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal with tasks for selected date */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-900 dark:text-gray-100">Zadania</h2>
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedDateTasks([]);
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(selectedDate)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {selectedDateTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedDateTasks([]);
                      onNavigate('taskDetails', task);
                    }}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCategoryColor(task.category) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-gray-900 dark:text-gray-100 ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </h3>
                          {task.priority === 'high' && !task.completed && (
                            <span className="text-red-500">●</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: getCategoryColor(task.category) + '20',
                              color: getCategoryColor(task.category),
                            }}
                          >
                            {getCategoryName(task.category)}
                          </span>
                          {task.dueTime && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {task.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}