import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };


  return (
    <AuthContext.Provider value={{token,user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};