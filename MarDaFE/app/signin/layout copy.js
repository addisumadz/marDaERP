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
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { data: session, status } = useSession();

  const isButtonDisabled = !username || !password || isSubmitting; // Derived state

  useEffect(() => {
    // Delay loading to simulate a loading state
    const loadDelay = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(loadDelay);
  }, []);
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (typeof window !== "undefined") {
        localStorage.setItem("user_token", JSON.stringify(session));
      }
      const allowedAdminRoles = ["ROLE_ADMIN"];

      const firstRole = session?.roles?.[0];

      if (firstRole === "ROLE_ADMIN") {
        router.push("/ui/admin");
      } else if (firstRole === "ROLE_MANAGER") {
        router.push("/ui/manager");
      } else if (firstRole === "ROLE_USER") {
        router.push("/ui/user");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (username || password) {
      setErrorMessage("");
    }
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
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
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("user_token", JSON.stringify(result.session));
      }
      router.push("/ui/user");
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Map error messages to background colors
  const getErrorBackgroundColor = (message) => {
    switch (message) {
      case "Please Check the Server":
        return "error.main"; // Example for server-related errors
      case "Invalid credentials":
        return "warning.main"; // Example for authentication errors
      default:
        return "error.main"; // Default color
    }
  };

  return (
    <main className="flex justify-center pt-10">
      <div className="w-3/5 grid justify-items-center">
        <div className="text-center mb-6">
          <Link className="inline-block" href="/">
            <Image
              src="/images/logo/CodeX_wBill.png" // Update this path to your logo
              alt="Logo"
              width={100}
              height={5}
            />
          </Link>
        </div>

        <div className="text-center mb-4">
          <h1>የባሕር ዳር ከተማ አስተዳደር ኅብረት ስራ ማህበራት ማስፋፊያ ጽ/ቤት</h1>
        </div>

        <div className="w-4/5">
          <form onSubmit={handleSubmit} className="w-full p-4">
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Username
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  id="username"
                  type="text"
                  required
                  onChange={(e) => setUsername(e.target.value)} // Update state
                  placeholder="Enter your Username"
                />
                <span className="absolute right-4 top-4">
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M19.2516 3.90005H2.75156C1.58281 3.90005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.90005 19.2516 3.90005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                        fill=""
                      />
                    </g>
                  </svg>
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={(e) => setPassword(e.target.value)} // Update state
                  placeholder="Password"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <span
                  className="absolute right-4 top-4 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.18438 16.1547 6.80626ZM12.8422 8.71251L11.7319 9.89526L10.6884 9.00551L12.8422 6.80451C14.0094 8.22051 13.4934 10.9032 11.8934 12.1788L10.7566 13.0925L11.9575 14.3988L13.5175 12.8425C15.5166 10.8469 15.6475 7.59626 13.7319 5.50451L12.8422 8.71251ZM15.0134 7.85938L11.9575 11.1853L10.0822 9.72626L12.2069 6.78313C12.9344 7.4275 13.6469 8.08626 14.3781 8.73188L16.3469 10.0744C17.6684 8.69188 18.0969 6.59188 17.7619 4.74938C16.9422 4.14526 16.4394 3.42313 15.7481 2.91938L14.7684 3.54251L12.2069 6.78313L11.9575 6.42051L12.9422 6.09188L15.0134 7.85938Z"
                        fill=""
                      />
                    </g>
                  </svg>
                </span>
              </div>
            </div>

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

            <button
              type="submit"
              className={`inline-flex items-center justify-center rounded-lg bg-primary py-4 px-8 text-base font-medium text-white transition hover:bg-opacity-90 w-full ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
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
