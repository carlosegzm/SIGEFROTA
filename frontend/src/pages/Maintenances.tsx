import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { Maintenance, Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Wrench, Calendar, Settings, ArrowUpDown, ArrowDownAZ } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';
import { todayLocalISO, formatDateBR } from '../utils/date';
import { getErrorMessage } from '../utils/error';

type SortField = 'vehicleId' | 'type' | 'performedAt' | 'registeredKm' | 'nextDueDate';
type SortDirection = 'asc' | 'desc';

export function Maintenances() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [sortValue, setSortValue] = useState('performedAt-desc');

  const sortField = sortValue.split('-')[0] as SortField;
  const sortDirection = sortValue.split('-')[1] as SortDirection;

  const { isManager } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState('OIL_CHANGE');
  const [registeredKm, setRegisteredKm] = useState('0');
  const [performedAt, setPerformedAt] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get<Maintenance[]>('/maintenances'),
        api.get<Vehicle[]>('/vehicles')
      ]);
      setMaintenances(results[0].status === 'fulfilled' ? results[0].value.data : []);
      setVehicles(results[1].status === 'fulfilled' ? results[1].value.data : []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar manutenções.'));
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
    setType('OIL_CHANGE');
    setRegisteredKm('0');
    setPerformedAt(todayLocalISO());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    
    setError('');
    const parsedKm = Number(registeredKm);
    
    if (!Number.isFinite(parsedKm) || parsedKm <= 0) {
      setError('Preencha um valor válido (maior que 0) no odômetro.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/maintenances', { vehicleId, type, registeredKm: parsedKm, performedAt });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao registrar manutenção.'));
    } finally {
      setSaving(false);
    }
  };

  const getVehiclePlate = useCallback((id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.plate : id;
  }, [vehicles]);

  const translateType = (t: string) => {
    switch (t) {
      case 'OIL_CHANGE': return 'Troca de Óleo';
      case 'INSPECTION': return 'Inspeção';
      case 'TIRE_REPLACEMENT': return 'Troca de Pneus';
      default: return t;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortValue(`${field}-${sortDirection === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSortValue(`${field}-asc`);
    }
  };

  const filteredAndSortedMaintenances = useMemo(() => {
    let result = maintenances.filter(m => {
      const plate = getVehiclePlate(m.vehicleId);
      const matchesSearch = plate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || m.type === filterType;
      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      let aValue: unknown = a[sortField as keyof Maintenance];
      let bValue: unknown = b[sortField as keyof Maintenance];

      if (sortField === 'vehicleId') {
        aValue = getVehiclePlate(a.vehicleId).toLowerCase();
        bValue = getVehiclePlate(b.vehicleId).toLowerCase();
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      // Handle nulls
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if ((aValue as string | number) < (bValue as string | number)) return sortDirection === 'asc' ? -1 : 1;
      if ((aValue as string | number) > (bValue as string | number)) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [maintenances, searchTerm, filterType, sortField, sortDirection, getVehiclePlate]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Manutenções</h1>
          <p className="text-gray-500 font-medium mt-1">Registre e acompanhe o histórico de reparos da frota.</p>
        </div>
        {isManager && (
          <button
            onClick={openNewModal}
            className="flex items-center px-6 py-3.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark hover:shadow-lg transition-all font-bold hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" /> Nova Manutenção
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
              value={filterType}
              onChange={setFilterType}
              icon={<Filter size={20} />}
              options={[
                { value: 'ALL', label: 'Todos os Tipos' },
                { value: 'OIL_CHANGE', label: 'Troca de Óleo' },
                { value: 'INSPECTION', label: 'Inspeção' },
                { value: 'TIRE_REPLACEMENT', label: 'Troca de Pneus' }
              ]}
            />
          </div>
          <div className="w-full md:w-56 z-10">
            <CustomSelect
              value={sortValue}
              onChange={setSortValue}
              icon={<ArrowDownAZ size={20} />}
              options={[
                { value: 'performedAt-desc', label: 'Data Realizada (Mais recentes)' },
                { value: 'performedAt-asc', label: 'Data Realizada (Mais antigos)' },
                { value: 'vehicleId-asc', label: 'Veículo (A-Z)' },
                { value: 'type-asc', label: 'Serviço (A-Z)' },
                { value: 'nextDueDate-asc', label: 'Previsão (Próximos)' },
                { value: 'registeredKm-desc', label: 'Odômetro (Maior)' }
              ]}
            />
          </div>
        </div>

        {error && <div className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">{error}</div>}

        <div className="overflow-x-auto rounded-xl">
          {loading ? (
            <div className="p-12 text-center text-primary font-medium flex justify-center items-center gap-2">
              <Search className="animate-spin" /> Carregando manutenções...
            </div>
          ) : filteredAndSortedMaintenances.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Wrench size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhuma manutenção encontrada.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('vehicleId')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tl-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Veículo <ArrowUpDown size={12} className={sortField === 'vehicleId' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('type')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Serviço Realizado <ArrowUpDown size={12} className={sortField === 'type' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('performedAt')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Data Realizada <ArrowUpDown size={12} className={sortField === 'performedAt' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('registeredKm')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Odômetro <ArrowUpDown size={12} className={sortField === 'registeredKm' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('nextDueDate')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tr-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Previsão (Próxima) <ArrowUpDown size={12} className={sortField === 'nextDueDate' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredAndSortedMaintenances.map((m) => {
                  return (
                  <tr key={m.id} className="hover:bg-primary/10 transition-colors group bg-white">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-black tracking-wider text-primary group-hover:border-primary/30 transition-colors">
                        {getVehiclePlate(m.vehicleId)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Settings size={14}/> {translateType(m.type)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {formatDateBR(m.performedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{m.registeredKm.toLocaleString('pt-BR')} km</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-600">
                        {m.nextDueDate ? formatDateBR(m.nextDueDate) : '-'}
                      </div>
                      {m.nextDueKm && <div className="text-xs text-gray-400 mt-1">aos {m.nextDueKm.toLocaleString('pt-BR')} km</div>}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Manutenção">
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
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Serviço</label>
            <div className="relative">
              <select required value={type} onChange={(e) => setType(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900 cursor-pointer">
                <option value="OIL_CHANGE">Troca de Óleo</option>
                <option value="INSPECTION">Inspeção</option>
                <option value="TIRE_REPLACEMENT">Troca de Pneus</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Data Realizada</label>
              <input type="date" required max={todayLocalISO()} value={performedAt} onChange={(e) => setPerformedAt(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Odômetro Registrado</label>
              <input type="number" required min="0" value={registeredKm} onChange={(e) => setRegisteredKm(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-gray-50">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-6 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-xl shadow-md font-bold hover:bg-primary-dark transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Registrando...' : 'Registrar Manutenção'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
