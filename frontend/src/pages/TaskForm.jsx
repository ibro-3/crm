import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tasks as api, contacts, deals } from '../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function TaskForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    contact: '',
    deal: '',
  });
  const [contactList, setContactList] = useState([]);
  const [dealList, setDealList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    Promise.all([contacts.list(), deals.list()])
      .then(([c, d]) => {
        setContactList(c);
        setDealList(d);
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
            description: data.description || '',
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            due_date: data.due_date || '',
            contact: data.contact || '',
            deal: data.deal || '',
          });
        })
        .catch(() => setError('Failed to load task'))
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
      navigate('/tasks');
    } catch (err) {
      const message = err.response?.data
        ? JSON.stringify(err.response.data).replace(/[{}"\[\]]/g, '').replace(/,/g, '\n')
        : 'Failed to save task';
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
        <button onClick={() => navigate('/tasks')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{id ? 'Edit' : 'New'} Task</h1>
          <p className="text-gray-500 mt-1">{id ? 'Update task information' : 'Add a new task'}</p>
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Contact</label>
            <select value={form.contact || ''} onChange={(e) => setForm({ ...form, contact: e.target.value ? parseInt(e.target.value) : '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select --</option>
              {contactList.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Related Deal</label>
          <select value={form.deal || ''} onChange={(e) => setForm({ ...form, deal: e.target.value ? parseInt(e.target.value) : '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Select --</option>
            {dealList.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Save size={18} />
            {loading ? 'Saving...' : id ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/tasks')} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
