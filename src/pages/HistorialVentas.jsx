import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import { sileo, Toaster } from 'sileo';

const HistorialVentas = () => {
    const { usuario, cajaAbierta } = useContext(AuthContext);
    
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(false);
    
    const [usuariosFiltro, setUsuariosFiltro] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState('');
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const dropdownRef = useRef(null);

    const esAdmin = String(usuario?.rol || '').toUpperCase() === 'ADMINISTRADOR';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const cargarUsuariosFiltro = async () => {
            if (!esAdmin) return;
            try {
                const res = await api.get('/admin/usuarios');
                if (isMounted) setUsuariosFiltro(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        cargarUsuariosFiltro();
        return () => { isMounted = false; };
    }, [esAdmin]);

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            if (!usuario) return;
            setCargando(true);
            try {
                const uid = usuario?.usuarioID || usuario?.UsuarioID;
                const parametros = {};
                if (String(usuario?.rol || '').toUpperCase() === 'ADMINISTRADOR' && filtroSeleccionado) {
                    parametros.filtro = filtroSeleccionado;
                }
                
                const res = await api.get(`/ventas/historial/${uid}`, { params: parametros });
                if (isMounted) setVentas(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) setCargando(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [usuario, filtroSeleccionado, refreshTrigger]);

    const cargarHistorial = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAnular = async (ventaID) => {
        if (!cajaAbierta) {
            sileo.warning({ title: 'Caja Cerrada', description: 'No se puede anular con la caja cerrada' });
            return;
        }

        const confirmacion = await Swal.fire({
            html: `
                <div class="flex flex-col items-center mt-2">
                    <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5 shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]">
                        <i class="fa-solid fa-triangle-exclamation text-4xl animate-pulse"></i>
                    </div>
                    <h2 class="text-2xl font-black text-[var(--texto-principal)] tracking-tight mb-2 transition-colors">¿Anular esta venta?</h2>
                    <p class="text-[var(--texto-secundario)] font-medium text-sm text-center px-2 transition-colors">
                        Esta acción es <b class="text-red-500">irreversible</b> y afectará el cuadre de caja en tiempo real.
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-trash-can mr-2"></i> Anular Venta',
            cancelButtonText: 'Mantener',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-[2rem] p-6 border-2 border-[var(--border-color)] bg-[var(--color-header)] shadow-2xl max-w-md w-full transition-colors',
                actions: 'flex flex-row justify-center gap-4 w-full mt-6 px-2 pb-2 box-border',
                confirmButton: 'whitespace-nowrap flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 px-4 font-bold shadow-md hover:shadow-lg transition-all text-sm outline-none m-0',
                cancelButton: 'whitespace-nowrap flex-1 bg-[var(--color-header)] border-2 border-[var(--border-color)] hover:bg-[var(--color-fondo-app)] text-[var(--texto-principal)] rounded-2xl py-3.5 px-4 font-bold transition-all text-sm outline-none m-0'
            }
        });

        if (confirmacion.isConfirmed) {
            try {
                const uid = usuario?.usuarioID || usuario?.UsuarioID;
                const payload = {
                    ventaID: parseInt(ventaID),
                    ventaId: parseInt(ventaID),
                    usuarioID: parseInt(uid),
                    usuarioId: parseInt(uid),
                    motivo: "Anulación Manual"
                };

                await api.post('/ventas/anular', payload);
                sileo.success({ title: 'Venta Anulada', description: 'La venta se anuló correctamente' });
                cargarHistorial();
            } catch (error) {
                const msg = error.response?.data?.mensaje || error.response?.data?.error || "Error al anular la venta";
                sileo.error({ title: 'Error', description: msg });
            }
        }
    };

    const renderMedioPago = (v) => {
        const formaPagoStr = String(v.formapago || v.FormaPago || v.formaPago || '').toUpperCase().trim();
        const entidadStr = String(v.entidad || v.Entidad || v.entidadbancaria || '').toUpperCase().trim();
        const sufijo = (entidadStr && entidadStr !== 'UNDEFINED' && entidadStr !== 'NULL' && entidadStr !== '') 
            ? ` ${entidadStr}` 
            : '';

        if (['QR', 'YAPE', 'PLIN'].includes(formaPagoStr)) {
            return (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 transition-colors">
                        <i className="fa-solid fa-qrcode text-sm"></i>
                    </div>
                    <span className="font-semibold text-[var(--texto-principal)] transition-colors">{formaPagoStr}{sufijo}</span>
                </div>
            );
        }
        if (formaPagoStr === 'TARJETA') {
            return (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 transition-colors">
                        <i className="fa-regular fa-credit-card text-sm"></i>
                    </div>
                    <span className="font-semibold text-[var(--texto-principal)] transition-colors">TARJETA{sufijo}</span>
                </div>
            );
        }
        if (formaPagoStr === 'TRANSFERENCIA') {
            return (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors">
                        <i className="fa-solid fa-money-bill-transfer text-sm"></i>
                    </div>
                    <span className="font-semibold text-[var(--texto-principal)] transition-colors">TRANSF{sufijo}</span>
                </div>
            );
        }
        if (formaPagoStr !== '') {
            return (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
                        <i className="fa-solid fa-wallet text-sm"></i>
                    </div>
                    <span className="font-semibold text-[var(--texto-principal)] transition-colors">{formaPagoStr}</span>
                </div>
            );
        }
        
        return (
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 transition-colors">
                    <i className="fa-solid fa-money-bill-wave text-sm"></i>
                </div>
                <span className="font-semibold text-[var(--texto-principal)] transition-colors">EFECTIVO</span>
            </div>
        );
    };

    const renderEstado = (estadoStr) => {
        const est = String(estadoStr || '').toUpperCase();
        if (est === 'ANULADO') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold tracking-wide transition-colors">
                    <i className="fa-solid fa-circle-xmark"></i> ANULADO
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold tracking-wide transition-colors">
                <i className="fa-solid fa-circle-check"></i> PAGADO
            </span>
        );
    };

    const usuariosFiltrados = usuariosFiltro.filter(u => {
        const nombre = String(u.nombreCompleto || u.NombreCompleto || u.nombre || u.Nombre || u.username || '').toLowerCase();
        return nombre.includes(busquedaUsuario.toLowerCase());
    });

    const userObj = usuariosFiltro.find(u => String(u.usuarioID || u.UsuarioID || u.usuarioId || u.usuarioid || u.id) === String(filtroSeleccionado));
    const nombreSeleccionado = filtroSeleccionado 
        ? (userObj?.nombreCompleto || userObj?.NombreCompleto || userObj?.nombre || userObj?.Nombre || userObj?.username || '')
        : 'Todos los Usuarios';

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
                
                <div className="bg-[var(--color-header)] rounded-[2rem] shadow-sm border border-[var(--border-color)] flex flex-col overflow-hidden transition-colors duration-300">
                    
                    <div className="p-6 md:p-8 border-b border-[var(--border-color)] bg-[var(--color-fondo-app)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors duration-300">
                        <div>
                            <h2 className="text-3xl font-black text-[var(--texto-principal)] tracking-tight flex items-center gap-3 mb-1 transition-colors duration-300">
                                <i className="fa-solid fa-clock-rotate-left text-[var(--texto-principal)] transition-colors duration-300"></i>
                                Registro de Ventas
                            </h2>
                            <p className="text-[15px] text-[var(--texto-secundario)] font-medium transition-colors duration-300">Supervisión y control de transacciones en tiempo real.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {esAdmin && (
                                <div className="relative w-full sm:w-64" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setDropdownAbierto(!dropdownAbierto)}
                                        className={`w-full flex items-center justify-between gap-3 bg-[var(--color-header)] border-2 px-5 py-3.5 rounded-xl text-sm font-bold text-[var(--texto-principal)] transition-colors shadow-sm outline-none ${dropdownAbierto ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[var(--border-color)] hover:bg-[var(--color-fondo-app)]'}`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <i className="fa-solid fa-users text-blue-500 text-lg"></i>
                                            <span className="truncate">{nombreSeleccionado}</span>
                                        </div>
                                        <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${dropdownAbierto ? 'rotate-180 text-blue-500' : ''}`}></i>
                                    </button>

                                    {dropdownAbierto && (
                                        <div className="absolute top-full right-0 mt-2 w-full sm:w-72 bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-[fade-slide-down_0.15s_ease-out_forwards]">
                                            <div className="p-3 border-b border-[var(--border-color)] bg-[var(--color-fondo-app)]">
                                                <div className="relative">
                                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--texto-secundario)] text-xs"></i>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Buscar usuario..."
                                                        value={busquedaUsuario}
                                                        onChange={(e) => setBusquedaUsuario(e.target.value)}
                                                        className="w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-lg pl-8 pr-3 py-2.5 text-sm font-medium text-[var(--texto-principal)] outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                                <button
                                                    onClick={() => { setFiltroSeleccionado(''); setDropdownAbierto(false); setBusquedaUsuario(''); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${filtroSeleccionado === '' ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span className="truncate"><i className="fa-solid fa-border-all mr-2 w-5 text-center text-[var(--texto-secundario)]"></i> Todos los Usuarios</span>
                                                    {filtroSeleccionado === '' && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                </button>
                                                {usuariosFiltrados.length === 0 ? (
                                                    <div className="px-3 py-4 text-center text-sm text-[var(--texto-secundario)] font-medium">No se encontraron usuarios</div>
                                                ) : (
                                                    usuariosFiltrados.map(u => {
                                                        const uid = String(u.usuarioID || u.UsuarioID || u.usuarioId || u.usuarioid || u.id);
                                                        const nombre = u.nombreCompleto || u.NombreCompleto || u.nombre || u.Nombre || u.username;
                                                        const isSel = String(filtroSeleccionado) === uid;
                                                        return (
                                                            <button
                                                                key={uid}
                                                                onClick={() => { setFiltroSeleccionado(uid); setDropdownAbierto(false); }}
                                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${isSel ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                            >
                                                                <span className="truncate"><i className="fa-solid fa-user-astronaut mr-2 w-5 text-center text-[var(--texto-secundario)]"></i> {nombre}</span>
                                                                {isSel && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <button 
                                className="w-full sm:w-auto bg-[var(--color-header)] border-2 border-[var(--border-color)] text-[var(--texto-principal)] hover:bg-[var(--color-fondo-app)] shadow-sm transition-all px-5 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed outline-none"
                                onClick={cargarHistorial} 
                                disabled={cargando}
                            >
                                <i className={`fa-solid fa-rotate-right transition-transform duration-500 group-hover:rotate-180 ${cargando ? 'animate-spin text-blue-500' : 'text-[var(--texto-secundario)]'}`}></i> 
                                {cargando ? 'Actualizando...' : 'Actualizar Datos'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-[var(--color-header)] border-b border-[var(--border-color)] transition-colors duration-300">
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Cajero</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Medio de Pago</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Familia</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Ref / Comprobante</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider text-right">Monto</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider text-center">Hora</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider text-center">Estado</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] transition-colors duration-300">
                                {cargando ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center gap-3 text-[var(--texto-secundario)]">
                                                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                                                <span className="font-semibold text-sm tracking-wide">Cargando registros...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : ventas.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center gap-3 text-[var(--texto-secundario)]">
                                                <div className="w-16 h-16 rounded-full bg-[var(--color-fondo-app)] flex items-center justify-center mb-2 transition-colors duration-300">
                                                    <i className="fa-solid fa-receipt text-2xl"></i>
                                                </div>
                                                <span className="font-bold text-[var(--texto-secundario)]">No hay ventas registradas</span>
                                                <span className="text-sm">Las transacciones del día aparecerán aquí.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    ventas.map((v, idx) => {
                                        const vID = v.ventaid || v.VentaID || v.ventaID;
                                        const cajero = v.cajero || v.Cajero || 'Sistema';
                                        const familia = v.familia || v.Familia || 'Varios';
                                        const refOp = v.refoperacion || v.RefOperacion || v.comprobante || v.Comprobante || '-';
                                        const monto = parseFloat(v.importetotal || v.ImporteTotal || v.monto || v.Monto || 0).toFixed(2);
                                        const estado = String(v.estado || v.Estado || '').toUpperCase();
                                        const esAnulado = estado === 'ANULADO';
                                        
                                        const fechaEmision = v.fechaemision || v.FechaEmision || v.fechaEmision;
                                        const horaFormateada = fechaEmision ? new Date(fechaEmision).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '--:--';

                                        return (
                                            <tr key={vID || idx} className={`transition-colors duration-200 hover:bg-[var(--color-fondo-app)] ${esAnulado ? 'opacity-60 bg-[var(--color-fondo-app)]' : 'bg-[var(--color-header)]'}`}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[var(--color-fondo-app)] border border-[var(--border-color)] flex items-center justify-center text-[var(--texto-principal)] font-bold text-xs transition-colors duration-300">
                                                            {cajero.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className={`font-bold text-sm transition-colors duration-300 ${esAnulado ? 'text-[var(--texto-secundario)]' : 'text-[var(--texto-principal)]'}`}>{cajero}</span>
                                                    </div>
                                                </td>
                                                <td className={`py-4 px-6 whitespace-nowrap transition-colors duration-300 ${esAnulado ? 'opacity-50 grayscale' : ''}`}>
                                                    {renderMedioPago(v)}
                                                </td>
                                                <td className={`py-4 px-6 text-sm font-semibold transition-colors duration-300 ${esAnulado ? 'text-[var(--texto-secundario)]' : 'text-[var(--texto-principal)]'}`}>
                                                    {familia}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-widest transition-colors duration-300 bg-[var(--color-fondo-app)] border border-[var(--border-color)] ${esAnulado ? 'text-[var(--texto-secundario)]' : 'text-[var(--texto-principal)]'}`}>
                                                        {refOp}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className={`font-black text-lg tracking-tight transition-colors duration-300 ${esAnulado ? 'text-[var(--texto-secundario)] line-through' : 'text-[var(--texto-principal)]'}`}>
                                                        S/ {monto}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`text-sm font-bold transition-colors duration-300 ${esAnulado ? 'text-[var(--texto-secundario)]' : 'text-[var(--texto-secundario)]'}`}>
                                                        {horaFormateada}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {renderEstado(estado)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        {esAnulado ? (
                                                            <span className="w-24 py-2 text-center text-xs font-bold text-[var(--texto-secundario)] transition-colors">Anulada</span>
                                                        ) : (
                                                            <button 
                                                                className="w-28 py-2 rounded-xl text-xs font-bold text-red-500 bg-[var(--color-header)] border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-red-100 outline-none shadow-sm"
                                                                onClick={() => handleAnular(vID)}
                                                            >
                                                                <i className="fa-solid fa-trash-can"></i> Anular
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </section>
            <style>
                {`
                    @keyframes fade-slide-down {
                        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}
            </style>
        </>
    );
};

export default HistorialVentas;