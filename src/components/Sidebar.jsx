import { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import logo from '../assets/img/img/LogoYapeRojas.png';
import avatar from '../assets/img/icon/mujer.png';
import transferencia from '../assets/img/icon/transferencia-movil.png';
import tarjeta from '../assets/img/icon/tarjeta-icon.png';
import anular from '../assets/img/icon/anular-icon.png';
import configuracion from '../assets/img/icon/configuracion-web.png';
import reportes from '../assets/img/icon/reporte-icon.png';

const ItemNav = ({ to, icono, texto, activo, onNavigate, colapsado }) => (
    <li>
        <NavLink
            to={to}
            onClick={onNavigate}
            className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group overflow-hidden ${
                activo
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
        >
            {activo && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>}
            
            <div className={`w-6 flex justify-center shrink-0 transition-transform duration-300 ${activo ? 'scale-110 text-white' : 'group-hover:scale-110'}`}>
                {icono}
            </div>
            <span className={`whitespace-nowrap tracking-wide transition-all duration-300 ${colapsado ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                {texto}
            </span>
        </NavLink>
    </li>
);

const Sidebar = ({ colapsado, mobileOpen, onNavigate }) => {
    const { usuario } = useContext(AuthContext);
    const location = useLocation();

    const [showModalPerfil, setShowModalPerfil] = useState(false);

    const isActivo = (path) => location.pathname === path;
    const esAdmin = String(usuario?.rol || '').toUpperCase() === 'ADMINISTRADOR';

    const iconoImg = (src, ruta) => (
        <img
            src={src}
            alt=""
            className={`w-5 h-5 transition-all duration-300 ${isActivo(ruta) ? 'grayscale-0 opacity-100' : 'grayscale invert opacity-60 group-hover:opacity-100'}`}
        />
    );

    return (
        <>
            <nav
                className={`fixed md:relative flex flex-col bg-[var(--color-sidebar-bg)] text-white z-[100] transition-all duration-300 ease-in-out border-white/10 top-3 left-3 h-[calc(100vh-24px)] w-[270px] rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] ${mobileOpen ? 'translate-x-0 opacity-100 visible pointer-events-auto' : '-translate-x-[120%] opacity-0 invisible pointer-events-none md:pointer-events-auto md:visible md:opacity-100 md:translate-x-0'} md:top-0 md:left-0 md:h-full md:rounded-none md:shadow-none md:border-r md:border-y-0 md:border-l-0 ${colapsado ? 'md:w-[84px]' : 'md:w-[256px]'}`}
            >
                <div className={`p-6 flex flex-col items-center border-b border-white/5 transition-all duration-300 ${colapsado ? 'pb-5' : 'pb-6'}`}>
                    <div className={`flex justify-center transition-all duration-300 ${colapsado ? 'h-0 opacity-0 overflow-hidden' : 'h-14 opacity-100'}`}>
                        <img src={logo} className="h-full w-auto object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" alt="Logo" />
                    </div>
                    {colapsado && (
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner">
                            R
                        </div>
                    )}
                </div>

                <ul className="flex-1 overflow-y-auto flex flex-col gap-1.5 p-4 hide-scrollbar">

                    <li className={`text-[10px] font-black text-white/40 uppercase tracking-widest px-2 pb-1 pt-2 transition-all ${colapsado ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100'}`}>
                        Caja & Operaciones
                    </li>

                    <ItemNav
                        to="/yape"
                        onNavigate={onNavigate}
                        colapsado={colapsado}
                        activo={isActivo('/yape')}
                        texto="Venta Digital"
                        icono={<i className={`fa-solid fa-qrcode text-lg ${isActivo('/yape') ? 'text-purple-300' : ''}`}></i>}
                    />
                    <ItemNav
                        to="/tarjeta"
                        onNavigate={onNavigate}
                        colapsado={colapsado}
                        activo={isActivo('/tarjeta')}
                        texto="Venta Tarjeta"
                        icono={iconoImg(tarjeta, '/tarjeta')}
                    />
                    <ItemNav
                        to="/transferencia"
                        onNavigate={onNavigate}
                        colapsado={colapsado}
                        activo={isActivo('/transferencia')}
                        texto="Transferencias"
                        icono={iconoImg(transferencia, '/transferencia')}
                    />
                    <ItemNav
                        to="/historial"
                        onNavigate={onNavigate}
                        colapsado={colapsado}
                        activo={isActivo('/historial')}
                        texto="Historial / Anular"
                        icono={iconoImg(anular, '/historial')}
                    />

                    {esAdmin && (
                        <>
                            <div className={`h-px bg-white/5 my-3 transition-all ${colapsado ? 'mx-2' : 'mx-0'}`}></div>
                            <li className={`text-[10px] font-black text-white/40 uppercase tracking-widest px-2 pb-1 transition-all ${colapsado ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100'}`}>
                                Administración
                            </li>

                            <ItemNav
                                to="/configuracion"
                                onNavigate={onNavigate}
                                colapsado={colapsado}
                                activo={isActivo('/configuracion')}
                                texto="Configuración"
                                icono={iconoImg(configuracion, '/configuracion')}
                            />
                            <ItemNav
                                to="/reportes"
                                onNavigate={onNavigate}
                                colapsado={colapsado}
                                activo={isActivo('/reportes')}
                                texto="Reportes"
                                icono={iconoImg(reportes, '/reportes')}
                            />
                            <ItemNav
                                to="/usuarios"
                                onNavigate={onNavigate}
                                colapsado={colapsado}
                                activo={isActivo('/usuarios')}
                                texto="Usuarios & Turnos"
                                icono={<i className={`fa-solid fa-users text-lg ${isActivo('/usuarios') ? 'text-indigo-300' : ''}`}></i>}
                            />
                            <ItemNav
                                to="/dashboard"
                                onNavigate={onNavigate}
                                colapsado={colapsado}
                                activo={isActivo('/dashboard')}
                                texto="Dashboard"
                                icono={<i className={`fa-solid fa-chart-pie text-lg ${isActivo('/dashboard') ? 'text-emerald-400' : ''}`}></i>}
                            />
                        </>
                    )}
                </ul>

                <div className="p-4 border-t border-white/5 bg-black/10 flex flex-col gap-3">
                    
                    <div
                        className={`flex items-center rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:bg-white/10 ${colapsado ? 'justify-center p-2' : 'gap-3 p-3 bg-black/20'}`}
                        onClick={() => setShowModalPerfil(true)}
                        title="Ver mi perfil"
                    >
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-[var(--color-sidebar-bg)] shadow-md transition-colors duration-300">
                                <img src={avatar} alt="Foto" className="w-full h-full object-cover" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--color-sidebar-bg)] transition-colors duration-300"></span>
                        </div>
                        <div className={`flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-300 ${colapsado ? 'w-0 opacity-0 hidden' : 'w-full opacity-100'}`}>
                            <span className="font-bold text-sm text-gray-200 truncate">{usuario?.nombreCompleto || 'Cargando...'}</span>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest truncate mt-0.5">
                                {usuario?.rol || '...'}
                            </span>
                        </div>
                    </div>

                    <NavLink
                        to="/cierre"
                        onClick={onNavigate}
                        className={({ isActive }) => `flex items-center justify-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group outline-none ${
                            isActive
                                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-transparent'
                        }`}
                        title="Cierre de Caja"
                    >
                        <div className="w-6 flex justify-center text-lg shrink-0 transition-transform group-hover:scale-110">
                            <i className="fa-solid fa-cash-register"></i>
                        </div>
                        <span className={`whitespace-nowrap transition-all duration-300 tracking-wide ${colapsado ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            Cierre de Caja
                        </span>
                    </NavLink>
                </div>
            </nav>

            {showModalPerfil && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
                    onClick={() => setShowModalPerfil(false)}
                >
                    <div
                        className="bg-[var(--color-header)] w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[var(--border-color)] transform transition-all animate-[fade-slide-up_0.3s_ease-out]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 px-6 py-6 flex justify-between items-start text-white relative">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <h3 className="m-0 text-xl font-black tracking-tight relative z-10 flex items-center gap-2">
                                <i className="fa-solid fa-id-badge"></i> Perfil de Usuario
                            </h3>
                            <button
                                className="text-white/70 hover:text-white hover:rotate-90 hover:scale-110 transition-all text-2xl leading-none relative z-10 outline-none"
                                onClick={() => setShowModalPerfil(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 relative">
                            <div className="flex justify-center -mt-14 mb-5 relative z-20">
                                <div className="w-24 h-24 rounded-full border-4 border-[var(--color-header)] bg-[var(--color-fondo-app)] shadow-xl overflow-hidden relative transition-colors duration-300">
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <p className="font-black text-[var(--texto-principal)] text-2xl m-0 tracking-tight">{usuario?.nombreCompleto || 'No definido'}</p>
                                <span className="inline-block mt-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                    {usuario?.rol || 'Personal'}
                                </span>
                            </div>

                            <div className="bg-[var(--color-fondo-app)] border border-[var(--border-color)] p-4 rounded-2xl flex flex-col gap-4 mb-6 transition-colors duration-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-[var(--texto-secundario)] font-bold uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-clock text-gray-400"></i> Turno Actual</span>
                                    <span className="font-bold text-[var(--texto-principal)]">{usuario?.turno || 'General'}</span>
                                </div>
                                <div className="h-px w-full bg-[var(--border-color)] transition-colors duration-300"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-[var(--texto-secundario)] font-bold uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-shield-halved text-gray-400"></i> Estado Sistema</span>
                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span> Operativo
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 outline-none"
                                onClick={() => setShowModalPerfil(false)}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
        </>
    );
};

export default Sidebar;