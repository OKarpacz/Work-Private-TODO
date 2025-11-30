import React from 'react';
import { User, Briefcase, Home, Plus, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Task, TaskCategory } from '../App';

interface DashboardProps {
  tasks: Task[];
  hideWorkTasks: boolean;
  onNavigate: (screen: any, task?: Task) => void;
  onCategorySelect: (category: TaskCategory | 'all') => void;
}

export function Dashboard({ tasks, hideWorkTasks, onNavigate, onCategorySelect }: DashboardProps) {
  const getCategoryStats = (category: TaskCategory) => {
    const categoryTasks = tasks.filter(t => t.category === category);
    const completed = categoryTasks.filter(t => t.completed).length;
    const total = categoryTasks.length;
    const pending = total - completed;
    return { completed, total, pending };
  };

  const categories = [
    {
      id: 'private' as TaskCategory,
      name: 'Private',
      icon: User,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      id: 'work' as TaskCategory,
      name: 'Work',
      icon: Briefcase,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      id: 'home' as TaskCategory,
      name: 'Home',
      icon: Home,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
  ];

  const todayTasks = tasks.filter(t => {
    if (hideWorkTasks && t.category === 'work') return false;
    return t.dueDate === new Date().toISOString().split('T')[0] && !t.completed;
  });

  const highPriorityTasks = tasks.filter(t => {
    if (hideWorkTasks && t.category === 'work') return false;
    return t.priority === 'high' && !t.completed;
  });

  const handleCategoryClick = (category: TaskCategory) => {
    onCategorySelect(category);
    onNavigate('tasks');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={() => onNavigate('newTask')}
            className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {hideWorkTasks && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Clock size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-900">Tryb po godzinach</p>
              <p className="text-amber-700 text-sm mt-0.5">
                Zadania służbowe są ukryte. Czas na odpoczynek!
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
              <span className="text-gray-600 dark:text-gray-400">Dzisiaj</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{todayTasks.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-red-600 dark:text-red-400" />
              <span className="text-gray-600 dark:text-gray-400">Priorytet</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{highPriorityTasks.length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-24">
        <h2 className="text-gray-900 dark:text-gray-100 mb-4">Kategorie</h2>
        
        <div className="space-y-3">
          {categories.map(category => {
            const stats = getCategoryStats(category.id);
            const Icon = category.icon;
            const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            const isHidden = hideWorkTasks && category.id === 'work';

            return (
              <button
                key={category.id}
                onClick={() => !isHidden && handleCategoryClick(category.id)}
                className="w-full bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all disabled:opacity-50"
                disabled={isHidden}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: category.bgColor }}
                  >
                    <Icon size={28} style={{ color: category.color }} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900 dark:text-gray-100">{category.name}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    
                    {stats.pending > 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        {stats.pending} {stats.pending === 1 ? 'zadanie' : 'zadań'} do wykonania
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <button
            onClick={() => onNavigate('weekly')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p>Widok tygodniowy</p>
                <p className="text-purple-100 text-sm mt-1">
                  Zobacz priorytety na cały tydzień
                </p>
              </div>
              <Calendar size={24} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}