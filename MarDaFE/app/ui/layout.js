"use client";
import Head from "next/head";
import Sidebar from "../ui/components/Sidebar";
import Header from "../ui/components/Header";
import IdleTimer from "./components/common/IdleTimer";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  // Keep localStorage user_token and token synchronized with NextAuth session.
  // This guarantees that direct page visits, page reloads (F5), or cross-tab navigation
  // on remote/public IP deployments never result in missing Bearer tokens for legacy services.
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
    }
  }, [status, session]);

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
