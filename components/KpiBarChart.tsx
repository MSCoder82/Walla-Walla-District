
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiDataPoint } from '../types';

interface KpiBarChartProps {
    data: KpiDataPoint[];
}

const KpiBarChart: React.FC<KpiBarChartProps> = ({ data }) => {
    const mediaMentionsData = data
        .filter(d => d.metric === 'Media pickups')
        .reduce((acc, current) => {
            const month = new Date(current.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!acc[month]) {
                acc[month] = 0;
            }
            acc[month] += current.quantity;
            return acc;
        }, {} as Record<string, number>);
    
    const chartData = Object.keys(mediaMentionsData).map(month => ({
        name: month,
        'Pickups': mediaMentionsData[month]
    })).sort((a, b) => new Date(`1 ${a.name}`).getTime() - new Date(`1 ${b.name}`).getTime());


    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Pickups" fill="#003366" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default KpiBarChart;
