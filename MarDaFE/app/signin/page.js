"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      // Check if token is expired
      if (session?.isTokenExpierd === 1) {
        // Token expired, redirect to signin to refresh
        router.replace('/signin');
        return;
      }

      const raw = session?.user?.roles || session?.roles || [];
      const roles = Array.isArray(raw) ? raw : [];

      if (roles.includes('ROLE_ADMIN')) {
        router.replace('/ui/admin');
        return;
      }
      if (roles.includes('billzgjt')) {
        router.replace('/ui/manager');
        return;
      }
      if (roles.includes('ROLE_USER')) {
        router.replace('/ui/user');
        return;
      }
      if (roles.includes('ROLE_CASHIER')) {
        router.replace('/ui/cashier/cashier');
        return;
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Username and password are required');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else if (result?.ok) {
        // Redirect will be handled by useEffect after session updates
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md w-full rounded-md border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-8 text-center shadow-default">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (status === 'authenticated') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md w-full rounded-md border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-8 text-center shadow-default">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md w-full rounded-md border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-8 shadow-default">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-white mb-2">Sign In</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter your credentials to access the water billing system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-black dark:text-white mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter your username"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-3 px-4 text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Contact your administrator if you need help with your account
          </p>
        </div>
      </div>
    </div>
  );
}
