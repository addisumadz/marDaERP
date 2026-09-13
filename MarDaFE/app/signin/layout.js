"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loader from "../ui/components/common/Loader";
import Box from "@mui/material/Box";

const LoginPage = () => {
  const [companyInfo, setCompanyInfo] = useState({ companyName: "", companyNameAmh: "" });
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { data: session, status } = useSession();

  const isButtonDisabled = !username || !password || isSubmitting;

  useEffect(() => {
    const loadDelay = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Fetch Company Info
    const fetchCompanyInfo = async () => {
      try {
        const res = await fetch("/backend/api/card_managenment/company-profile/latest");
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo({
            companyName: data.companyName,
            companyNameAmh: data.companyNameAmh
          });
        }
      } catch (error) {
        console.error("Failed to fetch company info", error);
      }
    };
    fetchCompanyInfo();

    return () => clearTimeout(loadDelay);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (typeof window !== "undefined") {
        localStorage.setItem("user_token", JSON.stringify(session));
      }
      const roles = session?.user?.roles || session?.roles || [];
      const normalized = Array.isArray(roles)
        ? roles.map((r) =>
          String(r || "").replace(/^ROLE_/i, "").toLowerCase()
        )
        : [];

      if (roles.includes("ROLE_ADMIN")) {
        router.push("/ui/admin");
      } else if (roles.length > 0) {
        // Any authenticated user with roles goes to manager dashboard
        router.push("/ui/manager");
      } else {
        router.push("/unauthorized");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (username || password) {
      setErrorMessage("");
    }
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error === "fetch failed") {
      setErrorMessage("Please Check the Server");
    } else if (result?.error) {
      setErrorMessage(result.error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const getErrorBackgroundColor = (message) => {
    switch (message) {
      case "Please Check the Server":
        return "error.main";
      case "Invalid credentials":
        return "warning.main";
      default:
        return "error.main";
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[450px]">

        {/* LEFT SIDE: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center relative bg-white">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                id="username"
                type="text"
                placeholder="Enter your Username"
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                />
                <span
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </span>
              </div>
            </div>

            {errorMessage && (
              <Box
                sx={{
                  backgroundColor: getErrorBackgroundColor(errorMessage),
                  color: "white",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  textAlign: "center",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}
              >
                {errorMessage}
              </Box>
            )}

            <button
              type="submit"
              className={`w-full py-3 bg-[#0047AB] hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 shadow-md transform active:scale-95 text-base ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isButtonDisabled}
            >
              {isSubmitting ? "Signing In..." : "Login"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: Branding & Company Info - Split Design */}
        <div className="w-full md:w-1/2 flex flex-col">

          {/* Top Half: White Background with Logo */}
          <div className="h-2/5 w-full bg-white flex items-center justify-center p-0 relative">
            <div className="animate-fade-in-up">
              {/* Logo without filter - user will provide transparent logo */}
              <Image
                src="/logo.png"
                alt="Marda WBMS Logo"
                width={210}
                height={210}
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Bottom Half: Blue Background with Text */}
          <div className="h-3/5 w-full bg-[#0047AB] flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
            {/* Decorative Background Circles */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400 rounded-full opacity-20 filter blur-3xl"></div>
            <div className="absolute top-0 -left-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 filter blur-3xl"></div>

            <div className="text-center space-y-4 max-w-sm z-10">


              {/* Company Names from Backend */}
              <div className="mt-6 space-y-2">
                {companyInfo.companyNameAmh ? (
                  <h2 className="text-2xl font-bold font-amharic leading-snug">
                    {companyInfo.companyNameAmh}
                  </h2>
                ) : (
                  <div className="h-8 w-48 bg-blue-600/50 rounded animate-pulse mx-auto"></div>
                )}

                {companyInfo.companyName ? (
                  <h3 className="text-lg font-medium opacity-90">
                    {companyInfo.companyName}
                  </h3>
                ) : (
                  <div className="h-6 w-32 bg-blue-600/50 rounded animate-pulse mx-auto mt-1"></div>
                )}
              </div>
            </div>

            <div className="text-blue-200 text-xs mt-auto pt-6 z-10 flex items-center justify-center gap-3">
              <span>&copy; {new Date().getFullYear()} All Rights Reserved</span>
              <span className="px-2 py-0.5 bg-blue-500/40 rounded-full text-[10px] font-semibold tracking-wider text-blue-100 border border-blue-400/30">
                V 4.0.0
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default LoginPage;
