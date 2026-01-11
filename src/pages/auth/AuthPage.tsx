import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, ClipboardCheck, Users, Building2, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const roleConfig: Record<string, { label: string; icon: typeof GraduationCap; gradient: string; redirectPath: string }> = {
  student: {
    label: 'Student',
    icon: GraduationCap,
    gradient: 'bg-gradient-student',
    redirectPath: '/student',
  },
  coordinator: {
    label: 'Coordinator',
    icon: ClipboardCheck,
    gradient: 'bg-gradient-coordinator',
    redirectPath: '/coordinator',
  },
  convenor: {
    label: 'Convenor',
    icon: Users,
    gradient: 'bg-gradient-convenor',
    redirectPath: '/convenor',
  },
  club: {
    label: 'Club Admin',
    icon: Building2,
    gradient: 'bg-club',
    redirectPath: '/club',
  },
  admin: {
    label: 'Super Admin',
    icon: Shield,
    gradient: 'bg-gradient-admin',
    redirectPath: '/admin',
  },
};

export default function AuthPage() {
  const { role = 'student' } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithMicrosoft } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;

  // Handle Microsoft OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      toast.error(errorDescription || 'Authentication failed');
      // Remove error params from URL
      navigate(window.location.pathname, { replace: true });
      return;
    }

    if (code) {
      handleMicrosoftCallback(code);
    }
  }, [searchParams]);

  const handleMicrosoftCallback = async (code: string) => {
    setIsLoading(true);
    try {
      await loginWithMicrosoft(code);
      toast.success('Logged in successfully!');
      navigate(config.redirectPath);
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
      // Remove code from URL
      navigate(window.location.pathname, { replace: true });
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.auth.getMicrosoftAuthUrl();
      // Redirect to Microsoft login
      window.location.href = response.authUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className={cn('hidden lg:flex lg:w-1/2 relative', config.gradient)}>
        <div className="absolute inset-0 bg-foreground/10" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-8">
              <Icon className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">E-Attend</h1>
            <p className="text-xl text-primary-foreground/90 mb-2">{config.label} Portal</p>
            <p className="text-primary-foreground/70">K. R. Mangalam University</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card variant="elevated">
            <CardHeader className="space-y-1 pb-4">
              <div className="lg:hidden flex items-center gap-3 mb-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.gradient)}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">{config.label}</CardTitle>
                  <CardDescription>E-Attend Portal</CardDescription>
                </div>
              </div>
              <CardTitle className="text-2xl hidden lg:block">
                Welcome to E-Attend
              </CardTitle>
              <CardDescription>
                Sign in with your K. R. Mangalam University Microsoft account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Use your @krmu.edu.in email address to sign in
                  </p>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={handleMicrosoftLogin}
                  disabled={isLoading}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  {isLoading ? 'Redirecting...' : 'Sign in with Microsoft'}
                </Button>

                <div className="text-center text-xs text-muted-foreground space-y-1">
                  <p>Only @krmu.edu.in email addresses are allowed</p>
                  <p>Your account will be automatically created on first login</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
