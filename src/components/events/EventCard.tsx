import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event, EventCategory } from '@/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  showRegisterButton?: boolean;
  isRegistered?: boolean;
}

const categoryConfig: Record<EventCategory, { label: string; variant: 'student' | 'coordinator' | 'convenor' | 'admin' | 'club' }> = {
  workshop: { label: 'Workshop', variant: 'student' },
  cultural: { label: 'Cultural', variant: 'club' },
  sports: { label: 'Sports', variant: 'coordinator' },
  academic: { label: 'Academic', variant: 'convenor' },
  club: { label: 'Club Event', variant: 'club' },
  seminar: { label: 'Seminar', variant: 'admin' },
};

export function EventCard({ event, showRegisterButton = true, isRegistered = false }: EventCardProps) {
  const categoryInfo = categoryConfig[event.category];
  const seatsAvailable = event.totalSeats ? event.totalSeats - event.registeredCount : null;
  const isAlmostFull = seatsAvailable !== null && seatsAvailable < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card variant="interactive" className="overflow-hidden h-full flex flex-col">
        {/* Event Image/Gradient Header */}
        <div
          className={cn(
            'h-32 relative',
            event.poster ? '' : 'bg-gradient-hero'
          )}
          style={event.poster ? { backgroundImage: `url(${event.poster})`, backgroundSize: 'cover' } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>
            {event.isClubOnly && (
              <Badge variant="outline" className="ml-2 bg-card/80 text-foreground">
                Members Only
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{event.venue}</span>
            </div>
            {seatsAvailable !== null && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className={isAlmostFull ? 'text-destructive font-medium' : ''}>
                  {seatsAvailable} seats left
                </span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{event.organizer}</span>
            {showRegisterButton && (
              isRegistered ? (
                <Badge variant="success">Registered</Badge>
              ) : (
                <Button size="sm" asChild>
                  <Link to={`/student/events/${event.id}`}>
                    View <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
