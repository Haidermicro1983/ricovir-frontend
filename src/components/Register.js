import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "../assets/style.css";
import ricovirLogo from "../assets/Modern Ricovir logo design.png";

export default function Register({ setUser }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date()
      });

      setUser(user);

      alert("Registration successful!");

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "provider") {
        navigate("/provider-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">
          <img
            src={ricovirLogo}
            alt="Ricovir Logo"
            className="auth-logo"
          />

          <h1>Create Account</h1>

          <p className="auth-subtitle">
            Join Ricovir and start managing your telehealth appointments.
          </p>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-select"
            >
              <option value="patient">Patient</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <button type="submit" className="hero-button">
              Create Account
            </button>
          </form>

          <div className="auth-links">
            <p>
              Already have an account?
              <span onClick={() => navigate("/login")}>
                {" "}Sign In
              </span>
            </p>

            <p>
              <span onClick={() => navigate("/")}>
                Back to Home
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}