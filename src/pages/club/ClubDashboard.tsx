import { Calendar, Users, BarChart3, Plus, Upload } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockEvents, mockClubs } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function ClubDashboard() {
  const club = mockClubs[0]; // Coding Club
  const clubEvents = mockEvents.filter((e) => e.isClubOnly && e.clubId === club.id);

  return (
    <DashboardLayout role="club" userName={club.name}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{club.name}</h1>
            <p className="text-muted-foreground">{club.description}</p>
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
            value={club.memberCount}
            icon={<Users className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Club Events"
            value={clubEvents.length}
            icon={<Calendar className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Total Registrations"
            value={clubEvents.reduce((acc, e) => acc + e.registeredCount, 0)}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Avg. Attendance"
            value="92%"
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
              </CardContent>
            </Card>

            {/* Member Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Member List</CardTitle>
                <CardDescription>Update your club membership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload CSV with roll numbers
                  </p>
                </div>
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
                {clubEvents.map((event) => (
                  <Card key={event.id}>
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
                              {event.registeredCount} / {event.totalSeats} registered
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
                  <h3 className="font-semibold mb-2">No Events Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first club event to get started
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
