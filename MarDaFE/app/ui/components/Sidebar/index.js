"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import SidebarItem from "./SidebarItem";
import { menuGroups } from "./sidebarConfig";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import {
  getNewLineRoleActionCount,
  getMaintenanceRoleActionCount,
} from "../../../lib/workflowRoleActionHelper";
import { getUserRoles } from "../../manager/custom_newLineConnection/customNewLineUserRoles";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const trigger = useRef(null);
  const sidebar = useRef(null);

  let storedSidebarExpanded = "true";
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  const [userRoles, setUserRoles] = useState([]);
  const [permittedPages, setPermittedPages] = useState([]);
  const [homeHref, setHomeHref] = useState("/ui/user");
  const [workflowCounts, setWorkflowCounts] = useState({ newLine: 0, maintenance: 0 });

  // Fetch pending action counts for the logged-in user's role
  const fetchWorkflowCounts = useCallback(async () => {
    try {
      const roles = getUserRoles(session);
      const [nlStats, maintStats] = await Promise.allSettled([
        customNewLineConnectionService.getDepartmentStats(),
        customMaintenanceService.getDepartmentStats(),
      ]);

      const nl =
        nlStats.status === "fulfilled" && nlStats.value
          ? getNewLineRoleActionCount(nlStats.value, roles)
          : 0;
      const maint =
        maintStats.status === "fulfilled" && maintStats.value
          ? getMaintenanceRoleActionCount(maintStats.value, roles)
          : 0;

      setWorkflowCounts({ newLine: nl, maintenance: maint });
    } catch {
      // Silently catch in sidebar
    }
  }, [session]);

  useEffect(() => {
    fetchWorkflowCounts();
    const interval = setInterval(fetchWorkflowCounts, 30000);
    const handleWorkflowAction = () => fetchWorkflowCounts();
    window.addEventListener("marda_workflow_action_performed", handleWorkflowAction);
    return () => {
      clearInterval(interval);
      window.removeEventListener("marda_workflow_action_performed", handleWorkflowAction);
    };
  }, [fetchWorkflowCounts]);

  // Handle Session and Roles
  useEffect(() => {
    if (session) {
      const roles = session?.user?.roles || session?.roles || [];
      const pages = session?.user?.permittedPages || session?.permittedPages || [];
      setUserRoles(roles);
      setPermittedPages(pages);

      // Set landing page — any user with roles goes to manager
      if (roles.length > 0) {
        setHomeHref("/ui/manager");
      } else {
        setHomeHref("/unauthorized");
      }
    }
  }, [session]);

  // Handle Sidebar Open/Close
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  if (status === "unauthenticated") {
    // router.push("/signin");
    // redirect("/signin");
  }

  // Helper: extract page code from a path like "/ui/manager/invItems" → "invItems"
  const getPageCode = (path) => path ? path.split("/").pop() : "";

  // Only true admins bypass dynamic filtering entirely
  const isAdmin = userRoles.includes("systemadmin") || userRoles.includes("billzgjt");

  // Filter Menu Items — dynamic permittedPages with static fallback
  const filteredMenuGroups = menuGroups.map((group) => {
    const filteredItems = group.items.filter((item) => {
      const hasExcludedRole =
        item.excludeRoles &&
        item.excludeRoles.some((role) => userRoles.includes(role));
      if (hasExcludedRole) return false;

      // Admin: always use static roles[] arrays from sidebarConfig
      if (isAdmin) {
        return !item.roles || item.roles.some((role) => userRoles.includes(role));
      }

      // Non-admin: use dynamic permittedPages when configured
      if (permittedPages.length > 0) {
        // For parent items with children — show if ANY child page is permitted
        if (item.children && item.children.length > 0) {
          return item.children.some(child => permittedPages.includes(getPageCode(child.path)));
        }
        // For leaf items — check if this page is permitted
        const pageCode = getPageCode(item.path);
        if (pageCode && pageCode !== "#" && pageCode !== "manager") {
          return permittedPages.includes(pageCode);
        }
        // Fallback for items without a clear page code: use static roles
        return !item.roles || item.roles.some((role) => userRoles.includes(role));
      }

      // No permittedPages configured yet — fall back to static role-based filtering
      return !item.roles || item.roles.some((role) => userRoles.includes(role));
    });

    // Also filter children dynamically (skip for admins) and inject role-specific workflow badges
    const itemsWithFilteredChildren = filteredItems.map(item => {
      let baseChildren = item.children;
      if (!isAdmin && item.children && permittedPages.length > 0) {
        const filteredChildren = item.children.filter(child => {
          const childCode = getPageCode(child.path);
          return permittedPages.includes(childCode);
        });
        baseChildren = filteredChildren.length > 0 ? filteredChildren : item.children;
      }

      // Attach dynamic badge counts for New Line Connection & Customer Maintenance
      if (baseChildren && baseChildren.length > 0) {
        let parentBadgeCount = 0;
        const childrenWithBadges = baseChildren.map(child => {
          let bCount = 0;
          if (child.path === "/ui/manager/custom_newLineConnection") {
            bCount = workflowCounts.newLine || 0;
          } else if (child.path === "/ui/manager/custom_maintenance") {
            bCount = workflowCounts.maintenance || 0;
          }
          parentBadgeCount += bCount;
          return { ...child, badgeCount: bCount };
        });
        return {
          ...item,
          children: childrenWithBadges,
          badgeCount: parentBadgeCount,
        };
      }

      let leafBadgeCount = 0;
      if (item.path === "/ui/manager/custom_newLineConnection") {
        leafBadgeCount = workflowCounts.newLine || 0;
      } else if (item.path === "/ui/manager/custom_maintenance") {
        leafBadgeCount = workflowCounts.maintenance || 0;
      }

      return { ...item, badgeCount: leafBadgeCount };
    });

    return {
      ...group,
      items: itemsWithFilteredChildren,
    };
  }).filter((group) => group.items.length > 0);


  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebar}
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{
          background: "linear-gradient(180deg, #1a1c2e 0%, #111318 100%)",
        }}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between px-4 py-4 lg:py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link href={homeHref} className="flex justify-center w-full">
            <Image
              width={130}
              height={60}
              src={"/logo3.jpg"}
              alt="Logo"
              className="object-contain rounded-lg"
              style={{ maxWidth: "100%", height: "auto" }}
              priority
            />
          </Link>

          <button
            ref={trigger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            className="block lg:hidden ml-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-white/80" />
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div
          className="flex flex-col overflow-y-auto duration-300 ease-linear"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
          }}
        >
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-3 py-2 px-3 lg:mt-4 lg:px-4">
            {filteredMenuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-3 ml-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {group.name}
                </h3>

                <ul className="mb-4 flex flex-col gap-0.5">
                  {group.items.map((item, itemIndex) => (
                    <SidebarItem
                      key={itemIndex}
                      item={item}
                      sidebarExpanded={sidebarExpanded}
                      setSidebarExpanded={setSidebarExpanded}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
