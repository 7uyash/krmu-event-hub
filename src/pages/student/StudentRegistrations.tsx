import { Calendar, Clock, MapPin, Download, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockEvents, mockRegistrations } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function StudentRegistrations() {
  const registrationsWithEvents = mockRegistrations.map((reg) => ({
    ...reg,
    event: mockEvents.find((e) => e.id === reg.eventId),
  })).filter((r) => r.event);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Registrations</h1>
            <p className="text-muted-foreground">Track all your event registrations</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-student/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-student" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrationsWithEvents.length}</p>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-coordinator/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-coordinator" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {registrationsWithEvents.filter((r) => r.attendanceStatus === 'present').length}
                </p>
                <p className="text-sm text-muted-foreground">Attended</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-admin/20 flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-admin-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {registrationsWithEvents.filter((r) => r.attendanceStatus === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationsWithEvents.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div className="font-medium">{reg.event?.title}</div>
                        <div className="text-sm text-muted-foreground">{reg.event?.organizer}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(reg.event!.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {reg.event?.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{reg.event?.venue}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(reg.registeredAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            reg.attendanceStatus === 'present'
                              ? 'success'
                              : reg.attendanceStatus === 'absent'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {reg.attendanceStatus === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {reg.attendanceStatus === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                          {reg.attendanceStatus === 'pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                          {reg.attendanceStatus.charAt(0).toUpperCase() + reg.attendanceStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/student/events/${reg.eventId}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
