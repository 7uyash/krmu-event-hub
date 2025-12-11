import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'student' | 'coordinator' | 'convenor' | 'admin';
}

const variantConfig = {
  default: 'bg-primary/10 text-primary',
  student: 'bg-student/10 text-student',
  coordinator: 'bg-coordinator/10 text-coordinator',
  convenor: 'bg-convenor/10 text-convenor',
  admin: 'bg-admin/20 text-admin-foreground',
};

export function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
              {trend && (
                <p className={cn('text-sm mt-1', trend.isPositive ? 'text-coordinator' : 'text-destructive')}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
                </p>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', variantConfig[variant])}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
