
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiDataPoint, EntryType } from '../types';

interface KpiPieChartProps {
  data: KpiDataPoint[];
}

const COLORS: Record<EntryType, string> = {
    [EntryType.OUTPUT]: '#003366', // usace-blue
    [EntryType.OUTTAKE]: '#D42127', // usace-red
    [EntryType.OUTCOME]: '#7195b9', // navy-400
};

const KpiPieChart: React.FC<KpiPieChartProps> = ({ data }) => {
  const typeCounts = data.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<EntryType, number>);

  const chartData = Object.entries(typeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as EntryType]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KpiPieChart;
