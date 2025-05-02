import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    roles: string[];
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        return {
            isAuthenticated: !!token,
            user,
            token
        };
    });

    useEffect(() => {
        // Check token validity on mount
        const token = localStorage.getItem('token');
        if (token) {
            // You might want to validate the token with your backend here
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            setAuthState({
                isAuthenticated: true,
                user,
                token
            });
        }
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
            isAuthenticated: true,
            user,
            token
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null
        });
    };

    return {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        token: authState.token,
        login,
        logout
    };
}; 