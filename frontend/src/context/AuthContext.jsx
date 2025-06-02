import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const initializeAuth = async () => {
      setIsAuthLoading(true);

      const storedToken = localStorage.getItem("jwt_token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        setLoggedIn(true);
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setTimeout(() => setIsAuthLoading(false), 0);
    };

    initializeAuth();
  }, []);

  const value = {
    navigate,
    token,
    setToken,
    loggedIn,
    setLoggedIn,
    showWelcomeMessage,
    setShowWelcomeMessage,
    user,
    setUser,
    isAuthLoading,
    setIsAuthLoading,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
