import { Calendar, Users, BarChart3, Plus, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Event } from '@/types';
import { toast } from 'sonner';

export default function ConvenorDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.eventsAdmin.getMyEvents();
        const mapped = (res.events || []).map((e: any) => ({
          ...e,
          id: e._id?.toString() || e.id,
        }));
        setEvents(mapped);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load your events');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const myEvents = useMemo(() => events.slice(0, 4), [events]);
  const totalRegistrations = useMemo(
    () => events.reduce((acc: number, e: any) => acc + (e.registeredCount || 0), 0),
    [events]
  );
  const totalAttendance = useMemo(
    () => events.reduce((acc: number, e: any) => acc + (e.attendedCount || 0), 0),
    [events]
  );
  const avgAttendanceRate = useMemo(() => {
    const denom = totalRegistrations || 0;
    if (denom === 0) return 0;
    return Math.round((totalAttendance / denom) * 100);
  }, [totalAttendance, totalRegistrations]);

  const firstEventId = (events[0] as any)?._id?.toString() || events[0]?.id;

  return (
    <DashboardLayout role="convenor" userName="Dr. Sharma">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Convenor Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and track participation</p>
          </div>
          <Button variant="convenor" asChild>
            <Link to="/convenor/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Events"
            value={isLoading ? '—' : myEvents.length}
            icon={<Calendar className="h-6 w-6" />}
            variant="convenor"
          />
          <StatCard
            title="Total Registrations"
            value={isLoading ? '—' : totalRegistrations}
            icon={<Users className="h-6 w-6" />}
            variant="convenor"
          />
          <StatCard
            title="Total Attendance"
            value={isLoading ? '—' : totalAttendance}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Avg. Attendance Rate"
            value={isLoading ? '—' : `${avgAttendanceRate}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 5, isPositive: true }}
            variant="convenor"
          />
        </div>

        {/* Quick Actions & Recent Events */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/convenor/create">
                  <Calendar className="h-4 w-4 mr-2" />
                  Create New Event
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/convenor/events">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Events
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/convenor/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={firstEventId ? `/convenor/events/${firstEventId}/registrations` : '/convenor/events'}>
                  <Users className="h-4 w-4 mr-2" />
                  Event Registrations
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={firstEventId ? `/convenor/events/${firstEventId}/close` : '/convenor/events'}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Finalize Event
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* My Events List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Events</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/convenor/events">View All</Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {myEvents.map((event: any) => (
                <Card key={event.id} variant="convenor">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={event.status === 'upcoming' ? 'convenor' : 'secondary'}>
                        {event.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-1">{event.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        <Users className="h-4 w-4 inline mr-1" />
                        {event.registeredCount || 0} registered
                      </span>
                      {event.attendedCount !== undefined && (
                        <span className="text-coordinator">
                          {event.attendedCount || 0} attended
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/convenor/events/${(event._id || event.id)?.toString()}/registrations`}>Registrations</Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/convenor/events/${(event._id || event.id)?.toString()}/close`}>Finalize</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!isLoading && myEvents.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No events yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first event to start tracking registrations and attendance.
                    </p>
                    <Button variant="convenor" asChild>
                      <Link to="/convenor/create">Create Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
