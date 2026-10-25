import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Automations from "./pages/Automations";
import CreateAutomation from "./pages/CreateAutomation";
import AutomationDetails from "./pages/AutomationDetails";
import Templates from "./pages/Templates";
import AIAssistant from "./pages/AIAssistant";
import FocusMode from "./pages/FocusMode";
import ConnectedApps from "./pages/ConnectedApps";
import ActivityLog from "./pages/ActivityLog";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
      <Route path="/automations/new" element={<ProtectedRoute><CreateAutomation /></ProtectedRoute>} />
      <Route path="/automations/:id" element={<ProtectedRoute><AutomationDetails /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
      <Route path="/apps" element={<ProtectedRoute><ConnectedApps /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
