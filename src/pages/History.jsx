// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function History({ role }) {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');

//   // States to hold enriched consultation data
//   const [doctorConsultations, setDoctorConsultations] = useState([]);
//   const [patientConsultations, setPatientConsultations] = useState([]);

//   // Utility to ensure we have an array from the response.
//   const getArrayData = (data) => {
//     if (Array.isArray(data)) return data;
//     if (data && Array.isArray(data.consultations)) return data.consultations;
//     return [];
//   };

//   // When role is doctor, fetch consultations and enrich each with patient details.
//   useEffect(() => {
//     async function fetchDoctorConsultations() {
//       try {
//         const consultationRes = await axios.get(
//           'https://53ee-129-137-96-16.ngrok-free.app/consultations/doctor/1',
//           {
//             headers: {
//               Accept: 'application/json',
//               'ngrok-skip-browser-warning': 'true'
//             },
//           }
//         );
//         const consultations = getArrayData(consultationRes.data);
//         const enrichedConsultations = await Promise.all(
//           consultations.map(async (consultation) => {
//             try {
//               // Use consultation.patient as the identifier for fetching patient details.
//               const patientRes = await axios.get(
//                 `https://53ee-129-137-96-16.ngrok-free.app/patients/${consultation.patient}`,
//                 {
//                   headers: {
//                     Accept: 'application/json',
//                     'ngrok-skip-browser-warning': 'true'
//                   },
//                 }
//               );
//               const patientData = patientRes.data;
//               return {
//                 id: consultation.consultation_id,
//                 startDate: new Date(consultation.start_time).toLocaleDateString(),
//                 startTime: new Date(consultation.start_time).toLocaleTimeString(),
//                 endDate: consultation.end_time
//                   ? new Date(consultation.end_time).toLocaleDateString()
//                   : 'N/A',
//                 endTime: consultation.end_time
//                   ? new Date(consultation.end_time).toLocaleTimeString()
//                   : 'N/A',
//                 patientName: patientData.name,
//                 age: patientData.age,
//                 gender: patientData.gender,
//                 summary: consultation.summary || '',
//               };
//             } catch (error) {
//               console.error(
//                 "Error fetching patient data for consultation",
//                 consultation.consultation_id,
//                 error
//               );
//               // Fallback if patient fetch fails.
//               return {
//                 id: consultation.consultation_id,
//                 startDate: new Date(consultation.start_time).toLocaleDateString(),
//                 startTime: new Date(consultation.start_time).toLocaleTimeString(),
//                 endDate: consultation.end_time
//                   ? new Date(consultation.end_time).toLocaleDateString()
//                   : 'N/A',
//                 endTime: consultation.end_time
//                   ? new Date(consultation.end_time).toLocaleTimeString()
//                   : 'N/A',
//                 patientName: `Patient ID: ${consultation.patient}`,
//                 age: 'N/A',
//                 gender: 'N/A',
//                 summary: consultation.summary || '',
//               };
//             }
//           })
//         );
//         setDoctorConsultations(enrichedConsultations);
//       } catch (error) {
//         console.error("Error fetching doctor's consultations:", error);
//       }
//     }
//     if (role === 'doctor') {
//       fetchDoctorConsultations();
//     }
//   }, [role]);

