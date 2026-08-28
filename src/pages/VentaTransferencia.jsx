import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { sileo, Toaster } from 'sileo';
import gatitoGif from '../assets/img/img/Caminando.gif'; 

const VentaTransferencia = () => {
    const { usuario, cajaAbierta } = useContext(AuthContext);

    const [bancos, setBancos] = useState([]);
    
    const [bancoSeleccionado, setBancoSeleccionado] = useState('');
    const [monto, setMonto] = useState('');
    const [titular, setTitular] = useState('');
    const [numOperacion, setNumOperacion] = useState('');
    const [cargando, setCargando] = useState(false);

    const [dropdownBancosAbierto, setDropdownBancosAbierto] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownBancosAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resBancos = await api.get('/maestros/entidades');
                const entidades = resBancos.data;
                
                const soloBancos = entidades.filter(b => {
                    const tipo = String(b.tipo || b.Tipo || '').toUpperCase();
                    const estaActivo = b.activo !== false && b.Activo !== false;
                    return estaActivo && tipo === 'BANCO';
                });
                
                setBancos(soloBancos);

                if (soloBancos.length > 0) {
                    const primerBancoID = soloBancos[0].entidadID || soloBancos[0].EntidadID;
                    setBancoSeleccionado(primerBancoID);
                }
            } catch (error) {
                console.error(error);
            }
        };
        
        cargarDatos();
    }, []);

    const handleRegistrarVenta = async (e) => {
        e.preventDefault();

        if (!cajaAbierta) {
            return sileo.error({ title: 'Caja Cerrada', description: 'Abre turno primero para vender' });
        }
        if (!monto || parseFloat(monto) <= 0) {
            return sileo.warning({ title: 'Atención', description: 'Ingresa un monto válido' });
        }
        if (!bancoSeleccionado || !titular || !numOperacion) {
            return sileo.warning({ title: 'Atención', description: 'Complete todos los campos' });
        }

        setCargando(true);
        const uid = usuario?.usuarioID || usuario?.UsuarioID;

        const payload = {
            usuarioID: parseInt(uid),
            tipoComprobanteID: 2, 
            clienteDoc: "00000000",
            clienteNombre: titular.toUpperCase(), 
            detalles: [{ CategoriaID: 1, Monto: parseFloat(monto) }], 
            pagos: [{
                FormaPago: "TRANSFERENCIA", 
                EntidadID: parseInt(bancoSeleccionado),
                NumOperacion: numOperacion,
                NombreTitular: titular.toUpperCase(),
                Monto: parseFloat(monto)
            }]
        };

        try {
            const res = await api.post('/ventas/registrar', payload);
            
            sileo.success({ 
                title: '¡Transferencia Exitosa!', 
                description: `Ticket generado: ${res.data.comprobante || res.data.Comprobante}`
            });

            setMonto(''); 
            setNumOperacion(''); 
            setTitular('');
        } catch (error) {
            const msg = error.response?.data?.mensaje || error.response?.data?.error || 'Error al registrar';
            sileo.error({ title: 'Error', description: msg });
        } finally {
            setCargando(false);
        }
    };

    const obtenerColorDot = (nombreBanco) => {
        const nom = String(nombreBanco).toUpperCase();
        if (nom.includes('INTERBANK')) return 'bg-[#009c3b]';
        if (nom.includes('SCOTIA')) return 'bg-[#ec111a]';
        if (nom.includes('BCP')) return 'bg-[#002a8d]';
        if (nom.includes('BBVA')) return 'bg-[#004481]';
        return 'bg-gray-500';
    };

    const bancosVisibles = bancos.slice(0, 4);
    const bancosOcultos = bancos.slice(4);
    const isHiddenSelected = bancosOcultos.some(b => (b.entidadID || b.EntidadID) === bancoSeleccionado);
    const bancoOcultoActivo = bancosOcultos.find(b => (b.entidadID || b.EntidadID) === bancoSeleccionado);

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

            <section className={`animate-fade-in w-full pb-4 pt-4 transition-opacity duration-500 ${cajaAbierta ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                
                <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-6 max-w-[1100px] mx-auto">
                    
                    <div className="absolute -top-12 left-10 w-24 z-50 pointer-events-none">
                         <img src={gatitoGif} alt="Gatito caminando" className="w-full h-auto mix-blend-multiply contrast-125 animate-[caminarGatito_60s_linear_infinite]" />
                    </div>

                    <div className="bg-[var(--color-header)] p-6 md:p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] lg:w-[45%] flex flex-col transition-colors duration-300">
                        <h2 className="text-2xl font-black text-emerald-600 mb-6 tracking-tight flex items-center gap-3">
                            <i className="fa-solid fa-building-columns"></i> Venta Transferencia
                        </h2>
                        
                        <div className="flex flex-col gap-6 flex-grow">
                            <div className="bg-[var(--color-fondo-app)] p-5 rounded-3xl border-2 border-[var(--border-color)] focus-within:border-emerald-600 transition-colors duration-300 flex flex-col justify-center min-h-[100px]">
                                <label className="text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider mb-2">Monto Transferido</label>
                                <div className="flex items-center">
                                    <span className="text-3xl md:text-4xl font-black text-[var(--texto-secundario)] mr-3">S/</span>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        step="0.01" 
                                        value={monto} 
                                        onChange={e => setMonto(e.target.value)} 
                                        required 
                                        className="w-full bg-transparent text-4xl md:text-5xl font-black text-[var(--texto-principal)] outline-none placeholder:text-[var(--texto-secundario)]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-[0.8rem] font-bold text-[var(--texto-secundario)] uppercase tracking-wider mb-2">
                                    Banco de Destino:
                                </label>
                                
                                <div className="flex flex-wrap gap-3 relative">
                                    {bancos.length === 0 ? (
                                        <p className="text-xs text-[var(--texto-secundario)] animate-pulse">Cargando bancos del sistema...</p>
                                    ) : (
                                        <>
                                            {bancosVisibles.map(b => {
                                                const idBan = b.entidadID || b.EntidadID;
                                                const nombreBan = b.nombre || b.Nombre;
                                                const claseDot = obtenerColorDot(nombreBan);
                                                const estaSeleccionado = bancoSeleccionado === idBan;

                                                return (
                                                    <button 
                                                        key={idBan} 
                                                        type="button"
                                                        onClick={() => setBancoSeleccionado(idBan)}
                                                        className={`relative flex items-center justify-center gap-2.5 border-2 px-5 py-3 rounded-xl cursor-pointer font-bold text-sm transition-colors duration-300 flex-1 sm:flex-none ${
                                                            estaSeleccionado 
                                                                ? 'border-emerald-600 bg-[var(--color-header)] text-[var(--texto-principal)] shadow-sm z-10' 
                                                                : 'bg-[var(--color-header)] border-[var(--border-color)] text-[var(--texto-secundario)] hover:border-[var(--texto-secundario)]'
                                                        }`}
                                                    >
                                                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${claseDot}`}></span> 
                                                        {nombreBan}

                                                        {estaSeleccionado && (
                                                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-600 border-2 border-[var(--color-header)] rounded-full flex items-center justify-center shadow-md animate-[popCheck_0.3s_ease-out_forwards]">
                                                                <i className="fa-solid fa-check text-white text-[9px]"></i>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                            
                                            {bancosOcultos.length > 0 && (
                                                <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDropdownBancosAbierto(!dropdownBancosAbierto)}
                                                        className={`w-full flex items-center justify-between gap-3 border-2 px-5 py-3 rounded-xl cursor-pointer font-bold text-sm transition-all duration-200 outline-none ${
                                                            isHiddenSelected 
                                                                ? 'border-emerald-600 bg-[var(--color-header)] text-[var(--texto-principal)] shadow-sm z-10' 
                                                                : 'bg-[var(--color-header)] border-[var(--border-color)] text-[var(--texto-secundario)] hover:border-[var(--texto-secundario)]'
                                                        } ${dropdownBancosAbierto ? 'ring-4 ring-emerald-600/10 border-emerald-600' : ''}`}
                                                    >
                                                        <span className="flex items-center gap-2.5 truncate">
                                                            {isHiddenSelected && (
                                                                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${obtenerColorDot(bancoOcultoActivo?.nombre || bancoOcultoActivo?.Nombre)}`}></span>
                                                            )}
                                                            <span className="truncate">
                                                                {isHiddenSelected ? (bancoOcultoActivo?.nombre || bancoOcultoActivo?.Nombre) : `Más bancos (${bancosOcultos.length})`}
                                                            </span>
                                                        </span>
                                                        <i className={`fa-solid fa-chevron-down transition-transform duration-300 text-xs flex-shrink-0 ${dropdownBancosAbierto ? 'rotate-180 text-emerald-600' : ''}`}></i>
                                                    </button>

                                                    {dropdownBancosAbierto && (
                                                        <div className="absolute top-full left-0 mt-2 w-full sm:w-60 bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-[0_20px_45px_-10px_rgba(0,0,0,0.2)] z-[60] overflow-hidden p-1.5 origin-top animate-[fade-slide-down_0.16s_ease-out_forwards]">
                                                            {bancosOcultos.map(b => {
                                                                const idBan = b.entidadID || b.EntidadID;
                                                                const nombreBan = b.nombre || b.Nombre;
                                                                const claseDot = obtenerColorDot(nombreBan);
                                                                const isSel = bancoSeleccionado === idBan;
                                                                return (
                                                                    <button
                                                                        key={idBan}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setBancoSeleccionado(idBan);
                                                                            setDropdownBancosAbierto(false);
                                                                        }}
                                                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-150 ${
                                                                            isSel
                                                                                ? 'bg-emerald-600/10 text-emerald-600'
                                                                                : 'text-[var(--texto-principal)] hover:bg-[var(--color-fondo-app)]'
                                                                        }`}
                                                                    >
                                                                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${claseDot}`}></span>
                                                                        <span className="flex-1 text-left truncate">{nombreBan}</span>
                                                                        {isSel && <i className="fa-solid fa-check text-emerald-600 text-xs flex-shrink-0"></i>}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    
                                                    {isHiddenSelected && !dropdownBancosAbierto && (
                                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-600 border-2 border-[var(--color-header)] rounded-full flex items-center justify-center shadow-md animate-[popCheck_0.3s_ease-out_forwards] z-20">
                                                            <i className="fa-solid fa-check text-white text-[9px]"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--color-header)] p-6 md:p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] lg:w-[55%] flex flex-col transition-colors duration-300 relative">
                        
                        <h3 className="text-xl font-black text-[var(--texto-principal)] mb-6 tracking-tight flex items-center gap-3">
                            <i className="fa-solid fa-file-invoice text-emerald-600"></i> Detalles del Voucher
                        </h3>

                        <form onSubmit={handleRegistrarVenta} className="flex flex-col flex-grow gap-6">
                            
                            <div>
                                <label className="block text-[0.8rem] font-bold text-[var(--texto-secundario)] uppercase tracking-wider mb-2">
                                    Nombre del Titular de la Cuenta
                                </label>
                                <div className="relative flex items-center">
                                    <i className="fa-solid fa-user absolute left-4 text-[var(--texto-secundario)]"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Juan Perez" 
                                        value={titular} 
                                        onChange={e => setTitular(e.target.value)} 
                                        required 
                                        className="w-full py-4 pl-12 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:border-emerald-600 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-colors placeholder:font-medium text-base placeholder:text-[var(--texto-secundario)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[0.8rem] font-bold text-[var(--texto-secundario)] uppercase tracking-wider mb-2">
                                    N° de Operación (Voucher)
                                </label>
                                <div className="relative flex items-center">
                                    <i className="fa-solid fa-hashtag absolute left-4 text-[var(--texto-secundario)]"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 123456789" 
                                        maxLength="20" 
                                        value={numOperacion} 
                                        onChange={e => setNumOperacion(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} 
                                        required 
                                        className="w-full py-4 pl-12 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:border-emerald-600 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-colors tracking-widest placeholder:tracking-normal text-lg placeholder:text-[var(--texto-secundario)]"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-2">
                                <button 
                                    type="submit" 
                                    disabled={cargando || !cajaAbierta}
                                    className="w-full bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black tracking-wide text-lg py-4 rounded-2xl shadow-md transition-colors duration-300 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {cargando ? (
                                        <><i className="fa-solid fa-spinner fa-spin text-xl"></i> REGISTRANDO...</>
                                    ) : (
                                        <><i className="fa-solid fa-paper-plane text-xl"></i> CONFIRMAR TRANSFERENCIA</>
                                    )}
                                </button>
                            </div>
                            
                        </form>
                    </div>

                </div>
                <style>
                    {`
                        @keyframes caminarGatito {
                            0% { transform: translateX(-40px) scaleX(1); }
                            49.9% { transform: translateX(65vw) scaleX(1); }
                            50% { transform: translateX(65vw) scaleX(-1); }
                            99.9% { transform: translateX(-70px) scaleX(-1); }
                            100% { transform: translateX(-70px) scaleX(1); }
                        }
                        @keyframes popCheck {
                            0% { transform: scale(0); }
                            100% { transform: scale(1); }
                        }
                        @keyframes fade-slide-down {
                            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}
                </style>
            </section>
        </>
    );
};

export default VentaTransferencia;