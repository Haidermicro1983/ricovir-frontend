import React, { useState } from "react";
import "../assets/style.css";
import { auth, db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";



export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  const doctors = [
    {
      id: "provider1",
      name: "Dr. Sarah Johnson",
      specialty: "General Physician",
      avatar: "https://i.pravatar.cc/100?img=5",
      providerEmail: "provider1@ricovir.com",
    },
    {
      id: "provider2",
      name: "Dr. Michael Lee",
      specialty: "Cardiologist",
      avatar: "https://i.pravatar.cc/100?img=12",
      providerEmail: "provider2@ricovir.com",
    },
    {
      id: "provider3",
      name: "Dr. Emily Davis",
      specialty: "Dermatologist",
      avatar: "https://i.pravatar.cc/100?img=20",
      providerEmail: "provider3@ricovir.com",
    },
  ];

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
  ];

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert("Please select a doctor, date, and time.");
      return;
    }

    if (!auth.currentUser) {
      alert("Please login before booking.");
      return;
    }

    setLoading(true);

    try {
      console.log("Current User:", auth.currentUser.email);

      const appointmentData = {
        // Patient
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,

        // Provider
        providerId: selectedDoctor.id,
        providerEmail: selectedDoctor.providerEmail,
        doctor: selectedDoctor.name,
        specialty: selectedDoctor.specialty,

        // Appointment
        date: selectedDate,
        time: selectedTime,

        // Notes
        patientNotes: "",
        providerNotes: "",

        // Status Workflow
        status: "pending_payment",

        // Payment
        paymentStatus: "pending",
        paymentAmount: 50,

        // Provider Payment
        providerPaymentAmount: 35,
        providerPaymentStatus: "pending",

        // Admin Approval
        approvedBy: "",
        approvedAt: null,

        // Zoom
        zoomLink: "",
        zoomMeetingId: "",

        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "appointments"),
        appointmentData
      );

      console.log(
        "Appointment Saved Successfully:",
        docRef.id
      );

      // Save appointment id for later use after payment
      localStorage.setItem(
        "appointmentId",
        docRef.id
      );

      // Redirect to Paypal
      window.location.href = "/paypal-checkout";

    } catch (error) {
      console.error("Booking Error:", error);

      alert(
        `Booking Failed:\n${error.message}`
      );

      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <h1>Book an Appointment</h1>

      {/* Doctor Selection */}
      <div className="booking-section">
        <label>Select Doctor:</label>

        <div className="doctor-list">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className={`doctor-card ${
                selectedDoctor?.id === doc.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedDoctor(doc)
              }
            >
              <img
                src={doc.avatar}
                alt={doc.name}
              />

              <h3>{doc.name}</h3>

              <p>{doc.specialty}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="booking-section">
        <label>Select Date:</label>

        <input
          type="date"
          min={
            new Date()
              .toISOString()
              .split("T")[0]
          }
          value={selectedDate}
          onChange={(e) =>
            setSelectedDate(e.target.value)
          }
        />
      </div>

      {/* Time Selection */}
      <div className="booking-section">
        <label>Select Time:</label>

        <div className="time-slots">
          {timeSlots.map((time) => (
            <button
              type="button"
              key={time}
              className={`time-slot ${
                selectedTime === time
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedTime(time)
              }
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedDoctor && (
        <div className="booking-summary">
          <h3>Appointment Summary</h3>

          <p>
            <strong>Doctor:</strong>{" "}
            {selectedDoctor.name}
          </p>

          <p>
            <strong>Specialty:</strong>{" "}
            {selectedDoctor.specialty}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {selectedDate || "Not Selected"}
          </p>

          <p>
            <strong>Time:</strong>{" "}
            {selectedTime || "Not Selected"}
          </p>

          <p>
            <strong>Consultation Fee:</strong>
            {" "} $50.00
          </p>
        </div>
      )}

      {/* Book Button */}
      <button
        className="book-btn"
        onClick={handleBooking}
        disabled={loading}
      >
        {loading
          ? "Saving Appointment..."
          : "Proceed to Payment"}
      </button>
    </div>
  );
}