//   // When role is patient, fetch consultations and the doctor details once.
//   useEffect(() => {
//     async function fetchPatientConsultations() {
//       try {
//         const [consultationRes, doctorRes] = await Promise.all([
//           axios.get(
//             'https://53ee-129-137-96-16.ngrok-free.app/consultations/patient/1',
//             {
//               headers: {
//                 Accept: 'application/json',
//                 'ngrok-skip-browser-warning': 'true'
//               },
//             }
//           ),
//           axios.get(
//             'https://53ee-129-137-96-16.ngrok-free.app/doctors/1',
//             {
//               headers: {
//                 Accept: 'application/json',
//                 'ngrok-skip-browser-warning': 'true'
//               },
//             }
//           )
//         ]);
//         const consultations = getArrayData(consultationRes.data);
//         const doctorData = doctorRes.data;
//         const enrichedConsultations = consultations.map((consultation) => ({
//           id: consultation.consultation_id,
//           startDate: new Date(consultation.start_time).toLocaleDateString(),
//           startTime: new Date(consultation.start_time).toLocaleTimeString(),
//           endDate: consultation.end_time
//             ? new Date(consultation.end_time).toLocaleDateString()
//             : 'N/A',
//           endTime: consultation.end_time
//             ? new Date(consultation.end_time).toLocaleTimeString()
//             : 'N/A',
//           doctorName: doctorData.name,
//           summary: consultation.summary || '',
//         }));
//         setPatientConsultations(enrichedConsultations);
//       } catch (error) {
//         console.error("Error fetching patient's consultations:", error);
//       }
//     }
//     if (role === 'patient') {
//       fetchPatientConsultations();
//     }
//   }, [role]);

//   // Filtering for doctor: search by patient name.
//   const filteredDoctorConsultations = doctorConsultations.filter((cons) =>
//     cons.patientName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Filtering for patient: filter by start date.
//   const filteredPatientConsultations = patientConsultations.filter((cons) => {
//     // Note: Here we compare the startDate string with the input values.
//     // Depending on locale formats, you might want to store and compare ISO strings.
//     return (!fromDate || cons.startDate >= fromDate) && (!toDate || cons.startDate <= toDate);
//   });

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-4">
//         {role === 'doctor' ? 'Doctor History' : 'Patient History'}
//       </h1>

//       {role === 'doctor' ? (
//         <div>
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search patient records..."
//             className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
//           />
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-2xl font-semibold mb-4">Patient Consultation Records</h2>
//             {filteredDoctorConsultations.length > 0 ? (
//               <ul>
//                 {filteredDoctorConsultations.map((cons) => (
//                   <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
//                     <p>
//                       <span className="font-medium">Patient:</span> {cons.patientName}
//                     </p>
//                     <p>
//                       <span className="font-medium">Age:</span> {cons.age}
//                     </p>
//                     <p>
//                       <span className="font-medium">Gender:</span> {cons.gender}
//                     </p>
//                     <p>
//                       <span className="font-medium">Start Date:</span> {cons.startDate} at {cons.startTime}
//                     </p>
//                     <p>
//                       <span className="font-medium">End Date:</span> {cons.endDate} at {cons.endTime}
//                     </p>
//                     {cons.summary && (
//                       <p>
//                         <span className="font-medium">Summary:</span> {cons.summary}
//                       </p>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No consultation records found.</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div>
//           <div className="mb-4">
//             <label className="mr-2">From:</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="border border-gray-300 px-2 py-1 rounded"
//             />
//             <label className="ml-4 mr-2">To:</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="border border-gray-300 px-2 py-1 rounded"
//             />
//           </div>
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-2xl font-semibold mb-4">Consultation History</h2>
//             {filteredPatientConsultations.length > 0 ? (
//               <ul>
//                 {filteredPatientConsultations.map((cons) => (
//                   <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
//                     <p>
//                       <span className="font-medium">Doctor:</span> {cons.doctorName}
//                     </p>
//                     <p>
//                       <span className="font-medium">Start Date:</span> {cons.startDate} at {cons.startTime}
//                     </p>
//                     <p>
//                       <span className="font-medium">End Date:</span> {cons.endDate} at {cons.endTime}
//                     </p>
//                     {cons.summary && (
//                       <p>
//                         <span className="font-medium">Summary:</span> {cons.summary}
//                       </p>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No consultation records found for the selected dates.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default History;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function History({ role }) {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');

//   // States to hold enriched consultation data
//   const [doctorConsultations, setDoctorConsultations] = useState([]);
//   const [patientConsultations, setPatientConsultations] = useState([]);

//   // Utility to ensure we have an array from the response.
//   const getArrayData = (data) => {
//     if (Array.isArray(data)) return data;
//     if (data && Array.isArray(data.consultations)) return data.consultations;
//     return [];
//   };

