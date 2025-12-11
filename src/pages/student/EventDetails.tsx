import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  CheckCircle,
  Building2,
  Mail,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockEvents, mockRegistrations, mockUser } from '@/data/mockData';
import { toast } from 'sonner';
import { EventCategory } from '@/types';

const categoryConfig: Record<EventCategory, { label: string; variant: 'student' | 'coordinator' | 'convenor' | 'admin' | 'club' }> = {
  workshop: { label: 'Workshop', variant: 'student' },
  cultural: { label: 'Cultural', variant: 'club' },
  sports: { label: 'Sports', variant: 'coordinator' },
  academic: { label: 'Academic', variant: 'convenor' },
  club: { label: 'Club Event', variant: 'club' },
  seminar: { label: 'Seminar', variant: 'admin' },
};

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const [isRegistering, setIsRegistering] = useState(false);

  const event = mockEvents.find((e) => e.id === eventId);
  const isRegistered = mockRegistrations.some((r) => r.eventId === eventId);

  if (!event) {
    return (
      <DashboardLayout role="student" userName={mockUser.name}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Button asChild>
            <Link to="/student/events">Back to Events</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const categoryInfo = categoryConfig[event.category];
  const seatsAvailable = event.totalSeats ? event.totalSeats - event.registeredCount : null;
  const registrationPercentage = event.totalSeats
    ? (event.registeredCount / event.totalSeats) * 100
    : 0;

  const handleRegister = async () => {
    setIsRegistering(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Successfully registered for the event!');
    setIsRegistering(false);
  };

  return (
    <DashboardLayout role="student" userName={mockUser.name}>
      <div className="space-y-6 max-w-4xl">
        {/* Back Button */}
        <Link
          to="/student/events"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            {/* Banner */}
            <div className="h-48 md:h-64 bg-gradient-hero relative">
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge variant={categoryInfo.variant} className="mb-3">
                  {categoryInfo.label}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  {event.title}
                </h1>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Event Meta */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <p className="font-medium">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Organizer</p>
                    <p className="font-medium">{event.organizer}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-2">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>

              {/* Seats Progress */}
              {event.totalSeats && (
                <div className="mb-6 p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Seat Availability</span>
                    </div>
                    <span className="text-sm">
                      {event.registeredCount} / {event.totalSeats} registered
                    </span>
                  </div>
                  <Progress value={registrationPercentage} className="h-2" />
                  {seatsAvailable !== null && seatsAvailable < 20 && (
                    <p className="text-sm text-destructive mt-2">
                      Only {seatsAvailable} seats left!
                    </p>
                  )}
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{event.convenorEmail}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {isRegistered ? (
                  <Button variant="student" disabled className="flex-1 sm:flex-none">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Registered
                  </Button>
                ) : (
                  <Button
                    variant="student"
                    size="lg"
                    onClick={handleRegister}
                    disabled={isRegistering || (seatsAvailable !== null && seatsAvailable === 0)}
                    className="flex-1 sm:flex-none"
                  >
                    {isRegistering ? 'Registering...' : 'Register Now'}
                  </Button>
                )}
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
