import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const existingToken = localStorage.getItem('token');
    const existingRole = localStorage.getItem('role');
    let existingUser = null;

    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            existingUser = JSON.parse(userStr);
        } catch (error) {
            console.error('Ошибка при парсинге user из localStorage:', error);
            existingUser = null;
            localStorage.removeItem('user');
        }
    }

    const [authData, setAuthData] = useState({
        isAuthenticated: !!existingToken,
        user: existingUser || null,
        token: existingToken || null,
        role: existingRole || null,
    });

    const login = (userData) => {
        setAuthData({
            isAuthenticated: true,
            user: userData.user,
            token: userData.token,
            role: userData.role,
        });

        try {
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData.user));
            localStorage.setItem('role', userData.role);
        } catch (error) {
            console.error('Ошибка при сохранении данных в localStorage:', error);
        }
    };

    const logout = () => {
        setAuthData({
            isAuthenticated: false,
            user: null,
            token: null,
            role: null,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('cart');

        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ authData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
