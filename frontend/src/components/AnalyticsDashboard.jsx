import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { TrendingUp, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9ca3af',
        font: { size: 10, weight: 'bold' },
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: '#111827',
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      displayColors: false
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280', font: { size: 10 } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#6b7280', font: { size: 10 } }
    }
  }
};

export function AnalyticsDashboard({ data = {}, type = 'system' }) {
  const {
    statusCounts = [],
    priorityCounts = [],
    deptCounts = [],
    staffPerformance = [],
    totalTickets = 0,
    resolvedRatePct = 0,
    slaCompliancePct = 0,
    slaBreached = 0
  } = data;

  const statusData = {
    labels: statusCounts.map(s => s._id || 'Unknown'),
    datasets: [{
      label: 'Tickets',
      data: statusCounts.map(s => s.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(168, 85, 247, 0.6)'
      ],
      borderColor: '#ffffff10',
      borderWidth: 1
    }]
  };

  const priorityData = {
    labels: priorityCounts.map(p => p._id || 'Unknown'),
    datasets: [{
      label: 'Volume',
      data: priorityCounts.map(p => p.count),
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(34, 197, 94, 0.7)'
      ],
      hoverOffset: 10
    }]
  };

  const deptData = {
    labels: type === 'system' ? deptCounts.map(d => d.name) : staffPerformance.map(s => s.name),
    datasets: [{
      label: type === 'system' ? 'Department Load' : 'Staff Output',
      data: type === 'system' ? deptCounts.map(d => d.count) : staffPerformance.map(s => s.count),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderRadius: 8
    }]
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: totalTickets, icon: TrendingUp, color: 'text-primary' },
          { label: 'Resolved rate', value: `${resolvedRatePct}%`, icon: CheckCircle2, color: 'text-success' },
          { label: 'SLA compliance', value: `${slaCompliancePct}%`, icon: Shield, color: 'text-blue-400' },
          { label: 'SLA breaches (open)', value: slaBreached, icon: AlertCircle, color: 'text-red-500' }
        ].map((stat, i) => (
          <div key={i} className="cc-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
            </div>
            <stat.icon className={stat.color} size={24} strokeWidth={2.5} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="cc-card p-8 min-h-[400px]">
          <h3 className="text-lg font-black text-white mb-8">Ticket Status Distribution</h3>
          <div className="h-[300px]">
            <Doughnut data={statusData} options={{ ...chartOptions, cutout: '70%' }} />
          </div>
        </div>

        {/* Priority Level */}
        <div className="cc-card p-8 min-h-[400px]">
          <h3 className="text-lg font-black text-white mb-8">Priority Volume Analysis</h3>
          <div className="h-[300px]">
            <Pie data={priorityData} options={chartOptions} />
          </div>
        </div>

        {/* Workload */}
        <div className="cc-card p-8 lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-black text-white mb-8">
            {type === 'system' ? 'City-wide Department Workload' : 'Department Staff Performance'}
          </h3>
          <div className="h-[300px]">
            <Bar data={deptData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
