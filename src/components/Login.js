import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import "../assets/style.css";
import ricovirLogo from "../assets/Modern Ricovir logo design.png";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      setUser(userCredential.user);

      alert("✅ Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      alert(
        "✅ Password reset email sent."
      );
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

          <h1>Welcome Back</h1>

          <p className="auth-subtitle">
            Sign in to access your Ricovir telehealth dashboard.
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              type="submit"
              className="hero-button"
            >
              Sign In
            </button>
          </form>

          <p
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </p>

          <div className="auth-links">
            <p>
              Don't have an account?
              <span
                onClick={() =>
                  navigate("/register")
                }
              >
                {" "}Register
              </span>
            </p>

            <p>
              <span
                onClick={() =>
                  navigate("/")
                }
              >
                ← Back to Home
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}


