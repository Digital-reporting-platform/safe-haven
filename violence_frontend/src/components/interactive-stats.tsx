import { useState } from 'react';
import { TrendingUp, Users, Globe2, Award } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';

interface Stat {
  icon: any;
  value: number;
  suffix: string;
  label: string;
  description: string;
  color: string;
}

export function InteractiveStats() {
  const [activeStat, setActiveStat] = useState<number>(0);

  const stats: Stat[] = [
    {
      icon: Users,
      value: 250000,
      suffix: '+',
      label: 'Cases Resolved',
      description: 'Successfully handled incidents with 98% satisfaction rate',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Globe2,
      value: 150,
      suffix: '+',
      label: 'Countries Served',
      description: 'Global presence ensuring help is always accessible',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Award,
      value: 98,
      suffix: '%',
      label: 'Success Rate',
      description: 'Verified positive outcomes and sustained recovery',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: TrendingUp,
      value: 15,
      suffix: 'min',
      label: 'Avg Response',
      description: 'Fastest crisis response time in the industry',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`group relative cursor-pointer transition-all duration-300 ${
            activeStat === index ? 'scale-105' : 'hover:scale-102'
          }`}
          onMouseEnter={() => setActiveStat(index)}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
          />

          <div className="relative rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-300 group-hover:border-blue-300 group-hover:shadow-xl">
            <div
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} mb-4`}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </div>

            <div
              className="mb-2 text-4xl text-slate-900"
              style={{ fontWeight: 700 }}
            >
              <AnimatedCounter end={stat.value} suffix={stat.suffix} />
            </div>

            <div
              className="mb-1 text-sm text-slate-900"
              style={{ fontWeight: 600 }}
            >
              {stat.label}
            </div>

            <div
              className={`text-xs text-slate-500 transition-all duration-300 ${
                activeStat === index
                  ? 'max-h-20 opacity-100'
                  : 'max-h-0 overflow-hidden opacity-0'
              }`}
            >
              {stat.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
