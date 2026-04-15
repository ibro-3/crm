import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companies as api } from '../services/api';
import { Plus, Search, Edit2, Trash2, Building2, AlertCircle } from 'lucide-react';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list(params);
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (industryFilter) params.industry = industryFilter;
    loadCompanies(params);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await api.delete(id);
        setCompanies(companies.filter((c) => c.id !== id));
      } catch (err) {
        alert('Failed to delete company');
      }
    }
  };

  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
          <p className="text-gray-500 mt-1">Manage your company profiles</p>
        </div>
        <Link to="/companies/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 w-fit">
          <Plus size={20} />
          Add Company
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Industry</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No companies found</p>
                    <Link to="/companies/new" className="text-blue-600 hover:underline mt-2 inline-block">
                      Add your first company
                    </Link>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{company.name}</td>
                    <td className="px-4 py-3 text-gray-600">{company.industry || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{company.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{company.phone || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/companies/${company.id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(company.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Delete">
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
