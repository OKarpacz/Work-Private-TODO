import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TaskDetails } from './components/TaskDetails';
import { NewTask } from './components/NewTask';
import { WeeklyWidget } from './components/WeeklyWidget';
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

type Screen = 'login' | 'onboarding' | 'dashboard' | 'tasks' | 'taskDetails' | 'newTask' | 'weekly' | 'settings';

const API_URL = 'http://localhost:5000/api/tasks';

const initialSettings: AppSettings = {
  blockWorkTasksAfterHours: true,
  workHoursEnd: '16:00',
  notifications: true,
  darkMode: false,
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [tasks, setTasks] = useState<Task[]>([]);
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

    fetchTasks();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', settings.darkMode.toString());
  }, [settings.darkMode]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

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

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setCurrentScreen('tasks');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
        if (selectedTask?.id === taskId) {
          setSelectedTask(updatedTask);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
        setCurrentScreen('tasks');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
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