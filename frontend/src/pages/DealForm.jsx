import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deals as api, contacts, companies } from '../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function DealForm() {
  const [form, setForm] = useState({
    title: '',
    value: 0,
    stage: 'prospecting',
    contact: '',
    company: '',
    expected_close_date: '',
    notes: '',
  });
  const [contactList, setContactList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    Promise.all([contacts.list(), companies.list()])
      .then(([c, comp]) => {
        setContactList(c);
        setCompanyList(comp);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setInitialLoading(false));

    if (id) {
      setInitialLoading(true);
      api.get(id)
        .then((res) => {
          const data = res.data;
          setForm({
            title: data.title || '',
            value: data.value || 0,
            stage: data.stage || 'prospecting',
            contact: data.contact || '',
            company: data.company || '',
            expected_close_date: data.expected_close_date || '',
            notes: data.notes || '',
          });
        })
        .catch(() => setError('Failed to load deal'))
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
      navigate('/deals');
    } catch (err) {
      const message = err.response?.data
        ? JSON.stringify(err.response.data).replace(/[{}"\[\]]/g, '').replace(/,/g, '\n')
        : 'Failed to save deal';
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
        <button onClick={() => navigate('/deals')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{id ? 'Edit' : 'New'} Deal</h1>
          <p className="text-gray-500 mt-1">{id ? 'Update deal information' : 'Add a new deal'}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="prospecting">Prospecting</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <select value={form.contact || ''} onChange={(e) => setForm({ ...form, contact: e.target.value ? parseInt(e.target.value) : '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select --</option>
              {contactList.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value ? parseInt(e.target.value) : '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select --</option>
              {companyList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
          <input type="date" value={form.expected_close_date} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          <button type="button" onClick={() => navigate('/deals')} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
