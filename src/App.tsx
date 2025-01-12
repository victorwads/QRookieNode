import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TabBar from './components/TabBar';
import Games from './pages/Games';
import Downloads from './pages/Downloads';
import Devices from './pages/Devices';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TabBar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Games />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;