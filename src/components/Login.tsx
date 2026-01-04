import React, { useState } from 'react';
import {LogIn, Mail, Lock, CheckCircle2, Briefcase, Home, User, } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  darkMode: boolean;
}

const categories = [
  { icon: User, color: '#3B82F6', label: 'Private' },
  { icon: Briefcase, color: '#F59E0B', label: 'Work' },
  { icon: Home, color: '#10B981', label: 'Home' },
] as const;

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string): boolean => {
  const minLength = password.length >= 8;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  return (
    minLength &&
    hasLowerCase &&
    hasUpperCase &&
    hasNumber &&
    hasSpecialChar
  );
};

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Podaj poprawny adres email.');
      return;
    }

    if (!isValidPassword(password)) {
      setError(
        'Hasło musi mieć min. 8 znaków oraz zawierać małą i dużą literę, cyfrę i znak specjalny.'
      );
      return;
    }

    try {
      setIsLoading(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      onLogin();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      <div className="relative overflow-hidden px-8 pt-16 pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 blur-3xl opacity-20" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-br from-amber-500 to-red-500 blur-3xl opacity-20" />
        </div>

        <div className="relative z-10 text-center">
          <div className="flex justify-center gap-3 mb-6">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <div
                  key={index}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <Icon size={24} style={{ color: cat.color }} strokeWidth={2} />
                </div>
              );
            })}
          </div>

          <h1 className="text-gray-900 dark:text-white mb-2">
            Work-Private TODO
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Zorganizuj swoje życie w jednym miejscu
          </p>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Hasło
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Min. 8 znaków, duża i mała litera, cyfra, znak specjalny
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90 disabled:opacity-50 mt-8"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logowanie...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Zaloguj się</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 space-y-4">
          {[
            { text: 'Zarządzaj zadaniami prywatnymi, służbowymi i domowymi', color: '#3B82F6' },
            { text: 'Automatyczne ukrywanie pracy po godzinach', color: '#F59E0B' },
            { text: 'Współdziel zadania z rodziną i zespołem', color: '#10B981' },
                   
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <CheckCircle2
                  size={14}
                  style={{ color: feature.color }}
                  strokeWidth={2.5}
                />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

     
      