import { Calendar, Users, BarChart3, Plus, Upload } from 'lucide-react';
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

export default function ClubDashboard() {
  const [club, setClub] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [profileRes, eventsRes] = await Promise.all([
          api.club.getProfile(),
          api.eventsAdmin.getMyEvents(),
        ]);
        setClub(profileRes.club);
        const mapped = (eventsRes.events || []).map((e: any) => ({
          ...e,
          id: e._id?.toString() || e.id,
        }));
        setEvents(mapped);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const clubEvents = useMemo(() => events.filter((e) => !!e.isClubOnly), [events]);
  const totalRegistrations = useMemo(
    () => clubEvents.reduce((acc: number, e: any) => acc + (e.registeredCount || 0), 0),
    [clubEvents]
  );
  const avgAttendanceRate = useMemo(() => {
    const totalReg = clubEvents.reduce((acc: number, e: any) => acc + (e.registeredCount || 0), 0);
    const totalAtt = clubEvents.reduce((acc: number, e: any) => acc + (e.attendedCount || 0), 0);
    if (!totalReg) return 0;
    return Math.round((totalAtt / totalReg) * 100);
  }, [clubEvents]);

  return (
    <DashboardLayout role="club" userName={club?.name || 'Club'}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{club?.name || 'Club'}</h1>
            <p className="text-muted-foreground">{club?.description || 'Club management overview'}</p>
          </div>
          <Button variant="club" asChild>
            <Link to="/club/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Club Members"
            value={club?.memberCount ?? '—'}
            icon={<Users className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Club Events"
            value={isLoading ? '—' : clubEvents.length}
            icon={<Calendar className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Total Registrations"
            value={isLoading ? '—' : totalRegistrations}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Avg. Attendance"
            value={isLoading ? '—' : `${avgAttendanceRate}%`}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="coordinator"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/club/create">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Club Event
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/club/members">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/club/profile">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Club Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/club/members/import">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Members
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Member Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Member List</CardTitle>
                <CardDescription>Update your club membership</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/club/members/import" className="block">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload CSV with roll numbers
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Club Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Club Events</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/club/events">View All</Link>
              </Button>
            </div>

            {clubEvents.length > 0 ? (
              <div className="space-y-4">
                {clubEvents.map((event: any) => (
                  <Card key={event._id || event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-club/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-8 w-8 text-club" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">{event.venue}</p>
                            </div>
                            <Badge variant={event.status === 'upcoming' ? 'club' : 'secondary'}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              {new Date(event.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })} at {event.time}
                            </span>
                            <span className="text-muted-foreground">
                              {(event.registeredCount || 0)} / {event.totalSeats ?? '∞'} registered
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{isLoading ? 'Loading…' : 'No Events Yet'}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isLoading ? 'Fetching your events…' : 'Create your first club event to get started'}
                  </p>
                  <Button variant="club" asChild>
                    <Link to="/club/create">Create Event</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
