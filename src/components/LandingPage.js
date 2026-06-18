// FILE: src/components/LandingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import ricovirLogo from "../assets/Modern Ricovir logo design.png";
import "../assets/style.css";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* Header */}
            <header className="landing-header" style={{ display: "flex", alignItems: "center", padding: "1rem 3rem" }}>
                <img src={ricovirLogo} alt="Ricovir Logo" className="landing-logo" style={{ height: "50px" }} />

                {/* Login/Register Buttons */}
                <nav className="header-nav">
                    <button
                        className="nav-button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>

                    <button
                        className="nav-button"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>

                    <button
                        className="admin-button"
                        onClick={() => navigate("/admin-login")}
                    >
                        Admin Portal
                    </button>

                    <button
                        className="provider-button"
                        onClick={() => navigate("/provider-login")}
                    >
                        Provider Portal
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <h1>Telehealth Appointments with Ricovir</h1>
                <p>Book your healthcare sessions quickly and safely from the comfort of your home.</p>
                <button
                    className="hero-button"
                    onClick={() => navigate("/booking")}
                >
                    Book an Appointment
                </button>
            </section>

            {/* Cards Section */}
            <section className="landing-cards">
                <div className="card">
                    <h2>Video Consultations</h2>
                    <p>Connect with licensed healthcare providers via Zoom securely.</p>
                </div>
                <div className="card">
                    <h2>Easy Scheduling</h2>
                    <p>Choose the time that fits your schedule through Calendly integration.</p>
                </div>
                <div className="card">
                    <h2>Secure Records</h2>
                    <p>Your medical records and consultations are fully encrypted and private.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Ricovir. All rights reserved.</p>
            </footer>
        </div>
    );
}
