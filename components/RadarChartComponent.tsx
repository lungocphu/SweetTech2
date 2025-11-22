import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { RadarData } from '../types';

interface Props {
  data: RadarData[];
}

export const RadarChartComponent: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-[300px] bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-center font-semibold text-gray-700 mb-2">Sensory Profile</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Product"
            dataKey="A"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.6}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#db2777', fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
