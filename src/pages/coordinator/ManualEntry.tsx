import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, ArrowLeft, Upload, Camera } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function ManualEntry() {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  const [rollNumber, setRollNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [result, setResult] = useState<{ found: boolean; name?: string; roll?: string; student?: any } | null>(null);

  const handleSearch = async () => {
    if (!rollNumber.trim()) {
      toast.error('Please enter a roll number');
      return;
    }

    if (!eventId) {
      toast.error('Please select an event');
      return;
    }

    setIsSearching(true);
    setResult(null);

    try {
      const response = await api.eventsAdmin.searchStudent(eventId, rollNumber);
      setResult({ 
        found: true, 
        name: response.student.name, 
        roll: response.student.rollNumber,
        student: response.student,
      });
    } catch (error: any) {
      setResult({ found: false });
      if (error.message.includes('not found')) {
        toast.error('Student not found');
      } else if (error.message.includes('not registered')) {
        toast.error('Student not registered for this event');
      } else {
        toast.error(error.message || 'Failed to search student');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!eventId || !result?.student) return;

    setIsMarking(true);
    try {
      await api.eventsAdmin.markAttendance(eventId, {
        rollNumber: result.roll!,
        status: 'present',
      });
      toast.success(`Attendance marked for ${result.name} (${result.roll})`);
      setRollNumber('');
      setResult(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <DashboardLayout role="coordinator" userName="Event Coordinator">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          to="/coordinator"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Manual Entry Card */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Attendance Entry</CardTitle>
            <CardDescription>Enter roll number or upload ID card photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!eventId && (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please select an event from the coordinator dashboard first.
                </p>
              </div>
            )}
            
            {/* Roll Number Input */}
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <div className="flex gap-2">
                <Input
                  id="rollNumber"
                  placeholder="Enter roll number (e.g., 2023001)"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={!eventId}
                />
                <Button onClick={handleSearch} disabled={isSearching || !eventId}>
                  {isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Search className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Search Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl ${
                  result.found
                    ? 'bg-coordinator/10 border border-coordinator/30'
                    : 'bg-destructive/10 border border-destructive/30'
                }`}
              >
                {result.found ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-coordinator" />
                      <div>
                        <p className="font-semibold">{result.name}</p>
                        <p className="text-sm text-muted-foreground">Roll: {result.roll}</p>
                        <p className="text-xs text-coordinator">Registered for this event</p>
                      </div>
                    </div>
                    <Button 
                      variant="coordinator" 
                      onClick={handleMarkAttendance}
                      disabled={isMarking}
                    >
                      {isMarking ? 'Marking...' : 'Mark Present'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="font-semibold">Student Not Found</p>
                      <p className="text-sm text-muted-foreground">
                        Not registered for this event or invalid roll number
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* OCR Upload */}
            <div className="space-y-2">
              <Label>Upload ID Card Photo (OCR)</Label>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span>Upload Image</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Camera className="h-6 w-6" />
                  <span>Take Photo</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload or capture a photo of the student's ID card. OCR will extract the roll number automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Manual Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Manual Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { roll: '2023089', name: 'Ananya Verma', time: '10:15 AM' },
                { roll: '2023124', name: 'Rohit Mehra', time: '10:12 AM' },
                { roll: '2023067', name: 'Kavya Sharma', time: '10:08 AM' },
              ].map((entry) => (
                <div
                  key={entry.roll}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">{entry.roll}</p>
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
