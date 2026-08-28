import { useContext, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Layout from './components/Layout';
import Login from './pages/Login';

// 👇 Solo dejamos base.css donde inyectamos Tailwind y tus variables
import './styles/styles/base.css';

// IMPORTACIONES PEREZOSAS (Lazy Loading) para máxima velocidad
const Bienvenida = lazy(() => import('./pages/Bienvenido'));
const VentaYape = lazy(() => import('./pages/VentaYape'));
const VentaTarjeta = lazy(() => import('./pages/VentaTarjeta'));
const VentaTransferencia = lazy(() => import('./pages/VentaTransferencia'));
const HistorialVentas = lazy(() => import('./pages/HistorialVentas'));
const Configuracion = lazy(() => import('./pages/Configuracion')); 
const Reportes = lazy(() => import('./pages/Reportes')); 
const UsuariosTurnos = lazy(() => import('./pages/UsuariosTurnos'));
const DashboardGraficos = lazy(() => import('./pages/DashboardGraficos'));
const CierreCaja = lazy(() => import('./pages/CierreCaja'));

// LoadingFallback 100% Tailwind
const LoadingFallback = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] z-[9999]">
        <i className="fa-solid fa-circle-notch fa-spin text-5xl text-[var(--color-primario)]"></i>
    </div>
);

function App() {
  const { usuario } = useContext(AuthContext);

  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={!usuario ? <Login /> : <Navigate to="/" />} />

            <Route path="/" element={usuario ? <Layout /> : <Navigate to="/login" />}>
              <Route index element={<Bienvenida />} />
              <Route path="yape" element={<VentaYape />} />
              <Route path="tarjeta" element={<VentaTarjeta />} />
              <Route path="transferencia" element={<VentaTransferencia />} />
              <Route path="historial" element={<HistorialVentas />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="usuarios" element={<UsuariosTurnos />} />
              <Route path="dashboard" element={<DashboardGraficos />} />
              <Route path="cierre" element={<CierreCaja />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;