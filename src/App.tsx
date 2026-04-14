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
import AcademicClubs from "./pages/student/AcademicClubs";

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
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
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

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
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
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/events"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/events/:eventId"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/registrations"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentRegistrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/support"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/academic-clubs"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <AcademicClubs />
                </ProtectedRoute>
              }
            />

          {/* Coordinator Routes */}
          <Route path="/coordinator" element={<ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorDashboard /></ProtectedRoute>} />
          <Route path="/coordinator/events" element={<ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorEvents /></ProtectedRoute>} />
          <Route path="/coordinator/scan" element={<ProtectedRoute allowedRoles={["coordinator"]}><ScanAttendance /></ProtectedRoute>} />
          <Route path="/coordinator/manual" element={<ProtectedRoute allowedRoles={["coordinator"]}><ManualEntry /></ProtectedRoute>} />
          <Route path="/coordinator/events/:eventId/registrations" element={<ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorEventRegistrations /></ProtectedRoute>} />
          <Route path="/coordinator/reports" element={<ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorReports /></ProtectedRoute>} />

          {/* Convenor Routes */}
          <Route path="/convenor" element={<ProtectedRoute allowedRoles={["convenor"]}><ConvenorDashboard /></ProtectedRoute>} />
          <Route path="/convenor/create" element={<ProtectedRoute allowedRoles={["convenor"]}><CreateEvent /></ProtectedRoute>} />
          <Route path="/convenor/events" element={<ProtectedRoute allowedRoles={["convenor"]}><ConvenorEvents /></ProtectedRoute>} />
          <Route path="/convenor/analytics" element={<ProtectedRoute allowedRoles={["convenor"]}><ConvenorAnalytics /></ProtectedRoute>} />
          <Route path="/convenor/events/:eventId/registrations" element={<ProtectedRoute allowedRoles={["convenor"]}><ConvenorEventRegistrations /></ProtectedRoute>} />
          <Route path="/convenor/events/:eventId/close" element={<ProtectedRoute allowedRoles={["convenor"]}><ConvenorCloseEvent /></ProtectedRoute>} />

          {/* Club Routes */}
          <Route path="/club" element={<ProtectedRoute allowedRoles={["club"]}><ClubDashboard /></ProtectedRoute>} />
          <Route path="/club/create" element={<ProtectedRoute allowedRoles={["club"]}><CreateEvent /></ProtectedRoute>} />
          <Route path="/club/profile" element={<ProtectedRoute allowedRoles={["club"]}><ClubProfile /></ProtectedRoute>} />
          <Route path="/club/members" element={<ProtectedRoute allowedRoles={["club"]}><ClubMembers /></ProtectedRoute>} />
          <Route path="/club/events" element={<ProtectedRoute allowedRoles={["club"]}><ClubEvents /></ProtectedRoute>} />
          <Route path="/club/members/import" element={<ProtectedRoute allowedRoles={["club"]}><ClubMemberImport /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute allowedRoles={["admin"]}><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDepartments /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAuditLogs /></ProtectedRoute>} />
          <Route path="/admin/system-settings" element={<ProtectedRoute allowedRoles={["admin"]}><SystemSettings /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
