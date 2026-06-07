import { NavLink } from 'react-router-dom';

const links = [
  { to: '/invoices', label: '🧾 Invoices' },
  { to: '/customers', label: '👥 Customers' },
  { to: '/invoices/new', label: '➕ Create Invoice' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col p-4 gap-1">
      <div className="text-lg font-semibold text-gray-800 mb-6 px-2">
        InvoiceApp
      </div>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </aside>
  );
}