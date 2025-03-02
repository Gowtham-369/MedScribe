// Layout.jsx
import React from 'react';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-gray-100">
      {children}
    </div>
  );
}

export default Layout;
