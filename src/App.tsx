import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TaskDetails } from './components/TaskDetails';
import { NewTask } from './components/NewTask';
import { WeeklyWidget } from './components/WeeklyWidget';
import { YearlyView } from './components/YearlyView';
import { Settings } from './components/Settings';
import { Navigation } from './components/Navigation';

export type TaskCategory = 'private' | 'work' | 'home';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  assignedUsers?: string[];
  createdAt: string;
}

export interface AppSettings {
  blockWorkTasksAfterHours: boolean;
  workHoursEnd: string;
  notifications: boolean;
  darkMode: boolean;
}

type Screen = 'login' | 'onboarding' | 'dashboard' | 'tasks' | 'taskDetails' | 'newTask' | 'weekly' | 'yearly' | 'settings';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Medytacja poranna',
    description: '15 minut medytacji i ćwiczeń oddechowych',
    category: 'private',
    priority: 'high',
    dueDate: '2026-01-04',
    dueTime: '07:00',
    completed: false,
    createdAt: '2026-01-03',
  },
  {
    id: '2',
    title: 'Prezentacja Q4',
    description: 'Przygotować slajdy na spotkanie zarządu',
    category: 'work',
    priority: 'high',
    dueDate: '2026-01-05',
    dueTime: '14:00',
    completed: false,
    assignedUsers: ['Ty', 'Anna K.', 'Piotr M.'],
    createdAt: '2026-01-02',
  },
  {
    id: '3',
    title: 'Zakupy spożywcze',
    description: 'Mleko, chleb, warzywa na obiad',
    category: 'home',
    priority: 'medium',
    dueDate: '2026-01-04',
    dueTime: '18:00',
    completed: false,
    assignedUsers: ['Ty', 'Partner'],
    createdAt: '2026-01-03',
  },
  {
    id: '4',
    title: 'Przeczytać książkę',
    description: 'Rozdział 5-7 z "Atomic Habits"',
    category: 'private',
    priority: 'low',
    dueDate: '2026-01-06',
    dueTime: '20:00',
    completed: true,
    createdAt: '2026-01-02',
  },
  {
    id: '5',
    title: 'Code review - PR #234',
    description: 'Sprawdzić zmiany w module autoryzacji',
    category: 'work',
    priority: 'medium',
    dueDate: '2026-01-04',
    dueTime: '10:30',
    completed: false,
    assignedUsers: ['Ty'],
    createdAt: '2026-01-03',
  },
  {
    id: '6',
    title: 'Naprawić kran w łazience',
    description: 'Wymienić uszczelkę, kupić części w sklepie',
    category: 'home',
    priority: 'high',
    dueDate: '2026-01-05',
    dueTime: '16:00',
    completed: false,
    assignedUsers: ['Ty'],
    createdAt: '2026-01-03',
  },
  {
    id: '7',
    title: 'Trening na siłowni',
    description: 'Dzień klatki piersiowej i tricepsów',
    category: 'private',
    priority: 'medium',
    dueDate: '2026-01-04',
    dueTime: '17:30',
    completed: false,
    createdAt: '2026-01-03',
  },
  {
    id: '8',
    title: 'Spotkanie z klientem',
    description: 'Omówienie wymagań do nowego projektu',
    category: 'work',
    priority: 'high',
    dueDate: '2026-01-07',
    dueTime: '11:00',
    completed: false,
    assignedUsers: ['Ty', 'Marcin D.'],
    createdAt: '2026-01-03',
  },
];

