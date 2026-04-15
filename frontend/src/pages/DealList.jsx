import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deals as api } from '../services/api';
import { Plus, Search, Edit2, Trash2, DollarSign, AlertCircle } from 'lucide-react';

const stages = {
  prospecting: { label: 'Prospecting', color: 'bg-gray-100 text-gray-700' },
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  proposal: { label: 'Proposal', color: 'bg-yellow-100 text-yellow-700' },
  negotiation: { label: 'Negotiation', color: 'bg-purple-100 text-purple-700' },
  closed_won: { label: 'Won', color: 'bg-green-100 text-green-700' },
  closed_lost: { label: 'Lost', color: 'bg-red-100 text-red-700' },
};

export default function DealList() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list(params);
      setDeals(data);
    } catch (err) {
      setError('Failed to load deals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (stageFilter) params.stage = stageFilter;
    loadDeals(params);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await api.delete(id);
        setDeals(deals.filter((d) => d.id !== id));
      } catch (err) {
        alert('Failed to delete deal');
      }
    }
  };

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'closed_won').reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
          <p className="text-gray-500 mt-1">Manage your sales opportunities</p>
        </div>
        <Link to="/deals/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 w-fit">
          <Plus size={20} />
          Add Deal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Deal Value</p>
          <p className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Won Deals</p>
          <p className="text-2xl font-bold text-green-600">${wonDeals.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Active Deals</p>
          <p className="text-2xl font-bold text-gray-800">{deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              <option value="prospecting">Prospecting</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Won</option>
              <option value="closed_lost">Lost</option>
            </select>
            <button type="submit" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Filter
            </button>
          </form>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stage</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Close Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No deals found</p>
                    <Link to="/deals/new" className="text-blue-600 hover:underline mt-2 inline-block">
                      Create your first deal
                    </Link>
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{deal.title}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">${deal.value?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${stages[deal.stage]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {stages[deal.stage]?.label || deal.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{deal.company_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{deal.expected_close_date || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/deals/${deal.id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(deal.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
