import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number; // e.g. +14.2%
  changePeriod?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changePeriod = 'vs previous snapshot',
  subtitle,
  icon,
  className,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900/50 border border-neutral-200/70 dark:border-neutral-800/70 rounded-2xl p-5 shadow-2xs hover:border-neutral-300/80 dark:hover:border-neutral-700/80 transition-all duration-200 flex flex-col justify-between backdrop-blur-xs',
        className
      )}
    >
      <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{label}</span>
        {icon && <div className="text-neutral-400 dark:text-neutral-500">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{value}</span>
      </div>

      {(change !== undefined || subtitle) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded text-[11px]',
                isPositive && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
                isNegative && 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
                !isPositive && !isNegative && 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          )}
          <span className="text-neutral-400 dark:text-neutral-500 truncate">{subtitle || changePeriod}</span>
        </div>
      )}
    </div>
  );
};
