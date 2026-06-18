import React, { useEffect, useState } from "react";

export default function ZoomMeeting() {
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        // Example: get latest appointment from backend
        const res = await fetch("http://localhost:5000/latest-appointment");
        const data = await res.json();

        setMeetingLink(data.zoomLink);
      } catch (error) {
        console.error("Error fetching meeting:", error);
      }
    };

    fetchMeeting();
  }, []);

  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold mb-4">
        Your Telehealth Appointment
      </h2>

      {meetingLink ? (
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition"
        >
          Join Zoom Meeting
        </a>
      ) : (
        <p className="text-gray-500">Waiting for payment confirmation...</p>
      )}
    </div>
  );
}