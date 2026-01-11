import { Calendar, CheckCircle, ClipboardList, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { EventCard } from '@/components/events/EventCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockEvents, mockRegistrations } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const upcomingEvents = mockEvents.filter((e) => e.status === 'upcoming').slice(0, 3);
  const registeredEvents = mockRegistrations.length;
  const attendedEvents = mockRegistrations.filter((r) => r.attendanceStatus === 'present').length;

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your events and participation</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Upcoming Events"
            value={upcomingEvents.length}
            icon={<Calendar className="h-6 w-6" />}
            variant="student"
          />
          <StatCard
            title="Registered Events"
            value={registeredEvents}
            icon={<ClipboardList className="h-6 w-6" />}
            variant="student"
          />
          <StatCard
            title="Events Attended"
            value={attendedEvents}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Participation Rate"
            value={`${registeredEvents > 0 ? Math.round((attendedEvents / registeredEvents) * 100) : 0}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
            variant="convenor"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recommended Events</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/events">View All</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={mockRegistrations.some((r) => r.eventId === event.id)}
                />
              ))}
            </div>
          </div>

          {/* My Registrations Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Registrations</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/registrations">View All</Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                {mockRegistrations.slice(0, 4).map((reg) => {
                  const event = mockEvents.find((e) => e.id === reg.eventId);
                  if (!event) return null;
                  return (
                    <div
                      key={reg.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          reg.attendanceStatus === 'present'
                            ? 'success'
                            : reg.attendanceStatus === 'absent'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {reg.attendanceStatus}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/student/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Events
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/student/attendance">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View Attendance
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
