// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // default role is patient
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    // Determine URL based on role
    const url =
      role === 'patient'
        ? 'https://53ee-129-137-96-16.ngrok-free.app/patients/login'
        : 'https://53ee-129-137-96-16.ngrok-free.app/doctors/login';

    try {
      const response = await axios.post(
        url,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Login successful:', response.data);
      // Handle login success (e.g., store token and redirect)
      navigate("/home");
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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

      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {/* Email */}
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
        {/* Password */}
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Log In
        </button>
      </form>

      <p className="mt-4">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Create an Account
        </Link>
      </p>
    </div>
  );
}

export default Login;
