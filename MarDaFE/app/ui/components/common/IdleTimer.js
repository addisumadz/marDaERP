"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, ShieldAlert, LogOut } from "lucide-react";

// Inactivity timeout: 15 minutes total
// Warning modal appears during the final 60 seconds
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_DURATION_SEC = 60;

export default function IdleTimer() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_DURATION_SEC);

  const lastActivityRef = useRef(Date.now());
  const timerCheckRef = useRef(null);

  const performLogout = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_token");
        sessionStorage.clear();
      }
      // Call backend signout for audit logging
      try {
        await fetch("/backend/api/auth/signout", { method: "POST" });
      } catch (_) {}

      await signOut({ redirect: false });
      router.replace("/signin?reason=inactivity");
    } catch (e) {
      router.replace("/signin");
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(WARNING_DURATION_SEC);
    }
  }, [showWarning]);

  // Listen for user activity
  useEffect(() => {
    if (status !== "authenticated") return;

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "wheel",
    ];

    const handleUserActivity = () => {
      // If modal is not active, touch activity updates timestamp
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [status, showWarning]);

  // Heartbeat interval to check idle status and token expiry
  useEffect(() => {
    if (status !== "authenticated") return;

    timerCheckRef.current = setInterval(() => {
      // 1. Check if backend token has expired
      if (session?.isTokenExpired === 1 || session?.isTokenExpierd === 1) {
        performLogout();
        return;
      }

      // 2. Check idle elapsed time
      const elapsed = Date.now() - lastActivityRef.current;
      const warningThreshold = IDLE_TIMEOUT_MS - WARNING_DURATION_SEC * 1000;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        performLogout();
      } else if (elapsed >= warningThreshold) {
        const remaining = Math.max(
          1,
          Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000)
        );
        setShowWarning(true);
        setSecondsRemaining(remaining);
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      if (timerCheckRef.current) {
        clearInterval(timerCheckRef.current);
      }
    };
  }, [status, session, showWarning, performLogout]);

  if (!showWarning || status !== "authenticated") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-stroke dark:border-strokedark p-6 text-center transform animate-scale-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
          <ShieldAlert size={36} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Session Inactivity Warning
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Your workstation has been idle. For security reasons, you will be
          automatically signed out in:
        </p>

        {/* Countdown Badge */}
        <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-mono text-2xl font-bold mb-6">
          <Clock size={24} className="animate-pulse" />
          <span>{secondsRemaining}s</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={resetTimer}
            className="flex-1 rounded-lg bg-primary py-3 px-4 font-semibold text-white transition hover:bg-opacity-90 shadow-md"
          >
            I'm Still Working
          </button>
          <button
            type="button"
            onClick={performLogout}
            className="flex items-center justify-center gap-2 rounded-lg border border-stroke dark:border-strokedark py-3 px-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-meta-4 transition"
          >
            <LogOut size={18} />
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
