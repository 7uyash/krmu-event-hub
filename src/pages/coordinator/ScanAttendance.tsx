import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, ArrowLeft, Volume2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function ScanAttendance() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<{ roll: string; name: string; status: 'success' | 'error' } | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scan
    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        const student = { roll: '2023' + Math.floor(Math.random() * 200).toString().padStart(3, '0'), name: 'Student Name' };
        setLastScanned({ ...student, status: 'success' });
        toast.success(`Attendance marked for ${student.roll}`);
      } else {
        setLastScanned({ roll: 'N/A', name: 'Unknown', status: 'error' });
        toast.error('Student not registered for this event');
      }
      setIsScanning(false);
    }, 1500);
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

        {/* Scanner Card */}
        <Card variant="coordinator" className="overflow-hidden">
          <CardHeader className="bg-gradient-coordinator text-coordinator-foreground">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR / Barcode Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Camera Viewfinder */}
            <div className="relative aspect-video bg-foreground/5 rounded-xl overflow-hidden mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                {isScanning ? (
                  <motion.div
                    className="w-48 h-48 border-2 border-coordinator rounded-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <div className="w-full h-1 bg-coordinator animate-pulse absolute top-1/2" />
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera viewfinder</p>
                    <p className="text-sm text-muted-foreground">Position barcode in the frame</p>
                  </div>
                )}
              </div>

              {/* Scan Frame Corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-coordinator" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-coordinator" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-coordinator" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-coordinator" />
            </div>

            {/* Scan Button */}
            <Button
              variant="coordinator"
              size="xl"
              className="w-full"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <QrCode className="h-5 w-5" />
                  </motion.div>
                  Scanning...
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  Start Scanning
                </>
              )}
            </Button>

            {/* Last Scanned Result */}
            <AnimatePresence>
              {lastScanned && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-6 p-4 rounded-xl flex items-center gap-4 ${
                    lastScanned.status === 'success'
                      ? 'bg-coordinator/10 border border-coordinator/30'
                      : 'bg-destructive/10 border border-destructive/30'
                  }`}
                >
                  {lastScanned.status === 'success' ? (
                    <CheckCircle className="h-10 w-10 text-coordinator" />
                  ) : (
                    <XCircle className="h-10 w-10 text-destructive" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {lastScanned.status === 'success' ? 'Attendance Marked!' : 'Not Found'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Roll: {lastScanned.roll}
                    </p>
                  </div>
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Position the student's ID card barcode within the frame</p>
            <p>2. Hold steady until the scan completes</p>
            <p>3. Wait for confirmation sound and visual feedback</p>
            <p>4. For issues, use Manual Entry mode</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
