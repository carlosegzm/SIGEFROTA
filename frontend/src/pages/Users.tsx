import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/error';
import { User } from '../types';
import { Search, Filter, Shield, UserCog, Mail, ArrowUpDown, ArrowDownAZ } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { useAuth } from '../context/AuthContext';

type SortField = 'name' | 'email' | 'role';
type SortDirection = 'asc' | 'desc';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userEmail, isManager } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const [sortValue, setSortValue] = useState('name-asc');

  const sortField = sortValue.split('-')[0] as SortField;
  const sortDirection = sortValue.split('-')[1] as SortDirection;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar usuários.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    if (!isManager) return;
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao alterar papel do usuário.'));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortValue(`${field}-${sortDirection === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSortValue(`${field}-asc`);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter(u => {
      const matchesSearch = (u.name + u.email).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'ALL' || u.role === filterRole;
      return matchesSearch && matchesRole;
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
  }, [users, searchTerm, filterRole, sortField, sortDirection]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Usuários</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie os acessos e permissões do sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900"
            />
          </div>
          <div className="w-full md:w-56 z-20">
            <CustomSelect
              value={filterRole}
              onChange={setFilterRole}
              icon={<Filter size={20} />}
              options={[
                { value: 'ALL', label: 'Todos os Papéis' },
                { value: 'DRIVER', label: 'Motorista' },
                { value: 'FINANCE', label: 'Financeiro' },
                { value: 'FLEET_MANAGER', label: 'Gestor' }
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
                { value: 'email-asc', label: 'E-mail (A-Z)' },
                { value: 'email-desc', label: 'E-mail (Z-A)' },
                { value: 'role-asc', label: 'Papel (A-Z)' },
                { value: 'role-desc', label: 'Papel (Z-A)' }
              ]}
            />
          </div>
        </div>

        {error && <div className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">{error}</div>}

        <div className="overflow-x-auto rounded-xl">
          {loading ? (
            <div className="p-12 text-center text-primary font-medium flex justify-center items-center gap-2">
              <Search className="animate-spin" /> Carregando usuários...
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <UserCog size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhum usuário encontrado para a sua busca.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('name')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest rounded-tl-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Nome <ArrowUpDown size={12} className={sortField === 'name' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('email')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-1">Contato <ArrowUpDown size={12} className={sortField === 'email' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                  <th onClick={() => handleSort('role')} className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group rounded-tr-xl">
                    <div className="flex items-center gap-1">Papel (Permissão) <ArrowUpDown size={12} className={sortField === 'role' ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}/></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredAndSortedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-primary/10 transition-colors group bg-white">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{u.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative inline-block w-full max-w-[200px]">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Shield size={14} className={u.role === 'FLEET_MANAGER' ? 'text-primary' : u.role === 'FINANCE' ? 'text-green-600' : 'text-gray-500'} />
                          </div>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.email === userEmail}
                            className={`appearance-none w-full text-xs font-bold border rounded-lg py-2 pl-9 pr-8 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer ${
                              u.role === 'FLEET_MANAGER' ? 'bg-primary/5 text-primary border-primary/20 hover:border-primary/40' :
                              u.role === 'FINANCE' ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-300' :
                              'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <option value="DRIVER">Motorista</option>
                            <option value="FINANCE">Financeiro</option>
                            <option value="FLEET_MANAGER">Gestor de Frota</option>
                          </select>
                          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
