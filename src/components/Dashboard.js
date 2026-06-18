// FILE: src/components/Dashboard.js

import React, { useEffect, useState } from "react";
import ZoomMeeting from "./ZoomMeeting";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ricovirLogo from "../assets/Modern Ricovir logo design.png";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(db, "appointments"),
          where("userId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAppointments(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="dashboard-wrapper">

        {/* Header */}
        <div className="auth-card dashboard-header">
          <img
            src={ricovirLogo}
            alt="Ricovir"
            className="auth-logo"
          />

          <h1>Patient Dashboard</h1>

          <p className="auth-subtitle">
            Manage appointments and join telehealth sessions.
          </p>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Appointments */}
        <div className="auth-card">
          <h2>My Appointments</h2>

          {appointments.length === 0 ? (
            <p className="empty-text">
              No appointments booked yet.
            </p>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt.id}
                className="appointment-card"
              >
                <h3>{appt.doctor}</h3>

                <p>{appt.specialty}</p>

                <p>📅 {appt.date}</p>

                <p>⏰ {appt.time}</p>

                <p>
                  Status:
                  <span className="status-badge">
                    {appt.status || "Pending"}
                  </span>
                </p>

                {appt.zoomLink && (
                  <a
                    href={appt.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-button"
                  >
                    Join Zoom Meeting
                  </a>
                )}
              </div>
            ))
          )}

          <button
            className="hero-button"
            onClick={() => navigate("/booking")}
          >
            Book New Appointment
          </button>
        </div>

        {/* Zoom Section */}
        <div className="auth-card">
          <ZoomMeeting />
        </div>
      </div>
    </div>
  );
}