import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Vehicle, Fuel, Maintenance } from '../types';
import { Truck, AlertTriangle, XCircle, Activity, Calendar, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { format } from 'date-fns';
import { todayLocalISO, parseLocalDate } from '../utils/date';
import { getErrorMessage } from '../utils/error';

export function Dashboard() {
  const [stats, setStats] = useState({ active: 0, inMaintenance: 0, inactive: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<{name: string, abastecimentos: number, manutencoes: number}[]>([]);
  const [pieData, setPieData] = useState<{name: string, value: number, color: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get<Vehicle[]>('/vehicles'),
          api.get<Fuel[]>('/fuels'),
          api.get<Maintenance[]>('/maintenances')
        ]);
        
        const vehicles = results[0].status === 'fulfilled' ? results[0].value.data : [];
        const fuels = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const maintenances = results[2].status === 'fulfilled' ? results[2].value.data : [];
        
        const active = vehicles.filter(v => v.status === 'ACTIVE').length;
        const inMaintenance = vehicles.filter(v => v.status === 'IN_MAINTENANCE').length;
        const inactive = vehicles.filter(v => v.status === 'INACTIVE').length;
        
        setStats({ active, inMaintenance, inactive, total: vehicles.length });

        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        // Calculate the date 7 days ago
        const todayStr = todayLocalISO();
        const today = parseLocalDate(todayStr);
        const sevenDaysAgo = parseLocalDate(todayStr);
        sevenDaysAgo.setDate(today.getDate() - 6); // Include today

        interface ChartDataPoint {
          dateString: string;
          name: string;
          abastecimentos: number;
          manutencoes: number;
        }

        // Initialize chart data for the last 7 days
        const last7DaysData: ChartDataPoint[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(sevenDaysAgo);
          date.setDate(sevenDaysAgo.getDate() + i);
          const dayName = days[date.getDay()];
          last7DaysData.push({
            dateString: format(date, 'yyyy-MM-dd'),
            name: dayName,
            abastecimentos: 0,
            manutencoes: 0
          });
        }

        // Aggregate fuels
        fuels.forEach(f => {
          const fuelDateStr = f.refueledAt.split('T')[0];
          const fuelDate = parseLocalDate(fuelDateStr);
          if (fuelDate >= sevenDaysAgo && fuelDate <= today) {
            const dayData = last7DaysData.find(d => d.dateString === fuelDateStr);
            if (dayData) {
              dayData.abastecimentos += 1;
            }
          }
        });

        // Aggregate maintenances
        maintenances.forEach(m => {
          const maintDateStr = m.performedAt.split('T')[0];
          const maintDate = parseLocalDate(maintDateStr);
          if (maintDate >= sevenDaysAgo && maintDate <= today) {
            const dayData = last7DaysData.find(d => d.dateString === maintDateStr);
            if (dayData) {
              dayData.manutencoes += 1;
            }
          }
        });

        setChartData(last7DaysData);

        setPieData([
          { name: 'Ativos', value: active, color: '#182A3A' },
          { name: 'Em Manutenção', value: inMaintenance, color: '#FCD34D' },
          { name: 'Inativos', value: inactive, color: '#EF4444' },
        ]);
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar dados do dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-primary font-medium flex items-center gap-2"><Zap className="animate-pulse" /> Carregando métricas...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600 bg-red-50 rounded-xl m-8 border border-red-100">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">Visão Geral</h1>
        <p className="text-gray-500 font-medium mt-1">Acompanhe as métricas e a saúde da sua frota em tempo real.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
            <Activity size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total de Veículos</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-primary">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
            <Truck size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-4 shadow-md shadow-primary/20">
              <Truck size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Frota Ativa</p>
            <p className="text-4xl font-black text-gray-900">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
            <AlertTriangle size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Em Manutenção</p>
            <p className="text-4xl font-black text-gray-900">{stats.inMaintenance}</p>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
            <XCircle size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <XCircle size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Inativos</p>
            <p className="text-4xl font-black text-gray-900">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-primary">Atividade dos Últimos 7 Dias</h3>
              <p className="text-sm text-gray-500 font-medium">Abastecimentos x Manutenções</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-xl text-gray-500">
              <Calendar size={20} />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }} 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#182A3A', marginBottom: '0.5rem' }}
                />
                <Bar dataKey="abastecimentos" name="Abastecimentos" fill="#182A3A" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="manutencoes" name="Manutenções" fill="#FCD34D" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-gray-100 flex flex-col">
          <h3 className="text-lg font-extrabold text-primary mb-2">Distribuição da Frota</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">Status atual de todos os veículos</p>
          <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
