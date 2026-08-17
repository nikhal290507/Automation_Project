import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import ConnectApps from './pages/ConnectApps';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import CalendarPage from './pages/Calendar';
import Automations from './pages/Automations';
import Focus from './pages/Focus';
import Tasks from './pages/Tasks';
import ActivityPage from './pages/ActivityPage';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/role" element={<RoleSelect />} />
          <Route path="/connect" element={<ConnectApps />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
