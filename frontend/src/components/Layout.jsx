import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { LayoutDashboard, Users, Target, DollarSign, CheckSquare, Building2, LogOut, Menu, X } from 'lucide-react';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    auth.currentUser()
      .then((res) => setUser(res.data))
      .catch(() => {
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/leads', label: 'Leads', icon: Target },
    { path: '/deals', label: 'Deals', icon: DollarSign },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/companies', label: 'Companies', icon: Building2 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">CRM</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 p-2 hover:bg-red-50 rounded-lg"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">CRM</h1>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
