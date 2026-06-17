// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import History from './pages/History';
import News from './pages/News';
import About from './pages/About';
import Community from './pages/Community'; // 🔥 Importing Community Hub Component
import './index.css';

// Route Guard Wrapper preventing unauthenticated breaches
const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div className="p-8 text-white text-center font-mono">Reading security configurations...</div>;
    return token ? children : <Navigate to="/auth" replace />;
};

function AppContent() {
    return (
        <div className="min-h-screen text-slate-100 flex flex-col font-['Poppins'] bg-slate-950">
            <Routes>
                {/* Public Gateways */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Secure Encapsulated Gateways */}
                <Route path="/home" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/history" element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                } />
                <Route path="/news" element={
                    <ProtectedRoute>
                        <News />
                    </ProtectedRoute>
                } />
                {/* 🔥 Secure Community Hub Gateway */}
                <Route path="/community" element={
                    <ProtectedRoute>
                        <Community />
                    </ProtectedRoute>
                } />
                <Route path="/about" element={
                    <ProtectedRoute>
                        <About />
                    </ProtectedRoute>
                } />

                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;