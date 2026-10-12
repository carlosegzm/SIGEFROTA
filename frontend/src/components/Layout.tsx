import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Wrench, 
  FileText, 
  Droplet, 
  UserCog, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

export function Layout() {
  const { role, logout, userEmail } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vehicles', icon: Truck, label: 'Veículos' },
    { to: '/drivers', icon: Users, label: 'Motoristas' },
    { to: '/maintenances', icon: Wrench, label: 'Manutenções' },
    { to: '/documents', icon: FileText, label: 'Documentos' },
    { to: '/fuels', icon: Droplet, label: 'Abastecimentos' },
  ];

  if (role === 'FLEET_MANAGER') {
    navItems.push({ to: '/users', icon: UserCog, label: 'Usuários' });
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Dark Premium */}
      <aside 
        className={clsx(
          "bg-primary text-gray-300 flex flex-col relative z-20 shadow-2xl shadow-primary/20 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-4 top-12 bg-white text-primary rounded-full p-1.5 shadow-md border border-gray-100 hover:bg-gray-50 hover:scale-110 transition-all z-30"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Top Logo Area */}
        <div className={clsx("pt-10 pb-6 flex flex-col items-center", isCollapsed ? "px-2" : "px-6")}>
          <div className="bg-white/5 w-full py-4 rounded-2xl border border-white/10 flex justify-center backdrop-blur-sm overflow-hidden">
            <img 
              src="/logo.png" 
              alt="SIGEFROTA" 
              className={clsx("object-contain drop-shadow-md transition-all duration-300", isCollapsed ? "h-10 w-10" : "h-24 w-24")} 
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-none">
          {!isCollapsed && <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 mt-2 whitespace-nowrap">Menu Principal</p>}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  clsx(
                    isActive ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5 hover:text-gray-100 font-medium',
                    'group flex items-center py-3.5 rounded-xl transition-all duration-200',
                    isCollapsed ? 'justify-center px-0' : 'px-4'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={clsx('h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300', !isCollapsed && 'mr-3.5')} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info Bottom Area */}
        <div className="p-4 mt-auto">
          <div className={clsx("bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition-all", isCollapsed ? "p-2 flex flex-col gap-2 items-center" : "p-4")}>
            <div className={clsx("flex items-center", !isCollapsed && "mb-4")}>
              <div className={clsx("rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white uppercase border border-white/10 flex-shrink-0", isCollapsed ? "w-10 h-10 mb-2" : "w-10 h-10 mr-3")}>
                {userEmail?.[0] || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{userEmail}</p>
                  <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{role}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              title={isCollapsed ? "Sair" : undefined}
              className={clsx(
                "flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none transition-all duration-300",
                isCollapsed ? "p-3 w-full" : "px-4 py-2.5 w-full"
              )}
            >
              <LogOut className={clsx("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-gray-50 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-gray-200/50 to-transparent pointer-events-none"></div>
        <div className="h-full overflow-y-auto px-4 md:px-8 xl:px-12 py-8 relative z-10 scrollbar-thin scrollbar-thumb-gray-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
