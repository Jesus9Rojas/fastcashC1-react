import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { sileo, Toaster } from 'sileo';
import gatitoGif from '../assets/img/img/Caminando.gif'; 

const MAPA_ICONOS_VENTAS = {
    'Comestibles': '📦', 'Bebidas': '🥤', 'Licores': '🍷',
    'Limpieza': '🧹', 'Cuidado Personal': '🧴', 'Frescos': '🥦',
    'Plasticos': '🍽️', 'Libreria': '✏️', 'Bazar': '🛍️',
    'Yape': '🟣', 'Plin': '🔵', 'BCP': '🟠', 'BBVA': '🔵',
    'Interbank': '🟢', 'Scotiabank': '🔴', 'Efectivo': '💵'
};

const VentaYape = () => {
    const { usuario, cajaAbierta } = useContext(AuthContext); 

    const [familias, setFamilias] = useState([]);
    const [bancos, setBancos] = useState([]);
    
    const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
    const [bancoSeleccionado, setBancoSeleccionado] = useState('');
    const [monto, setMonto] = useState('');
    const [comprobante, setComprobante] = useState('2'); 
    const [numOperacion, setNumOperacion] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarDatosMaestros = async () => {
            try {
                const resFamilias = await api.get('/maestros/categorias');
                const familiasActivas = resFamilias.data.filter(f => 
                    f.activo === true || f.Activo === true || String(f.activo) === 'true'
                );
                
                setFamilias(familiasActivas);
                if (familiasActivas.length > 0) {
                    const catComestibles = familiasActivas.find(c => {
                        const nombreCat = (c.nombre || c.Nombre || '').toUpperCase();
                        return nombreCat.includes('COMESTIBLE');
                    });
                    
                    if (catComestibles) {
                        setFamiliaSeleccionada(catComestibles.categoriaID || catComestibles.CategoriaID);
                    } else {
                        setFamiliaSeleccionada(familiasActivas[0].categoriaID || familiasActivas[0].CategoriaID);
                    }
                }

                const resBancos = await api.get('/maestros/entidades');
                const entidades = resBancos.data;
                
                const billeteras = entidades.filter(b => {
                    const tipo = String(b.tipo || b.Tipo || '').toUpperCase(); 
                    const nombre = String(b.nombre || b.Nombre || '').toUpperCase();
                    const estaActivo = b.activo !== false && b.Activo !== false;

                    return estaActivo && (tipo.includes('BILLETERA') || nombre.includes('BCP') || nombre.includes('BBVA'));
                });
                
                setBancos(billeteras);

                if (billeteras.length > 0) {
                    const primerBancoID = billeteras[0].entidadID || billeteras[0].EntidadID;
                    setBancoSeleccionado(primerBancoID);
                }
                
            } catch (error) {
                console.error(error);
            }
        };

        cargarDatosMaestros();
    }, []);

    const handleRegistrarVenta = async (e) => {
        e.preventDefault();
        
        if (!cajaAbierta) {
            return sileo.error({ title: 'Caja Cerrada', description: 'Abre turno primero para vender' });
        }
        if (!monto || parseFloat(monto) <= 0) {
            return sileo.warning({ title: 'Atención', description: 'Ingresa un monto válido' });
        }
        if (!familiaSeleccionada || !bancoSeleccionado || !numOperacion) {
            return sileo.warning({ title: 'Atención', description: 'Complete todos los campos' });
        }

        setCargando(true);
        const uid = usuario?.usuarioID || usuario?.UsuarioID;

        const payload = {
            usuarioID: parseInt(uid),
            tipoComprobanteID: parseInt(comprobante),
            clienteDoc: "00000000",
            clienteNombre: "PUBLICO GENERAL",
            detalles: [{ CategoriaID: parseInt(familiaSeleccionada), Monto: parseFloat(monto) }],
            pagos: [{
                FormaPago: "QR", 
                EntidadID: parseInt(bancoSeleccionado),
                NumOperacion: numOperacion,
                Monto: parseFloat(monto)
            }]
        };

        try {
            const res = await api.post('/ventas/registrar', payload);
            
            sileo.success({ 
                title: '¡Venta Exitosa!', 
                description: `Ticket generado: ${res.data.comprobante || res.data.Comprobante}`
            });

            setMonto(''); 
            setNumOperacion('');
            setComprobante('2');
        } catch (error) {
            const msg = error.response?.data?.mensaje || error.response?.data?.error || 'No se pudo registrar la venta';
            sileo.error({ title: 'Error', description: msg });
        } finally {
            setCargando(false);
        }
    };
    
    const obtenerColorDot = (nombreBanco) => {
        const nom = String(nombreBanco).toUpperCase();
        if (nom.includes('YAPE')) return 'bg-[var(--color-primario)]';
        if (nom.includes('PLIN')) return 'bg-[#00e4c0]';
        if (nom.includes('BCP')) return 'bg-[#002a8d]';
        if (nom.includes('BBVA')) return 'bg-[#004481]';
        return 'bg-gray-500';
    };

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

            <section className={`animate-fade-in w-full h-full pb-8 pt-4 transition-opacity duration-500 ${cajaAbierta ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                
                <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-6 max-w-[1100px] mx-auto">
                    
                    <div className="absolute -top-12 left-10 w-24 z-50 pointer-events-none">
                         <img src={gatitoGif} alt="Gatito caminando" className="w-full h-auto mix-blend-multiply contrast-125 animate-[caminarGatito_60s_linear_infinite]" />
                    </div>

                    <div className="bg-[var(--color-header)] p-6 md:p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] lg:w-[45%] flex flex-col transition-colors duration-300">
                        <h3 className="text-2xl font-black text-[var(--texto-principal)] mb-6 tracking-tight flex items-center gap-3">
                            <i className="fa-solid fa-bag-shopping text-[var(--color-primario)]"></i> ¿Qué vendiste?
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pb-2 flex-grow content-start w-full">
                            {familias.length === 0 ? (
                                <p className="col-span-full text-center text-[var(--texto-secundario)] font-medium py-10 animate-pulse">Cargando familias...</p>
                            ) : (
                                familias.map(f => {
                                    const id = f.categoriaID || f.CategoriaID;
                                    const nombre = f.nombre || f.Nombre;
                                    const icono = MAPA_ICONOS_VENTAS[nombre] || '📦';
                                    const estaSeleccionada = familiaSeleccionada === id;

                                    return (
                                        <button 
                                            key={id} 
                                            type="button"
                                            className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl cursor-pointer transition-colors duration-300 border-2 ${
                                                estaSeleccionada 
                                                    ? 'border-[var(--color-primario)] bg-[var(--color-header)] text-[var(--color-primario)] shadow-sm z-10' 
                                                    : 'border-[var(--border-color)] bg-[var(--color-header)] text-[var(--texto-secundario)] hover:border-[var(--texto-secundario)]'
                                            }`}
                                            onClick={() => setFamiliaSeleccionada(id)}
                                        >
                                            <span className={`text-2xl sm:text-3xl mb-1.5 transition-transform duration-300 ${estaSeleccionada ? 'grayscale-0 scale-110' : 'grayscale-[0.3]'}`}>
                                                {icono}
                                            </span>
                                            <span className={`text-[0.7rem] sm:text-[0.8rem] font-bold text-center leading-tight`}>
                                                {nombre}
                                            </span>

                                            {estaSeleccionada && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-primario)] border-2 border-[var(--color-header)] rounded-full flex items-center justify-center shadow-md animate-[popCheck_0.3s_ease-out_forwards]">
                                                    <i className="fa-solid fa-check text-white text-[10px]"></i>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="bg-[var(--color-header)] p-6 md:p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] lg:w-[55%] flex flex-col transition-colors duration-300 relative">
                        
                        <h2 className="text-2xl font-black text-[var(--color-primario)] mb-6 tracking-tight flex items-center gap-3">
                            <i className="fa-solid fa-mobile-screen-button"></i> Pago Digital
                        </h2>

                        <form onSubmit={handleRegistrarVenta} className="flex flex-col gap-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4">
                                
                                <div className="bg-[var(--color-fondo-app)] p-5 rounded-3xl border-2 border-[var(--border-color)] focus-within:border-[var(--color-primario)] transition-colors duration-300 flex flex-col justify-center min-h-[100px]">
                                    <label className="text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider mb-2">Importe a Cobrar</label>
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

                                <div className="flex flex-col gap-2 justify-center h-full">
                                    <button type="button" onClick={() => setComprobante('2')} className={`flex items-center justify-center py-2.5 px-4 rounded-xl border-2 font-bold text-sm transition-colors duration-300 ${comprobante === '2' ? 'bg-[var(--color-header)] border-[var(--color-primario)] text-[var(--color-primario)] shadow-sm' : 'bg-[var(--color-header)] border-[var(--border-color)] text-[var(--texto-secundario)] hover:border-[var(--texto-secundario)] hover:text-[var(--texto-principal)]'}`}>
                                        Boleta
                                    </button>
                                    <button type="button" onClick={() => setComprobante('1')} className={`flex items-center justify-center py-2.5 px-4 rounded-xl border-2 font-bold text-sm transition-colors duration-300 ${comprobante === '1' ? 'bg-[var(--color-header)] border-[var(--color-primario)] text-[var(--color-primario)] shadow-sm' : 'bg-[var(--color-header)] border-[var(--border-color)] text-[var(--texto-secundario)] hover:border-[var(--texto-secundario)] hover:text-[var(--texto-principal)]'}`}>
                                        Factura
                                    </button>
                                    <button type="button" onClick={() => setComprobante('4')} className={`flex items-center justify-center py-2.5 px-4 rounded-xl border-2 font-bold text-sm transition-colors duration-300 ${comprobante === '4' ? 'bg-[var(--color-header)] border-[var(--color-primario)] text-[var(--color-primario)] shadow-sm' : 'bg-[var(--color-header)] border-[var(--border-color)] text-[var(--texto-secundario)] hover:border-[var(--texto-secundario)] hover:text-[var(--texto-principal)]'}`}>
                                        Nota
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-[0.8rem] font-bold text-[var(--texto-secundario)] uppercase tracking-wider mb-2">
                                    Seleccione Billetera de Destino:
                                </label>
                                
                                <div className="flex flex-wrap gap-3">
                                    {bancos.length === 0 ? (
                                        <p className="text-xs text-[var(--texto-secundario)] animate-pulse">Cargando entidades...</p>
                                    ) : (
                                        bancos.map(b => {
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
                                                            ? 'border-[var(--color-primario)] bg-[var(--color-header)] text-[var(--texto-principal)] shadow-sm z-10' 
                                                            : 'bg-[var(--color-header)] border-[var(--border-color)] text-[var(--texto-secundario)] hover:border-[var(--texto-secundario)]'
                                                    }`}
                                                >
                                                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${claseDot}`}></span> 
                                                    {nombreBan}

                                                    {estaSeleccionado && (
                                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--color-primario)] border-2 border-[var(--color-header)] rounded-full flex items-center justify-center shadow-md animate-[popCheck_0.3s_ease-out_forwards]">
                                                            <i className="fa-solid fa-check text-white text-[9px]"></i>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[0.8rem] font-bold text-[var(--texto-secundario)] uppercase tracking-wider mb-2">
                                    N° Operación (Aprobación)
                                </label>
                                <div className="relative flex items-center">
                                    <i className="fa-solid fa-hashtag absolute left-4 text-[var(--texto-secundario)]"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 12345678" 
                                        maxLength="15" 
                                        value={numOperacion} 
                                        onChange={e => setNumOperacion(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} 
                                        required 
                                        className="w-full py-4 pl-12 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:border-[var(--color-primario)] rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-colors tracking-widest placeholder:tracking-normal text-lg placeholder:text-[var(--texto-secundario)]"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-2">
                                <button 
                                    type="submit" 
                                    disabled={cargando || !cajaAbierta}
                                    className="w-full bg-gradient-to-br from-[var(--color-primario)] to-red-800 hover:from-red-600 hover:to-red-900 text-white font-black tracking-wide text-lg py-4 rounded-2xl shadow-md transition-colors duration-300 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {cargando ? (
                                        <><i className="fa-solid fa-spinner fa-spin text-xl"></i> PROCESANDO...</>
                                    ) : (
                                        <><i className="fa-solid fa-qrcode text-xl"></i> CONFIRMAR VENTA DIGITAL</>
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
                    `}
                </style>
            </section>
        </>
    );
};

export default VentaYape;