// src/pages/News.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const News = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [feedError, setFeedError] = useState('');

    // Network connection status tracking triggers
    useEffect(() => {
        const goOnline = () => setIsOffline(false);
        const goOffline = () => setIsOffline(true);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    useEffect(() => {
        const fetchCyberNews = async () => {
            setLoading(true);
            setFeedError('');

            // Grabbing cache backup upfront
            const storageBackup = localStorage.getItem('cached_cyber_news_json');

            // IF TRULY OFFLINE: Bypass network completely and load backup instantly
            if (navigator.onLine === false) {
                if (storageBackup) {
                    setNewsItems(JSON.parse(storageBackup));
                } else {
                    setFeedError('Network interface disconnected. Stored telemetry cache empty.');
                }
                setLoading(false);
                return;
            }

            try {
                // 🔥 REPLACE YOUR_API_KEY WITH YOUR GENERATED KEY
                // Direct endpoint targets cybersecurity specifically without proxies!
                const response = await axios.get(
                    `https://newsapi.org/v2/everything?q=cybersecurity+OR+phishing&sortBy=publishedAt&language=en&pageSize=12&apiKey=40641e7051744eb88e018880d8b329d3`,
                    { timeout: 6000 } // 6 seconds timeout limit
                );

                const articles = response.data.articles || [];
                
                if (articles.length === 0) throw new Error("Empty payload stream.");

                // Map clean parameters directly from json structure
                const formattedArticles = articles.map((art) => ({
                    title: art.title || 'Cyber Intelligence Entry',
                    description: art.description || 'No supplementary description data received from endpoint buffer layer.',
                    link: art.url || '#'
                }));

                setNewsItems(formattedArticles);
                // Sync fresh data inside cache database
                localStorage.setItem('cached_cyber_news_json', JSON.stringify(formattedArticles));

            } catch (err) {
                console.error("Downstream pipeline integration failure:", err);
                
                // SERVER FAIL / TIMEOUT FALLBACK: Trigger cache silently if available
                if (storageBackup) {
                    const parsedBackup = JSON.parse(storageBackup);
                    if (parsedBackup && parsedBackup.length > 0) {
                        setNewsItems(parsedBackup);
                        setFeedError(''); // Keep UI clean as data is salvaged
                    } else {
                        setFeedError('Unable to load live news feed. Please verify network or API keys.');
                    }
                } else {
                    setFeedError('Unable to load live news feed. Please verify network or API keys.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCyberNews();
    }, [isOffline]);

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            <Navbar />
            
            <div className="max-w-6xl mx-auto px-6 pt-28 pb-12 text-center">
                <h1 className="text-4xl font-extrabold tracking-wide mb-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
                    Latest Cyber Security News
                </h1>
                <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
                    Stay updated with the latest infrastructure threats, vulnerabilities, and technological trends in the global digital era.
                </p>

                {/* Network Status Info Tags */}
                {isOffline && (
                    <div className="mb-8 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-mono inline-flex items-center gap-2">
                        ⚠️ Operational mode: Offline. Displaying stored localized threat telemetry.
                    </div>
                )}

                {loading ? (
                    <div className="text-sm font-mono text-cyan-400 tracking-widest animate-pulse mt-12">
                        Intercepting dynamic security data fields...
                    </div>
                ) : feedError && newsItems.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl max-w-md mx-auto mt-6">
                        <h3 className="text-red-400 font-semibold mb-2">Feed Connection Failure</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {feedError}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                        {newsItems.map((item, index) => (
                            <div 
                                key={index} 
                                className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
                            >
                                <div>
                                    <h3 className="text-cyan-400 font-bold text-base leading-snug mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-4 font-normal">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-800/60">
                                    <a 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-block text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border-b border-transparent hover:border-emerald-300/60 pb-0.5"
                                    >
                                        Read Article →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;