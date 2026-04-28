import { useContext, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Layout from './components/Layout';
import Login from './pages/Login';

import './styles/styles/base.css';
import './styles/styles/layout.css';
import './styles/styles/ventas.css';
import './styles/styles/admin-reportes.css';
import './styles/styles/media-queries.css';
import './styles/styles/tablas-modales.css';

// 👇 1. IMPORTACIONES PEREZOSAS (Lazy Loading) para máxima velocidad
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

const LoadingFallback = () => (
    <div style={{ 
        position: 'fixed',   
        top: 0, 
        left: 0,
        width: '100vw',       
        height: '100vh',     
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#09090b',
        zIndex: 9999         
    }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-3x" style={{ color: 'var(--color-primario)' }}></i>
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