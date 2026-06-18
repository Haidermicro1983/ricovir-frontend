import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ricovirLogo from "../assets/Modern Ricovir logo design.png";

const PROVIDERS_BY_DOCTOR = {
  "Dr. Sarah Johnson": {
    providerId: "sarah-johnson",
    providerEmail: "sarah@ricovir.com",
  },
  "Dr. Michael Lee": {
    providerId: "michael-lee",
    providerEmail: "michael@ricovir.com",
  },
  "Dr. Emily Davis": {
    providerId: "emily-davis",
    providerEmail: "emily@ricovir.com",
  },
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const snapshot = await getDocs(collection(db, "appointments"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderInfo = (appointment) => {
    if (appointment.providerEmail && appointment.providerId) {
      return {
        providerId: appointment.providerId,
        providerEmail: appointment.providerEmail,
      };
    }

    return PROVIDERS_BY_DOCTOR[appointment.doctor] || {};
  };

  const approveAppointment = async (appointment) => {
    try {
      await updateDoc(doc(db, "appointments", appointment.id), {
        ...getProviderInfo(appointment),
        status: "approved",
      });

      loadAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectAppointment = async (id) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: "rejected",
      });

      loadAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const addZoomLink = async (appointment) => {
    const zoomLink = prompt("Enter Zoom Meeting URL");

    if (!zoomLink) return;

    try {
      await updateDoc(doc(db, "appointments", appointment.id), {
        ...getProviderInfo(appointment),
        zoomLink,
        status: "approved",
      });

      loadAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="dashboard-wrapper">
        <div className="auth-card">
          <img
            src={ricovirLogo}
            alt="Ricovir"
            className="auth-logo"
          />

          <h1>Admin Dashboard</h1>

          <p className="auth-subtitle">
            Manage patient appointments.
          </p>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="auth-card">
          <h2>Appointment Requests</h2>

          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            appointments.map((appt) => {
              const providerInfo = getProviderInfo(appt);

              return (
                <div
                  key={appt.id}
                  className="appointment-card"
                >
                  <h3>{appt.doctor}</h3>

                  <p>
                    <strong>Provider:</strong>{" "}
                    {providerInfo.providerEmail || "Not assigned"}
                  </p>

                  <p>
                    <strong>Patient:</strong>{" "}
                    {appt.userEmail}
                  </p>

                  <p>{appt.specialty}</p>

                  <p>{appt.date}</p>

                  <p>{appt.time}</p>

                  <p>
                    Status:{" "}
                    <span className="status-badge">
                      {appt.status || "pending"}
                    </span>
                  </p>

                  {appt.zoomLink && (
                    <p>
                      <strong>Zoom:</strong>{" "}
                      {appt.zoomLink}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="hero-button"
                      onClick={() => approveAppointment(appt)}
                    >
                      Approve
                    </button>

                    <button
                      className="logout-btn"
                      onClick={() => rejectAppointment(appt.id)}
                    >
                      Reject
                    </button>

                    <button
                      className="hero-button"
                      onClick={() => addZoomLink(appt)}
                    >
                      Add Zoom Link
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}