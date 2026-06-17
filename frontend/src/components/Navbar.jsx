// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import phishLogo from "../assets/phishlogo2.png";

const Navbar = () => {
  const { user, logoutSession } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        {/* 🔥 Auth Theme Gradient Logo Container */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-950/50 via-slate-900/50 to-emerald-950/30 flex items-center justify-center overflow-hidden relative shadow-[0_0_15px_rgba(34,211,238,0.05)]">
          <img
            src={phishLogo}
            alt="PhishGuard Logo"
            className="w-full h-full scale-[1.4] object-center mix-blend-lighten contrast-[1.4] brightness-[0.85] saturate-[1.2]"
            onError={(e) => {
              e.target.src = "https://placehold.co/50x50/0f172a/ffffff?text=PG";
            }}
          />
          {/* Subtle vignette layer to compress stubborn light corners */}
          <div className="absolute inset-0 pointer-events-none rounded-xl inset-shadow-xs shadow-[inset_0_0_8px_rgba(3,7,18,0.9)]" />
        </div>
        <span className="text-xl font-extrabold tracking-wider text-white select-none">
          Phish<span className="text-cyan-400">Guard</span>
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/home"
          className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive("/home") ? "text-cyan-400 border-b-2 border-cyan-400 pb-1" : "text-slate-400 hover:text-white"}`}
        >
          Scanner Dashboard
        </Link>
        <Link
          to="/history"
          className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive("/history") ? "text-cyan-400 border-b-2 border-cyan-400 pb-1" : "text-slate-400 hover:text-white"}`}
        >
          Threat History Logs
        </Link>
        <Link
          to="/news"
          className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive("/news") ? "text-cyan-400 border-b-2 border-cyan-400 pb-1" : "text-slate-400 hover:text-white"}`}
        >
          News
        </Link>
        <Link
          to="/about"
          className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive("/about") ? "text-cyan-400 border-b-2 border-cyan-400 pb-1" : "text-slate-400 hover:text-white"}`}
        >
          About
        </Link>
        <Link
          to="/community"
          className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive("/community") ? "text-cyan-400 border-b-2 border-cyan-400 pb-1" : "text-slate-400 hover:text-white"}`}
        >
          Community
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-white">{user?.username}</p>
          <p className="text-[10px] text-slate-500 max-w-[120px] truncate">
            {user?.email}
          </p>
        </div>
        <button
          onClick={logoutSession}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;