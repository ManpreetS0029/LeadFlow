import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null);

    const [permissions, setPermissions] = useState(
        JSON.parse(localStorage.getItem("permissions")) || []);

    const login = (data) => {
        setUser(data.user);
        setPermissions(data.permissions);

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("permissions", JSON.stringify(data.permissions));
        localStorage.setItem("token", data.token);
    };

    const logout = () => {
        setUser(null);
        setPermissions([]);

        localStorage.clear();
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            permissions,
            hasPermission,
            setPermissions
        }}
        >
            {children}
        </AuthContext.Provider>
    )

};

export const useAuth = () => useContext(AuthContext);