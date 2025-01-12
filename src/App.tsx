import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import TabBar from './components/TabBar';
import Games from './pages/Games';
import Downloads from './pages/Downloads';
import Devices from './pages/Devices';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TabBar />
          <div style={{ display: 'flex', flex: 1, overflow: 'auto', flexDirection: 'column' }}>
            <Outlet />
          </div>
        </div>
        }>
          <Route path="/" element={<Navigate to="/games" replace />} />
          <Route path="/games/:id?" element={<Games />} index={true} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;