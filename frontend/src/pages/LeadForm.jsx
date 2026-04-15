import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leads as api, companies } from '../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function LeadForm() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    stage: 'new',
    source: '',
    notes: '',
  });
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    companies.list()
      .then((res) => setCompanyList(res))
      .catch(() => setError('Failed to load companies'))
      .finally(() => setInitialLoading(false));

    if (id) {
      setInitialLoading(true);
      api.get(id)
        .then((res) => setForm(res.data))
        .catch(() => setError('Failed to load lead'))
        .finally(() => setInitialLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) await api.update(id, form);
      else await api.create(form);
      navigate('/leads');
    } catch (err) {
      const message = err.response?.data
        ? JSON.stringify(err.response.data).replace(/[{}"\[\]]/g, '').replace(/,/g, '\n')
        : 'Failed to save lead';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/leads')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{id ? 'Edit' : 'New'} Lead</h1>
          <p className="text-gray-500 mt-1">{id ? 'Update lead information' : 'Add a new lead'}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value ? parseInt(e.target.value) : '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select --</option>
              {companyList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Select --</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
            <option value="advertising">Advertising</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Save size={18} />
            {loading ? 'Saving...' : id ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/leads')} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
