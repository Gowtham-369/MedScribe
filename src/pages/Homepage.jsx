import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- Use Link instead of useNavigate
import axios from 'axios';

function Homepage({ role, setRole }) {
  // For doctor: dynamic state for appointments fetched from backend.
  const [futureAppointments, setFutureAppointments] = useState([]);

  // Static doctor summary values except upcomingAppointments, which will be updated from backend data.
  const [doctorSummary, setDoctorSummary] = useState({
    totalConsultations: 120,
    totalPatients: 85,
    upcomingAppointments: 0,
  });

  // For patient: state for patient details.
  const [patientData, setPatientData] = useState(null);

  // Fetch doctor's consultations when role is "doctor".
  useEffect(() => {
    if (role === 'doctor') {
      axios
        .get('https://53ee-129-137-96-16.ngrok-free.app/consultations/doctor/1')
        .then((response) => {
          const consultations = response.data;
          const now = new Date();
          const futureConsultations = consultations.filter((consultation) => {
            return new Date(consultation.start_time) > now;
          });

          // Transform data for display (formatting date/time, and showing patient id)
          const transformedAppointments = futureConsultations.map((consultation) => ({
            id: consultation.consultation_id,
            date: new Date(consultation.start_time).toLocaleDateString(),
            time: new Date(consultation.start_time).toLocaleTimeString(),
            patient: `Patient ID: ${consultation.patient_id}`,
          }));

          setFutureAppointments(transformedAppointments);
          // Update only the upcomingAppointments value in the doctor summary.
          setDoctorSummary((prev) => ({
            ...prev,
            upcomingAppointments: futureConsultations.length,
          }));
        })
        .catch((error) => {
          console.error("Error fetching doctor's consultations:", error);
        });
    }
  }, [role]);

  // Fetch patient's details when role is "patient".
  useEffect(() => {
    if (role === 'patient') {
      axios
        .get('https://53ee-129-137-96-16.ngrok-free.app/patients/1', {
          headers: {
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
        })
        .then((response) => {
          console.log("Patient data:", response.data);
          setPatientData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching patient's details:", error);
        });
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-gradient-to-r">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white py-4 shadow">
        <div className="container mx-auto flex justify-center">
          <span className="text-4xl font-bold">MedScribe</span>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto p-6 mt-6">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setRole('patient')}
            className={`px-4 py-2 border border-r-0 rounded-l transition ${
              role === 'patient' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => setRole('doctor')}
            className={`px-4 py-2 border rounded-r transition ${
              role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Doctor
          </button>
        </div>

        {/* Patient Homepage */}
        {role === 'patient' ? (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Patient Homepage</h1>
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">User Details</h2>
              {patientData ? (
                <>
                  <p className="mb-2">
                    <span className="font-medium">Name:</span> {patientData.name}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Email:</span> {patientData.email}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Age:</span> {patientData.age}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Gender:</span> {patientData.gender}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Patient ID:</span> {patientData.patient_id}
                  </p>
                </>
              ) : (
                <p>Loading patient details...</p>
              )}
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Make an Appointment
            </button>
          </div>
        ) : (
          // Doctor Homepage
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Doctor Homepage</h1>
            {/* Doctor Summary Section */}
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Summary</h2>
              <p className="mb-2">
                <span className="font-medium">Total Consultations:</span> {doctorSummary.totalConsultations}
              </p>
              <p className="mb-2">
                <span className="font-medium">Total Patients Treated:</span> {doctorSummary.totalPatients}
              </p>
              <p className="mb-2">
                <span className="font-medium">Upcoming Appointments:</span> {doctorSummary.upcomingAppointments}
              </p>
            </div>

            {/* Additional functionalities */}
            <div className="flex space-x-4 mb-6">
              {/* Link to talk-to-patient route */}
              <Link
                to="/talk"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Talk to Patient
              </Link>
              {/* Link to history route */}
              <Link
                to="/history"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Consultation History
              </Link>
            </div>

            {/* Doctor's Future Appointments (Fetched from Backend) */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Upcoming Appointments</h2>
              {futureAppointments.length > 0 ? (
                <ul>
                  {futureAppointments.map((appt) => (
                    <li key={appt.id} className="mb-2">
                      <span className="font-medium">
                        {appt.date} at {appt.time}
                      </span>{' '}
                      with {appt.patient}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming appointments.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // <-- Use Link instead of useNavigate
// import axios from 'axios';

// function Homepage({ role, setRole }) {
//   // For doctor: dynamic state for appointments fetched from backend.
//   const [futureAppointments, setFutureAppointments] = useState([]);

//   // Static doctor summary values except upcomingAppointments, which will be updated from backend data.
//   const [doctorSummary, setDoctorSummary] = useState({
//     totalConsultations: 120,
//     totalPatients: 85,
//     upcomingAppointments: 0,
//   });

//   // For patient: state for patient details.
//   const [patientData, setPatientData] = useState(null);

//   // Fetch doctor's consultations when role is "doctor".
//   useEffect(() => {
//     if (role === 'doctor') {
//       axios
//         .get('https://53ee-129-137-96-16.ngrok-free.app/consultations/doctor/1')
//         .then((response) => {
//           const consultations = response.data;
//           const now = new Date();
//           const futureConsultations = consultations.filter((consultation) => {
//             return new Date(consultation.start_time) > now;
//           });

//           // Transform data for display (formatting date/time, and showing patient id)
//           const transformedAppointments = futureConsultations.map((consultation) => ({
//             id: consultation.consultation_id,
//             date: new Date(consultation.start_time).toLocaleDateString(),
//             time: new Date(consultation.start_time).toLocaleTimeString(),
//             patient: `Patient ID: ${consultation.patient_id}`,
//           }));

//           setFutureAppointments(transformedAppointments);
//           // Update only the upcomingAppointments value in the doctor summary.
//           setDoctorSummary((prev) => ({
//             ...prev,
//             upcomingAppointments: futureConsultations.length,
//           }));
//         })
//         .catch((error) => {
//           console.error("Error fetching doctor's consultations:", error);
//         });
//     }
//   }, [role]);

//   // Fetch patient's details when role is "patient".
//   useEffect(() => {
//     if (role === 'patient') {
//       axios
//         .get('https://53ee-129-137-96-16.ngrok-free.app/patients/1', {
//           headers: {
//             Accept: 'application/json',
//             'ngrok-skip-browser-warning': 'true'
//           },
//         })
//         .then((response) => {
//           console.log("Patient data:", response.data);
//           setPatientData(response.data);
//         })
//         .catch((error) => {
//           console.error("Error fetching patient's details:", error);
//         });
//     }
//   }, [role]);

//   return (
//     // Outer flex container: sidebar + main content
//     <div className="flex h-screen bg-gradient-to-r from-blue-50 to-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-blue-900 text-white p-4">
//         <h2 className="text-xl font-bold mb-4">Menu</h2>
//         <ul>
//           <li className="mb-2">
//             <Link to="/homepage" className="hover:underline">Homepage</Link>
//           </li>
//           <li className="mb-2">
//             <Link to="/talk" className="hover:underline">Talk to Patient</Link>
//           </li>
//           <li className="mb-2">
//             <Link to="/history" className="hover:underline">Consultation History</Link>
//           </li>
//         </ul>
//       </div>

//       {/* Main content area */}
//       <div className="flex-1 flex flex-col">
//         {/* Navbar attached flush at the top */}
//         <nav className="bg-blue-800 text-white py-4 px-6">
//           <div className="flex justify-center">
//             <span className="text-2xl font-bold">MedScribe</span>
//           </div>
//         </nav>

//         {/* Content container */}
//         <div className="flex-1 p-6">
//           {/* Toggle Buttons */}
//           <div className="flex justify-center mb-8">
//             <button
//               onClick={() => setRole('patient')}
//               className={`px-4 py-2 border border-r-0 rounded-l transition ${
//                 role === 'patient' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
//               }`}
//             >
//               Patient
//             </button>
//             <button
//               onClick={() => setRole('doctor')}
//               className={`px-4 py-2 border rounded-r transition ${
//                 role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
//               }`}
//             >
//               Doctor
//             </button>
//           </div>

//           {/* Render based on role */}
//           {role === 'patient' ? (
//             <div>
//               <h1 className="text-3xl font-bold mb-6 text-gray-800">Patient Homepage</h1>
//               <div className="bg-white p-6 rounded shadow mb-6">
//                 <h2 className="text-2xl font-semibold mb-4 text-gray-700">User Details</h2>
//                 {patientData ? (
//                   <>
//                     <p className="mb-2">
//                       <span className="font-medium">Name:</span> {patientData.name}
//                     </p>
//                     <p className="mb-2">
//                       <span className="font-medium">Email:</span> {patientData.email}
//                     </p>
//                     <p className="mb-2">
//                       <span className="font-medium">Age:</span> {patientData.age}
//                     </p>
//                     <p className="mb-2">
//                       <span className="font-medium">Gender:</span> {patientData.gender}
//                     </p>
//                     <p className="mb-2">
//                       <span className="font-medium">Patient ID:</span> {patientData.patient_id}
//                     </p>
//                   </>
//                 ) : (
//                   <p>Loading patient details...</p>
//                 )}
//               </div>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
//                 Make an Appointment
//               </button>
//             </div>
//           ) : (
//             // Doctor Homepage
//             <div>
//               <h1 className="text-3xl font-bold mb-6 text-gray-800">Doctor Homepage</h1>
//               {/* Doctor Summary Section */}
//               <div className="bg-white p-6 rounded shadow mb-6">
//                 <h2 className="text-2xl font-semibold mb-4 text-gray-700">Summary</h2>
//                 <p className="mb-2">
//                   <span className="font-medium">Total Consultations:</span> {doctorSummary.totalConsultations}
//                 </p>
//                 <p className="mb-2">
//                   <span className="font-medium">Total Patients Treated:</span> {doctorSummary.totalPatients}
//                 </p>
//                 <p className="mb-2">
//                   <span className="font-medium">Upcoming Appointments:</span> {doctorSummary.upcomingAppointments}
//                 </p>
//               </div>

//               {/* Additional functionalities */}
//               <div className="flex space-x-4 mb-6">
//                 {/* Link to talk-to-patient route */}
//                 <Link
//                   to="/talk"
//                   className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
//                 >
//                   Talk to Patient
//                 </Link>
//                 {/* Link to history route */}
//                 <Link
//                   to="/history"
//                   className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
//                 >
//                   Consultation History
//                 </Link>
//               </div>

//               {/* Doctor's Future Appointments (Fetched from Backend) */}
//               <div className="bg-white p-6 rounded shadow">
//                 <h2 className="text-2xl font-semibold mb-4 text-gray-700">Upcoming Appointments</h2>
//                 {futureAppointments.length > 0 ? (
//                   <ul>
//                     {futureAppointments.map((appt) => (
//                       <li key={appt.id} className="mb-2">
//                         <span className="font-medium">
//                           {appt.date} at {appt.time}
//                         </span>{' '}
//                         with {appt.patient}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p>No upcoming appointments.</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Homepage;
