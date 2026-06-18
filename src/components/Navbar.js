import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-teal-400 to-blue-500 p-4 shadow-md text-white flex justify-between items-center">
      <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        🩺 Ricovir
      </div>

      <div className="space-x-4">
        {!user ? (
          <>
            <Link
              to="/login"
              className="bg-white text-teal-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-teal-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="bg-white text-teal-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="bg-white text-teal-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}