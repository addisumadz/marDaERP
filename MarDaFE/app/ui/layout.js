"use client";
import Head from "next/head";
import Sidebar from "../ui/components/Sidebar";
import Header from "../ui/components/Header";
import IdleTimer from "./components/common/IdleTimer";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Keep localStorage user_token and token synchronized with NextAuth session.
  // Synchronously ensure localStorage is ready as soon as authenticated session is available.
  if (typeof window !== "undefined" && status === "authenticated" && session) {
    try {
      const directToken = session?.accessToken || session?.token || session?.access_token;
      if (directToken) {
        const currentToken = localStorage.getItem("token");
        if (currentToken !== String(directToken)) {
          localStorage.setItem("user_token", JSON.stringify(session));
          localStorage.setItem("token", String(directToken));
          if (session?.refreshToken) {
            localStorage.setItem("refreshToken", String(session.refreshToken));
          }
        }
      }
    } catch (_) {}
  }

  // Backup effect to guarantee sync across status/session updates
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (typeof window !== "undefined") {
        try {
          const directToken = session?.accessToken || session?.token || session?.access_token;
          if (directToken) {
            localStorage.setItem("user_token", JSON.stringify(session));
            localStorage.setItem("token", String(directToken));
            if (session?.refreshToken) {
              localStorage.setItem("refreshToken", String(session.refreshToken));
            }
          }
        } catch (_) {}
      }
    } else if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, session, router]);

  // Prevent child page components and queries from firing before session credentials are ready
  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-boxdark-2">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <IdleTimer />
      {/* <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
      </Head> */}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Start */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Sidebar End */}

        {/* Content Area Start */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header Start */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* Header End */}

          {/* Main Content Start */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* Main Content End */}
        </div>
        {/* Content Area End */}
      </div>
    </div>
  );
}
