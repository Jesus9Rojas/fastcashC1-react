import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';

const TEMAS = [
    { id: 'light', nombre: 'Claro', dot: 'bg-gray-100 border-gray-300', icono: <i className="fa-solid fa-sun text-amber-500"></i> },
    { id: 'dark', nombre: 'Oscuro', dot: 'bg-gray-900 border-gray-600', icono: <i className="fa-solid fa-moon text-blue-400"></i> },
    { id: 'pink', nombre: 'Pink', dot: 'bg-pink-500 border-pink-300', icono: <i className="fa-solid fa-spa text-pink-500"></i> },
    { id: 'red', nombre: 'Rojo', dot: 'bg-red-500 border-red-300', icono: <i className="fa-solid fa-fire text-red-500"></i> },
];

const Header = ({ toggleSidebar, isMobileOpen }) => {
    const { usuario, logout, cajaAbierta, setCajaAbierta } = useContext(AuthContext);
    const navigate = useNavigate();

    const [menuTemaActivo, setMenuTemaActivo] = useState(false);
    const [abriendo, setAbriendo] = useState(false);
    const [fechaActual, setFechaActual] = useState('');
    const [horaActual, setHoraActual] = useState('');
    const [temaActual, setTemaActual] = useState(localStorage.getItem('temaFastCash') || 'light');
    const temaRef = useRef(null);

    useEffect(() => {
        const actualizarReloj = () => {
            const ahora = new Date();
            const fecha = ahora.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' });
            const hora = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
            setFechaActual(fecha.charAt(0).toUpperCase() + fecha.slice(1));
            setHoraActual(hora);
        };
        actualizarReloj();
        const intervalo = setInterval(actualizarReloj, 1000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        document.body.setAttribute('data-theme', temaActual);
    }, [temaActual]);

    useEffect(() => {
        const verificarCaja = async () => {
            try {
                const uid = usuario?.usuarioID || usuario?.UsuarioID;
                const res = await api.get(`/caja/estado/${uid}`);
                const estadoReal = res.data.estado || res.data.Estado;
                setCajaAbierta(estadoReal === 'ABIERTO');
            } catch (e) {
    console.error("Error al verificar estado de la caja:", e);
    setCajaAbierta(false);
}
        };
        if (usuario) verificarCaja();
    }, [usuario, setCajaAbierta]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (temaRef.current && !temaRef.current.contains(event.target)) {
                setMenuTemaActivo(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAbrirCaja = async () => {
        setAbriendo(true);
        try {
            const uid = usuario?.usuarioID || usuario?.UsuarioID;
            await api.post('/caja/abrir', {
                usuarioID: parseInt(uid),
                usuarioId: parseInt(uid),
                saldoInicial: 0.00
            });

            setCajaAbierta(true);

            Swal.fire({
                html: `
                    <div class="flex flex-col items-center mt-2">
                        <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-5 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]">
                            <i class="fa-solid fa-box-open text-4xl"></i>
                        </div>
                        <h2 class="text-2xl font-black text-[var(--texto-principal)] tracking-tight mb-2">¡Turno Iniciado!</h2>
                        <p class="text-[var(--texto-secundario)] font-medium text-sm text-center px-2">
                            Caja abierta correctamente. Puedes comenzar a registrar ventas.
                        </p>
                    </div>
                `,
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'rounded-[2.5rem] p-6 border border-[var(--border-color)] bg-[var(--color-header)] shadow-2xl max-w-sm w-full' }
            });

        } catch (error) {
            const msg = error.response?.data?.mensaje || error.response?.data?.error || "Error al abrir caja";
            Swal.fire({
                html: `
                    <div class="flex flex-col items-center mt-2">
                        <div class="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[1.5rem] flex items-center justify-center text-red-500 dark:text-red-400 mb-5 shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]">
                            <i class="fa-solid fa-triangle-exclamation text-4xl animate-pulse"></i>
                        </div>
                        <h2 class="text-2xl font-black text-[var(--texto-principal)] tracking-tight mb-2">Error</h2>
                        <p class="text-[var(--texto-secundario)] font-medium text-sm text-center px-2">
                            ${msg}
                        </p>
                    </div>
                `,
                confirmButtonText: 'Aceptar',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-[2.5rem] p-6 border border-[var(--border-color)] bg-[var(--color-header)] shadow-2xl max-w-sm w-full',
                    actions: 'flex w-full mt-6 px-2 pb-2',
                    confirmButton: 'w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 font-bold shadow-md hover:shadow-lg transition-all text-sm outline-none m-0'
                }
            });
        } finally {
            setAbriendo(false);
        }
    };

    const cambiarTema = (nuevoTema) => {
        setTemaActual(nuevoTema);
        localStorage.setItem('temaFastCash', nuevoTema);
        setMenuTemaActivo(false);
    };

    const temaSeleccionado = TEMAS.find(t => t.id === temaActual);

    return (
        <header className="h-[75px] bg-[var(--color-header)] flex justify-between items-center px-3 sm:px-6 border-b border-[var(--border-color)] z-40 shrink-0 transition-colors duration-300">

            <div className="flex items-center gap-1 sm:gap-4">
                <button
                    className="w-10 h-10 sm:w-11 sm:h-11 flex flex-col justify-center items-center gap-1.5 rounded-full text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--color-primario)] transition-all duration-300 focus:outline-none"
                    onClick={toggleSidebar}
                    aria-label="Alternar menú"
                >
                    <span className={`block w-5 h-[2px] bg-current rounded-full transition-transform duration-300 ${isMobileOpen ? 'translate-y-[8px] rotate-45' : ''}`}></span>
                    <span className={`block w-4 h-[2px] bg-current rounded-full transition-opacity duration-300 self-start ml-2.5 sm:ml-3 ${isMobileOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-5 h-[2px] bg-current rounded-full transition-transform duration-300 ${isMobileOpen ? '-translate-y-[8px] -rotate-45' : ''}`}></span>
                </button>

                <div className="hidden sm:block w-px h-6 bg-[var(--border-color)] mx-1"></div>

                <div className="relative" ref={temaRef}>
                    <button
                        className={`w-10 h-10 sm:w-11 sm:h-11 flex justify-center items-center rounded-full text-[1.1rem] sm:text-lg transition-all focus:outline-none ${menuTemaActivo ? 'bg-[var(--color-fondo-app)] text-[var(--color-primario)] shadow-inner' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                        onClick={() => setMenuTemaActivo(!menuTemaActivo)}
                        title="Cambiar Tema"
                    >
                        {temaSeleccionado?.icono || <i className="fa-solid fa-palette text-gray-600"></i>}
                    </button>

                    {menuTemaActivo && (
                        <div className="absolute top-14 left-0 bg-[var(--color-header)] border border-[var(--border-color)] rounded-[1.5rem] p-2 w-48 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.15)] flex flex-col gap-1 z-[1000] origin-top-left animate-[fade-slide-down_0.2s_ease-out_forwards]">
                            <span className="px-3 pt-2 pb-1 text-[10px] font-black text-[var(--texto-secundario)] uppercase tracking-widest">Apariencia</span>
                            {TEMAS.map(tema => (
                                <button
                                    key={tema.id}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all ${
                                        temaActual === tema.id
                                            ? 'bg-[var(--color-fondo-app)] text-[var(--color-primario)] shadow-sm'
                                            : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'
                                    }`}
                                    onClick={() => cambiarTema(tema.id)}
                                >
                                    <div className="w-6 flex justify-center text-lg shrink-0">
                                        {tema.icono}
                                    </div>
                                    <span className="flex-1 text-[var(--texto-principal)]">{tema.nombre}</span>
                                    {temaActual === tema.id && <i className="fa-solid fa-circle-check text-[var(--color-primario)] text-xs"></i>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">

                <div className="hidden lg:flex items-center gap-3 bg-[var(--color-fondo-app)] border border-[var(--border-color)] rounded-2xl px-4 py-2 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-[var(--texto-secundario)]">
                        <i className="fa-regular fa-calendar text-xs"></i>
                        <span className="text-[11px] font-bold uppercase tracking-widest">{fechaActual}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]"></div>
                    <div className="flex items-center gap-2">
                        <i className="fa-regular fa-clock text-xs text-[var(--color-primario)]"></i>
                        <span className="text-sm font-black text-[var(--texto-principal)] font-mono tabular-nums tracking-tight">{horaActual}</span>
                    </div>
                </div>

                {!cajaAbierta ? (
                    <button
                        className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] sm:text-sm shadow-md transition-all outline-none"
                        onClick={handleAbrirCaja}
                        disabled={abriendo}
                    >
                        <i className={`fa-solid ${abriendo ? 'fa-spinner fa-spin' : 'fa-box-open'} text-[14px] sm:text-base`}></i>
                        <span>{abriendo ? 'Abriendo...' : 'Abrir Caja'}</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-[12px] sm:text-sm shadow-md cursor-default">
                        <i className="fa-solid fa-check-circle text-[14px] sm:text-base"></i>
                        <span>Caja Abierta</span>
                    </div>
                )}

                <div className="hidden sm:block w-px h-6 bg-[var(--border-color)]"></div>

                <button
                    className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#E60023] hover:bg-[#cc001f] text-white font-bold text-[12px] sm:text-sm shadow-md transition-all outline-none"
                    onClick={() => { logout(); navigate('/login'); }}
                    title="Cerrar Sesión"
                >
                    <i className="fa-solid fa-power-off text-[14px] sm:text-base"></i>
                    <span>Salir</span>
                </button>
            </div>
        </header>
    );
};

export default Header;