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

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import ScanAttendance from "./pages/coordinator/ScanAttendance";
import ManualEntry from "./pages/coordinator/ManualEntry";

// Convenor Pages
import ConvenorDashboard from "./pages/convenor/ConvenorDashboard";
import CreateEvent from "./pages/convenor/CreateEvent";

// Club Pages
import ClubDashboard from "./pages/club/ClubDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

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

          {/* Coordinator Routes */}
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
          <Route path="/coordinator/scan" element={<ScanAttendance />} />
          <Route path="/coordinator/manual" element={<ManualEntry />} />

          {/* Convenor Routes */}
          <Route path="/convenor" element={<ConvenorDashboard />} />
          <Route path="/convenor/create" element={<CreateEvent />} />
          <Route path="/convenor/events" element={<ConvenorDashboard />} />
          <Route path="/convenor/analytics" element={<ConvenorDashboard />} />

          {/* Club Routes */}
          <Route path="/club" element={<ClubDashboard />} />
          <Route path="/club/create" element={<CreateEvent />} />
          <Route path="/club/members" element={<ClubDashboard />} />
          <Route path="/club/events" element={<ClubDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/departments" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminDashboard />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
