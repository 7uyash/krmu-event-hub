import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, GraduationCap, ClipboardCheck, Users, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const roleConfig: Record<string, { label: string; icon: typeof GraduationCap; gradient: string; emailHint: string; redirectPath: string }> = {
  student: {
    label: 'Student',
    icon: GraduationCap,
    gradient: 'bg-gradient-student',
    emailHint: 'rollnumber@krmu.edu.in',
    redirectPath: '/student',
  },
  coordinator: {
    label: 'Coordinator',
    icon: ClipboardCheck,
    gradient: 'bg-gradient-coordinator',
    emailHint: 'coordinator.eventid@krmu.edu.in',
    redirectPath: '/coordinator',
  },
  convenor: {
    label: 'Convenor',
    icon: Users,
    gradient: 'bg-gradient-convenor',
    emailHint: 'convenor@krmu.edu.in',
    redirectPath: '/convenor',
  },
  club: {
    label: 'Club Admin',
    icon: Building2,
    gradient: 'bg-club',
    emailHint: 'club.admin@krmu.edu.in',
    redirectPath: '/club',
  },
  admin: {
    label: 'Super Admin',
    icon: Shield,
    gradient: 'bg-gradient-admin',
    emailHint: 'admin@krmu.edu.in',
    redirectPath: '/admin',
  },
};

export default function AuthPage() {
  const { role = 'student' } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
    navigate(config.redirectPath);
    setIsLoading(false);
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
                {isLogin ? 'Welcome back' : 'Create account'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Enter your credentials to access your account'
                  : 'Fill in your details to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={config.emailHint}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
