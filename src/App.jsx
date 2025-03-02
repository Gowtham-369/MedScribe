import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Homepage from './pages/Homepage';
import TalkToPhysician from './pages/TalkToPhysician';
import History from './pages/History';

function App() {
  const [role, setRole] = useState('patient'); // Manage role globally
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar role={role}/>
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Homepage role={role} setRole={setRole}/>} />
            <Route path="/talk" element={<TalkToPhysician role={role}/>} />
            <Route path="/history" element={<History role={role}/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
