import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContactList from './pages/ContactList';
import ContactForm from './pages/ContactForm';
import LeadList from './pages/LeadList';
import LeadForm from './pages/LeadForm';
import DealList from './pages/DealList';
import DealForm from './pages/DealForm';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import CompanyList from './pages/CompanyList';
import CompanyForm from './pages/CompanyForm';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<ContactList />} />
          <Route path="contacts/new" element={<ContactForm />} />
          <Route path="contacts/:id" element={<ContactForm />} />
          <Route path="leads" element={<LeadList />} />
          <Route path="leads/new" element={<LeadForm />} />
          <Route path="leads/:id" element={<LeadForm />} />
          <Route path="deals" element={<DealList />} />
          <Route path="deals/new" element={<DealForm />} />
          <Route path="deals/:id" element={<DealForm />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/new" element={<TaskForm />} />
          <Route path="tasks/:id" element={<TaskForm />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/new" element={<CompanyForm />} />
          <Route path="companies/:id" element={<CompanyForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}