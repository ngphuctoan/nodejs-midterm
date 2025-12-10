import { useState } from 'react';
import { AuthContext } from './AuthContext';
import { loginUser, getMe } from "../api/auth";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = async (email, password) => {
        const response = await loginUser({ email, password });
        const token = response.data.accessToken;

        setToken(token);
        localStorage.setItem('token', token);

        const userResponse = await getMe(token);
        const userData = userResponse.data;

        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const value = {
        user,
        token,
        isLoggedIn: !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};