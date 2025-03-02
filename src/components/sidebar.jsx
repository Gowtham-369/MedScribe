import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({role}) {
  return (
    <div className="bg-gray-800 text-white w-56 p-6">
      <h2 className="text-2xl font-bold mb-6">Menu</h2>
      <nav className="flex flex-col space-y-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "text-green-400" : "hover:underline"
          }
        >
          Homepage
        </NavLink>
        <NavLink
          to="/talk"
          className={({ isActive }) =>
            isActive ? "text-green-400" : "hover:underline"
          }
        >
          Talk to {role === 'patient'?'Physician':'Patient'}
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? "text-green-400" : "hover:underline"
          }
        >
          History
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
