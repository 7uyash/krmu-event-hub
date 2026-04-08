import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import AuthPage from "./pages/auth/AuthPage";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentEvents from "./pages/student/StudentEvents";
import EventDetails from "./pages/student/EventDetails";
import StudentRegistrations from "./pages/student/StudentRegistrations";
import StudentAttendance from "./pages/student/StudentAttendance";
import Profile from "./pages/student/Profile";
import StudentNotifications from "./pages/student/Notifications";
import StudentSettings from "./pages/student/Settings";
import StudentSupport from "./pages/student/Support";

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorEvents from "./pages/coordinator/CoordinatorEvents";
import ScanAttendance from "./pages/coordinator/ScanAttendance";
import ManualEntry from "./pages/coordinator/ManualEntry";
import CoordinatorEventRegistrations from "./pages/coordinator/EventRegistrations";
import CoordinatorReports from "./pages/coordinator/CoordinatorReports";

// Convenor Pages
import ConvenorDashboard from "./pages/convenor/ConvenorDashboard";
import CreateEvent from "./pages/convenor/CreateEvent";
import ConvenorEvents from "./pages/convenor/ConvenorEvents";
import ConvenorAnalytics from "./pages/convenor/ConvenorAnalytics";
import ConvenorEventRegistrations from "./pages/convenor/ConvenorEventRegistrations";
import ConvenorCloseEvent from "./pages/convenor/ConvenorCloseEvent";

// Club Pages
import ClubDashboard from "./pages/club/ClubDashboard";
import ClubProfile from "./pages/club/ClubProfile";
import ClubMembers from "./pages/club/ClubMembers";
import ClubEvents from "./pages/club/ClubEvents";
import ClubMemberImport from "./pages/club/ClubMemberImport";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAuditLogs from "./pages/admin/AuditLogs";
import SystemSettings from "./pages/admin/SystemSettings";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/student" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/:role" element={<AuthPage />} />

            {/* Student Routes - Protected */}
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/events"
              element={
                <ProtectedRoute>
                  <StudentEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/events/:eventId"
              element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/registrations"
              element={
                <ProtectedRoute>
                  <StudentRegistrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute>
                  <StudentNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute>
                  <StudentSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/support"
              element={
                <ProtectedRoute>
                  <StudentSupport />
                </ProtectedRoute>
              }
            />

          {/* Coordinator Routes */}
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
          <Route path="/coordinator/events" element={<CoordinatorEvents />} />
          <Route path="/coordinator/scan" element={<ScanAttendance />} />
          <Route path="/coordinator/manual" element={<ManualEntry />} />
          <Route path="/coordinator/events/:eventId/registrations" element={<CoordinatorEventRegistrations />} />
          <Route path="/coordinator/reports" element={<CoordinatorReports />} />

          {/* Convenor Routes */}
          <Route path="/convenor" element={<ConvenorDashboard />} />
          <Route path="/convenor/create" element={<CreateEvent />} />
          <Route path="/convenor/events" element={<ConvenorEvents />} />
          <Route path="/convenor/analytics" element={<ConvenorAnalytics />} />
          <Route path="/convenor/events/:eventId/registrations" element={<ConvenorEventRegistrations />} />
          <Route path="/convenor/events/:eventId/close" element={<ConvenorCloseEvent />} />

          {/* Club Routes */}
          <Route path="/club" element={<ClubDashboard />} />
          <Route path="/club/create" element={<CreateEvent />} />
          <Route path="/club/profile" element={<ClubProfile />} />
          <Route path="/club/members" element={<ClubMembers />} />
          <Route path="/club/events" element={<ClubEvents />} />
          <Route path="/club/members/import" element={<ClubMemberImport />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/system-settings" element={<SystemSettings />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
