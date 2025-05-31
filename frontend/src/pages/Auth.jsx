import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Auth = () => {
  const [loginError, setLoginError] = useState(null);
  const { loggedIn, navigate, setToken, setLoggedIn } = useContext(AuthContext);

  // On successful Google login, exchange Google's credential for your app's JWT
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL_BACKEND}/auth/google`,
        {
          credentials: credentialResponse.credential,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        localStorage.setItem("jwt_token", res.data.data.token);
        setToken(res.data.data.token); // Store JWT for subsequent API calls
        setLoggedIn(true);
        navigate("/");
      }
    } catch (err) {
      setLoginError(
        "Login failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="mb-6 text-2xl font-bold">Sign in with Google</h2>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => setLoginError("Google Login Failed")}
      />
      {loginError && <p className="text-red-500 mt-3">{loginError}</p>}
    </div>
  );
};
export default Auth;
