import { Navigate, Outlet, Route, HashRouter as Router, Routes } from "react-router-dom";
import "./App.css";

import TabBar from "@components/TabBar";
import Devices from "@pages/Devices";
import Games from "@pages/Games";
import Library from "@pages/Library";
import Settings from "@pages/Settings";
import Users from "@pages/Users";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
              <TabBar />
              <div style={{ display: "flex", overflow: "auto", flexDirection: "column" }}>
                <Outlet />
              </div>
            </div>
          }
        >
          <Route path="/" element={<Navigate to="/games" replace />} />
          <Route path="/games/:id?" element={<Games />} index={true} />
          <Route path="/downloads" element={<Library />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