//   /********************************************************************
//    *  DOCTOR VIEW
//    ********************************************************************/
//   useEffect(() => {
//     async function fetchDoctorConsultations() {
//       try {
//         // 1. Fetch all consultations for the doctor
//         const consultationRes = await axios.get(
//           'https://53ee-129-137-96-16.ngrok-free.app/consultations/doctor/1',
//           {
//             headers: {
//               Accept: 'application/json',
//               'ngrok-skip-browser-warning': 'true',
//             },
//           }
//         );
//         const consultations = getArrayData(consultationRes.data);

//         // 2. For each consultation, fetch patient details using the patient_id
//         const enrichedConsultations = await Promise.all(
//           consultations.map(async (consultation) => {
//             // Ensure we have the correct patient ID field from your backend
//             const patientId = consultation.patient_id; 
//             let patientName = `Patient ID: ${patientId}`;
//             let patientAge = 'N/A';
//             let patientGender = 'N/A';

//             try {
//               if (patientId) {
//                 const patientRes = await axios.get(
//                   `https://53ee-129-137-96-16.ngrok-free.app/patients/${patientId}`,
//                   {
//                     headers: {
//                       Accept: 'application/json',
//                       'ngrok-skip-browser-warning': 'true',
//                     },
//                   }
//                 );
//                 const patientData = patientRes.data;
//                 patientName = patientData.name || patientName;
//                 patientAge = patientData.age || 'N/A';
//                 patientGender = patientData.gender || 'N/A';
//               }
//             } catch (error) {
//               console.error(
//                 `Error fetching patient data for consultation ${consultation.consultation_id}:`,
//                 error
//               );
//             }

//             return {
//               id: consultation.consultation_id,
//               startDate: new Date(consultation.start_time).toLocaleDateString(),
//               startTime: new Date(consultation.start_time).toLocaleTimeString(),
//               endDate: consultation.end_time
//                 ? new Date(consultation.end_time).toLocaleDateString()
//                 : 'N/A',
//               endTime: consultation.end_time
//                 ? new Date(consultation.end_time).toLocaleTimeString()
//                 : 'N/A',
//               patientName,
//               age: patientAge,
//               gender: patientGender,
//               summary: consultation.summary || '',
//             };
//           })
//         );

//         setDoctorConsultations(enrichedConsultations);
//       } catch (error) {
//         console.error("Error fetching doctor's consultations:", error);
//       }
//     }

//     if (role === 'doctor') {
//       fetchDoctorConsultations();
//     }
//   }, [role]);

//   /********************************************************************
//    *  PATIENT VIEW
//    ********************************************************************/
//   useEffect(() => {
//     async function fetchPatientConsultations() {
//       try {
//         // 1. Fetch all consultations for the patient
//         const consultationRes = await axios.get(
//           'https://53ee-129-137-96-16.ngrok-free.app/consultations/patient/1',
//           {
//             headers: {
//               Accept: 'application/json',
//               'ngrok-skip-browser-warning': 'true',
//             },
//           }
//         );
//         const consultations = getArrayData(consultationRes.data);

//         // 2. For each consultation, fetch the doctor details using doctor_id
//         const enrichedConsultations = await Promise.all(
//           consultations.map(async (consultation) => {
//             const doctorId = consultation.doctor_id;
//             let doctorName = `Doctor ID: ${doctorId}`;
//             let doctorAge = 'N/A';
//             let doctorGender = 'N/A';

//             try {
//               if (doctorId) {
//                 const doctorRes = await axios.get(
//                   `https://53ee-129-137-96-16.ngrok-free.app/doctors/${doctorId}`,
//                   {
//                     headers: {
//                       Accept: 'application/json',
//                       'ngrok-skip-browser-warning': 'true',
//                     },
//                   }
//                 );
//                 const doctorData = doctorRes.data;
//                 doctorName = doctorData.name || doctorName;
//                 // If your doctor object has age/gender, set them here
//                 doctorAge = doctorData.age || 'N/A';
//                 doctorGender = doctorData.gender || 'N/A';
//               }
//             } catch (error) {
//               console.error(
//                 `Error fetching doctor data for consultation ${consultation.consultation_id}:`,
//                 error
//               );
//             }

