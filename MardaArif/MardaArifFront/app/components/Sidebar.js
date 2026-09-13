"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "Cities", path: "/cities", icon: "🏙️" },
  { label: "Bills", path: "/bills", icon: "📄" },
  { label: "Payments", path: "/payments", icon: "💳" },
  { label: "SMS Gateway", path: "/sms", icon: "💬" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">M</div>
        <div>
          <h2>MardaArif</h2>
          <span>Central Payment Hub</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`sidebar-link${pathname === item.path || pathname.startsWith(item.path + "/") ? " active" : ""}`}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-link"
          onClick={() => {
            localStorage.removeItem("arif_token");
            localStorage.removeItem("arif_user");
            window.location.href = "/signin";
          }}
          style={{ color: "var(--danger)" }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
