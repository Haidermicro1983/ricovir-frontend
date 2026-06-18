import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ricovirLogo from "../assets/Modern Ricovir logo design.png";
import "../assets/style.css";

export default function ProviderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.role !== "provider") {
        alert("This account is not a provider account.");
        await auth.signOut();
        return;
      }

      navigate("/provider-dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="provider-login-page">
      <form className="provider-login-card" onSubmit={handleLogin}>
        <img
          src={ricovirLogo}
          alt="Ricovir Logo"
          className="provider-login-logo"
        />

        <h1>Provider Portal</h1>

        <p>
          Sign in to view your appointments and patient notes.
        </p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="provider-submit-button"
        >
          Login
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/register")}
        >
          Register as Provider
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/")}
        >
          Return to Home
        </button>
      </form>
    </div>
  );
}