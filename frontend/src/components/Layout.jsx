import { Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Farmacias de Occidente</h1>
            </div>
          </div>
          <div className="flex space-x-1 pb-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link
              to="/registro-ventas"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/registro-ventas')}`}
            >
              Registro de Ventas
            </Link>
            <Link
              to="/listado-registros"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/listado-registros')}`}
            >
              Listado de Registros
            </Link>
            <Link
              to="/resumen-sucursal"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/resumen-sucursal')}`}
            >
              Resumen por Sucursal
            </Link>
            <Link
              to="/reportes"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/reportes')}`}
            >
              Reportes Excel
            </Link>
            <Link
              to="/sucursales"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/sucursales')}`}
            >
              Sucursales
            </Link>
            <Link
              to="/turnos"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/turnos')}`}
            >
              Turnos
            </Link>
            <Link
              to="/cuentas"
              className={`px-3 py-2 rounded-t text-sm font-medium hover:bg-blue-700 transition ${isActive('/cuentas')}`}
            >
              Cuentas
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
