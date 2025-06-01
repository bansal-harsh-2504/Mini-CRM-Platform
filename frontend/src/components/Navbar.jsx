import { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { FiLogOut } from "react-icons/fi";
import { BsPerson, BsMoon } from "react-icons/bs";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { loggedIn, setLoggedIn, navigate, setToken, user, setUser } =
    useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    setToken("");
    setUser(null);
    localStorage.removeItem("jwt_token");
    navigate("/login");
  };

  return (
    <div
      className={` nav border-b-1 border-orange-200 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[6vw] mb-1 fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled ? "backdrop-blur-md bg-white/50 shadow-md" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between py-1 font-medium">
        <div className="flex">
          <p className="m-2 translate-y-0.5 cursor-pointer font-bold text-xl text-gray-600">
            <NavLink to="/">MiniCrm</NavLink>
          </p>
        </div>

        <ul className="hidden sm:flex flex-1 justify-center gap-8 text-gray-600 text-sm">
          <NavLink to="/" className="flex flex-col items-center gap-1">
            <p>Dashboard</p>
          </NavLink>
          <NavLink to="/campaigns" className="flex flex-col items-center gap-1">
            <p>Campaigns</p>
          </NavLink>
          <NavLink to="/ingest" className="flex flex-col items-center gap-1">
            <p>Import Data</p>
          </NavLink>
        </ul>

        <div className="relative flex items-center gap-6" ref={dropdownRef}>
          {loggedIn ? (
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-[256px] flex items-center gap-3 px-3 py-2 rounded-full cursor-pointer hover:bg-orange-300 transition-colors duration-200"
            >
              <img
                src="/default-profile.jpg"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left leading-4">
                <div className="text-sm font-medium text-gray-800">
                  {user?.name || "John Doe"}
                </div>
                <div className="text-xs max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-500">
                  {user?.email || "john@example.com"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink to="/login">
                <button className="flex bg-white items-center text-gray-600 px-4 py-1.25 rounded-lg border border-orange-200 cursor-pointer transition-colors duration-300 group hover:bg-orange-50">
                  Log In
                </button>
              </NavLink>
              <NavLink to="/login">
                <button className="flex bg-orange-400 items-center text-white px-4 py-1.25 rounded-lg shadow cursor-pointer transition-colors duration-300 group hover:bg-orange-500">
                  Get Started
                </button>
              </NavLink>
            </div>
          )}

          {dropdownOpen && loggedIn && (
            <div className="absolute top-[110%] w-64 text-gray-600 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-orange-300 bg-orange-300 rounded-t-lg">
                <div className="flex items-center gap-3 ">
                  <img
                    src="/default-profile.jpg"
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left text-sm leading-tight">
                    <p className="font-semibold">{user?.name || "John Doe"}</p>
                    <p className="text-xs text-gray-500 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {user?.email || "john@example.com"}
                    </p>
                  </div>
                </div>
              </div>
              <ul className="text-sm p-2 bg-white rounded-lg">
                <li className="px-4 py-2 rounded-lg hover:bg-orange-100 flex items-center gap-2 cursor-pointer">
                  <BsPerson className="text-lg" /> Profile
                </li>
                <li className="px-4 py-2 rounded-lg hover:bg-orange-100 flex items-center gap-2 cursor-pointer">
                  <BsMoon className="text-lg" /> Dark Mode
                </li>
                <hr className="text-orange-200 mb-1 mt-1" />
                <li
                  className="px-4 py-2 rounded-lg hover:bg-orange-100 hover:text-gray-600 flex items-center gap-2 cursor-pointer text-red-400"
                  onClick={handleLogout}
                >
                  <FiLogOut className="text-lg" /> Sign Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
