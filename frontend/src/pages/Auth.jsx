import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Auth = () => {
  const [loginError, setLoginError] = useState(null);
  const { loggedIn, navigate, setToken, setLoggedIn, setUser } =
    useContext(AuthContext);

  // On successful Google login, exchange Google's credential for your app's JWT
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = (
        await axios.post(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/auth/google`,
          {
            credentials: credentialResponse.credential,
          },
          { withCredentials: true }
        )
      ).data;
      if (res.success) {
        localStorage.setItem("jwt_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setToken(res.data.token); // Store JWT for subsequent API calls
        setUser(res.data.user);
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
    <div className="flex items-center justify-center min-h-screen bg-[#fffaf4] px-4">
      <div className="w-full max-w-lg bg-[linear-gradient(180deg,_rgba(255,129,99,0.15)_0%,_rgba(255,129,99,0.05)_100%)] p-8 rounded-xl shadow-md text-center space-y-6">
        <div className="text-3xl mb-6">
          <span className="bg-white border px-2 py-3 rounded-xl border-orange-400 shadow">
            &lt;/&gt;
          </span>
        </div>

        <h1 className="text-3xl font-semibold text-gray-800 tracking-wide">
          Welcome to <span className="font-bold">MiniCRM</span>
        </h1>

        {/* Subheading */}
        <p className="text-gray-500 text-sm">
          Access your dashboard and start tracking
        </p>

        {/* Google Login Button */}
        <div className="w-sm mx-auto">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setLoginError("Google Login Failed")}
            width="100%"
          />
        </div>

        {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 pt-2 jet">
          By signing in, you agree to our{" "}
          <span className="font-bold text-orange-400">Terms of Service</span>{" "}
          and <span className="font-bold text-orange-400">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
export default Auth;
