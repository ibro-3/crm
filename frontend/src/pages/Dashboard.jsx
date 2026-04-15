import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contacts, leads, deals, tasks, companies } from '../services/api';
import { Users, Target, DollarSign, CheckSquare, Building2, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    contacts: 0,
    leads: 0,
    deals: 0,
    tasks: 0,
    companies: 0,
  });
  const [recentDeals, setRecentDeals] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      contacts.list(),
      leads.list(),
      deals.list(),
      tasks.list(),
      companies.list(),
    ])
      .then(([c, l, d, t, comp]) => {
        setStats({
          contacts: c.length,
          leads: l.length,
          deals: d.length,
          tasks: t.length,
          companies: comp.length,
        });
        setRecentDeals(d.slice(0, 5));
        setRecentTasks(t.filter((task) => task.status !== 'completed').slice(0, 5));
      })
      .catch((err) => {
        setError('Failed to load dashboard data');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const statCards = [
    { label: 'Contacts', value: stats.contacts, icon: Users, color: 'bg-blue-500', path: '/contacts' },
    { label: 'Leads', value: stats.leads, icon: Target, color: 'bg-purple-500', path: '/leads' },
    { label: 'Deals', value: stats.deals, icon: DollarSign, color: 'bg-green-500', path: '/deals' },
    { label: 'Tasks', value: stats.tasks, icon: CheckSquare, color: 'bg-orange-500', path: '/tasks' },
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'bg-teal-500', path: '/companies' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your CRM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white`}>
                <card.icon size={24} />
              </div>
              <TrendingUp className="text-gray-300 group-hover:text-green-500 transition-colors" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-800">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={20} className="text-green-500" />
              Recent Deals
            </h2>
            <Link to="/deals" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          {recentDeals.length === 0 ? (
            <div className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-lg">
              No deals yet. Create your first deal to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium truncate">{deal.title}</p>
                    <p className="text-xs text-gray-500">{deal.company_name || 'No company'}</p>
                  </div>
                  <span className="text-green-600 font-semibold ml-3">${deal.value?.toLocaleString() || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={20} className="text-orange-500" />
              Pending Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-lg">
              No pending tasks. Great job!
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.due_date || 'No due date'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
