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
  Timestamp,
} from "firebase/firestore";
import "../assets/style.css";

const PROVIDER_VISIT_RATE = 50;

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState("approved");
  const [activeTab, setActiveTab] = useState("appointments");

  const appointments = useMemo(() => {
    if (appointmentFilter === "approved") {
      return allAppointments.filter(
        (appointment) => appointment.status === "approved"
      );
    }

    if (appointmentFilter === "done") {
      return allAppointments.filter(
        (appointment) =>
          appointment.status === "done" || appointment.status === "completed"
      );
    }

    if (appointmentFilter === "paid") {
      return allAppointments.filter(
        (appointment) => appointment.providerPaymentStatus === "paid"
      );
    }

    return allAppointments;
  }, [allAppointments, appointmentFilter]);

  const selectedAppointment = useMemo(
    () => allAppointments.find((appointment) => appointment.id === selectedId),
    [allAppointments, selectedId]
  );

  const doneAppointments = useMemo(
    () =>
      allAppointments.filter(
        (appointment) =>
          appointment.status === "done" || appointment.status === "completed"
      ),
    [allAppointments]
  );

  const paidAppointments = useMemo(
    () =>
      allAppointments.filter(
        (appointment) => appointment.providerPaymentStatus === "paid"
      ),
    [allAppointments]
  );

  const pendingPaymentAppointments = useMemo(
    () =>
      doneAppointments.filter(
        (appointment) => appointment.providerPaymentStatus !== "paid"
      ),
    [doneAppointments]
  );

  const totalEarned = doneAppointments.reduce(
    (total, appointment) =>
      total + (appointment.providerPaymentAmount || PROVIDER_VISIT_RATE),
    0
  );

  const totalPaid = paidAppointments.reduce(
    (total, appointment) =>
      total + (appointment.providerPaymentAmount || PROVIDER_VISIT_RATE),
    0
  );

  const pendingPayment = pendingPaymentAppointments.reduce(
    (total, appointment) =>
      total + (appointment.providerPaymentAmount || PROVIDER_VISIT_RATE),
    0
  );

  useEffect(() => {
    const loadAppointments = async () => {
      if (!auth.currentUser) {
        navigate("/provider-login");
        return;
      }

      setLoading(true);

      try {
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("providerEmail", "==", auth.currentUser.email)
        );

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

        setAllAppointments(providerAppointments);
      } catch (error) {
        console.error("Provider appointments error:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [navigate]);

  useEffect(() => {
    if (!appointments.some((appointment) => appointment.id === selectedId)) {
      setSelectedId(appointments[0]?.id || null);
    }
  }, [appointments, selectedId]);

  useEffect(() => {
    setNoteDraft(selectedAppointment?.providerNotes || "");
  }, [selectedAppointment]);

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      await updateDoc(doc(db, "appointments", selectedAppointment.id), {
        providerNotes: noteDraft,
      });

      setAllAppointments((currentAppointments) =>
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

  const markAppointmentDone = async () => {
    if (!selectedAppointment) return;

    try {
      const paymentUpdate = {
        status: "done",
        providerPaymentAmount:
          selectedAppointment.providerPaymentAmount || PROVIDER_VISIT_RATE,
        providerPaymentStatus: "pending",
        completedAt: Timestamp.now(),
      };

      await updateDoc(
        doc(db, "appointments", selectedAppointment.id),
        paymentUpdate
      );

      setAllAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? { ...appointment, ...paymentUpdate }
            : appointment
        )
      );

      setAppointmentFilter("done");
      alert("Appointment marked done. Provider payment is now pending.");
    } catch (error) {
      console.error("Done appointment error:", error);
      alert(error.message);
    }
  };

  const markProviderPaid = async () => {
    if (!selectedAppointment) return;

    try {
      const paymentUpdate = {
        providerPaymentStatus: "paid",
        providerPaidAt: Timestamp.now(),
      };

      await updateDoc(
        doc(db, "appointments", selectedAppointment.id),
        paymentUpdate
      );

      setAllAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? { ...appointment, ...paymentUpdate }
            : appointment
        )
      );

      setAppointmentFilter("paid");
      alert("Provider payment marked paid.");
    } catch (error) {
      console.error("Provider payment error:", error);
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

      <div style={tabWrapStyle}>
        <button
          type="button"
          style={activeTab === "appointments" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </button>

        <button
          type="button"
          style={activeTab === "balance" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("balance")}
        >
          Provider Balance
        </button>
      </div>

      {activeTab === "balance" && (
        <section style={balancePageStyle}>
          <div style={paymentGridStyle}>
            <div style={featuredPaymentCardStyle}>
              <p style={paymentLabelStyle}>Total Earned</p>
              <h2 style={paymentValueStyle}>${totalEarned.toFixed(2)}</h2>
              <p style={paymentHelpStyle}>
                {doneAppointments.length} appointments done
              </p>
            </div>

            <div style={paymentCardStyle}>
              <p style={paymentLabelStyle}>Pending Payment</p>
              <h2 style={paymentValueStyle}>${pendingPayment.toFixed(2)}</h2>
              <p style={paymentHelpStyle}>
                {pendingPaymentAppointments.length} waiting for payout
              </p>
            </div>

            <div style={paymentCardStyle}>
              <p style={paymentLabelStyle}>Paid</p>
              <h2 style={paymentValueStyle}>${totalPaid.toFixed(2)}</h2>
              <p style={paymentHelpStyle}>
                {paidAppointments.length} payments sent
              </p>
            </div>
          </div>

          <div style={paymentTableStyle}>
            <h2 style={{ marginTop: 0, color: "#12312d" }}>Payment History</h2>

            {doneAppointments.length === 0 ? (
              <p>No completed appointments yet.</p>
            ) : (
              doneAppointments.map((appointment) => (
                <div key={appointment.id} style={paymentRowStyle}>
                  <div>
                    <strong>{appointment.userEmail}</strong>
                    <p style={paymentHelpStyle}>
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <strong>
                      $
                      {(
                        appointment.providerPaymentAmount ||
                        PROVIDER_VISIT_RATE
                      ).toFixed(2)}
                    </strong>
                    <p style={paymentHelpStyle}>
                      {appointment.providerPaymentStatus || "pending"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "appointments" && (
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
                <option value="done">Done</option>
                <option value="paid">Paid</option>
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
                  <p>
                    <strong>Provider Payment:</strong>{" "}
                    {selectedAppointment.providerPaymentStatus || "not started"}
                  </p>
                  <p>
                    <strong>Payment Amount:</strong> $
                    {(
                      selectedAppointment.providerPaymentAmount ||
                      PROVIDER_VISIT_RATE
                    ).toFixed(2)}
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

                <button
                  className="provider-submit-button"
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={markAppointmentDone}
                  disabled={
                    selectedAppointment.status === "done" ||
                    selectedAppointment.status === "completed"
                  }
                >
                  {selectedAppointment.status === "done" ||
                  selectedAppointment.status === "completed"
                    ? "Appointment Done"
                    : "Mark Appointment Done"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={markProviderPaid}
                  disabled={
                    selectedAppointment.providerPaymentStatus === "paid" ||
                    !["done", "completed"].includes(selectedAppointment.status)
                  }
                >
                  {selectedAppointment.providerPaymentStatus === "paid"
                    ? "Payment Paid"
                    : "Mark Payment Paid"}
                </button>
              </>
            ) : (
              <p>Select an appointment to view patient details.</p>
            )}
          </section>
        </main>
      )}
    </div>
  );
}








