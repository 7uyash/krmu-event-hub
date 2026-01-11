import { useState, useEffect } from 'react';
import { QrCode, Users, CheckCircle, Clock, WifiOff, Wifi, Download, FileSpreadsheet } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QRCodeDisplay } from '@/components/events/QRCodeDisplay';
import { api } from '@/lib/api';
import { exportToExcel, exportToCSV, formatAttendanceData } from '@/lib/export';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function CoordinatorDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, use first event. In production, coordinators should see their assigned events
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const eventsResponse = await api.events.getAll({ status: 'upcoming' });
        if (eventsResponse.events && eventsResponse.events.length > 0) {
          const firstEvent = eventsResponse.events[0];
          setEvent(firstEvent);
          
          // Fetch registrations
          const regResponse = await api.eventsAdmin.getEventRegistrations(firstEvent._id || firstEvent.id);
          setRegistrations(regResponse.registrations || []);
        }
      } catch (error: any) {
        toast.error('Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, []);

  const registered = event?.registeredCount || 0;
  const present = registrations.filter((r) => r.attendanceStatus === 'present').length;
  const absent = registered - present;
  const attendanceRate = registered > 0 ? Math.round((present / registered) * 100) : 0;

  const handleExportExcel = () => {
    if (registrations.length === 0) {
      toast.error('No data to export');
      return;
    }
    const formatted = formatAttendanceData(registrations);
    exportToExcel(formatted, `${event?.title || 'event'}-attendance`);
    toast.success('Excel file downloaded');
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast.error('No data to export');
      return;
    }
    const formatted = formatAttendanceData(registrations);
    exportToCSV(formatted, `${event?.title || 'event'}-attendance`);
    toast.success('CSV file downloaded');
  };

  if (isLoading) {
    return (
      <DashboardLayout role="coordinator" userName="Event Coordinator">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout role="coordinator" userName="Event Coordinator">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No events assigned</h2>
          <p className="text-muted-foreground">You don't have any events to coordinate at the moment.</p>
        </div>
      </DashboardLayout>
    );
  }

  const eventId = (event._id || event.id)?.toString();

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
              <div className="text-coordinator-foreground flex-1">
                <p className="text-sm opacity-90">Currently Managing</p>
                <h2 className="text-xl font-bold">{event.title}</h2>
                <p className="text-sm opacity-90">{event.venue} • {event.time}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-coordinator-foreground"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-coordinator-foreground"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
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

        {/* QR Code & Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <QRCodeDisplay eventId={eventId} eventTitle={event.title} />
          </div>
          
          <div className="space-y-4">
            <Card variant="interactive" className="overflow-hidden">
              <Link to={`/coordinator/scan?eventId=${eventId}`}>
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
              <Link to={`/coordinator/manual?eventId=${eventId}`}>
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
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Last 5 attendance marked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrations
                .filter((r) => r.attendanceStatus === 'present')
                .slice(0, 5)
                .map((reg) => {
                  const student = reg.userId || reg.user;
                  const markedAt = reg.markedAt ? new Date(reg.markedAt) : null;
                  return (
                    <div
                      key={reg._id || reg.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-coordinator" />
                        <div>
                          <p className="font-medium">{student?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{student?.rollNumber || 'N/A'}</p>
                        </div>
                      </div>
                      {markedAt && (
                        <span className="text-sm text-muted-foreground">
                          {markedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              {registrations.filter((r) => r.attendanceStatus === 'present').length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No attendance marked yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
