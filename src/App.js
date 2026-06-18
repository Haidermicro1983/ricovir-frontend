import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import BookingPage from "./components/BookingPage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ProviderLogin from "./components/ProviderLogin";
import ProviderDashboard from "./components/ProviderDashboard";
import PayPalCheckout from "./components/PayPalCheckout";



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/provider-login" element={<ProviderLogin />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route
          path="/paypal-checkout"
          element={<PayPalCheckout />}
        />

        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />

        <Route
          path="/register"
          element={<Register setUser={setUser} />}
        />

        <Route
          path="/booking"
          element={
            user ? (
              <BookingPage user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


