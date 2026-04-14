export type UserRole = 'student' | 'coordinator' | 'convenor' | 'club' | 'admin';

export type EventCategory = 'workshop' | 'cultural' | 'sports' | 'academic' | 'club' | 'seminar';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type AttendanceStatus = 'present' | 'absent' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  school?: string;
  department?: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: EventCategory;
  poster?: string;
  organizer: string;
  organizerDepartment?: string;
  convenorEmail: string;
  coordinatorEmail?: string;
  totalSeats?: number;
  registeredCount: number;
  attendedCount?: number;
  status: EventStatus;
  isOpen: boolean;
  isClubOnly?: boolean;
  clubId?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  attendanceStatus: AttendanceStatus;
  markedAt?: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  memberCount: number;
  adminEmail: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  upcomingEvents: number;
}
