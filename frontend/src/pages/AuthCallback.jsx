// src/pages/AuthCallback.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const { loginSession } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const handshakeTriggered = useRef(false);

    useEffect(() => {
        if (handshakeTriggered.current) return;
        handshakeTriggered.current = true;

        const parseSecureSession = () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                console.error("Critical Token parameter missing from authorization redirection.");
                navigate('/auth');
                return;
            }

            try {
                // Base64 decode the JWT token payload to read user details locally
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                
                const decodedData = JSON.parse(jsonPayload);
                
                // Static user mapping structure following your user model keys
                const mockUserUser = {
                    id: decodedData.user_id,
                    email: decodedData.sub,
                    username: decodedData.sub.split('@')[0], // Quick client fallback string
                    is_verified: true
                };

                // Seed session directly to dynamic application memory layers
                loginSession(token, mockUserUser);
                navigate('/home');
            } catch (error) {
                console.error("Failed parsing identity payload secure streams:", error);
                navigate('/auth');
            }
        };

        parseSecureSession();
    }, [location, loginSession, navigate]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-indigo-500/30 border-b-indigo-500/30 border-l-cyan-400 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-1 tracking-wide">Locking Secure Credentials</h3>
            <p className="text-xs text-slate-400 animate-pulse">Mounting authorization context layers safely...</p>
        </div>
    );
};

export default AuthCallback;