//             return {
//               id: consultation.consultation_id,
//               startDate: new Date(consultation.start_time).toLocaleDateString(),
//               startTime: new Date(consultation.start_time).toLocaleTimeString(),
//               endDate: consultation.end_time
//                 ? new Date(consultation.end_time).toLocaleDateString()
//                 : 'N/A',
//               endTime: consultation.end_time
//                 ? new Date(consultation.end_time).toLocaleTimeString()
//                 : 'N/A',
//               doctorName,
//               doctorAge,
//               doctorGender,
//               summary: consultation.summary || '',
//             };
//           })
//         );

//         setPatientConsultations(enrichedConsultations);
//       } catch (error) {
//         console.error("Error fetching patient's consultations:", error);
//       }
//     }

//     if (role === 'patient') {
//       fetchPatientConsultations();
//     }
//   }, [role]);

//   /********************************************************************
//    *  FILTERING
//    ********************************************************************/

//   // Doctor: filter by patient name
//   const filteredDoctorConsultations = doctorConsultations.filter((cons) =>
//     cons.patientName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Patient: filter by date range (comparing the startDate string).
//   // NOTE: If you need accurate comparisons, store ISO dates and compare as Date objects.
//   const filteredPatientConsultations = patientConsultations.filter((cons) => {
//     return (!fromDate || cons.startDate >= fromDate) && (!toDate || cons.startDate <= toDate);
//   });

//   /********************************************************************
//    *  RENDER
//    ********************************************************************/

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-4">
//         {role === 'doctor' ? 'Doctor History' : 'Patient History'}
//       </h1>

