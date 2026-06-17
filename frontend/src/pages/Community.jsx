// src/pages/Community.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Community = () => {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Tab State: 'all' aur 'mine'
    const [activeTab, setActiveTab] = useState('all');
    
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState('');

    // 🔥 Custom Professional Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToPurge, setPostToPurge] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchFeed = async () => {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get('http://127.0.0.1:8000/api/community/', config);
            setPosts(response.data);
            setError('');
        } catch (err) {
            console.error("Failed to intercept community feed:", err);
            setError('Unable to link with central discussion repository.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, [token]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitLoading(true);
        setError('');
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/community/', 
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setContent('');
            setActiveTab('all'); 
            fetchFeed();
        } catch (err) {
            console.error("Post deployment failed:", err);
            setError('Authorization breach or invalid signature tokens.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdatePost = async (postId) => {
        if (!editContent.trim()) return;
        try {
            await axios.put(
                `http://127.0.0.1:8000/api/community/${postId}`, 
                { content: editContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingPostId(null);
            setEditContent('');
            fetchFeed();
        } catch (err) {
            setError('Failed to update target post parameters.');
        }
    };

    // 🔥 Trigger Custom Modal Guard
    const openDeleteConfirmation = (postId) => {
        setPostToPurge(postId);
        setShowDeleteModal(true);
    };

    // 🔥 Core Purge Execution
    const executePurgeSequence = async () => {
        if (!postToPurge) return;
        setDeleteLoading(true);
        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/community/${postToPurge}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowDeleteModal(false);
            setPostToPurge(null);
            fetchFeed();
        } catch (err) {
            setError('Unauthorized execution request. Token identity mismatch.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const displayedPosts = posts.filter(post => {
        if (activeTab === 'mine') {
            return user?.id === post.author?.id || user?.email === post.author?.email;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 pb-12 relative">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-28">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-wide mb-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
                        Community Discussion Hub
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                        Share recent phishing encounters, deceptive strings, or suspicious vectors. Keep other users safe through global tracking logs.
                    </p>
                </div>

                {/* Broadcast Form Context Block */}
                <form onSubmit={handleCreatePost} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md mb-8">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="3"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                        placeholder="Paste deceptive contents or report suspicious domain sequences..."
                        required
                    />
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                            
                        </span>
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                        >
                            {submitLoading ? 'Broadcasting Payload...' : 'Create your Post 🚀'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono text-center">
                        ⚠️ {error}
                    </div>
                )}

                {/* Tab Sorting Controller */}
                <div className="flex items-center gap-2 border-b border-slate-800/80 mb-6 pb-px">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider transition-all relative ${
                            activeTab === 'all' 
                            ? 'text-cyan-400' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        🌐 GLOBAL FEED
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider transition-all relative ${
                            activeTab === 'mine' 
                            ? 'text-cyan-400' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        🗂️ MY POST LOGS ({posts.filter(p => user?.id === p.author?.id || user?.email === p.author?.email).length})
                        {activeTab === 'mine' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        )}
                    </button>
                </div>

                {/* Feed Array Telemetry Mapping Area */}
                {loading ? (
                    <div className="text-center text-sm font-mono text-cyan-400 tracking-widest animate-pulse mt-12">
                        Intercepting central threat intelligence feed matrix...
                    </div>
                ) : displayedPosts.length === 0 ? (
                    <div className="bg-slate-900/20 border border-slate-800/60 p-8 rounded-2xl text-center max-w-md mx-auto mt-6">
                        <h3 className="text-slate-300 font-semibold mb-1">
                            {activeTab === 'mine' ? 'No Personal Logs Found' : 'Discussion Matrix Clean'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {activeTab === 'mine' ? 'You have not committed any payloads to the stream.' : 'No telemetry payloads uploaded yet by users.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedPosts.map((post) => {
                            const isOwner = user?.id === post.author?.id || user?.email === post.author?.email;

                            return (
                                <div key={post.id} className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl hover:border-slate-700/60 transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-cyan-400">@{post.author?.username || 'anonymous'}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    • {new Date(post.created_at).toLocaleString()}
                                                </span>
                                            </div>

                                            {isOwner && editingPostId !== post.id && (
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingPostId(post.id);
                                                            setEditContent(post.content);
                                                        }}
                                                        className="text-[10px] font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteConfirmation(post.id)}
                                                        className="text-[10px] font-bold text-red-500/70 hover:text-red-400 transition-colors border border-red-500/20 bg-red-500/5 px-2 py-0.5 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {editingPostId === post.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    rows="2"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 resize-none"
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button 
                                                        onClick={() => setEditingPostId(null)}
                                                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdatePost(post.id)}
                                                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold rounded-lg transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-300 text-xs leading-relaxed font-light break-words whitespace-pre-wrap select-text">
                                                {post.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 🔥 HIGH-TECH GLASSMORPHIC CONFIRMATION MODAL GUARD */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    {/* Backdrop Layer */}
                    <div 
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                        onClick={() => !deleteLoading && setShowDeleteModal(false)}
                    />
                    
                    {/* Modal Content Structure */}
                    <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.15)] text-center backdrop-blur-xl transform transition-transform scale-100">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-xl shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            ⚠️
                        </div>
                        <h3 className="text-base font-mono font-bold tracking-wide text-slate-200 mb-2">
                            PURGE OPERATIONAL RECORD?
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            This action will permanently delete this threat log entry from the database cluster. This action cannot be reverted.
                        </p>
                        
                        <div className="flex items-center gap-3 justify-center">
                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={executePurgeSequence}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-[1.02] disabled:opacity-50"
                            >
                                {deleteLoading ? 'Purging Matrix...' : 'Confirm Delete 🗑️'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;