const initialSettings: AppSettings = {
  blockWorkTasksAfterHours: true,
  workHoursEnd: '16:00',
  notifications: true,
  darkMode: false,
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [activeCategory, setActiveCategory] = useState<TaskCategory | 'all'>('all');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      if (onboardingCompleted === 'true') {
        setHasCompletedOnboarding(true);
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('onboarding');
      }
    }
    
    if (savedDarkMode === 'true') {
      setSettings(prev => ({ ...prev, darkMode: true }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', settings.darkMode.toString());
  }, [settings.darkMode]);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    setCurrentScreen('onboarding');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    setCurrentScreen('dashboard');
  };

  const navigateTo = (screen: Screen, task?: Task) => {
    if (screen === 'taskDetails' && task) {
      setSelectedTask(task);
    } else if (screen === 'newTask' && task) {
      setEditingTask(task);
    } else {
      setSelectedTask(null);
      setEditingTask(null);
    }
    setCurrentScreen(screen);
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([...tasks, newTask]);
    setCurrentScreen('tasks');
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setCurrentScreen('tasks');
  };

  const getCategoryColor = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return '#6B7280'; 

    switch (task.category) {
      case 'private': return '#3B82F6';
      case 'work': return '#F59E0B';
      case 'home': return '#10B981';
      default: return '#6B7280';
    }
  };

const toggleTaskComplete = (taskId: string) => {
  const taskElement = document.getElementById(`task-${taskId}`);
  if (taskElement) {
    taskElement.classList.add('task-hide'); 
  }

  setTimeout(() => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  }, 500); 
};

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const shouldHideWorkTasks = () => {
    if (!settings.blockWorkTasksAfterHours) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [endHour, endMinute] = settings.workHoursEnd.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const endTime = endHour * 60 + endMinute;
    
    return currentTime >= endTime;
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
  
    filtered = filtered.filter(t => !t.completed);
  
    if (shouldHideWorkTasks()) {
      filtered = filtered.filter(t => t.category !== 'work');
    }
  
    if (activeCategory !== 'all') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }
  
    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ${settings.darkMode ? 'dark' : ''}`} style={{ height: '812px', maxHeight: '90vh' }}>
        {currentScreen === 'login' && (
          <Login onLogin={handleLogin} darkMode={settings.darkMode} />
        )}
        
        {currentScreen === 'onboarding' && (
          <Onboarding onComplete={completeOnboarding} />
        )}
        
        {currentScreen === 'dashboard' && (
          <Dashboard 
            tasks={tasks}
            hideWorkTasks={shouldHideWorkTasks()}
            onNavigate={navigateTo}
            onCategorySelect={setActiveCategory}
          />
        )}
        
        {currentScreen === 'tasks' && (
          <TaskList 
            tasks={getFilteredTasks()}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onTaskClick={(task) => navigateTo('taskDetails', task)}
            onToggleComplete={toggleTaskComplete}
            onNavigate={navigateTo}
          />
        )}
        
        {currentScreen === 'taskDetails' && selectedTask && (
          <TaskDetails 
            task={selectedTask}
            onBack={() => navigateTo('tasks')}
            onEdit={(task) => navigateTo('newTask', task)}
            onDelete={deleteTask}
            onToggleComplete={toggleTaskComplete}
          />
        )}
        
        {currentScreen === 'newTask' && (
          <NewTask 
            onBack={() => navigateTo('tasks')}
            onSave={addTask}
            editingTask={editingTask}
            onUpdate={updateTask}
          />
        )}
        
        {currentScreen === 'weekly' && (
          <WeeklyWidget 
            tasks={tasks}
            hideWorkTasks={shouldHideWorkTasks()}
            onNavigate={navigateTo}
          />
        )}
        
        {currentScreen === 'yearly' && (
          <YearlyView 
            tasks={tasks}
            hideWorkTasks={shouldHideWorkTasks()}
            onNavigate={navigateTo}
          />
        )}
        
        {currentScreen === 'settings' && (
          <Settings 
            settings={settings}
            onUpdateSettings={updateSettings}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        )}
        
        {hasCompletedOnboarding && currentScreen !== 'onboarding' && currentScreen !== 'login' && (
          <Navigation 
            currentScreen={currentScreen}
            onNavigate={navigateTo}
          />
        )}
      </div>
    </div>
  );
}