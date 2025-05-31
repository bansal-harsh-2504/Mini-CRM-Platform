import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const [token, setToken] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    if (storedToken) {
      setToken(storedToken);
      setLoggedIn(true);
    }
  }, []);

  const value = {
    navigate,
    token,
    setToken,
    loggedIn,
    setLoggedIn,
    showWelcomeMessage,
    setShowWelcomeMessage,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
