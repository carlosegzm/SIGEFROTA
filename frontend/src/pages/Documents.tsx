import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { VehicleDocument, Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, FileText, ArrowUpDown, ArrowDownAZ } from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { CustomSelect } from '../components/CustomSelect';
import { todayLocalISO, parseLocalDate, formatDateBR } from '../utils/date';
import { getErrorMessage } from '../utils/error';

type SortField = 'vehicleId' | 'type' | 'issuedAt' | 'expiresAt' | 'status';
type SortDirection = 'asc' | 'desc';

export function Documents() {
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [sortValue, setSortValue] = useState('expiresAt-asc');

  const sortField = sortValue.split('-')[0] as SortField;
  const sortDirection = sortValue.split('-')[1] as SortDirection;

  const { isManager } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState('CRLV');
  const [issuedAt, setIssuedAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get<VehicleDocument[]>('/documents'),
        api.get<Vehicle[]>('/vehicles')
      ]);
      setDocuments(results[0].status === 'fulfilled' ? results[0].value.data : []);
      setVehicles(results[1].status === 'fulfilled' ? results[1].value.data : []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar documentos.'));
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
    setType('CRLV');
    const today = todayLocalISO();
    setIssuedAt(today);
    
    const [y, m, d] = today.split('-');
    setExpiresAt(`${Number(y) + 1}-${m}-${d}`);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    
    if (new Date(expiresAt) < new Date(issuedAt)) {
      setError('A data de vencimento deve ser maior ou igual à data de emissão.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/documents', { vehicleId, type, issuedAt, expiresAt });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao registrar documento.'));
    } finally {
      setSaving(false);
    }
  };

  const getVehiclePlate = useCallback((id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.plate : id;
  }, [vehicles]);

  const getExpirationStatus = (expiresAtStr: string) => {
    const today = parseLocalDate(todayLocalISO());
    const expDate = parseLocalDate(expiresAtStr);
    
    if (expDate < today) return 'EXPIRED';
    
    const diffTime = Math.abs(expDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return 'WARNING';
    return 'OK';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortValue(`${field}-${sortDirection === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSortValue(`${field}-asc`);
    }
  };

  const filteredAndSortedDocuments = useMemo(() => {
    let result = documents.filter(d => {
      const plate = getVehiclePlate(d.vehicleId);
      const matchesSearch = plate.toLowerCase().includes(searchTerm.toLowerCase());
      const status = getExpirationStatus(d.expiresAt);
      const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let aValue: unknown = a[sortField as keyof VehicleDocument];
      let bValue: unknown = b[sortField as keyof VehicleDocument];

      if (sortField === 'vehicleId') {
        aValue = getVehiclePlate(a.vehicleId).toLowerCase();
        bValue = getVehiclePlate(b.vehicleId).toLowerCase();
      } else if (sortField === 'status') {
        const statusOrder = { EXPIRED: 1, WARNING: 2, OK: 3 };
        aValue = statusOrder[getExpirationStatus(a.expiresAt) as keyof typeof statusOrder];
        bValue = statusOrder[getExpirationStatus(b.expiresAt) as keyof typeof statusOrder];
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if ((aValue as string | number) < (bValue as string | number)) return sortDirection === 'asc' ? -1 : 1;
      if ((aValue as string | number) > (bValue as string | number)) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [documents, searchTerm, filterStatus, sortField, sortDirection, getVehiclePlate]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Documentos</h1>
          <p className="text-gray-500 font-medium mt-1">Controle de vencimentos e regularidade da frota.</p>
        </div>
        {isManager && (
          <button
            onClick={openNewModal}
            className="flex items-center px-6 py-3.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark hover:shadow-lg transition-all font-bold hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" /> Novo Documento
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
              value={filterStatus}
              onChange={setFilterStatus}
              icon={<Filter size={20} />}
              options={[
                { value: 'ALL', label: 'Todos os Status' },
                { value: 'OK', label: 'Regular (OK)' },
                { value: 'WARNING', label: 'Vence em Breve' },
                { value: 'EXPIRED', label: 'Vencido' }
              ]}
            />
          </div>
          <div className="w-full md:w-56 z-10">
            <CustomSelect
              value={sortValue}
              onChange={setSortValue}
              icon={<ArrowDownAZ size={20} />}
              options={[
                { value: 'expiresAt-asc', label: 'Vencimento (Próx)' },
                { value: 'expiresAt-desc', label: 'Vencimento (Dist)' },
                { value: 'vehicleId-asc', label: 'Veículo (A-Z)' },
                { value: 'type-asc', label: 'Documento (A-Z)' },
                { value: 'status-asc', label: 'Status' }
              ]}
            />
          </div>
        </div>

        {error && <div className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">{error}</div>}

        <div className="overflow-x-auto rounded-xl">
          {loading ? (
            <div className="p-12 text-center text-primary font-medium flex justify-center items-center gap-2">
              <Search className="animate-spin" /> Carregando documentos...
            </div>
          ) : filteredAndSortedDocuments.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhum documento encontrado.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('vehicleId')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tl-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Veículo <ArrowUpDown size={12} className={sortField === 'vehicleId' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('type')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Documento <ArrowUpDown size={12} className={sortField === 'type' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('issuedAt')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Emissão <ArrowUpDown size={12} className={sortField === 'issuedAt' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('expiresAt')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Vencimento <ArrowUpDown size={12} className={sortField === 'expiresAt' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('status')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tr-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Status <ArrowUpDown size={12} className={sortField === 'status' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredAndSortedDocuments.map((d) => {
                  const status = getExpirationStatus(d.expiresAt);
                  return (
                    <tr key={d.id} className={`hover:bg-primary/10 transition-colors group ${status === 'EXPIRED' ? 'bg-red-50/40' : status === 'WARNING' ? 'bg-yellow-50/40' : 'bg-white'}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-black tracking-wider text-primary group-hover:border-primary/30 transition-colors">
                          {getVehiclePlate(d.vehicleId)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-700">
                        {d.type}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                        {formatDateBR(d.issuedAt)}
                      </td>
                      <td className={`px-6 py-5 whitespace-nowrap text-sm font-bold ${status === 'EXPIRED' ? 'text-red-600' : status === 'WARNING' ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {formatDateBR(d.expiresAt)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <StatusBadge status={status} type="document" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Documento">
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Documento</label>
            <div className="relative">
              <select required value={type} onChange={(e) => setType(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900 cursor-pointer">
                <option value="CRLV">CRLV</option>
                <option value="INSURANCE">Seguro</option>
                <option value="LICENSING">Licenciamento</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Data de Emissão</label>
              <input type="date" required max={todayLocalISO()} value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Vencimento</label>
              <input type="date" required min={issuedAt} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" />
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-gray-50">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-6 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-xl shadow-md font-bold hover:bg-primary-dark transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Registrando...' : 'Registrar Documento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
