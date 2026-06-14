// src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const History = () => {
    const { token } = useAuth();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ type: '', message: '' });

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/detector/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setScans(response.data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
            setToast({ type: 'error', message: 'Unable to load history at this time.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchHistory();
    }, [token]);

    useEffect(() => {
        if (!toast.message) return;

        const timeout = setTimeout(() => {
            setToast({ type: '', message: '' });
        }, 3500);

        return () => clearTimeout(timeout);
    }, [toast]);

    // Delete handler targeting database rows directly
    const handleDelete = async (scanId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/detector/history/${scanId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic UI update: instantly filters out from list without full refresh
            setScans(scans.filter(scan => scan.id !== scanId));
            setToast({ type: 'success', message: 'Record removed from history.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Unable to delete record. Please try again.' });
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Navbar />

            <div className="flex-1 max-w-5xl w-full mx-auto p-6 my-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Threat Interrogation Repositories</h1>
                    <p className="text-xs text-slate-400 mt-1">Audit historic deep learning scans triggered under your current verified context.</p>
                </div>

                {toast.message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'}`}>
                        {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center text-slate-500 font-mono text-sm animate-pulse">
                        Synchronizing real-time analytical registers...
                    </div>
                ) : scans.length === 0 ? (
                    <div className="p-16 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500">
                        <span className="text-2xl block mb-2">📁</span> No scan footprints locked in current database nodes.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scans.map((scan) => (
                            <div key={scan.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center group">
                                <div className="text-left max-w-2xl">
                                    <p className="font-mono text-sm break-all text-slate-200">{scan.url}</p>
                                    <span className={`inline-block text-[10px] uppercase font-bold mt-1.5 ${scan.is_phishing ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {scan.is_phishing ? '🔥 Phishing Vector' : '🛡️ Safe'} ({Number(scan.confidence_score * 100).toFixed(2)}%)
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(scan.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 bg-slate-950 rounded-lg border border-slate-800 transition-all opacity-0 group-hover:opacity-100"
                                    title="Purge Record"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;