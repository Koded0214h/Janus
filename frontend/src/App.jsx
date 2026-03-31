import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Policies from "./pages/Policies.jsx";
import SecurityCenter from "./pages/SecurityCenter.jsx";
import Activity from "./pages/Activity.jsx";
import ZKPassport from "./pages/ZKPassport.jsx";
import Settings from "./pages/Settings.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/security" element={<SecurityCenter />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/zkpassport" element={<ZKPassport />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;