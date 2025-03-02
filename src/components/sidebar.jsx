import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({role}) {
  return (
    <div className="bg-blue-800 text-white w-56 p-6">
      <h2 className="text-3xl font-bold mb-6">Menu</h2>
      <nav className="flex flex-col space-y-4 text-xl">
        <NavLink
          to="/home"
          end
          className={({ isActive }) =>
            isActive ? "text-yellow-400" : "hover:underline"
          }
        >
          Homepage
        </NavLink>
        <NavLink
          to="/talk"
          className={({ isActive }) =>
            isActive ? "text-yellow-400" : "hover:underline"
          }
        >
          Talk to {role === 'patient'?'Physician':'Patient'}
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? "text-yellow-400" : "hover:underline"
          }
        >
          History
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
