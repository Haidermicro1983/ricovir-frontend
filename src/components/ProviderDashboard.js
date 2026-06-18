import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import "../assets/style.css";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState("approved");

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedId),
    [appointments, selectedId]
  );

  useEffect(() => {
    const loadAppointments = async () => {
      if (!auth.currentUser) {
        navigate("/provider-login");
        return;
      }

      setLoading(true);

      try {
        const providerEmail = auth.currentUser.email;

        const approvedAppointmentsQuery = query(
          collection(db, "appointments"),
          where("providerEmail", "==", providerEmail),
          where("status", "==", "approved")
        );

        const allProviderAppointmentsQuery = query(
          collection(db, "appointments"),
          where("providerEmail", "==", providerEmail)
        );

        const appointmentsQuery =
          appointmentFilter === "approved"
            ? approvedAppointmentsQuery
            : allProviderAppointmentsQuery;

        const snapshot = await getDocs(appointmentsQuery);
        const providerAppointments = snapshot.docs
          .map((appointmentDoc) => ({
            id: appointmentDoc.id,
            ...appointmentDoc.data(),
          }))
          .sort((a, b) => {
            const firstDate = `${a.date || ""} ${a.time || ""}`;
            const secondDate = `${b.date || ""} ${b.time || ""}`;
            return firstDate.localeCompare(secondDate);
          });

        setAppointments(providerAppointments);
        setSelectedId(providerAppointments[0]?.id || null);
      } catch (error) {
        console.error("Provider appointments error:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [appointmentFilter, navigate]);

  useEffect(() => {
    setNoteDraft(selectedAppointment?.providerNotes || "");
  }, [selectedAppointment]);

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      await updateDoc(doc(db, "appointments", selectedAppointment.id), {
        providerNotes: noteDraft,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? { ...appointment, providerNotes: noteDraft }
            : appointment
        )
      );

      alert("Notes saved.");
    } catch (error) {
      console.error("Save notes error:", error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/provider-login");
  };

  if (loading) {
    return (
      <div className="provider-dashboard">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <header className="provider-dashboard-header">
        <div>
          <h1>Provider Dashboard</h1>
          <p>{auth.currentUser?.email}</p>
        </div>

        <button className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="provider-dashboard-grid">
        <section className="appointments-panel">
          <div className="provider-panel-header">
            <h2>My Appointments</h2>

            <select
              className="auth-select"
              value={appointmentFilter}
              onChange={(event) => setAppointmentFilter(event.target.value)}
            >
              <option value="approved">Approved Only</option>
              <option value="all">All Appointments</option>
            </select>
          </div>

          {appointments.length === 0 ? (
            <p>No appointments found for this provider.</p>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <button
                  key={appointment.id}
                  className={`appointment-row ${
                    appointment.id === selectedId ? "active" : ""
                  }`}
                  onClick={() => setSelectedId(appointment.id)}
                >
                  <span>
                    <strong>{appointment.userEmail}</strong>
                    <small>{appointment.specialty}</small>
                  </span>

                  <span>
                    <strong>{appointment.time}</strong>
                    <small>{appointment.date}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="notes-panel">
          {selectedAppointment ? (
            <>
              <div className="patient-summary">
                <h2>{selectedAppointment.userEmail}</h2>
                <span className="status-pill">
                  {selectedAppointment.status || "pending"}
                </span>
              </div>

              <div className="appointment-details">
                <p>
                  <strong>Doctor:</strong> {selectedAppointment.doctor}
                </p>
                <p>
                  <strong>Date:</strong> {selectedAppointment.date}
                </p>
                <p>
                  <strong>Time:</strong> {selectedAppointment.time}
                </p>
                <p>
                  <strong>Specialty:</strong> {selectedAppointment.specialty}
                </p>
                {selectedAppointment.zoomLink && (
                  <p>
                    <strong>Zoom:</strong> {selectedAppointment.zoomLink}
                  </p>
                )}
              </div>

              <label className="notes-label">
                Provider Notes
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  rows="10"
                  placeholder="Add private provider notes for this patient appointment..."
                />
              </label>

              <button className="provider-submit-button" onClick={handleSaveNotes}>
                Save Notes
              </button>
            </>
          ) : (
            <p>Select an appointment to view patient details.</p>
          )}
        </section>
      </main>
    </div>
  );
}
