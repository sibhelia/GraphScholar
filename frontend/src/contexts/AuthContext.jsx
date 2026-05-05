import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('graphscholar_token');
            if (token) {
                try {
                    const res = await authApi.getMe();
                    setUser(res.data);
                } catch (err) {
                    console.error("Geçersiz token, çıkış yapılıyor.");
                    localStorage.removeItem('graphscholar_token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        const res = await authApi.login(username, password);
        localStorage.setItem('graphscholar_token', res.data.access_token);
        const meRes = await authApi.getMe();
        setUser(meRes.data);
    };

    const register = async (username, password) => {
        await authApi.register(username, password);
        await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('graphscholar_token');
        setUser(null);
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
