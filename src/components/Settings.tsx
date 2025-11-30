import React from 'react';
import { ArrowLeft, Clock, Bell, Shield, Moon, Smartphone } from 'lucide-react';
import { AppSettings } from '../App';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onNavigate: (screen: any) => void;
}

export function Settings({ settings, onUpdateSettings, onNavigate }: SettingsProps) {
  const timeOptions = [
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white">Ustawienia</h1>
        </div>
        <p className="text-purple-100">
          Personalizuj aplikację według swoich potrzeb
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-4">Work-Life Balance</h2>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Clock size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-900 dark:text-gray-100">Blokada zadań służbowych</span>
                    <button
                      onClick={() => onUpdateSettings({ 
                        blockWorkTasksAfterHours: !settings.blockWorkTasksAfterHours 
                      })}
                      className="relative w-12 h-6 rounded-full transition-colors"
                      style={{
                        backgroundColor: settings.blockWorkTasksAfterHours ? '#8B5CF6' : '#D1D5DB',
                      }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
                        style={{
                          transform: settings.blockWorkTasksAfterHours 
                            ? 'translateX(26px)' 
                            : 'translateX(4px)',
                        }}
                      />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Automatycznie ukryj zadania służbowe po godzinach pracy
                  </p>
                </div>
              </div>

              {settings.blockWorkTasksAfterHours && (
                <div className="pt-4 border-t border-purple-200 dark:border-purple-700">
                  <label className="block text-gray-700 dark:text-gray-300 mb-3">
                    Koniec dnia pracy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map(time => (
                      <button
                        key={time}
                        onClick={() => onUpdateSettings({ workHoursEnd: time })}
                        className="px-3 py-2 rounded-xl transition-all text-sm"
                        style={{
                          backgroundColor: settings.workHoursEnd === time 
                            ? '#8B5CF6' 
                            : 'transparent',
                          color: settings.workHoursEnd === time 
                            ? 'white' 
                            : '#6B7280',
                          border: `1px solid ${settings.workHoursEnd === time ? '#8B5CF6' : '#E5E7EB'}`,
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-4">Ustawienia wyświetlania</h2>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">Tryb ciemny</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Ciemny motyw dla oczu</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ 
                      darkMode: !settings.darkMode 
                    })}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: settings.darkMode ? '#6366F1' : '#D1D5DB',
                    }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
                      style={{
                        transform: settings.darkMode 
                          ? 'translateX(26px)' 
                          : 'translateX(4px)',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-4">Powiadomienia</h2>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <Bell size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">Powiadomienia push</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Otrzymuj przypomnienia o zadaniach</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ 
                      notifications: !settings.notifications 
                    })}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: settings.notifications ? '#3B82F6' : '#D1D5DB',
                    }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
                      style={{
                        transform: settings.notifications 
                          ? 'translateX(26px)' 
                          : 'translateX(4px)',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-4">Informacje</h2>
            
            <div className="space-y-3">
              <button className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                    <Shield size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">Prywatność i bezpieczeństwo</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Zarządzaj swoimi danymi</p>
                  </div>
                </div>
              </button>

              <button className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-600 flex items-center justify-center">
                    <Smartphone size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">O aplikacji</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Work-Private TODO v1.0.0</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Dbaj o równowagę między pracą a życiem prywatnym 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
