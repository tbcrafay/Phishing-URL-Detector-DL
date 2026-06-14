// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logoutSession } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="w-full bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
            <div className="flex items-center gap-3">
                <img src="/phish.jpg" alt="PhishGuard Logo" className="w-10 h-10 rounded-lg object-cover border border-cyan-500/20" onError={(e) => { e.target.src = "https://placehold.co/50x50/0f172a/ffffff?text=PG" }} />
                <span className="text-xl font-extrabold tracking-wider text-white">Phish<span className="text-cyan-400">Guard</span></span>
            </div>

            <div className="flex items-center gap-6">
                <Link to="/home" className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive('/home') ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-400 hover:text-white'}`}>
                    Scanner Dashboard
                </Link>
                <Link to="/history" className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive('/history') ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-400 hover:text-white'}`}>
                    Threat History Logs
                </Link>
                <Link to="/news" className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive('/news') ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-400 hover:text-white'}`}>
                    News
                </Link>
                <Link to="/about" className={`text-sm font-medium transition-all duration-300 tracking-wide ${isActive('/about') ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-400 hover:text-white'}`}>
                    About
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-white">{user?.username}</p>
                    <p className="text-[10px] text-slate-500 max-w-[120px] truncate">{user?.email}</p>
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