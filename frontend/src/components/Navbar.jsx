import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  const { loggedIn, setLoggedIn, navigate, setToken } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    setToken("");
    localStorage.removeItem("jwt_token");
    navigate("/login");
  };

  return (
    <div
      className={`nav border px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] mb-1 fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled ? "backdrop-blur-md bg-white/50 shadow-md" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between py-3 font-medium">
        <div className="flex">
          <p className="m-2 translate-y-0.5">MINI-CRM</p>
        </div>

        <ul className="hidden sm:flex flex-1 justify-center gap-8 text-sm text-black">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-emerald-600 font-semibold border-b-2 border-emerald-600"
                  : ""
              }`
            }
          >
            <p>Dashboard</p>
          </NavLink>
          <NavLink
            to="/campaigns"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-emerald-600 font-semibold border-b-2 border-emerald-600"
                  : ""
              }`
            }
          >
            <p>Campaigns</p>
          </NavLink>
          <NavLink
            to="/ingest"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-emerald-600 font-semibold border-b-2 border-emerald-600"
                  : ""
              }`
            }
          >
            <p>Import Data</p>
          </NavLink>
        </ul>

        <div className="flex items-center gap-6">
          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
