import { Link, useLocation } from 'react-router';

export function NavBar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Gantt Chart' },
    { to: '/timeline', label: 'Timeline' },
  ];

  return (
    <nav className="flex items-center gap-1 border-b border-slate-200 bg-white px-4 py-2">
      <h1 className="mr-6 text-lg font-bold text-slate-800">PM Tracker</h1>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            location.pathname === link.to
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
