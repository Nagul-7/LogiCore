import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [token, setToken]     = useState(null);
    const [loading, setLoading] = useState(true);

    // Validate stored token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('logicore_token');
        if (!storedToken) { setLoading(false); return; }

        api.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then(r => {
            setToken(storedToken);
            setUser(r.data.user);
        })
        .catch(() => {
            localStorage.removeItem('logicore_token');
        })
        .finally(() => setLoading(false));
    }, []);

    const login = async (credentials) => {
        const res = await api.post('/api/auth/login', credentials);
        localStorage.setItem('logicore_token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('logicore_token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    // Set axios default header if token exists
    useEffect(() => {
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
