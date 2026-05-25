import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import Home from './pages/Dashboard/Home';
import Leads from './pages/Leads/Leads';
import AddLead from './pages/Leads/AddLead';
import EditLead from './pages/Leads/EditLead';
import UserProfiles from './pages/UserProfiles';
import ViewLead from './pages/Leads/ViewLead';
import Users from './pages/Users/Users';
import AddUser from './pages/Users/AddUser';
import EditUser from './pages/Users/EditUser';

function ProtectedRoutes() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route element={<ProtectedRoutes />}>
              <Route index path="/" element={<Home />} />
              <Route index path="/dashboard" element={<Home />} />
              <Route index path="/leads" element={<Leads />} />
              <Route index path="/add-lead" element={<AddLead />} />
              <Route index path="/edit-lead/:id" element={<EditLead />} />
              <Route index path="/profile" element={<UserProfiles />} />
              <Route index path="/view-lead/:id" element={<ViewLead />} />
              <Route index path="/users" element={<Users />} />
              <Route index path="/add-user" element={<AddUser />} />
              <Route index path="/edit-user/:id" element={<EditUser />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route index path="/" element={<SignIn />} />
        </Routes>
      </Router>
    </>
  );
}
