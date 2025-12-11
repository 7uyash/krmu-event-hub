import { useState } from 'react';
import { QrCode, Users, CheckCircle, Clock, WifiOff, Wifi } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockEvents } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function CoordinatorDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const event = mockEvents[0]; // Current event being coordinated

  const registered = event.registeredCount;
  const present = event.attendedCount || 0;
  const absent = registered - present;
  const attendanceRate = registered > 0 ? Math.round((present / registered) * 100) : 0;

  return (
    <DashboardLayout role="coordinator" userName="Event Coordinator">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
            <p className="text-muted-foreground">Mark attendance for your assigned event</p>
          </div>
          <Badge
            variant={isOnline ? 'success' : 'warning'}
            className="flex items-center gap-1"
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Current Event */}
        <Card variant="coordinator" className="overflow-hidden">
          <div className="h-24 bg-gradient-coordinator relative">
            <div className="absolute inset-0 flex items-center px-6">
              <div className="text-coordinator-foreground">
                <p className="text-sm opacity-90">Currently Managing</p>
                <h2 className="text-xl font-bold">{event.title}</h2>
                <p className="text-sm opacity-90">{event.venue} • {event.time}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registered"
            value={registered}
            icon={<Users className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Present"
            value={present}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="coordinator"
          />
          <StatCard
            title="Remaining"
            value={absent}
            icon={<Clock className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={<QrCode className="h-6 w-6" />}
            variant="coordinator"
          />
        </div>

        {/* Attendance Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Progress</CardTitle>
            <CardDescription>Real-time attendance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Present: {present}</span>
                <span>Registered: {registered}</span>
              </div>
              <Progress value={attendanceRate} className="h-4" />
              <p className="text-sm text-muted-foreground text-center">
                {attendanceRate}% attendance recorded
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card variant="interactive" className="overflow-hidden">
            <Link to="/coordinator/scan">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-coordinator flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-coordinator-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">QR/Barcode Scanner</h3>
                    <p className="text-sm text-muted-foreground">
                      Scan student ID cards to mark attendance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card variant="interactive" className="overflow-hidden">
            <Link to="/coordinator/manual">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Manual Entry</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter roll number manually or upload photo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Last 5 attendance marked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { roll: '2023001', name: 'Rahul Sharma', time: '10:05 AM' },
                { roll: '2023045', name: 'Priya Patel', time: '10:04 AM' },
                { roll: '2023078', name: 'Amit Kumar', time: '10:03 AM' },
                { roll: '2023102', name: 'Sneha Gupta', time: '10:02 AM' },
                { roll: '2023156', name: 'Vikram Singh', time: '10:01 AM' },
              ].map((entry) => (
                <div
                  key={entry.roll}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-coordinator" />
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.roll}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
