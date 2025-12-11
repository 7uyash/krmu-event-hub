import { Calendar, Users, BarChart3, Building2, TrendingUp, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockEvents, mockDashboardStats, departmentStats } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(222, 59%, 28%)', 'hsl(175, 84%, 32%)', 'hsl(262, 83%, 58%)', 'hsl(43, 96%, 56%)', 'hsl(340, 82%, 52%)'];

const categoryData = [
  { name: 'Workshop', value: 35 },
  { name: 'Cultural', value: 25 },
  { name: 'Sports', value: 20 },
  { name: 'Academic', value: 15 },
  { name: 'Club', value: 5 },
];

export default function AdminDashboard() {
  const recentEvents = mockEvents.slice(0, 5);

  return (
    <DashboardLayout role="admin" userName="Super Admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">University Overview</h1>
          <p className="text-muted-foreground">K. R. Mangalam University - Event Analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={mockDashboardStats.totalEvents}
            icon={<Calendar className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
            variant="admin"
          />
          <StatCard
            title="Total Registrations"
            value={mockDashboardStats.totalRegistrations.toLocaleString()}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
            variant="admin"
          />
          <StatCard
            title="Total Attendance"
            value={mockDashboardStats.totalAttendance.toLocaleString()}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Upcoming Events"
            value={mockDashboardStats.upcomingEvents}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="convenor"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Department-wise Events */}
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Events</CardTitle>
              <CardDescription>Events organized by each department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="events" fill="hsl(222, 59%, 28%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Event Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Event Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events & Department Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Events</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/events">View All</Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.organizer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={event.status === 'upcoming' ? 'admin' : 'secondary'}>
                          {event.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.registeredCount} registered
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Department Performance</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <span className="text-sm text-muted-foreground">{dept.attendance}</span>
                    </div>
                    <Progress value={(dept.attendance / 900) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/admin/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Events
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
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
