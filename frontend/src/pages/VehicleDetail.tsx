import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Vehicle, Maintenance, VehicleDocument, Fuel } from '../types';
import { ArrowLeft, Activity, Wrench, FileText, Droplet, AlertTriangle } from 'lucide-react';
import { todayLocalISO, parseLocalDate, formatDateBR } from '../utils/date';
import { getErrorMessage } from '../utils/error';

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [averageConsumption, setAverageConsumption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          api.get<Vehicle>(`/vehicles/${id}`),
          api.get<Maintenance[]>('/maintenances'),
          api.get<VehicleDocument[]>('/documents'),
          api.get<Fuel[]>('/fuels'),
          api.get(`/fuels/vehicles/${id}/average-consumption`)
        ]);

        const vehRes = results[0].status === 'fulfilled' ? results[0].value.data : null;
        if (vehRes) setVehicle(vehRes);
        
        const maintRes = results[1].status === 'fulfilled' ? results[1].value.data : [];
        setMaintenances(maintRes.filter(m => m.vehicleId === id));
        
        const docRes = results[2].status === 'fulfilled' ? results[2].value.data : [];
        setDocuments(docRes.filter(d => d.vehicleId === id));
        
        const fuelRes = results[3].status === 'fulfilled' ? results[3].value.data : [];
        setFuels(fuelRes.filter(f => f.vehicleId === id));
        
        const avgRes = results[4].status === 'fulfilled' ? results[4].value.data : null;
        setAverageConsumption(typeof avgRes === 'number' ? avgRes : null);
        setError('');
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar detalhes do veículo.'));
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Carregando detalhes...</div>;
  if (error || !vehicle) return <div className="p-8 text-red-500">{error || 'Veículo não encontrado'}</div>;

  const translateMaintenanceType = (t: string) => {
    switch (t) {
      case 'OIL_CHANGE': return 'Troca de Óleo';
      case 'INSPECTION': return 'Inspeção';
      case 'TIRE_REPLACEMENT': return 'Troca de Pneus';
      default: return t;
    }
  };

  const getExpirationStatus = (expiresAtStr: string) => {
    const today = parseLocalDate(todayLocalISO());
    const expDate = parseLocalDate(expiresAtStr);
    
    if (expDate < today) return 'expired';
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 ? 'warning' : 'ok';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/vehicles" className="mr-4 p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{vehicle.plate}</h1>
          <span className={`ml-4 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            vehicle.status === 'IN_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {vehicle.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">Marca / Modelo</p>
          <p className="text-xl font-bold text-gray-900">{vehicle.brand} {vehicle.model}</p>
          <p className="text-gray-500 text-sm mt-2">Ano: {vehicle.year}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 flex items-center border-t-4 border-purple-500">
          <Activity size={40} className="text-purple-300 mr-4" />
          <div>
            <p className="text-gray-500 text-sm">Odômetro Atual</p>
            <p className="text-3xl font-extrabold text-primary tracking-tight">{vehicle.currentKm} km</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex items-center border-t-4 border-teal-500">
          <Droplet size={40} className="text-teal-300 mr-4" />
          <div>
            <p className="text-gray-500 text-sm">Consumo Médio</p>
            <p className="text-3xl font-extrabold text-primary tracking-tight">
              {averageConsumption !== null ? `${averageConsumption.toFixed(2)} km/L` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Manutenções */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Wrench className="text-gray-500 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Histórico de Manutenções</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Odômetro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-transparent">
                {maintenances.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Nenhuma manutenção</td></tr>
                ) : maintenances.map(m => (
                  <tr key={m.id}>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{formatDateBR(m.performedAt)}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{translateMaintenanceType(m.type)}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-gray-500 uppercase tracking-widest">{m.registeredKm} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <FileText className="text-gray-500 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Vencimento</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-transparent">
                {documents.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Nenhum documento</td></tr>
                ) : documents.map(d => {
                  const status = getExpirationStatus(d.expiresAt);
                  return (
                    <tr key={d.id} className={status === 'expired' ? 'bg-red-50' : status === 'warning' ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{d.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatDateBR(d.expiresAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {status === 'expired' && <span className="text-red-600 font-medium">Vencido</span>}
                        {status === 'warning' && <span className="text-yellow-600 font-medium">Vence em breve</span>}
                        {status === 'ok' && <span className="text-green-600 font-medium">Regular</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Abastecimentos */}
        <div className="bg-white shadow rounded-lg overflow-hidden xl:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Droplet className="text-gray-500 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Histórico de Abastecimentos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Litros</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Custo</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Odômetro</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Consumo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-transparent">
                {fuels.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum abastecimento</td></tr>
                ) : fuels.map(f => (
                  <tr key={f.id} className={f.anomalousConsumption ? 'bg-orange-50' : ''}>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{formatDateBR(f.refueledAt)}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{f.liters} L</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">R$ {f.totalCost.toFixed(2)}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-gray-500 uppercase tracking-widest">{f.odometerKm} km</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                      {f.consumptionKmL ? `${f.consumptionKmL.toFixed(2)} km/l` : '-'}
                      {f.anomalousConsumption && <span title="Consumo anômalo!"><AlertTriangle size={16} className="text-orange-500 ml-2" /></span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
