import React, { useEffect, useState } from 'react';

function History({ role }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
  
    // Dummy Data
    const doctorConsultations = [
      { id: 1, patient: 'Alice Smith', date: '2025-01-15', summary: 'Follow-up on migraine.' },
      { id: 2, patient: 'Bob Johnson', date: '2025-02-20', summary: 'Annual checkup.' },
      { id: 3, patient: 'Charlie Brown', date: '2025-03-05', summary: 'Blood test analysis.' },
    ];
  
    const patientConsultations = [
      { id: 1, date: '2025-01-10', summary: 'Routine checkup' },
      { id: 2, date: '2025-02-15', summary: 'Blood pressure follow-up' },
      { id: 3, date: '2025-03-20', summary: 'Diabetes test review' },
    ];
  
    // Filtering for Doctor (search by patient name)
    const filteredDoctorConsultations = doctorConsultations.filter(cons =>
      cons.patient.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    // Filtering for Patient (filter by date range)
    const filteredPatientConsultations = patientConsultations.filter(cons =>
      (!fromDate || cons.date >= fromDate) && (!toDate || cons.date <= toDate)
    );
  
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{role === 'doctor' ? 'Doctor History' : 'Patient History'}</h1>
  
        {role === 'doctor' ? (
          // Doctor Interface: Search for Patient Reports
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient records..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-4">Patient Consultation Records</h2>
              <ul>
                {filteredDoctorConsultations.map(cons => (
                  <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
                    <p><span className="font-medium">Patient:</span> {cons.patient}</p>
                    <p><span className="font-medium">Date:</span> {cons.date}</p>
                    <p><span className="font-medium">Summary:</span> {cons.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          // Patient Interface: Date Filter for Previous Consultations
          <div>
            <div className="mb-4">
              <label className="mr-2">From:</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-gray-300 px-2 py-1 rounded" />
              
              <label className="ml-4 mr-2">To:</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-gray-300 px-2 py-1 rounded" />
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-4">Consultation History</h2>
              <ul>
                {filteredPatientConsultations.map(cons => (
                  <li key={cons.id} className="mb-2 border-b border-gray-200 pb-2">
                    <p><span className="font-medium">Date:</span> {cons.date}</p>
                    <p><span className="font-medium">Summary:</span> {cons.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default History;
