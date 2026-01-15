import React, { useState } from 'react';
import { LogIn, Mail, Lock, CheckCircle2, Briefcase, Home, User, UserPlus } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';

interface LoginProps {
  onLogin: (accessToken: string, userEmail: string) => void;
  darkMode: boolean;
}

export function Login({ onLogin, darkMode }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*$/;

  const validateCredentials = () => {
    if (!isSignup) return true;

    if (!emailRegex.test(email)) {
      setError('Nieprawidłowy adres email');
      return false;
    }
    if (!passwordRegex.test(password)) {
      setError('Hasło musi mieć min. 8 znaków i zawierać wielką literę, małą literę, cyfrę i znak specjalny.');
      return false;
    }
    if (!name.trim()) {
      setError('Podaj imię');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCredentials()) return;

    setIsLoading(true);

    try {
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-90b519e8/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      
      console.log('Signup response:', {
        ok: response.ok,
        status: response.status,
        data
      });

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }


      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (signInData.session) {
        onLogin(signInData.session.access_token, email);
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas rejestracji');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCredentials()) return;

    setIsLoading(true);

    try { 
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user,
        error: signInError?.message 
      });

      if (signInError) {
        console.error('Login error details:', {
          message: signInError.message,
          status: signInError.status,
          code: (signInError as any).code
        });
        throw signInError;
      }

      if (data.session) {
        onLogin(data.session.access_token, email);
      } else {
        throw new Error('No session returned from login');
      }
    } catch (err: any) {
      console.error('Signin error:', err);
      setError(err.message || 'Błąd podczas logowania');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isSignup) {
      handleSignup(e);
    } else {
      handleSignin(e);
    }
  };

  const categories = [
    { icon: User, color: '#3B82F6', label: 'Private' },
    { icon: Briefcase, color: '#F59E0B', label: 'Work' },
    { icon: Home, color: '#10B981', label: 'Home' },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      <div className="relative overflow-hidden px-8 pt-16 pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ 
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              top: '-80px',
              right: '-80px'
            }}
          />
          <div 
            className="absolute w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ 
              background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              bottom: '-40px',
              left: '-40px'
            }}
          />
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
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
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
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Imię
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Twoje imię"
                className="w-full pl-4 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
          )}

          <div className="text-right">
            <button
              type="button"
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              Zapomniałeś hasła?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 disabled:opacity-50 mt-8"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
            }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isSignup ? 'Rejestracja...' : 'Logowanie...'}</span>
              </>
            ) : (
              <>
                {isSignup ? <UserPlus size={20} /> : <LogIn size={20} />}
                <span>{isSignup ? 'Zarejestruj się' : 'Zaloguj się'}</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {isSignup ? 'Masz już konto?' : 'Nie masz konta?'}{' '}
            <button 
              className="text-blue-500 dark:text-blue-400 hover:underline" 
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
            >
              {isSignup ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          </p>
        </div>

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
                <CheckCircle2 size={14} style={{ color: feature.color }} strokeWidth={2.5} />
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