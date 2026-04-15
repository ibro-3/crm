import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasks as api } from '../services/api';
import { Plus, Search, Edit2, Trash2, CheckSquare, AlertCircle } from 'lucide-react';

const priorities = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
};

const statuses = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
};

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list(params);
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    loadTasks(params);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(id);
        setTasks(tasks.filter((t) => t.id !== id));
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage your tasks and to-dos</p>
        </div>
        <Link to="/tasks/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 w-fit">
          <Plus size={20} />
          Add Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-800">{pendingTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Due Date</th>
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
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <CheckSquare size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No tasks found</p>
                    <Link to="/tasks/new" className="text-blue-600 hover:underline mt-2 inline-block">
                      Create your first task
                    </Link>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{task.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statuses[task.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statuses[task.status]?.label || task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorities[task.priority]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {priorities[task.priority]?.label || task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{task.due_date || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/tasks/${task.id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Delete">
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
