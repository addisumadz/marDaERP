"use client";
import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import { useEffect, useRef, useState } from "react";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Header = (props) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "unauthenticated") {
    return null; // Prevent rendering the rest of the component until authentication
  }

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle Button */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            {/* Button Content (e.g., icon) */}
          </button>
          {/* Logo */}
          <Link className="block flex-shrink-0 lg:hidden" href="/">
            <Image
              width={32}
              height={32}
              src="/images/logo/logo-icon.svg"
              alt="Logo"
            />
          </Link>
        </div>
        <span className="block text-lg text-black dark:text-white">
          <p>Marda WBMS</p>
        </span>
        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* User Area */}
          {/* <LanguageSwitcher /> */}
          <DropdownUser />
          {/* <DropdownMessage /> */}
          {/* <DropdownNotification /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
