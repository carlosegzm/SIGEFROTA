import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Driver } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, Filter, User, ArrowUpDown, ArrowDownAZ } from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { CustomSelect } from '../components/CustomSelect';
import { formatDateBR } from '../utils/date';
import { getErrorMessage } from '../utils/error';

type SortField = 'name' | 'licenseNumber' | 'licenseExpiration' | 'phone' | 'active';
type SortDirection = 'asc' | 'desc';

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [sortValue, setSortValue] = useState('name-asc');

  const sortField = sortValue.split('-')[0] as SortField;
  const sortDirection = sortValue.split('-')[1] as SortDirection;

  const { isManager } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiration, setLicenseExpiration] = useState('');
  const [phone, setPhone] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get<Driver[]>('/drivers');
      setDrivers(res.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar motoristas.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openNewModal = () => {
    if (!isManager) return;
    setEditingDriver(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('B');
    setLicenseExpiration('');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (d: Driver) => {
    if (!isManager) return;
    setEditingDriver(d);
    setName(d.name);
    setLicenseNumber(d.licenseNumber);
    setLicenseCategory(d.licenseCategory);
    setLicenseExpiration(d.licenseExpiration);
    setPhone(d.phone);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    try {
      setSaving(true);
      const payload = { name, licenseNumber, licenseCategory, licenseExpiration, phone };
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, payload);
      } else {
        await api.post('/drivers', payload);
      }
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar motorista.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isManager) return;
    try {
      await api.delete(`/drivers/${id}`);
      fetchDrivers();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao inativar motorista.'));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortValue(`${field}-${sortDirection === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSortValue(`${field}-asc`);
    }
  };

  const filteredAndSortedDrivers = useMemo(() => {
    let result = drivers.filter(d => {
      const matchesSearch = (d.name + d.licenseNumber + d.phone).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'ACTIVE' && d.active) || (filterStatus === 'INACTIVE' && !d.active);
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let aValue: unknown = a[sortField];
      let bValue: unknown = b[sortField];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (typeof aValue === 'boolean') aValue = aValue ? 1 : 0;
      if (typeof bValue === 'boolean') bValue = bValue ? 1 : 0;

      if ((aValue as string | number | boolean) < (bValue as string | number | boolean)) return sortDirection === 'asc' ? -1 : 1;
      if ((aValue as string | number | boolean) > (bValue as string | number | boolean)) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [drivers, searchTerm, filterStatus, sortField, sortDirection]);


  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Motoristas</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie os condutores da sua frota e suas habilitações.</p>
        </div>
        {isManager && (
          <button
            onClick={openNewModal}
            className="flex items-center px-6 py-3.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark hover:shadow-lg transition-all font-bold hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" /> Novo Motorista
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, CNH ou telefone..." 
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
                { value: 'name-asc', label: 'Nome (A-Z)' },
                { value: 'name-desc', label: 'Nome (Z-A)' },
                { value: 'licenseExpiration-asc', label: 'Venc. (Próximos)' },
                { value: 'licenseExpiration-desc', label: 'Venc. (Distantes)' },
                { value: 'active-desc', label: 'Status' }
              ]}
            />
          </div>
        </div>

        {error && <div className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">{error}</div>}

        <div className="overflow-x-auto rounded-xl">
          {loading ? (
            <div className="p-12 text-center text-primary font-medium flex justify-center items-center gap-2">
              <Search className="animate-spin" /> Carregando motoristas...
            </div>
          ) : filteredAndSortedDrivers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhum motorista encontrado para a sua busca.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('name')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tl-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Nome <ArrowUpDown size={12} className={sortField === 'name' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('licenseNumber')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">CNH <ArrowUpDown size={12} className={sortField === 'licenseNumber' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('licenseExpiration')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Vencimento <ArrowUpDown size={12} className={sortField === 'licenseExpiration' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('phone')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Telefone <ArrowUpDown size={12} className={sortField === 'phone' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('active')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Status <ArrowUpDown size={12} className={sortField === 'active' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  {isManager && (
                    <th className="px-6 py-4 text-right text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tr-xl">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredAndSortedDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-primary/10 transition-colors group bg-white">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{d.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{d.licenseNumber}</div>
                      <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">Cat. {d.licenseCategory}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{formatDateBR(d.licenseExpiration)}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{d.phone}</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <StatusBadge status={d.active} type="driver" />
                    </td>
                    {isManager && (
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(d)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors shadow-sm bg-white border border-gray-200 hover:border-primary/30">
                            <Edit2 size={16} />
                          </button>
                          {d.active && (
                            <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-200 hover:border-red-200" title="Inativar">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDriver ? "Editar Motorista" : "Novo Motorista"}>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nome Completo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" placeholder="Ex: João Silva" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nº CNH</label>
              <input type="text" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" placeholder="0000000000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Categoria (A, B, C, D, E)</label>
              <input type="text" required value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" placeholder="Ex: D" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Vencimento CNH</label>
              <input type="date" required value={licenseExpiration} onChange={(e) => setLicenseExpiration(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Telefone</label>
              <input type="text" placeholder="(49) 99999-9999" required value={phone} onChange={(e) => setPhone(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-gray-50">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-6 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-xl shadow-md font-bold hover:bg-primary-dark transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Salvando...' : editingDriver ? 'Atualizar Motorista' : 'Cadastrar Motorista'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
