// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const About = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-hidden relative">
            <Navbar />

            {/* Background Decorative Neon Orbs mimicking your old CSS layer elements */}
            <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 pt-32 pb-16 text-center relative z-10">
                <h1 className="text-4xl font-extrabold tracking-wide mb-10 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-md">
                    Why PhishGuard?
                </h1>

                {/* Info Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300 text-left">
                        <h3 className="text-cyan-400 font-bold text-lg mb-3">AI Intelligence</h3>
                        <p className="text-slate-400 text-xs leading-relaxed font-light">
                            Unlike normal static signature filters, we harness advanced machine learning sequence modeling pipelines to detect implicit underlying threat indicators, not just matching domains.
                        </p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300 text-left">
                        <h3 className="text-cyan-400 font-bold text-lg mb-3">Deep Feature Tracking</h3>
                        <p className="text-slate-400 text-xs leading-relaxed font-light">
                            We analyze multi-dimensional structural data attributes, processing character string distributions, sub-domain entropy weights, tokens, and active metadata parameters in real-time.
                        </p>
                    </div>

                    {/* Interactive Highlight Card */}
                    <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-indigo-950/40 border border-cyan-500/30 p-8 rounded-2xl backdrop-blur-md flex flex-col justify-between items-center text-center shadow-[0_0_25px_rgba(6,182,212,0.05)]">
                        <div>
                            <h3 className="text-emerald-400 font-bold text-lg mb-3">Ready to Test?</h3>
                            <p className="text-slate-300 text-xs leading-relaxed font-light px-2">
                                Do not wait for compromise actions! Proactively test and protect yourself from fraudulent vectors instantly.
                            </p>
                        </div>
                        <Link 
                            to="/home" 
                            className="mt-6 px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.03] duration-200"
                        >
                            Go to Scanner 🔍
                        </Link>
                    </div>
                </div>

                {/* Mission Core Blockbox */}
                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-2xl backdrop-blur-sm text-left max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-200 mb-3 tracking-wide">Our Mission</h2>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">
                        Internet infrastructure security layers remain structurally dense, but interacting with them safely shouldn't be barrier-heavy. Our mission centers on empowering users through an intuitive yet conceptually robust diagnostic interface to verify strings instantly. Stay insulated from deceptive typosquatting exploits and intricate sequential phishing maneuvers effortlessly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;