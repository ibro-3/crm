import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leads as api } from '../services/api';
import { Plus, Search, Edit2, Trash2, Target, AlertCircle } from 'lucide-react';

const stages = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-700' },
  won: { label: 'Won', color: 'bg-green-100 text-green-700' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700' },
};

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list(params);
      setLeads(data);
    } catch (err) {
      setError('Failed to load leads');
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
    loadLeads(params);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(id);
        setLeads(leads.filter((l) => l.id !== id));
      } catch (err) {
        alert('Failed to delete lead');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
          <p className="text-gray-500 mt-1">Track and manage your sales leads</p>
        </div>
        <Link to="/leads/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 w-fit">
          <Plus size={20} />
          Add Lead
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search leads..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stage</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Source</th>
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
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <Target size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No leads found</p>
                    <Link to="/leads/new" className="text-blue-600 hover:underline mt-2 inline-block">
                      Create your first lead
                    </Link>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.company_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${stages[lead.stage]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {stages[lead.stage]?.label || lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{lead.source || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/leads/${lead.id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(lead.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Delete">
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
