import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import {
  Compass,
  CheckSquare,
  User,
  LogOut,
  Sparkles,
  Shield,
  Heart,
} from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentMood } = useSelector((state) => state.mood);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Compass },
    { to: "/tasks", label: "Task List", icon: CheckSquare },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-800">
              AI Life Manager
            </span>
            <span className="hidden sm:block text-[10px] text-teal-600 font-medium tracking-wide">
              Mood-Aware Productivity
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-teal-50 text-teal-800 border border-teal-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User state / Auth actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/60 py-1 px-2.5 hover:bg-slate-100 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold text-xs uppercase">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-700">
                  {user.name || "Alex"}
                </span>
              </Link>

              <button
                onClick={() => dispatch(logout())}
                className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
