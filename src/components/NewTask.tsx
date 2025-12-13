import React, { useState } from 'react';
import { ArrowLeft, User, Briefcase, Home, Flag, Calendar, Users, X } from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '../App';

interface NewTaskProps {
  onBack: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  editingTask?: Task | null;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function NewTask({ onBack, onSave, editingTask, onUpdate }: NewTaskProps) {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [category, setCategory] = useState<TaskCategory>(editingTask?.category || 'private');
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || new Date().toISOString().split('T')[0]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>(editingTask?.assignedUsers || []);
  const [newUserName, setNewUserName] = useState('');
  const [showUserInput, setShowUserInput] = useState(false);

  const categories = [
    { id: 'private', name: 'Private', icon: User, color: '#3B82F6', bgColor: '#EFF6FF', darkBg: '#1E40AF', darkText: '#BFDBFE' },
    { id: 'work', name: 'Work', icon: Briefcase, color: '#F59E0B', bgColor: '#FEF3C7', darkBg: '#78350F', darkText: '#FCD34D' },
    { id: 'home', name: 'Home', icon: Home, color: '#10B981', bgColor: '#D1FAE5', darkBg: '#064E3B', darkText: '#6EE7B7' },
  ];

  const priorities = [
    { id: 'low', name: 'Niski', color: '#10B981', bgColor: '#D1FAE5', darkBg: '#064E3B', darkText: '#6EE7B7' },
    { id: 'medium', name: 'Średni', color: '#F59E0B', bgColor: '#FEF3C7', darkBg: '#78350F', darkText: '#FCD34D' },
    { id: 'high', name: 'Wysoki', color: '#EF4444', bgColor: '#FEE2E2', darkBg: '#7F1D1D', darkText: '#FCA5A5' },
  ];

  const handleSave = () => {
    if (!title.trim()) {
      alert('Podaj tytuł zadania');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      completed: editingTask?.completed || false,
      assignedUsers: assignedUsers.length > 0 ? assignedUsers : undefined,
    };

    if (editingTask && onUpdate) {
      onUpdate(editingTask.id, taskData);
      onBack();
    } else {
      onSave(taskData);
    }
  };

  const addUser = () => {
    if (newUserName.trim() && !assignedUsers.includes(newUserName.trim())) {
      setAssignedUsers([...assignedUsers, newUserName.trim()]);
      setNewUserName('');
      setShowUserInput(false);
    }
  };

  const removeUser = (userName: string) => {
    setAssignedUsers(assignedUsers.filter(u => u !== userName));
  };

  const selectedCategory = categories.find(c => c.id === category)!;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div 
        className="p-6"
        style={{ backgroundColor: selectedCategory.bgColor }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: selectedCategory.color }}
          >
            {editingTask ? 'Zapisz' : 'Dodaj zadanie'}
          </button>
        </div>

        <h1 className="text-gray-900 dark:text-gray-100">
          {editingTask ? 'Edytuj zadanie' : 'Nowe zadanie'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Tytuł
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Dokończyć prezentację"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Opis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodaj szczegóły zadania..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none dark:text-gray-100"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
              <Flag size={20} />
              <span>Kategoria</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id as TaskCategory)}
                    className="p-4 rounded-xl transition-all"
                    style={{
                      backgroundColor: isSelected ? cat.color : cat.bgColor,
                      color: isSelected ? 'white' : cat.color,
                      border: isSelected ? 'none' : `2px solid ${cat.color}20`,
                    }}
                  >
                    <Icon size={24} className="mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-sm">{cat.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
              <Flag size={20} />
              <span>Priorytet</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {priorities.map(pri => {
                const isSelected = priority === pri.id;

                return (
                  <button
                    key={pri.id}
                    onClick={() => setPriority(pri.id as TaskPriority)}
                    className="px-4 py-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: isSelected ? pri.color : pri.bgColor,
                      color: isSelected ? 'white' : pri.color,
                      border: isSelected ? 'none' : `2px solid ${pri.color}20`,
                    }}
                  >
                    <p className="text-sm">{pri.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
              <Calendar size={20} />
              <span>Termin</span>
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-gray-100"
            />
          </div>

          {(category === 'work' || category === 'home') && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
                <Users size={20} />
                <span>Przypisani użytkownicy</span>
              </div>

              <div className="space-y-2 mb-3">
                {assignedUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        {user.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-900 dark:text-gray-100">{user}</span>
                    </div>
                    <button
                      onClick={() => removeUser(user)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {showUserInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addUser()}
                    placeholder="Imię użytkownika"
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-gray-100"
                    autoFocus
                  />
                  <button
                    onClick={addUser}
                    className="px-6 py-3 rounded-xl text-white shadow-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: selectedCategory.color }}
                  >
                    Dodaj
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowUserInput(true)}
                  className="w-full py-3 border-2 border-dashed rounded-xl text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  style={{ borderColor: selectedCategory.color + '40' }}
                >
                  + Dodaj osobę
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
