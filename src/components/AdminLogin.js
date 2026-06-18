import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/admin");
    } catch (error) {
      console.error(error);

      alert(
        `${error.code}\n${error.message}`
      );
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(
        auth,
        email
      );

      alert("Password reset email sent.");
    } catch (error) {
      alert(
        `${error.code}\n${error.message}`
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Admin Login</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            className="hero-button"
          >
            Login
          </button>
        </form>

        <p
          className="forgot-password"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </p>
      </div>
    </div>
  );
}
