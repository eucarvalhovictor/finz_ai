import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../types';

interface PaymentMethodChartProps {
  transactions: Transaction[];
}

const COLORS = ['#40ff00', '#00C49F', '#FFBB28']; // Brand primary, green, yellow

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background p-4 rounded-xl border border-border">
                <p className="font-bold text-text-primary">{label}</p>
                <p className="text-text-secondary">{`${payload[0].name}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ transactions }) => {
  const data = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    const method = t.payment_method || 'Dinheiro'; // Default if not specified
    acc[method] = (acc[method] || 0) + t.amount;
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.keys(data).map(key => ({
    name: key,
    value: data[key],
  }));

  if (chartData.every(item => item.value === 0)) {
      return (
          <div className="bg-card p-6 rounded-2xl border border-border h-96 flex items-center justify-center">
              <p className="text-text-secondary text-center">Nenhum gasto registrado para métodos de pagamento.</p>
          </div>
      );
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border h-full min-h-[300px]">
      <h3 className="text-xl font-bold text-text-primary mb-6">Gastos por Meio de Pagamento</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentMethodChart;