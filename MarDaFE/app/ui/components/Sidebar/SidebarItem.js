
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { ChevronDown } from "lucide-react";

const SidebarItem = ({ item, sidebarExpanded, setSidebarExpanded }) => {
    const pathname = usePathname();

    const isActive = (path) => {
        if (path === "/" && pathname === "/") return true;
        return path !== "/" && pathname.includes(path);
    };

    const isGroupActive = (children) => {
        return children.some((child) => isActive(child.path));
    };

    if (item.children) {
        return (
            <SidebarLinkGroup activeCondition={isGroupActive(item.children)}>
                {(handleClick, open) => {
                    return (
                        <React.Fragment>
                            <Link
                                href="#"
                                className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium text-sm duration-200 ease-in-out transition-all ${isGroupActive(item.children)
                                        ? "bg-white/10 text-white"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                                }}
                                style={
                                    isGroupActive(item.children)
                                        ? { borderLeft: "3px solid #6366f1" }
                                        : { borderLeft: "3px solid transparent" }
                                }
                            >
                                {item.icon && (
                                    <item.icon
                                        size={18}
                                        className={`flex-shrink-0 transition-colors duration-200 ${isGroupActive(item.children)
                                                ? "text-indigo-400"
                                                : "text-white/50 group-hover:text-white/80"
                                            }`}
                                    />
                                )}
                                <span className="truncate">{item.title}</span>
                                {Number(item.badgeCount || 0) > 0 && (
                                    <span className="ml-auto mr-6 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-sm shadow-rose-600/40 animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />
                                        {item.badgeCount}
                                    </span>
                                )}
                                <ChevronDown
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200 ${open ? "rotate-180" : ""
                                        } ${isGroupActive(item.children)
                                            ? "text-indigo-400"
                                            : "text-white/40"
                                        }`}
                                    size={16}
                                />
                            </Link>

                            <div
                                className={`transform overflow-hidden transition-all duration-300 ease-in-out ${!open ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100"
                                    }`}
                            >
                                <ul className="mt-1 ml-3 flex flex-col gap-0.5 pl-4"
                                    style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
                                >
                                    {item.children.map((child, index) => (
                                        <li key={index}>
                                            <Link
                                                href={child.path}
                                                className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-3 text-sm font-medium duration-200 ease-in-out transition-all ${isActive(child.path)
                                                        ? "bg-white/10 text-white"
                                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                                    }`}
                                            >
                                                {child.icon && (
                                                    <child.icon
                                                        size={15}
                                                        className={`flex-shrink-0 transition-colors duration-200 ${isActive(child.path)
                                                                ? "text-indigo-400"
                                                                : "text-white/40 group-hover:text-white/70"
                                                            }`}
                                                    />
                                                )}
                                                <span className="truncate">{child.title}</span>
                                                {Number(child.badgeCount || 0) > 0 && (
                                                    <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-sm shadow-rose-600/40 animate-pulse">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />
                                                        {child.badgeCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </React.Fragment>
                    );
                }}
            </SidebarLinkGroup>
        );
    }

    return (
        <li>
            <Link
                href={item.path}
                className={`group relative flex items-center gap-2.5 rounded-lg py-2.5 px-3 font-medium text-sm duration-200 ease-in-out transition-all ${isActive(item.path)
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                style={
                    isActive(item.path)
                        ? { borderLeft: "3px solid #6366f1" }
                        : { borderLeft: "3px solid transparent" }
                }
            >
                {item.icon && (
                    <item.icon
                        size={18}
                        className={`flex-shrink-0 transition-colors duration-200 ${isActive(item.path)
                                ? "text-indigo-400"
                                : "text-white/50 group-hover:text-white/80"
                            }`}
                    />
                )}
                <span className="truncate">{item.title}</span>
                {Number(item.badgeCount || 0) > 0 && (
                    <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-sm shadow-rose-600/40 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />
                        {item.badgeCount}
                    </span>
                )}
            </Link>
        </li>
    );
};

export default SidebarItem;
