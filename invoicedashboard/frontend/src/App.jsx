import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import InvoicesPage from './pages/InvoicesPage';
import CustomersPage from './pages/CustomersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import EditInvoicePage from './pages/EditInvoicePage';

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px 48px', overflowAuto: 'auto', maxWidth: '1100px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/invoices" replace />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<CreateInvoicePage />} />
          <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}