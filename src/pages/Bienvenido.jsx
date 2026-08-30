import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoAnimado from '../assets/img/img/LogoYapeRojas.png'; 
import Gatito from '../assets/img/img/Tolon.png';

const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
};

const Bienvenida = () => {
    const { usuario } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [cargando, setCargando] = useState(true);
    const [saludo] = useState(obtenerSaludo());

    useEffect(() => {
        const timer = setTimeout(() => {
            setCargando(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                <img 
                    src={logoAnimado} 
                    alt="Cargando..." 
                    className="w-44 animate-pulse drop-shadow-[0_0_15px_rgba(230,0,35,0.4)]"
                />
                <p className="mt-5 text-[var(--texto-secundario)] font-semibold tracking-wide">
                    Preparando tu área de trabajo...
                </p>
            </div>
        );
    }

    const primerNombre = usuario?.nombreCompleto?.split(' ')[0] || 'Humano';

    return (
        <div className="animate-fade-in pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans transition-colors duration-300">
            
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 md:mt-12 mb-16 md:mb-24 gap-12 md:gap-8">
                
                <div className="text-center md:text-left z-10 w-full md:w-[55%] lg:w-[60%] order-1">
                    <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] xl:text-[5rem] font-black text-[var(--texto-principal)] tracking-tighter mb-4 leading-[1.1] transition-colors duration-300">
                        {saludo}, <br className="hidden md:block" />
                        <span className="text-[var(--color-primario)]">{primerNombre}</span>
                    </h1>
                    <p className="text-[var(--texto-secundario)] font-medium text-base sm:text-lg lg:text-xl max-w-lg mx-auto md:mx-0 transition-colors duration-300">
                        ¿Qué deseas hacer en este turno? Selecciona una acción rápida para comenzar.
                    </p>
                </div>

                <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 flex-shrink-0 z-10 order-2 mt-8 md:mt-0">
                    
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:top-[10%] md:left-auto md:right-[85%] md:translate-x-0 animate-float z-20 w-max pointer-events-none">
                        <div className="bg-[var(--color-header)] border border-[var(--border-color)] shadow-[0_15px_35px_rgba(0,0,0,0.15)] rounded-2xl px-5 py-3 md:px-6 md:py-4 text-sm md:text-[0.95rem] font-extrabold text-[var(--texto-principal)] relative transition-colors duration-300 text-center md:text-left">
                            ¡Miau! Bienvenido,<br/>
                            <span className="text-[var(--color-primario)]">{primerNombre}</span> 🐾
                            
                            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 w-0 h-0 border-y-[12px] border-y-transparent border-l-[12px] border-l-[var(--border-color)]"></div>
                            <div className="block md:hidden absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-[12px] border-x-transparent border-t-[12px] border-t-[var(--border-color)]"></div>
                        </div>
                    </div>
                    
                    <img 
                        src={Gatito} 
                        alt="Asistente Tolon" 
                        className="w-full h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] relative z-10 transform scale-110 md:scale-125 origin-bottom" 
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-7 bg-[var(--color-primario)] rounded-full shadow-sm"></div>
                <h3 className="text-2xl font-black text-[var(--texto-principal)] tracking-tight m-0 transition-colors duration-300">
                    Centro de Mando
                </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div 
                    onClick={() => navigate('/yape')} 
                    className="group relative bg-[var(--color-header)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] hover:border-purple-300 hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px] z-10 hover:-translate-y-1.5"
                >
                    <div className="flex justify-between items-start w-full">
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 text-3xl transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white shadow-inner">
                            <i className="fa-solid fa-qrcode"></i>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--texto-secundario)] transition-all duration-300 group-hover:border-purple-200 group-hover:text-purple-600 group-hover:-rotate-45 group-hover:bg-purple-50">
                            <i className="fa-solid fa-arrow-right text-base"></i>
                        </div>
                    </div>
                    
                    <div className="mt-8 relative z-10">
                        <h4 className="text-2xl font-extrabold text-[var(--texto-principal)] mb-1.5 tracking-tight transition-colors duration-300">Venta Digital</h4>
                        <p className="text-[0.9rem] text-[var(--texto-secundario)] font-medium transition-colors duration-300">Registrar pagos con Yape o Plin</p>
                    </div>

                    <div className="absolute -bottom-6 -right-6 text-[12rem] text-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10 transform group-hover:scale-110 group-hover:-rotate-12">
                        <i className="fa-solid fa-qrcode"></i>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/tarjeta')} 
                    className="group relative bg-[var(--color-header)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] hover:border-blue-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px] z-10 hover:-translate-y-1.5"
                >
                    <div className="flex justify-between items-start w-full">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-3xl transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white shadow-inner">
                            <i className="fa-regular fa-credit-card"></i>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--texto-secundario)] transition-all duration-300 group-hover:border-blue-200 group-hover:text-blue-600 group-hover:-rotate-45 group-hover:bg-blue-50">
                            <i className="fa-solid fa-arrow-right text-base"></i>
                        </div>
                    </div>
                    
                    <div className="mt-8 relative z-10">
                        <h4 className="text-2xl font-extrabold text-[var(--texto-principal)] mb-1.5 tracking-tight transition-colors duration-300">Venta Tarjeta</h4>
                        <p className="text-[0.9rem] text-[var(--texto-secundario)] font-medium transition-colors duration-300">Cobros con terminal POS</p>
                    </div>

                    <div className="absolute -bottom-6 -right-6 text-[12rem] text-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10 transform group-hover:scale-110 group-hover:-rotate-12">
                        <i className="fa-regular fa-credit-card"></i>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/historial')} 
                    className="group relative bg-[var(--color-header)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] hover:border-amber-300 hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px] z-10 hover:-translate-y-1.5"
                >
                    <div className="flex justify-between items-start w-full">
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500 text-3xl transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white shadow-inner">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--texto-secundario)] transition-all duration-300 group-hover:border-amber-200 group-hover:text-amber-600 group-hover:-rotate-45 group-hover:bg-amber-50">
                            <i className="fa-solid fa-arrow-right text-base"></i>
                        </div>
                    </div>
                    
                    <div className="mt-8 relative z-10">
                        <h4 className="text-2xl font-extrabold text-[var(--texto-principal)] mb-1.5 tracking-tight transition-colors duration-300">Historial</h4>
                        <p className="text-[0.9rem] text-[var(--texto-secundario)] font-medium transition-colors duration-300">Revisar o anular operaciones</p>
                    </div>

                    <div className="absolute -bottom-6 -right-6 text-[12rem] text-amber-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10 transform group-hover:scale-110 group-hover:-rotate-12">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Bienvenida;