//       {role === 'doctor' ? (
//         <div>
//           {/* Search input for patient name */}
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search patient records..."
//             className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
//           />
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-2xl font-semibold mb-4">Patient Consultation Records</h2>
//             {filteredDoctorConsultations.length > 0 ? (
//               <ul>
//                 {filteredDoctorConsultations.map((cons) => (
//                   <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
//                     <p>
//                       <span className="font-medium">Patient:</span> {cons.patientName}
//                     </p>
//                     <p>
//                       <span className="font-medium">Age:</span> {cons.age}
//                     </p>
//                     <p>
//                       <span className="font-medium">Gender:</span> {cons.gender}
//                     </p>
//                     <p>
//                       <span className="font-medium">Start Date:</span> {cons.startDate} at {cons.startTime}
//                     </p>
//                     <p>
//                       <span className="font-medium">End Date:</span> {cons.endDate} at {cons.endTime}
//                     </p>
//                     {cons.summary && (
//                       <p>
//                         <span className="font-medium">Summary:</span> {cons.summary}
//                       </p>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No consultation records found.</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div>
//           {/* Date range inputs */}
//           <div className="mb-4">
//             <label className="mr-2">From:</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="border border-gray-300 px-2 py-1 rounded"
//             />
//             <label className="ml-4 mr-2">To:</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="border border-gray-300 px-2 py-1 rounded"
//             />
//           </div>
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-2xl font-semibold mb-4">Consultation History</h2>
//             {filteredPatientConsultations.length > 0 ? (
//               <ul>
//                 {filteredPatientConsultations.map((cons) => (
//                   <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
//                     <p>
//                       <span className="font-medium">Doctor:</span> {cons.doctorName}
//                     </p>
//                     {/* If you want to display doctor's age/gender, uncomment below */}
//                     {/* 
//                     <p>
//                       <span className="font-medium">Age:</span> {cons.doctorAge}
//                     </p>
//                     <p>
//                       <span className="font-medium">Gender:</span> {cons.doctorGender}
//                     </p>
//                     */}
//                     <p>
//                       <span className="font-medium">Start Date:</span> {cons.startDate} at {cons.startTime}
//                     </p>
//                     <p>
//                       <span className="font-medium">End Date:</span> {cons.endDate} at {cons.endTime}
//                     </p>
//                     {cons.summary && (
//                       <p>
//                         <span className="font-medium">Summary:</span> {cons.summary}
//                       </p>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No consultation records found for the selected dates.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default History;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function History({ role }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // States to hold enriched consultation data
  const [doctorConsultations, setDoctorConsultations] = useState([]);
  const [patientConsultations, setPatientConsultations] = useState([]);

  // Utility to ensure we have an array from the response.
  const getArrayData = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.consultations)) return data.consultations;
    return [];
  };

  /********************************************************************
   *  DOCTOR VIEW
   ********************************************************************/
  useEffect(() => {
    async function fetchDoctorConsultations() {
      try {
        // 1. Fetch all consultations for the doctor
        const consultationRes = await axios.get(
          'https://53ee-129-137-96-16.ngrok-free.app/consultations/doctor/1',
          {
            headers: {
              Accept: 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        const consultations = getArrayData(consultationRes.data);

        // 2. For each consultation, fetch patient details using the patient_id
        const enrichedConsultations = await Promise.all(
          consultations.map(async (consultation) => {
            const patientId = consultation.patient_id; 
            let patientName = `Patient ID: ${patientId}`;
            let patientAge = 'N/A';
            let patientGender = 'N/A';

            try {
              if (patientId) {
                const patientRes = await axios.get(
                  `https://53ee-129-137-96-16.ngrok-free.app/patients/${patientId}`,
                  {
                    headers: {
                      Accept: 'application/json',
                      'ngrok-skip-browser-warning': 'true',
                    },
                  }
                );
                const patientData = patientRes.data;
                // Adjust these lines if your API returns different field names:
                patientName = patientData.name || patientName;
                patientAge = patientData.age || 'N/A';
                patientGender = patientData.gender || 'N/A';
              }
            } catch (error) {
              console.error(
                `Error fetching patient data for consultation ${consultation.consultation_id}:`,
                error
              );
            }

            return {
              id: consultation.consultation_id,
              fileId: consultation.file_id ?? 'N/A',
              startDate: new Date(consultation.start_time).toLocaleDateString(),
              startTime: new Date(consultation.start_time).toLocaleTimeString(),
              endDate: consultation.end_time
                ? new Date(consultation.end_time).toLocaleDateString()
                : 'N/A',
              endTime: consultation.end_time
                ? new Date(consultation.end_time).toLocaleTimeString()
                : 'N/A',
              patientName,
              age: patientAge,
              gender: patientGender,
              summary: consultation.summary || '',
            };
          })
        );

        setDoctorConsultations(enrichedConsultations);
      } catch (error) {
        console.error("Error fetching doctor's consultations:", error);
      }
    }

    if (role === 'doctor') {
      fetchDoctorConsultations();
    }
  }, [role]);

  /********************************************************************
   *  PATIENT VIEW
   ********************************************************************/
  /************************************************************
 *  PATIENT VIEW
 ************************************************************/
useEffect(() => {
  async function fetchPatientConsultations() {
    try {
      // 1. Fetch all consultations for the patient
      const consultationRes = await axios.get(
        'https://53ee-129-137-96-16.ngrok-free.app/consultations/patient/1',
        {
          headers: {
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      const consultations = getArrayData(consultationRes.data);

      // 2. For each consultation, fetch the doctor details using doctor_id
      const enrichedConsultations = await Promise.all(
        consultations.map(async (consultation) => {
          const doctorId = consultation.doctor_id;
          let doctorName = `Doctor ID: ${doctorId}`;
          let doctorAge = 'N/A';
          let doctorGender = 'N/A';

          try {
            if (doctorId) {
              const doctorRes = await axios.get(
                `https://53ee-129-137-96-16.ngrok-free.app/doctors/${doctorId}`,
                {
                  headers: {
                    Accept: 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                  },
                }
              );

              // Log to see what exactly the API returns:
              console.log("Doctor data for ID", doctorId, ":", doctorRes.data);

              const doctorData = doctorRes.data;

              // If the API returns an array, handle that:
              if (Array.isArray(doctorData) && doctorData.length > 0) {
                // If the array item has a "name" or "doctor_name" field:
                doctorName =
                  doctorData[0].name ||
                  doctorData[0].doctor_name ||
                  doctorName;
                doctorAge = doctorData[0].age || 'N/A';
                doctorGender = doctorData[0].gender || 'N/A';
              } else if (doctorData && typeof doctorData === 'object') {
                // If the API returns a single object:
                doctorName =
                  doctorData.name ||
                  doctorData.doctor_name ||
                  doctorName;
                doctorAge = doctorData.age || 'N/A';
                doctorGender = doctorData.gender || 'N/A';
              }
            }
          } catch (error) {
            console.error(
              `Error fetching doctor data for consultation ${consultation.consultation_id}:`,
              error
            );
          }

          return {
            id: consultation.consultation_id,
            fileId: consultation.file_id ?? 'N/A',
            startDate: new Date(consultation.start_time).toLocaleDateString(),
            startTime: new Date(consultation.start_time).toLocaleTimeString(),
            endDate: consultation.end_time
              ? new Date(consultation.end_time).toLocaleDateString()
              : 'N/A',
            endTime: consultation.end_time
              ? new Date(consultation.end_time).toLocaleTimeString()
              : 'N/A',
            doctorName,
            doctorAge,
            doctorGender,
            summary: consultation.summary || '',
          };
        })
      );

      setPatientConsultations(enrichedConsultations);
    } catch (error) {
      console.error("Error fetching patient's consultations:", error);
    }
  }

  if (role === 'patient') {
    fetchPatientConsultations();
  }
}, [role]);


  /********************************************************************
   *  FILTERING
   ********************************************************************/

  // Doctor: filter by patient name
  const filteredDoctorConsultations = doctorConsultations.filter((cons) =>
    cons.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Patient: filter by date range (comparing the startDate string).
  // NOTE: If you need accurate comparisons, store ISO dates and compare as Date objects.
  const filteredPatientConsultations = patientConsultations.filter((cons) => {
    return (!fromDate || cons.startDate >= fromDate) && (!toDate || cons.startDate <= toDate);
  });

  /********************************************************************
   *  RENDER
   ********************************************************************/

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        {role === 'doctor' ? 'Doctor History' : 'Patient History'}
      </h1>

      {role === 'doctor' ? (
        <div>
          {/* Search input for patient name */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient records..."
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          />
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Patient Consultation Records</h2>
            {filteredDoctorConsultations.length > 0 ? (
              <ul>
                {filteredDoctorConsultations.map((cons) => (
                  <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
                    <p>
                      <span className="font-medium">Patient:</span> {cons.patientName}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span> {cons.age}
                    </p>
                    <p>
                      <span className="font-medium">Gender:</span> {cons.gender}
                    </p>
                    <p>
                      <span className="font-medium">File ID:</span> {cons.fileId}
                    </p>
                    <p>
                      <span className="font-medium">Start Date:</span> {cons.startDate} at {cons.startTime}
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span> {cons.endDate} at {cons.endTime}
                    </p>
                    {cons.summary && (
                      <p>
                        <span className="font-medium">Summary:</span> {cons.summary}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No consultation records found.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Date range inputs */}
          <div className="mb-4">
            <label className="mr-2">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
            <label className="ml-4 mr-2">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Consultation History</h2>
            {filteredPatientConsultations.length > 0 ? (
              <ul>
                {filteredPatientConsultations.map((cons) => (
                  <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
                    <p>
                      <span className="font-medium">Doctor:</span> {cons.doctorName}
                    </p>
                    {/* If you want to display doctor's age/gender, uncomment below:
                    <p>
                      <span className="font-medium">Age:</span> {cons.doctorAge}
                    </p>
                    <p>
                      <span className="font-medium">Gender:</span> {cons.doctorGender}
                    </p>
                    */}
                    <p>
                      <span className="font-medium">File ID:</span> {cons.fileId}
                    </p>
                    <p>
                      <span className="font-medium">Start Date:</span> {cons.startDate} at {cons.startTime}
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span> {cons.endDate} at {cons.endTime}
                    </p>
                    {cons.summary && (
                      <p>
                        <span className="font-medium">Summary:</span> {cons.summary}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No consultation records found for the selected dates.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
