import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegistroVentas from './pages/RegistroVentas';
import ListadoRegistros from './pages/ListadoRegistros';
import ResumenSucursal from './pages/ResumenSucursal';
import Reportes from './pages/Reportes';
import Sucursales from './pages/Sucursales';
import Turnos from './pages/Turnos';
import Cuentas from './pages/Cuentas';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registro-ventas" element={<RegistroVentas />} />
          <Route path="/listado-registros" element={<ListadoRegistros />} />
          <Route path="/resumen-sucursal" element={<ResumenSucursal />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/sucursales" element={<Sucursales />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/cuentas" element={<Cuentas />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
