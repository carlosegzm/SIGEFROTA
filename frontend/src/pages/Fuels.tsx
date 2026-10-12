import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { Fuel, Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, AlertTriangle, Search, Filter, Droplet, Calendar, TrendingDown, ArrowUpDown, ArrowDownAZ } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';
import { todayLocalISO, formatDateBR } from '../utils/date';
import { getErrorMessage } from '../utils/error';

type SortField = 'vehicleId' | 'refueledAt' | 'liters' | 'totalCost' | 'odometerKm' | 'consumptionKmL';
type SortDirection = 'asc' | 'desc';

export function Fuels() {
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnomalous, setFilterAnomalous] = useState('ALL');

  const [sortValue, setSortValue] = useState('refueledAt-desc');

  const sortField = sortValue.split('-')[0] as SortField;
  const sortDirection = sortValue.split('-')[1] as SortDirection;

  const { isManager } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [refueledAt, setRefueledAt] = useState('');
  const [liters, setLiters] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [odometerKm, setOdometerKm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get<Fuel[]>('/fuels'),
        api.get<Vehicle[]>('/vehicles')
      ]);
      
      setFuels(results[0].status === 'fulfilled' ? results[0].value.data : []);
      setVehicles(results[1].status === 'fulfilled' ? results[1].value.data : []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar abastecimentos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewModal = () => {
    if (!isManager) return;
    setVehicleId('');
    setRefueledAt(todayLocalISO());
    setLiters('');
    setTotalCost('');
    setOdometerKm('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    
    setError('');
    
    const parsedLiters = Number(liters);
    const parsedCost = Number(totalCost);
    const parsedKm = Number(odometerKm);
    
    if (!Number.isFinite(parsedLiters) || parsedLiters <= 0) {
      setError('Preencha um valor válido (maior que 0) em Litros.');
      return;
    }
    if (!Number.isFinite(parsedCost) || parsedCost <= 0) {
      setError('Preencha um valor válido (maior que 0) no Custo Total.');
      return;
    }
    if (!Number.isFinite(parsedKm) || parsedKm <= 0) {
      setError('Preencha um valor válido (maior que 0) no Odômetro.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/fuels', { 
        vehicleId, 
        refueledAt, 
        liters: parsedLiters, 
        totalCost: parsedCost, 
        odometerKm: parsedKm 
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao registrar abastecimento.'));
    } finally {
      setSaving(false);
    }
  };

  const getVehiclePlate = useCallback((id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.plate : id;
  }, [vehicles]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortValue(`${field}-${sortDirection === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSortValue(`${field}-asc`);
    }
  };

  const filteredAndSortedFuels = useMemo(() => {
    let result = fuels.filter(f => {
      const plate = getVehiclePlate(f.vehicleId);
      const matchesSearch = plate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAnomaly = filterAnomalous === 'ALL' || (filterAnomalous === 'ANOMALOUS' && f.anomalousConsumption) || (filterAnomalous === 'NORMAL' && !f.anomalousConsumption);
      return matchesSearch && matchesAnomaly;
    });

    result.sort((a, b) => {
      let aValue: unknown = a[sortField as keyof Fuel];
      let bValue: unknown = b[sortField as keyof Fuel];

      if (sortField === 'vehicleId') {
        aValue = getVehiclePlate(a.vehicleId).toLowerCase();
        bValue = getVehiclePlate(b.vehicleId).toLowerCase();
      }
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      // Handle nulls for consumptionKmL
      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;

      if ((aValue as string | number | boolean) < (bValue as string | number | boolean)) return sortDirection === 'asc' ? -1 : 1;
      if ((aValue as string | number | boolean) > (bValue as string | number | boolean)) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [fuels, searchTerm, filterAnomalous, sortField, sortDirection, getVehiclePlate]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Abastecimentos</h1>
          <p className="text-gray-500 font-medium mt-1">Registre e analise o consumo de combustível da frota.</p>
        </div>
        {isManager && (
          <button
            onClick={openNewModal}
            className="flex items-center px-6 py-3.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark hover:shadow-lg transition-all font-bold hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" /> Novo Abastecimento
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por placa do veículo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900"
            />
          </div>
          <div className="w-full md:w-56 z-20">
            <CustomSelect
              value={filterAnomalous}
              onChange={setFilterAnomalous}
              icon={<Filter size={20} />}
              options={[
                { value: 'ALL', label: 'Todos os Registros' },
                { value: 'NORMAL', label: 'Consumo Normal' },
                { value: 'ANOMALOUS', label: 'Consumo Anômalo' }
              ]}
            />
          </div>
          <div className="w-full md:w-56 z-10">
            <CustomSelect
              value={sortValue}
              onChange={setSortValue}
              icon={<ArrowDownAZ size={20} />}
              options={[
                { value: 'refueledAt-desc', label: 'Data (Mais recentes)' },
                { value: 'refueledAt-asc', label: 'Data (Mais antigos)' },
                { value: 'vehicleId-asc', label: 'Veículo (A-Z)' },
                { value: 'liters-desc', label: 'Litros (Maior)' },
                { value: 'totalCost-desc', label: 'Custo Total (Maior)' },
                { value: 'consumptionKmL-asc', label: 'Consumo (Pior)' },
                { value: 'consumptionKmL-desc', label: 'Consumo (Melhor)' }
              ]}
            />
          </div>
        </div>

        {error && <div className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">{error}</div>}

        <div className="overflow-x-auto rounded-xl">
          {loading ? (
            <div className="p-12 text-center text-primary font-medium flex justify-center items-center gap-2">
              <Search className="animate-spin" /> Carregando abastecimentos...
            </div>
          ) : filteredAndSortedFuels.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Droplet size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhum abastecimento encontrado.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('vehicleId')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tl-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Veículo <ArrowUpDown size={12} className={sortField === 'vehicleId' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('refueledAt')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Data <ArrowUpDown size={12} className={sortField === 'refueledAt' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('liters')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Litros <ArrowUpDown size={12} className={sortField === 'liters' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('totalCost')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Custo Total <ArrowUpDown size={12} className={sortField === 'totalCost' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('odometerKm')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Odômetro <ArrowUpDown size={12} className={sortField === 'odometerKm' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('consumptionKmL')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tr-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Consumo (km/L) <ArrowUpDown size={12} className={sortField === 'consumptionKmL' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredAndSortedFuels.map((f) => {
                  return (
                    <tr key={f.id} className={`hover:bg-primary/10 transition-colors group ${f.anomalousConsumption ? 'bg-orange-50/40 hover:bg-orange-100/50' : 'bg-white'}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-black tracking-wider text-primary group-hover:border-primary/30 transition-colors">
                          {getVehiclePlate(f.vehicleId)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-600">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          {formatDateBR(f.refueledAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <Droplet size={14} className="mr-1.5 text-blue-500" />
                          {f.liters.toFixed(2)} L
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-green-600">
                        R$ {f.totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                        {f.odometerKm.toLocaleString('pt-BR')} km
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {f.consumptionKmL ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${f.anomalousConsumption ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                              {f.anomalousConsumption ? <TrendingDown size={14}/> : null}
                              {f.consumptionKmL.toFixed(2)} km/l
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                          {f.anomalousConsumption && (
                            <span title="Consumo anômalo detectado">
                              <AlertTriangle size={18} className="text-orange-500" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Abastecimento">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Veículo</label>
            <div className="relative">
              <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900 cursor-pointer">
                <option value="" disabled>Selecione um veículo</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Data do Abastecimento</label>
              <input type="date" required max={todayLocalISO()} value={refueledAt} onChange={(e) => setRefueledAt(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Odômetro Atual (Km)</label>
              <input type="number" required min="0" value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Total de Litros</label>
              <input type="number" step="0.01" required min="0.1" value={liters} onChange={(e) => setLiters(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Custo Total (R$)</label>
              <input type="number" step="0.01" required min="0.1" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-gray-50">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-6 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-xl shadow-md font-bold hover:bg-primary-dark transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Registrando...' : 'Registrar Abastecimento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
