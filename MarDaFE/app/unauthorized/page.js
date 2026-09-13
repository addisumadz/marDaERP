"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignInClick = async (e) => {
    e.preventDefault();
    try {
      // Clear any locally stored tokens or session caches
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_token');
        sessionStorage.clear();
      }
    } catch (_) {}
    // NextAuth signOut to clear server/session cookies, then redirect to /signin
    await signOut({ redirect: true, callbackUrl: '/signin' });
    // Fallback client redirect (in case signOut doesn't redirect due to config)
    router.replace('/signin');
  };

  const handleGoHomeClick = async (e) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_token');
        sessionStorage.clear();
      }
    } catch (_) {}
    await signOut({ redirect: true, callbackUrl: '/' });
    router.replace('/');
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md w-full rounded-md border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-8 text-center shadow-default">
        <h1 className="mb-3 text-2xl font-semibold text-black dark:text-white">Unauthorized</h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          You don’t have permission to access this page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleGoHomeClick}
            className="inline-flex items-center rounded bg-primary px-4 py-2 text-white hover:opacity-90"
          >
            Go Home
          </button>
          <button
            onClick={handleSignInClick}
            className="inline-flex items-center rounded border border-primary px-4 py-2 text-primary hover:bg-primary/10"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
