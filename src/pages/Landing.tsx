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
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

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
    color: 'hsl(var(--student))',
    link: '/auth/student',
  },
  {
    role: 'coordinator',
    icon: ClipboardCheck,
    title: 'Coordinator',
    description: 'Mark attendance using QR scan or manual entry',
    color: 'hsl(var(--coordinator))',
    link: '/auth/coordinator',
  },
  {
    role: 'convenor',
    icon: Users,
    title: 'Convenor',
    description: 'Create events and manage registrations',
    color: 'hsl(var(--convenor))',
    link: '/auth/convenor',
  },
  {
    role: 'club',
    icon: Building2,
    title: 'Club Admin',
    description: 'Manage club events and member activities',
    color: 'hsl(var(--club))',
    link: '/auth/club',
  },
  {
    role: 'admin',
    icon: Shield,
    title: 'Super Admin',
    description: 'University-wide oversight and analytics',
    color: 'hsl(var(--admin))',
    link: '/auth/admin',
  },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold">E-Attend</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Get Started
              </a>
              <Button asChild>
                <Link to="/auth/student">Login</Link>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t"
            >
              <nav className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </a>
                <Button asChild className="w-full">
                  <Link to="/auth/student" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                </Button>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-foreground blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-foreground blur-3xl" />
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Visual Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-12 flex justify-center"
            >
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="h-16 w-16 md:h-20 md:w-20 text-primary" />
                </div>
                <motion.div
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div
                  className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold mb-8"
            >
              E-Attend
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light"
            >
              Event & Attendance Management Platform
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="xl" className="text-lg px-8 py-6" asChild>
                <a href="#login">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="xl" variant="outline" className="text-lg px-8 py-6" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full mt-2" />
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
              A comprehensive platform for seamless event management and attendance tracking
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
                <Card variant="elevated" className="h-full border">
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
              Get Started
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
                    className="h-full group overflow-hidden border hover:shadow-lg transition-shadow"
                  >
                    <div 
                      className="h-20 flex items-center justify-center"
                      style={{ backgroundColor: `${card.color}15` }}
                    >
                      <card.icon 
                        className="h-10 w-10 transition-transform group-hover:scale-110"
                        style={{ color: card.color }}
                      />
                    </div>
                    <CardContent className="p-5 text-center">
                      <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full group-hover:bg-accent"
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
      <footer className="bg-muted/50 py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">E-Attend</h3>
          <p className="text-muted-foreground mb-6">K. R. Mangalam University</p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} E-Attend. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
