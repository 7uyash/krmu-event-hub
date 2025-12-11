import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ClipboardCheck,
  Users,
  Building2,
  Shield,
  Calendar,
  BarChart3,
  QrCode,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroBg from '@/assets/hero-bg.jpg';

const features = [
  {
    icon: Calendar,
    title: 'Event Management',
    description: 'Create, manage, and track university events with ease.',
  },
  {
    icon: QrCode,
    title: 'Quick Attendance',
    description: 'Mark attendance via QR scan or manual entry in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Get instant insights on event participation and trends.',
  },
  {
    icon: CheckCircle,
    title: 'Automated Reports',
    description: 'Generate and export attendance reports automatically.',
  },
];

const roleCards = [
  {
    role: 'student',
    icon: GraduationCap,
    title: 'Student',
    description: 'Browse events, register, and track your participation',
    gradient: 'bg-gradient-student',
    link: '/auth/student',
  },
  {
    role: 'coordinator',
    icon: ClipboardCheck,
    title: 'Coordinator',
    description: 'Mark attendance using QR scan or manual entry',
    gradient: 'bg-gradient-coordinator',
    link: '/auth/coordinator',
  },
  {
    role: 'convenor',
    icon: Users,
    title: 'Convenor',
    description: 'Create events and manage registrations',
    gradient: 'bg-gradient-convenor',
    link: '/auth/convenor',
  },
  {
    role: 'club',
    icon: Building2,
    title: 'Club Admin',
    description: 'Manage club events and member activities',
    gradient: 'bg-club',
    link: '/auth/club',
  },
  {
    role: 'admin',
    icon: Shield,
    title: 'Super Admin',
    description: 'University-wide oversight and analytics',
    gradient: 'bg-gradient-admin',
    link: '/auth/admin',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6">
              E-Attend
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 max-w-2xl mx-auto">
              University Event & Attendance Management Platform
            </p>
            <p className="text-lg text-primary-foreground/70 mb-8">
              K. R. Mangalam University
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="secondary" asChild>
                <a href="#login">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A comprehensive platform designed for seamless event management and attendance tracking
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Role
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select your role to access the platform
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {roleCards.map((card, index) => (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={card.link}>
                  <Card
                    variant="interactive"
                    className="h-full group overflow-hidden"
                  >
                    <div className={`h-24 ${card.gradient} flex items-center justify-center`}>
                      <card.icon className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <CardContent className="p-5 text-center">
                      <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 group-hover:bg-accent"
                      >
                        Login <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">E-Attend</h3>
          <p className="text-background/70 mb-6">K. R. Mangalam University</p>
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} E-Attend. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
