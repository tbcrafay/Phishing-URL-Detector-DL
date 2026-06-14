// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sync authentication state from localStorage on initial boot
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Function to initialize session after backend confirms Google handshake
    const loginSession = (accessToken, userProfile) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userProfile));
        setToken(accessToken);
        setUser(userProfile);
    };

    // Terminate session and flush client security memory
    const logoutSession = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, loginSession, logoutSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);