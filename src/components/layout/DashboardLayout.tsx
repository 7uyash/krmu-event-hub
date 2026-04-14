import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ClipboardList,
  QrCode,
  UserCircle,
  Building2,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
  userName?: string;
}

const roleConfig = {
  student: {
    headerBg: 'bg-student',
    headerText: 'text-student-foreground',
    accent: 'text-student',
    links: [
      { to: '/student', icon: Home, label: 'Dashboard' },
      { to: '/student/events', icon: Calendar, label: 'Events' },
      { to: '/student/registrations', icon: ClipboardList, label: 'My Registrations' },
      { to: '/student/attendance', icon: BarChart3, label: 'Attendance History' },
      { to: '/student/profile', icon: UserCircle, label: 'Profile' },
      { to: '/student/academic-clubs', icon: Building2, label: 'Academic & Clubs' },
    ],
  },
  coordinator: {
    headerBg: 'bg-coordinator',
    headerText: 'text-coordinator-foreground',
    accent: 'text-coordinator',
    links: [
      { to: '/coordinator', icon: Home, label: 'Dashboard' },
      { to: '/coordinator/events', icon: Calendar, label: 'My Events' },
      { to: '/coordinator/scan', icon: QrCode, label: 'Mark Attendance' },
      { to: '/coordinator/manual', icon: ClipboardList, label: 'Manual Entry' },
    ],
  },
  convenor: {
    headerBg: 'bg-convenor',
    headerText: 'text-convenor-foreground',
    accent: 'text-convenor',
    links: [
      { to: '/convenor', icon: Home, label: 'Dashboard' },
      { to: '/convenor/create', icon: Calendar, label: 'Create Event' },
      { to: '/convenor/events', icon: ClipboardList, label: 'My Events' },
      { to: '/convenor/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  club: {
    headerBg: 'bg-club',
    headerText: 'text-club-foreground',
    accent: 'text-club',
    links: [
      { to: '/club', icon: Home, label: 'Dashboard' },
      { to: '/club/create', icon: Calendar, label: 'Create Event' },
      { to: '/club/members', icon: Users, label: 'Members' },
      { to: '/club/events', icon: ClipboardList, label: 'Club Events' },
    ],
  },
  admin: {
    headerBg: 'bg-admin',
    headerText: 'text-admin-foreground',
    accent: 'text-primary',
    links: [
      { to: '/admin', icon: Home, label: 'Overview' },
      { to: '/admin/events', icon: Calendar, label: 'All Events' },
      { to: '/admin/users', icon: Users, label: 'Users' },
      { to: '/admin/departments', icon: Building2, label: 'Departments' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
};

const roleLabels: Record<UserRole, string> = {
  student: 'Student Portal',
  coordinator: 'Coordinator Portal',
  convenor: 'Convenor Portal',
  club: 'Club Admin',
  admin: 'Super Admin',
};

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const config = roleConfig[role];
  
  // Use authenticated user name if available, otherwise fallback to prop or default
  const displayName = userName || user?.name || (role === 'student' ? 'Student' : role === 'coordinator' ? 'Coordinator' : role === 'convenor' ? 'Convenor' : role === 'club' ? 'Club Admin' : 'Admin');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="font-bold text-lg">E-Attend</h1>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-card border-r shadow-xl transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn('h-20 flex items-center justify-between px-6', config.headerBg, config.headerText)}>
          <div>
            <h1 className="font-bold text-xl">E-Attend</h1>
            <p className="text-sm opacity-90">{roleLabels[role]}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn('lg:hidden hover:bg-black/10', config.headerText)}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', config.headerBg)}>
              <UserCircle className={cn('h-6 w-6', config.headerText)} />
            </div>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <Badge variant={role} className="mt-1">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {config.links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? `${config.headerBg} ${config.headerText} shadow-md`
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-20 px-8 border-b bg-card">
          <div>
            <h2 className="font-semibold text-lg">Welcome back, {displayName}!</h2>
            <p className="text-sm text-muted-foreground">K. R. Mangalam University</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
