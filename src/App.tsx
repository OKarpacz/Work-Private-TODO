import React, { useState, useEffect } from 'react';
import { projectId } from './utils/supabase/info';
import { getSupabaseClient } from './utils/supabase/client';
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
  userId?: string;
  sharedWith?: string[];
}

export interface AppSettings {
  blockWorkTasksAfterHours: boolean;
  workHoursStart: string;
  workHoursEnd: string;
  notifications: boolean;
  darkMode: boolean;
}

type Screen = 'login' | 'onboarding' | 'dashboard' | 'tasks' | 'taskDetails' | 'newTask' | 'weekly' | 'yearly' | 'settings';

const initialSettings: AppSettings = {
  blockWorkTasksAfterHours: true,
  workHoursStart: '08:00',
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
  const [accessToken, setAccessToken] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const supabase = getSupabaseClient();

  // Fetch tasks from backend
  const fetchTasks = async (token: string) => {
    setIsLoadingTasks(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90b519e8/tasks`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to fetch tasks');
        console.error('Status:', response.status);
        console.error('Response data:', data);
        throw new Error(data.error || data.message || 'Failed to fetch tasks');
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getSupabaseClient().auth.getSession();
      
      if (data.session) {
        const token = data.session.access_token;
        const email = data.session.user.email || '';
        
        
        setAccessToken(token);
        setUserEmail(email);
        setIsLoggedIn(true);
        
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        if (onboardingCompleted === 'true') {
          setHasCompletedOnboarding(true);
          setCurrentScreen('dashboard');
          await fetchTasks(token);
        } else {
          setCurrentScreen('onboarding');
        }
      }
    };

    checkSession();

    // Load settings from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedBlockWorkTasks = localStorage.getItem('blockWorkTasksAfterHours');
    const savedWorkHoursStart = localStorage.getItem('workHoursStart');
    const savedWorkHoursEnd = localStorage.getItem('workHoursEnd');
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedDarkMode === 'true') {
      setSettings(prev => ({ ...prev, darkMode: true }));
    }
    if (savedBlockWorkTasks !== null) {
      setSettings(prev => ({ ...prev, blockWorkTasksAfterHours: savedBlockWorkTasks === 'true' }));
    }
    if (savedWorkHoursStart) {
      setSettings(prev => ({ ...prev, workHoursStart: savedWorkHoursStart }));
    }
    if (savedWorkHoursEnd) {
      setSettings(prev => ({ ...prev, workHoursEnd: savedWorkHoursEnd }));
    }
    if (savedNotifications !== null) {
      setSettings(prev => ({ ...prev, notifications: savedNotifications === 'true' }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', settings.darkMode.toString());
    localStorage.setItem('blockWorkTasksAfterHours', settings.blockWorkTasksAfterHours.toString());
    localStorage.setItem('workHoursStart', settings.workHoursStart);
    localStorage.setItem('workHoursEnd', settings.workHoursEnd);
    localStorage.setItem('notifications', settings.notifications.toString());
  }, [settings]);

  const handleLogin = async (token: string, email: string) => {
    setAccessToken(token);
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentScreen('onboarding');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('onboardingCompleted');
    setAccessToken('');
    setUserEmail('');
    setIsLoggedIn(false);
    setTasks([]);
    setCurrentScreen('login');
  };

  const completeOnboarding = async () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    setCurrentScreen('dashboard');
    await fetchTasks(accessToken);
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90b519e8/tasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to create task:', response.status, data);
        throw new Error(data.error || 'Failed to create task');
      }

      setTasks([...tasks, data.task]);
      setCurrentScreen('tasks');
    } catch (error: any) {
      console.error('Error creating task:', error);
      alert(`Nie udało się utworzyć zadania: ${error.message}`);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90b519e8/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to update task:', response.status, data);
        throw new Error(data.error || 'Failed to update task');
      }

      setTasks(tasks.map(t => t.id === taskId ? data.task : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask(data.task);
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      alert(`Nie udało się zaktualizować zadania: ${error.message}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90b519e8/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to delete task:', response.status, data);
        throw new Error(data.error || 'Failed to delete task');
      }

      setTasks(tasks.filter(t => t.id !== taskId));
      setCurrentScreen('tasks');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      alert(`Nie udało się usunąć zadania: ${error.message}`);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { completed: !task.completed });
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const shouldHideWorkTasks = () => {
    if (!settings.blockWorkTasksAfterHours) {
      console.log('🔓 Work tasks blocking DISABLED');
      return false;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [startHour, startMinute] = settings.workHoursStart.split(':').map(Number);
    const [endHour, endMinute] = settings.workHoursEnd.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    const shouldHide = currentTime < startTime || currentTime >= endTime;
    
    
    return shouldHide;
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