// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { token } = useAuth();
    
    // Initializing directly from sessionStorage to persist data on reload
    const [urlInput, setUrlInput] = useState(() => {
        return sessionStorage.getItem('cached_url') || '';
    });
    const [result, setResult] = useState(() => {
        const cachedResult = sessionStorage.getItem('cached_result');
        return cachedResult ? JSON.parse(cachedResult) : null;
    });
    
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');

    const handleScanSubmit = async (e) => {
        e.preventDefault();
        if (!urlInput.trim()) return;

        setScanning(true);
        setResult(null);
        setError('');

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/detector/scan',
                { url: urlInput },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Save to state and session storage
            setResult(response.data);
            sessionStorage.setItem('cached_result', JSON.stringify(response.data));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Threat interrogation lifecycle failed.");
        } finally {
            setScanning(false);
        }
    };

    // 🔥 DYNAMIC CLEANER HOOK: 
    // Jaise hi user backspace daba kar input khali karega, scoreboard foran gayab ho jayega
    useEffect(() => {
        sessionStorage.setItem('cached_url', urlInput);
        
        if (urlInput.trim() === '') {
            setResult(null);
            setError('');
            sessionStorage.removeItem('cached_result');
        }
    }, [urlInput]);

    const renderXAIHeatmap = () => {
        if (!result || !result.attention_weights) return null;
        
        const urlChars = result.url.split('');
        const weights = result.attention_weights;

        return (
            <div className="mt-6 bg-slate-950/80 border border-slate-800 p-5 rounded-xl text-left w-full">
                <h4 className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-3">
                    🧠 XAI Feature Importance Map (Character-Level Perturbation)
                </h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    The highlighting represents how heavily our deep learning layers focused on specific characters to determine fraud vectors. Darker red indicates higher threat attention weights.
                </p>
                <div className="flex flex-wrap p-4 bg-slate-900 rounded-lg font-mono text-sm break-all leading-relaxed tracking-wide border border-slate-800 select-none">
                    {urlChars.map((char, index) => {
                        // Pulling directly using string matching keys
                        const weight = weights[String(index)] !== undefined ? parseFloat(weights[String(index)]) : 0.0;
                        
                        // Setting high visibility background scaling for Tailwind custom style injection
                        const alpha = Math.min(Math.max(weight, 0.08), 0.92);
                        const hasHighRisk = weight > 0.45;
                        
                        return (
                            <span 
                                key={index} 
                                className={`px-0.5 rounded transition-all duration-150 cursor-help inline-block ${hasHighRisk ? 'font-bold text-white underline decoration-red-500/80' : 'text-slate-300'}`}
                                style={{ backgroundColor: `rgba(239, 68, 68, ${alpha})` }}
                                title={`Index: ${index} | Char: "${char}" | Weight: ${weight.toFixed(4)}`}
                            >
                                {char}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Navbar />

            <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center items-center text-center my-8">
                <div className="mb-4">
                    <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 tracking-wider uppercase">
                        Hybrid Ensemble Processing Unit
                    </span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                    Shield Your Browsing Framework
                </h1>
                <p className="text-slate-400 text-sm max-w-lg mb-8">
                    Interrogate suspicious raw strings into our 1D CNN + BiLSTM matrix to inspect underlying malicious DNA structures.
                </p>

                {/* Cyberpunk Search Gate */}
                <form onSubmit={handleScanSubmit} className="w-full max-w-2xl mb-8">
                    <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl focus-within:border-cyan-500/50 transition-all duration-300">
                        <input 
                            type="text" 
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="Type or paste suspicious link here... (e.g. security-paypal-login.com)" 
                            required
                            disabled={scanning}
                            className="flex-1 bg-transparent px-4 py-3 text-white text-sm outline-none placeholder-slate-500 disabled:opacity-50 font-mono"
                        />
                        <button 
                            type="submit"
                            disabled={scanning}
                            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            {scanning ? 'Analyzing Matrix...' : 'SCAN LINK 🔍'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 text-left mb-6">
                        ⚠️ <strong>Core Error:</strong> {error}
                    </div>
                )}

                {scanning && (
                    <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-12 h-12 border-2 border-t-cyan-400 border-slate-800 rounded-full animate-spin mb-4"></div>
                        <p className="text-xs tracking-widest text-cyan-400 font-mono uppercase">Deconstructing Character Tokens...</p>
                    </div>
                )}

                {/* Diagnostic Evaluation Outputs */}
                {result && (
                    <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl transition-all duration-500">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
                            <div className="text-left">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Global Diagnostic Verdict</span>
                                <h2 className={`text-2xl font-extrabold ${result.is_phishing ? 'text-red-400' : 'text-emerald-400'}`}>
                                    System Classification: {result.is_phishing ? 'PHISHING THREAT DETECTED' : 'SAFE / VERIFIED'}
                                </h2>
                            </div>
                            <div className={`px-5 py-3 rounded-xl border flex flex-col items-center ${result.is_phishing ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Confidence Score</span>
                                <span className={`text-xl font-black ${result.is_phishing ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {(result.confidence_score * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        {/* Model Breakdown Metric Columns */}
                        <div className="grid sm:grid-cols-2 gap-4 mt-5 text-left">
                            <div className="bg-slate-950/50 p-4 border border-slate-800/60 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wide">1D CNN Engine Branch</h3>
                                    <span className="text-xs font-mono text-cyan-400">{(result.breakdown?.cnn_score * 100 || result.cnn_score * 100).toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${(result.breakdown?.cnn_score || result.cnn_score) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 p-4 border border-slate-800/60 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wide">BiLSTM Recurrent Recoil</h3>
                                    <span className="text-xs font-mono text-indigo-400">{(result.breakdown?.lstm_score * 100 || result.lstm_score * 100).toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-400 h-full transition-all duration-500" style={{ width: `${(result.breakdown?.lstm_score || result.lstm_score) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* XAI Engine Heatmap Render */}
                        {renderXAIHeatmap()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home; 