import React, { useState } from 'react';

function Homepage({role, setRole}) {

  // Dummy data for doctor's upcoming appointments
  const futureAppointments = [
    { id: 1, date: '2025-04-10', time: '10:00 AM', patient: 'Alice Smith' },
    { id: 2, date: '2025-04-11', time: '02:00 PM', patient: 'Bob Johnson' },
    { id: 3, date: '2025-04-12', time: '09:00 AM', patient: 'Charlie Brown' },
  ];

  // Dummy doctor summary statistics
  const doctorSummary = {
    totalConsultations: 120,
    totalPatients: 85,
    upcomingAppointments: futureAppointments.length,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setRole('patient')}
          className={`px-4 py-2 rounded-l transition ${
            role === 'patient' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Patient
        </button>
        <button
          onClick={() => setRole('doctor')}
          className={`px-4 py-2 rounded-r transition ${
            role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Doctor
        </button>
      </div>

      {/* Patient Homepage */}
      {role === 'patient' ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">Patient Homepage</h1>
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">User Details</h2>
            <p><span className="font-medium">Name:</span> John Doe</p>
            <p><span className="font-medium">Email:</span> john@example.com</p>
            <p><span className="font-medium">Phone:</span> 123-456-7890</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Make an Appointment
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-4">Doctor Homepage</h1>
          
          {/* Doctor Summary Section */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <p><span className="font-medium">Total Consultations:</span> {doctorSummary.totalConsultations}</p>
            <p><span className="font-medium">Total Patients Treated:</span> {doctorSummary.totalPatients}</p>
            <p><span className="font-medium">Upcoming Appointments:</span> {doctorSummary.upcomingAppointments}</p>
          </div>

          {/* Doctor's Future Appointments */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
            <ul>
              {futureAppointments.map(appt => (
                <li key={appt.id} className="mb-2">
                  <span className="font-medium">{appt.date} at {appt.time}</span> with {appt.patient}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
