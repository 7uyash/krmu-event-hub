import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ClipboardList, TrendingUp, Bell, Settings, HelpCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { EventCard } from '@/components/events/EventCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Event, Registration } from '@/types';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventsResponse, registrationsResponse] = await Promise.all([
          api.events.getAll({ status: 'upcoming' }),
          api.events.getUserRegistrations(),
        ]);
        
        // Map MongoDB _id to id for frontend compatibility
        const mappedEvents = (eventsResponse.events || []).map((event: any) => ({
          ...event,
          id: event._id?.toString() || event.id,
        }));
        setEvents(mappedEvents);
        
        // Map registrations
        const mappedRegistrations = (registrationsResponse.registrations || []).map((reg: any) => ({
          ...reg,
          id: reg._id?.toString() || reg.id,
          eventId: (reg.eventId?._id || reg.eventId?.id || reg.eventId)?.toString(),
        }));
        setRegistrations(mappedRegistrations);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const upcomingEvents = events.filter((e) => e.status === 'upcoming').slice(0, 3);
  const registeredEvents = registrations.length;
  const attendedEvents = registrations.filter((r) => r.attendanceStatus === 'present').length;

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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => {
                  const eventId = (event._id || event.id)?.toString();
                  return (
                    <EventCard
                      key={eventId}
                      event={event}
                      isRegistered={registrations.some((r) => 
                        (r.eventId as any)?._id?.toString() === eventId || 
                        r.eventId === eventId
                      )}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No upcoming events</h3>
                <p className="text-muted-foreground">Check back later for new events</p>
              </div>
            )}
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : registrations.length > 0 ? (
                  registrations.slice(0, 4).map((reg) => {
                    const event = reg.eventId as any;
                    if (!event) return null;
                    const eventId = (event._id || event.id || reg.eventId)?.toString();
                    return (
                      <div
                        key={reg.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title || 'Event'}</p>
                          {event.date && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          )}
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
                  })
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No registrations yet</p>
                  </div>
                )}
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
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/student/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/student/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/student/support">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Support
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
