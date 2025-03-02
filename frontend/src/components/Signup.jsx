// src/pages/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Signup() {
  // Role can be 'patient' or 'doctor'
  const [role, setRole] = useState('patient');

  // Form fields for both roles
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Additional fields for patient
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Additional fields for doctor
  const [doctorName, setDoctorName] = useState('');
  const [hospital, setHospital] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (role === 'patient') {
        // Build patient payload
        const payload = {
          age: Number(age), // ensure numeric
          email,
          gender,
          name: patientName,
          password,
        };

        const response = await axios.post(
          'https://53ee-129-137-96-16.ngrok-free.app/patients',
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('Patient signup success:', response.data);
        setSuccess('Patient account created successfully! Please log in.');
      } else {
        // For doctor, we use doctor_name, email, password, hospital.
        // active is default 1 and category is default "Physician"
        const payload = {
          active: 1,
          category: "Physician",
          doctor_name: doctorName,
          email,
          hospital,
          password,
        };

        const response = await axios.post(
          'https://53ee-129-137-96-16.ngrok-free.app/doctors',
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('Doctor signup success:', response.data);
        setSuccess('Doctor account created successfully! Please log in.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">MedScribe</h1>

      {/* Role Toggle */}
      <div className="flex mb-6">
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

      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-80">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        {/* Common Fields: Email & Password */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Patient Fields */}
        {role === 'patient' && (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Age</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Gender</label>
              <select
                className="w-full p-2 border rounded"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </>
        )}

        {/* Doctor Fields */}
        {role === 'doctor' && (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Doctor Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Hospital</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}

export default Signup;
