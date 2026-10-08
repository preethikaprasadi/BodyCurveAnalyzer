"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  BarChart2,
  Compass,
  Home,
  Sparkles,
  User,
  LogOut,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/analyze", label: "Analyze", icon: Sparkles },
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/progress", label: "Progress", icon: BarChart2 },
    { href: "/recommendations", label: "Style & Fitness", icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                BodyCurve <span className="text-teal-600">Analyzer</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                AI / ML
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
                <Link
                  href="/profile"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/profile"
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  title="Profile Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
