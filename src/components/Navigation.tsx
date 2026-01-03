import React from 'react';
import { Home, ListTodo, Calendar, Settings } from 'lucide-react';

interface NavigationProps {
  currentScreen: string;
  onNavigate: (screen: any) => void;
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', icon: Home },
    { id: 'tasks', icon: ListTodo },
    { id: 'weekly', icon: Calendar },
    { id: 'yearly', icon: Calendar },
    { id: 'settings', icon: Settings },
  ];

  const isDetailScreen = currentScreen === 'taskDetails' || currentScreen === 'newTask';

  if (isDetailScreen) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 px-2 py-2 transition-all"
            >
              <Icon
                size={24}
                style={{
                  color: isActive ? '#8B5CF6' : '#9CA3AF',
                  strokeWidth: isActive ? 2 : 1.5,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}