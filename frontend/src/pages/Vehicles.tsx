import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, Filter, Truck, ArrowUpDown, ArrowDownAZ } from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { CustomSelect } from '../components/CustomSelect';
import { getErrorMessage } from '../utils/error';

type SortField = 'plate' | 'brand' | 'year' | 'currentKm' | 'status';
type SortDirection = 'asc' | 'desc';

const MAX_YEAR = new Date().getFullYear() + 1;

export function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [sortValue, setSortValue] = useState('plate-asc');

  const sortField = sortValue.split('-')[0] as SortField;
  const sortDirection = sortValue.split('-')[1] as SortDirection;

  const { isManager } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [currentKm, setCurrentKm] = useState('0');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get<Vehicle[]>('/vehicles');
      setVehicles(res.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar veículos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openNewModal = () => {
    if (!isManager) return;
    setEditingVehicle(null);
    setPlate('');
    setModel('');
    setBrand('');
    setYear(String(new Date().getFullYear()));
    setCurrentKm('0');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    if (!isManager) return;
    setEditingVehicle(v);
    setPlate(v.plate);
    setModel(v.model);
    setBrand(v.brand);
    setYear(String(v.year));
    setCurrentKm(String(v.currentKm));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    
    setError('');
    
    const parsedYear = Number(year);
    const parsedKm = Number(currentKm);
    
    if (!Number.isFinite(parsedYear) || parsedYear < 1900 || parsedYear > MAX_YEAR) {
      setError('Preencha um ano válido.');
      return;
    }
    
    if (!Number.isFinite(parsedKm) || parsedKm < 0) {
      setError('Preencha uma quilometragem válida.');
      return;
    }

    try {
      setSaving(true);
      const normalizedPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const payload = { plate: normalizedPlate, model, brand, year: parsedYear, currentKm: parsedKm };
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload);
      } else {
        await api.post('/vehicles', payload);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar veículo.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isManager) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao inativar veículo.'));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!isManager) return;
    try {
      await api.patch(`/vehicles/${id}/status`, { status: newStatus });
      fetchVehicles();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao mudar status.'));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortValue(`${field}-${sortDirection === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSortValue(`${field}-asc`);
    }
  };

  const filteredAndSortedVehicles = useMemo(() => {
    let result = vehicles.filter(v => {
      const matchesSearch = (v.plate + v.brand + v.model).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, searchTerm, filterStatus, sortField, sortDirection]);



  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Frota de Veículos</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie, monitore e atualize o status de todos os veículos.</p>
        </div>
        {isManager && (
          <button
            onClick={openNewModal}
            className="flex items-center px-6 py-3.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark hover:shadow-lg transition-all font-bold hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" /> Cadastrar Veículo
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por placa, marca ou modelo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900"
            />
          </div>
          <div className="w-full md:w-56 z-20">
            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              icon={<Filter size={20} />}
              options={[
                { value: 'ALL', label: 'Todos os Status' },
                { value: 'ACTIVE', label: 'Ativos' },
                { value: 'IN_MAINTENANCE', label: 'Em Manutenção' },
                { value: 'INACTIVE', label: 'Inativos' }
              ]}
            />
          </div>
          <div className="w-full md:w-56 z-10">
            <CustomSelect
              value={sortValue}
              onChange={setSortValue}
              icon={<ArrowDownAZ size={20} />}
              options={[
                { value: 'plate-asc', label: 'Placa (A-Z)' },
                { value: 'plate-desc', label: 'Placa (Z-A)' },
                { value: 'brand-asc', label: 'Marca (A-Z)' },
                { value: 'brand-desc', label: 'Marca (Z-A)' },
                { value: 'year-desc', label: 'Mais Novos' },
                { value: 'year-asc', label: 'Mais Antigos' },
                { value: 'currentKm-desc', label: 'Maior Km' },
                { value: 'currentKm-asc', label: 'Menor Km' },
                { value: 'status-asc', label: 'Status' }
              ]}
            />
          </div>
        </div>

        {error && <div className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">{error}</div>}

        <div className="overflow-x-auto rounded-xl">
          {loading ? (
            <div className="p-12 text-center text-primary font-medium flex justify-center items-center gap-2">
              <Search className="animate-spin" /> Carregando base de veículos...
            </div>
          ) : filteredAndSortedVehicles.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Truck size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhum veículo encontrado para a sua busca.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('plate')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tl-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Placa <ArrowUpDown size={12} className={sortField === 'plate' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('brand')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Veículo <ArrowUpDown size={12} className={sortField === 'brand' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('year')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Ano <ArrowUpDown size={12} className={sortField === 'year' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('currentKm')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Odômetro <ArrowUpDown size={12} className={sortField === 'currentKm' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('status')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Status <ArrowUpDown size={12} className={sortField === 'status' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  {isManager && (
                    <th className="px-6 py-4 text-right text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tr-xl">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredAndSortedVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-primary/10 transition-colors group bg-white">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Link to={`/vehicles/${v.id}`} className="text-primary hover:text-primary-dark font-black tracking-wider text-sm bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-200 group-hover:border-primary/30 transition-all">
                        {v.plate}
                      </Link>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{v.model}</span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{v.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{v.year}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{v.currentKm.toLocaleString('pt-BR')} km</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {isManager ? (
                        <div className="relative inline-block w-40">
                          <select
                            value={v.status}
                            onChange={(e) => handleStatusChange(v.id, e.target.value)}
                            className={`appearance-none w-full text-xs font-bold border rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer ${
                              v.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-300' :
                              v.status === 'IN_MAINTENANCE' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300' :
                              'bg-red-50 text-red-700 border-red-200 hover:border-red-300'
                            }`}
                          >
                            <option value="ACTIVE">Ativo</option>
                            <option value="IN_MAINTENANCE">Em Manutenção</option>
                            <option value="INACTIVE">Inativo</option>
                          </select>
                          <div className={`absolute inset-y-0 right-2 flex items-center pointer-events-none ${
                              v.status === 'ACTIVE' ? 'text-green-500' :
                              v.status === 'IN_MAINTENANCE' ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      ) : (
                        <StatusBadge status={v.status} type="vehicle" />
                      )}
                    </td>
                    {isManager && (
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(v)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors shadow-sm bg-white border border-gray-200 hover:border-primary/30">
                            <Edit2 size={16} />
                          </button>
                          {v.status !== 'INACTIVE' && (
                            <button onClick={() => handleDelete(v.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-200 hover:border-red-200" title="Inativar">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVehicle ? "Editar Veículo" : "Novo Veículo"}>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Placa</label>
            <input type="text" required value={plate} onChange={(e) => setPlate(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" placeholder="AAA-0000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Marca</label>
              <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" placeholder="Ex: Volvo" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Modelo</label>
              <input type="text" required value={model} onChange={(e) => setModel(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" placeholder="Ex: FH 540" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Ano</label>
              <input type="number" required min={1900} max={MAX_YEAR} value={year} onChange={(e) => setYear(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Odômetro Inicial (Km)</label>
              <input type="number" required min={0} value={currentKm} onChange={(e) => setCurrentKm(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-gray-50">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-6 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-xl shadow-md font-bold hover:bg-primary-dark transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Salvando...' : editingVehicle ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
