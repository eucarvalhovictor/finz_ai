
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlySummary } from '../../types';

interface MonthlySummaryChartProps {
  data: MonthlySummary[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background p-4 rounded-xl border border-border">
                <p className="font-bold text-text-primary">{label}</p>
                <p className="text-green-400">{`Receita: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}`}</p>
                <p className="text-red-400">{`Despesa: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[1].value)}`}</p>
            </div>
        );
    }

    return null;
};

const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({ data }) => {
  // Protect against rendering if data is empty or undefined, which can cause Recharts size issues
  if (!data) {
      return (
        <div className="bg-card p-6 rounded-2xl border border-border h-96 flex items-center justify-center">
             <p className="text-text-secondary">Carregando dados...</p>
        </div>
      )
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border h-96">
      <h3 className="text-xl font-bold text-text-primary mb-6">Resumo Mensal</h3>
      <div className="w-full h-[90%] min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$${value / 1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(163, 230, 53, 0.1)' }}/>
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            <Bar dataKey="income" fill="#22c55e" name="Receitas" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlySummaryChart;
