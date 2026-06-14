// src/pages/Auth.jsx
import React from 'react';

const Auth = () => {
    const handleGoogleLogin = () => {
        // Points directly to your FastAPI gateway Google OAuth generator
        window.location.href = 'http://127.0.0.1:8000/api/auth/google/login';
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            {/* Main Premium Glassmorphism Card */}
            <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl grid md:grid-cols-2">
                
                {/* Brand Showcase Side */}
                <div className="p-8 md:p-12 bg-gradient-to-br from-indigo-950/50 via-slate-900/50 to-emerald-950/30 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-700/50">
                    <div className="mb-6 flex justify-center md:justify-start">
                        <img 
                            src="/phish.jpg" 
                            alt="PhishGuard Logo" 
                            className="w-20 h-20 rounded-xl object-cover border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            onError={(e) => { e.target.src = "https://placehold.co/150x150/0f172a/ffffff?text=PhishGuard" }}
                        />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 text-center md:text-left">
                        Phish<span className="text-cyan-400">Guard</span>
                    </h1>
                    <p className="text-slate-400 text-sm text-center md:text-left mb-6">
                        Smart AI-Powered URL Protection Layer
                    </p>
                    <ul className="space-y-3 text-slate-300 text-sm">
                        <li className="flex items-center gap-3">
                            <span className="text-cyan-400 text-base">🛡️</span> Real-time Deep Learning Analysis
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-cyan-400 text-base">🔍</span> 1D CNN + BiLSTM Hybrid Ensemble
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-cyan-400 text-base">🚀</span> Interrogate Attack Vector Gradients
                        </li>
                    </ul>
                </div>

                {/* Authorization Portal Action Side */}
                <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Secure Access Portal</h2>
                    <p className="text-slate-400 text-xs mb-8 max-w-xs">
                        Authorize via your trusted corporate or personal Google account identity providers.
                    </p>

                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full max-w-sm flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-white/5 active:scale-[0.98] group"
                    >
                        {/* Inline Google Colorful Icon Asset */}
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.96 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="mt-8 text-[10px] text-slate-500 max-w-xs uppercase tracking-wider">
                        Protected by hardware grade isolated cryptographic framework tunnels.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Auth;