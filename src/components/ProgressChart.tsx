
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface ProgressChartProps {
  data: { day: string; completed: number }[];
  title?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, title = "Weekly Progress" }) => {
  // Customize the tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-2 px-3 text-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-bettr-blue font-semibold">{`${payload[0].value} habits completed`}</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <motion.div 
      className="glass-card p-5 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 0,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="completed" 
              fill="url(#barGradient)" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E5CFF" />
                <stop offset="100%" stopColor="#8F5CFF" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ProgressChart;
