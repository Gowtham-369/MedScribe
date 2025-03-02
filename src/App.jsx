import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Signup from './components/Signup';
import Login from './components/Login';
import Homepage from './pages/Homepage';
import TalkToPhysician from './pages/TalkToPhysician';
import History from './pages/History';
import { Navigate } from 'react-router-dom';

function App() {
  const [role, setRole] = useState('patient'); // Manage role globally
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar role={role}/>
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            {/* Default route: redirect to Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Authentication Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route path="/home" element={<Homepage role={role} setRole={setRole}/>} />
            <Route path="/talk" element={<TalkToPhysician role={role}/>} />
            <Route path="/history" element={<History role={role}/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
