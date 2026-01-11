import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Download, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { exportToCSV, formatAttendanceData } from '@/lib/export';
import { Registration, Event } from '@/types';
import { toast } from 'sonner';

interface AttendanceHistory extends Registration {
  event?: Event;
}

export default function StudentAttendance() {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const response = await api.events.getUserAttendance();
        const history = (response.registrations || []).map((reg: any) => ({
          id: reg._id || reg.id,
          eventId: (reg.eventId?._id || reg.eventId?.id || reg.eventId)?.toString(),
          userId: (reg.userId?._id || reg.userId?.id || reg.userId)?.toString(),
          registeredAt: reg.registeredAt,
          attendanceStatus: reg.attendanceStatus,
          markedAt: reg.markedAt,
          event: reg.eventId || reg.event,
        }));
        setAttendanceHistory(history.filter((r: any) => r.event));
      } catch (error: any) {
        console.error('Failed to fetch attendance:', error);
        toast.error('Failed to load attendance history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const completedEvents = attendanceHistory.filter((r) => r.attendanceStatus !== 'pending');
  const presentCount = completedEvents.filter((r) => r.attendanceStatus === 'present').length;
  const absentCount = completedEvents.filter((r) => r.attendanceStatus === 'absent').length;
  const attendanceRate = completedEvents.length > 0 
    ? Math.round((presentCount / completedEvents.length) * 100) 
    : 0;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attendance History</h1>
            <p className="text-muted-foreground">Track your event participation</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              if (attendanceHistory.length === 0) {
                toast.error('No attendance data to export');
                return;
              }
              const formatted = attendanceHistory.map((reg) => ({
                ...reg,
                userId: reg.event?.organizer || { name: 'N/A', rollNumber: 'N/A', email: 'N/A' },
                attendanceStatus: reg.attendanceStatus,
              }));
              exportToCSV(formatAttendanceData(formatted as any[]), 'my-attendance');
              toast.success('Attendance report downloaded');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="student">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <TrendingUp className="h-5 w-5 text-student" />
              </div>
              <p className="text-3xl font-bold mb-2">{attendanceRate}%</p>
              <Progress value={attendanceRate} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{completedEvents.length}</p>
              <p className="text-sm text-muted-foreground">Events participated</p>
            </CardContent>
          </Card>

          <Card variant="coordinator">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <CheckCircle className="h-5 w-5 text-coordinator" />
              </div>
              <p className="text-3xl font-bold">{presentCount}</p>
              <p className="text-sm text-muted-foreground">Events attended</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-3xl font-bold">{absentCount}</p>
              <p className="text-sm text-muted-foreground">Events missed</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Participation Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : attendanceHistory.length > 0 ? (
                attendanceHistory.map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.attendanceStatus === 'present'
                            ? 'bg-coordinator/10'
                            : 'bg-destructive/10'
                        }`}
                      >
                        {item.attendanceStatus === 'present' ? (
                          <CheckCircle className="h-5 w-5 text-coordinator" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      {index < attendanceHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-border flex-1 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.event?.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.event?.organizer}</p>
                        </div>
                        <Badge
                          variant={item.attendanceStatus === 'present' ? 'success' : 'destructive'}
                        >
                          {item.attendanceStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {item.event?.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.event.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        {item.markedAt && (
                          <span>
                            Marked at {new Date(item.markedAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No attendance history yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
