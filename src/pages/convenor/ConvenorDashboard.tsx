import { Calendar, Users, BarChart3, Plus, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockEvents, mockDashboardStats } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function ConvenorDashboard() {
  const myEvents = mockEvents.filter((e) => e.convenorEmail === 'cs.convenor@krmu.edu.in' || e.convenorEmail === 'cultural@krmu.edu.in').slice(0, 4);

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
            value={myEvents.length}
            icon={<Calendar className="h-6 w-6" />}
            variant="convenor"
          />
          <StatCard
            title="Total Registrations"
            value={myEvents.reduce((acc, e) => acc + e.registeredCount, 0)}
            icon={<Users className="h-6 w-6" />}
            variant="convenor"
          />
          <StatCard
            title="Total Attendance"
            value={myEvents.reduce((acc, e) => acc + (e.attendedCount || 0), 0)}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Avg. Attendance Rate"
            value="87%"
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
              {myEvents.map((event) => (
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
                        {event.registeredCount} registered
                      </span>
                      {event.attendedCount !== undefined && (
                        <span className="text-coordinator">
                          {event.attendedCount} attended
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
