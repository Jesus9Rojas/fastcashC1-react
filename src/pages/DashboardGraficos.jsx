import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ContadorAnimado from '../components/ContadorAnimado';
import { sileo, Toaster } from 'sileo';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement, 
    PointElement, 
    LineElement, 
    Filler
);

const DashboardGraficos = () => {
    const { usuario } = useContext(AuthContext);

    const [cargando, setCargando] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const [datosCategoria, setDatosCategoria] = useState({ labels: [], datasets: [] });
    const [datosPagos, setDatosPagos] = useState({ labels: [], datasets: [] });
    const [datosTendencia, setDatosTendencia] = useState({ labels: [], datasets: [] });
    
    const [totalDia, setTotalDia] = useState(0);
    const [totalOperaciones, setTotalOperaciones] = useState(0);
    const [ticketPromedio, setTicketPromedio] = useState(0);

    const esAdmin = String(usuario?.rol || '').toUpperCase() === 'ADMINISTRADOR';

    useEffect(() => {
        let isMounted = true;
        
        const cargarDatosDashboard = async () => {
            if (!esAdmin) return;
            setCargando(true);
            
            try {
                const uid = usuario?.usuarioID || usuario?.UsuarioID;
                const res = await api.get(`/ventas/historial/${uid}`);
                
                if (!isMounted) return;
                
                const ventas = res.data;

                const resumenCategorias = {};
                const resumenPagos = {};
                const resumenHoras = {};
                let sumaTotal = 0;
                let cantidadValidas = 0;

                ventas.forEach(v => {
                    const estado = String(v.estado || v.Estado || '').toUpperCase();
                    if (estado === 'ANULADO') return;

                    const categoria = v.familia || v.Familia || 'Varios';
                    const formaPago = String(v.formapago || v.FormaPago || v.formaPago || 'Efectivo').toUpperCase();
                    const monto = parseFloat(v.importetotal || v.ImporteTotal || v.monto || v.Monto || 0);

                    sumaTotal += monto;
                    cantidadValidas += 1;

                    resumenCategorias[categoria] = (resumenCategorias[categoria] || 0) + monto;
                    
                    let pagoAgrupado = formaPago;
                    if (formaPago === 'QR' || formaPago === 'YAPE' || formaPago === 'PLIN') pagoAgrupado = 'DIGITAL (Yape/Plin)';
                    else if (formaPago === 'TARJETA') pagoAgrupado = 'TARJETA (POS)';
                    else if (formaPago === 'TRANSFERENCIA') pagoAgrupado = 'TRANSFERENCIA';
                    
                    resumenPagos[pagoAgrupado] = (resumenPagos[pagoAgrupado] || 0) + monto;

                    const fechaEmision = v.fechaemision || v.FechaEmision || v.fechaEmision;
                    if (fechaEmision) {
                        const hora = new Date(fechaEmision).getHours();
                        const horaLabel = `${String(hora).padStart(2, '0')}:00`;
                        resumenHoras[horaLabel] = (resumenHoras[horaLabel] || 0) + monto;
                    }
                });

                setTotalDia(sumaTotal);
                setTotalOperaciones(cantidadValidas);
                setTicketPromedio(cantidadValidas > 0 ? sumaTotal / cantidadValidas : 0);

                const paletaColores = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];
                
                setDatosCategoria({
                    labels: Object.keys(resumenCategorias),
                    datasets: [{
                        data: Object.values(resumenCategorias),
                        backgroundColor: paletaColores.slice(0, Object.keys(resumenCategorias).length),
                        borderWidth: 0,
                        hoverOffset: 12,
                        borderRadius: 4,
                    }]
                });

                setDatosPagos({
                    labels: Object.keys(resumenPagos),
                    datasets: [{
                        label: 'Ingresos (S/)',
                        data: Object.values(resumenPagos),
                        backgroundColor: ['rgba(59, 130, 246, 0.85)', 'rgba(16, 185, 129, 0.85)', 'rgba(245, 158, 11, 0.85)', 'rgba(139, 92, 246, 0.85)'],
                        hoverBackgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                        borderRadius: 8,
                        barThickness: 45,
                        borderSkipped: false,
                    }]
                });

                const horasOrdenadas = Object.keys(resumenHoras).sort();
                setDatosTendencia({
                    labels: horasOrdenadas,
                    datasets: [{
                        label: 'Ventas por Hora (S/)',
                        data: horasOrdenadas.map(h => resumenHoras[h]),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#3b82f6',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    }]
                });

            } catch (error) {
                console.error("Error cargando dashboard:", error);
                if (isMounted) sileo.error({ title: 'Error', description: 'No se pudieron cargar los datos del dashboard' });
            } finally {
                if (isMounted) setCargando(false);
            }
        };

        cargarDatosDashboard();

        return () => {
            isMounted = false;
        };
    }, [esAdmin, refreshTrigger, usuario]);

    if (!esAdmin) {
        return (
            <section className="animate-fade-in w-full max-w-full">
                <div className="text-center py-16 px-4">
                    <i className="fa-solid fa-lock text-6xl text-red-500 mb-4"></i>
                    <h2 className="text-2xl font-bold text-[var(--texto-principal)]">Acceso Denegado</h2>
                    <p className="text-gray-500 mt-2">Esta sección es exclusiva para Administradores.</p>
                </div>
            </section>
        );
    }

    return (
        <>
            <Toaster 
                position="top-center" 
                offset={0}
                options={{
                    fill: "#171717",
                    duration: 2500,
                    styles: {
                        title: "text-white!",
                        description: "text-white/90!"
                    }
                }}
            />

            <section className="animate-fade-in w-full max-w-full pb-8 pt-4">
                <div className="bg-white rounded-[2rem] shadow-sm border border-[var(--border-color)] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg p-6 md:p-8">
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full mb-8 pb-6 border-b border-gray-100 gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-[#1F2937] tracking-tight flex items-center gap-3 mb-1">
                                <i className="fa-solid fa-chart-pie text-[#1F2937]"></i>
                                Dashboard Financiero
                            </h2>
                            <p className="text-[#6B7280] font-medium text-[15px]">
                                Resumen visual en tiempo real de las operaciones del día.
                            </p>
                        </div>
                        <button 
                            className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed outline-none"
                            onClick={() => setRefreshTrigger(prev => prev + 1)} 
                            disabled={cargando}
                        >
                            <i className={`fa-solid fa-rotate-right transition-transform duration-500 group-hover:rotate-180 ${cargando ? 'animate-spin text-blue-500' : ''}`}></i> 
                            {cargando ? 'Actualizando...' : 'Actualizar Datos'}
                        </button>
                    </div>

                    {cargando && datosCategoria.labels.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
                            <p className="font-bold text-gray-600 tracking-wide">Analizando estadísticas del día...</p>
                        </div>
                    ) : datosCategoria.labels.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                <i className="fa-solid fa-chart-simple text-2xl text-gray-300"></i>
                            </div>
                            <p className="font-bold text-gray-600 text-base">Aún no hay ventas registradas hoy</p>
                            <p className="text-sm mt-1">Realiza algunas transacciones para visualizar las métricas.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            
                            {/* --- TARJETAS MÉTRICAS SUAVES --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                
                                <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl flex items-center justify-between group overflow-hidden">
                                    <div>
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mb-1.5 block">Ingresos Totales</span>
                                        <h2 className="text-3xl font-black tracking-tight text-gray-800 m-0">
                                            S/ <ContadorAnimado valorFinal={totalDia} duracion={1500} />
                                        </h2>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                        <i className="fa-solid fa-wallet text-2xl"></i>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl flex items-center justify-between group overflow-hidden">
                                    <div>
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mb-1.5 block">Total Operaciones</span>
                                        <h2 className="text-3xl font-black tracking-tight text-gray-800 m-0">
                                            <ContadorAnimado valorFinal={totalOperaciones} duracion={1200} /> <span className="text-sm font-bold text-gray-400">tickets</span>
                                        </h2>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                        <i className="fa-solid fa-receipt text-2xl"></i>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl flex items-center justify-between group overflow-hidden">
                                    <div>
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mb-1.5 block">Ticket Promedio</span>
                                        <h2 className="text-3xl font-black tracking-tight text-gray-800 m-0">
                                            S/ {ticketPromedio.toFixed(2)}
                                        </h2>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                        <i className="fa-solid fa-chart-line text-2xl"></i>
                                    </div>
                                </div>

                            </div>

                            {/* --- GRÁFICO DE LÍNEA --- */}
                            {datosTendencia.labels.length > 0 && (
                                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <h3 className="font-black text-gray-800 text-base mb-4 tracking-tight flex items-center gap-2">
                                        <i className="fa-solid fa-wave-square text-blue-500"></i> Tendencia de Ventas por Hora
                                    </h3>
                                    <div className="relative h-[260px] w-full">
                                        <Line 
                                            data={datosTendencia} 
                                            options={{ 
                                                maintainAspectRatio: false, 
                                                plugins: { 
                                                    legend: { display: false },
                                                    tooltip: {
                                                        backgroundColor: '#1f2937',
                                                        padding: 12,
                                                        titleFont: { size: 13, family: "'Inter', sans-serif" },
                                                        bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
                                                        displayColors: false,
                                                        callbacks: {
                                                            label: (context) => `Ingresos: S/ ${context.parsed.y.toFixed(2)}`
                                                        }
                                                    }
                                                }, 
                                                scales: { 
                                                    y: { 
                                                        beginAtZero: true, 
                                                        grid: { borderDash: [4, 4], color: '#e5e7eb' },
                                                        border: { display: false },
                                                        ticks: { color: '#6b7280', font: { weight: '600' } }
                                                    },
                                                    x: { 
                                                        grid: { display: false },
                                                        border: { display: false },
                                                        ticks: { color: '#6b7280', font: { weight: '600' } }
                                                    } 
                                                } 
                                            }} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- GRID DE GRÁFICOS INFERIORES --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* GRÁFICO CIRCULAR */}
                                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                                    <h3 className="font-black text-gray-800 text-base mb-2 tracking-tight flex items-center gap-2">
                                        <i className="fa-solid fa-chart-pie text-indigo-500"></i> Distribución por Categoría
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-400 mb-6">Participación porcentual de ventas según familia de productos</p>
                                    <div className="relative h-[300px] w-full flex justify-center items-center flex-grow">
                                        <Doughnut 
                                            data={datosCategoria} 
                                            options={{ 
                                                maintainAspectRatio: false,
                                                cutout: '72%',
                                                plugins: { 
                                                    legend: { 
                                                        position: 'bottom',
                                                        labels: { padding: 20, font: { weight: 'bold', size: 12 }, usePointStyle: true, pointStyle: 'circle', color: '#4b5563' }
                                                    },
                                                    tooltip: {
                                                        backgroundColor: '#1f2937',
                                                        padding: 12,
                                                        titleFont: { size: 13 },
                                                        bodyFont: { size: 14, weight: 'bold' },
                                                        displayColors: true,
                                                        boxPadding: 4,
                                                        callbacks: {
                                                            label: (context) => ` S/ ${context.parsed.toFixed(2)}`
                                                        }
                                                    }
                                                } 
                                            }} 
                                        />
                                    </div>
                                </div>

                                {/* GRÁFICO DE BARRAS */}
                                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                                    <h3 className="font-black text-gray-800 text-base mb-2 tracking-tight flex items-center gap-2">
                                        <i className="fa-solid fa-chart-column text-emerald-500"></i> Rendimiento por Medio de Pago
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-400 mb-6">Comparativa de flujo monetario por pasarela o efectivo</p>
                                    <div className="relative h-[300px] w-full flex-grow">
                                        <Bar 
                                            data={datosPagos} 
                                            options={{ 
                                                maintainAspectRatio: false, 
                                                plugins: { 
                                                    legend: { display: false },
                                                    tooltip: {
                                                        backgroundColor: '#1f2937',
                                                        padding: 12,
                                                        titleFont: { size: 13 },
                                                        bodyFont: { size: 14, weight: 'bold' },
                                                        displayColors: false,
                                                        callbacks: {
                                                            label: (context) => `Ingresos: S/ ${context.parsed.y.toFixed(2)}`
                                                        }
                                                    }
                                                }, 
                                                scales: { 
                                                    y: { 
                                                        beginAtZero: true, 
                                                        grid: { borderDash: [4, 4], color: '#e5e7eb' },
                                                        border: { display: false },
                                                        ticks: { color: '#6b7280', font: { weight: '600' } }
                                                    },
                                                    x: { 
                                                        grid: { display: false },
                                                        border: { display: false },
                                                        ticks: { color: '#4b5563', font: { weight: '600' } }
                                                    } 
                                                } 
                                            }} 
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>
                    )}

                </div>
            </section>
        </>
    );
};

export default DashboardGraficos;