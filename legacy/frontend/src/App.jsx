import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Policies from "./pages/Policies.jsx";
import SecurityCenter from "./pages/SecurityCenter.jsx";
import Activity from "./pages/Activity.jsx";
import ZKPassport from "./pages/ZKPassport.jsx";
import Settings from "./pages/Settings.jsx";
import AIAgent from "./pages/AIAgents.jsx";
import Support from "./pages/Support.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ModalProvider } from "./context/ModalContext";

function App() {
  return (
    <ModalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/security" element={<SecurityCenter />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/zk-passport" element={<ZKPassport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/agents" element={<AIAgent />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;