import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import InvoicesPage from './pages/InvoicesPage';
import CustomerPage from './pages/CustomerPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import EditInvoicePage from './pages/EditInvoicePage.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/invoices" replace />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<CreateInvoicePage />} />
          <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customers/:id" element={<CustomerProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}