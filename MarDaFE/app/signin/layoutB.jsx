"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "../ui/components/common/Loader";
import Box from "@mui/material/Box";
import jwtDecode from "jwt-decode";

const LoginPage = () => {
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { data: session, status, update } = useSession();

  const isButtonDisabled = !username || !password || isSubmitting;

  useEffect(() => {
    const loadDelay = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(loadDelay);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/ui/user");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (username || password) {
      setErrorMessage("");
    }
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (typeof result.error === "string") {
          setErrorMessage(
            result.error === "fetch failed"
              ? "Please Check the Server"
              : result.error
          );
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
      } else {
        router.replace("/ui/user");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  const handleRefreshToken = async () => {
    try {
      const result = await update();
      if (result?.error) {
        setErrorMessage("Failed to refresh session. Please log in again.");
      }
    } catch (error) {
      setErrorMessage("Error refreshing session.");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      if (isTokenExpired(session.accessToken)) {
        handleRefreshToken();
      }
    }
  }, [status, session]);

  if (loading || status === "loading") {
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
    <main className="flex justify-center pt-10">
      <div className="w-3/5 grid justify-items-center">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <Image
              src="/images/logo/CodeX_wBill.png"
              alt="Logo"
              width={100}
              height={5}
            />
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1>የባሕር ዳር ከተማ አስተዳደር ኅብረት ስራ ማህበራት ማስፋፊያ ጽ/ቤት</h1>
        </div>

        {/* Form */}
        <div className="w-4/5">
          <form onSubmit={handleSubmit} className="w-full p-4">
            {/* Username */}
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Username
              </label>
              <input
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Username"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <span
                  className="absolute right-4 top-4 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <Box
                sx={{
                  backgroundColor: getErrorBackgroundColor(errorMessage),
                  color: "white",
                  padding: "1rem",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                {errorMessage}
              </Box>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`inline-flex items-center justify-center rounded-lg bg-primary py-4 px-8 text-base font-medium text-white transition hover:bg-opacity-90 w-full ${
                isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isButtonDisabled}
            >
              {isSubmitting ? "እባክዎ ትንሽ ይጠብቁ..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
