import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom'; // 🚀 IMPORTANTE: Añadimos esto
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import gatitoGif from '../assets/img/img/Caminando.gif';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end', 
    showConfirmButton: false,
    timer: 3000, 
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer; 
        toast.onmouseleave = Swal.resumeTimer;
    }
});

const MAPA_ICONOS_VENTAS = {
    'Comestibles': '🛒', 'Bebidas': '🥤', 'Licores': '🍷',
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
    
    // 👇 ESTADO PARA CONTROLAR EL ARAÑAZO
    const [mostrarTransicion, setMostrarTransicion] = useState(false);

    useEffect(() => {
        // Al montar el componente, un pequeño retraso asegura que la bolita de carga termine primero
        const timer = setTimeout(() => {
             setMostrarTransicion(true);
        }, 100); 

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
                console.error("Error cargando maestros:", error);
            }
        };

        cargarDatosMaestros();

        return () => clearTimeout(timer);
    }, []);

    const handleRegistrarVenta = async (e) => {
        e.preventDefault();
        
        if (!cajaAbierta) {
            return Toast.fire({ icon: 'error', title: 'Caja Cerrada', text: 'Abre turno primero para vender' });
        }
        if (!monto || parseFloat(monto) <= 0) {
            return Toast.fire({ icon: 'warning', title: 'Atención', text: 'Ingresa un monto válido' });
        }
        if (!familiaSeleccionada || !bancoSeleccionado || !numOperacion) {
            return Toast.fire({ icon: 'warning', title: 'Atención', text: 'Complete todos los campos' });
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
            
            Toast.fire({
                icon: 'success',
                title: '¡Venta Exitosa!',
                text: `Ticket: ${res.data.comprobante || res.data.Comprobante}`
            });

            setMonto(''); 
            setNumOperacion('');
            setComprobante('2');
        } catch (error) {
            const msg = error.response?.data?.mensaje || error.response?.data?.error || 'No se pudo registrar la venta';
            
            Toast.fire({
                icon: 'error',
                title: 'Error',
                text: msg
            });
        } finally {
            setCargando(false);
        }
    };
    
    const obtenerClaseDot = (nombreBanco) => {
        const nom = String(nombreBanco).toUpperCase();
        if (nom.includes('BCP')) return 'bcp';
        if (nom.includes('BBVA')) return 'bbva';
        if (nom.includes('YAPE')) return 'personal';
        if (nom.includes('PLIN')) return 'interbank';
        return 'generic';
    };

    return (
        <section className="vista-seccion activa" style={{ opacity: cajaAbierta ? 1 : 0.5, pointerEvents: cajaAbierta ? 'all' : 'none' }}>
            
            {/* 🚀 EL PORTAL: Saca la animación de la caja fuerte y la tira encima de toda la web */}
            {mostrarTransicion && createPortal(
                <div className="efecto-transicion-arañazo">
                    <div className="garra-corte garra-1"></div>
                    <div className="garra-corte garra-2"></div>
                    <div className="garra-corte garra-3"></div>
                </div>,
                document.body // Esto le dice que lo ponga al nivel máximo de la página
            )}

            {/* 🚀 CRÍTICO: El position relative va aquí en el contenedor principal */}
            <div className="contenedor-ventas-pro" style={{ position: 'relative' }}>
                
                {/* 👇 CONTENEDOR DEL GATITO (Posicionado libremente sin ser recortado) */}
                <div className="gatito-container">
                     <img src={gatitoGif} alt="Gatito caminando" className="gatito-animado" />
                </div>

                {/* --- PANEL IZQUIERDO: CATEGORÍAS (FAMILIAS) --- */}
                <div className="panel-categorias-pro">
                    
                    <div className="cabecera-simple">
                        <h3><i className="fa-solid fa-bag-shopping"></i> ¿Qué vendiste?</h3>
                    </div>
                    
                    <div className="grid-familias-moderna">
                        {familias.length === 0 ? (
                            <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>Cargando familias...</p>
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
                                        className={`card-familia ${estaSeleccionada ? 'seleccionado' : ''}`}
                                        onClick={() => setFamiliaSeleccionada(id)}
                                    >
                                        <span className="emoji">{icono}</span>
                                        <span className="label">{nombre}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* --- PANEL DERECHO: TRANSACCIÓN --- */}
                <div className="panel-transaccion-pro">
                    <form onSubmit={handleRegistrarVenta} className="form-grid-pro">
                        
                        <div className="col-monto">
                            <h2 className="titulo-pago"><i className="fa-solid fa-mobile-screen-button"></i> Pago Digital</h2>
                            <div className="input-hero">
                                <span className="moneda">S/</span>
                                <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    step="0.01" 
                                    value={monto} 
                                    onChange={e => setMonto(e.target.value)} 
                                    required 
                                />
                            </div>
                            
                            <div className="selector-tipo">
                                <button type="button" className={`segmento ${comprobante === '2' ? 'seleccionado' : ''}`} onClick={() => setComprobante('2')}>Boleta</button>
                                <button type="button" className={`segmento ${comprobante === '1' ? 'seleccionado' : ''}`} onClick={() => setComprobante('1')}>Factura</button>
                                <button type="button" className={`segmento ${comprobante === '4' ? 'seleccionado' : ''}`} onClick={() => setComprobante('4')}>Nota</button>
                            </div>
                        </div>

                        <div className="col-detalles">
                            <label className="label-separador">Billetera de Destino:</label>
                            
                            <div className="selector-bancos wrap-grid">
                                {bancos.length === 0 ? (
                                    <p style={{ fontSize: '0.8rem' }}>Cargando entidades...</p>
                                ) : (
                                    bancos.map(b => {
                                        const idBan = b.entidadID || b.EntidadID;
                                        const nombreBan = b.nombre || b.Nombre;
                                        const claseDot = obtenerClaseDot(nombreBan);
                                        const estaSeleccionado = bancoSeleccionado === idBan;

                                        return (
                                            <button 
                                                key={idBan} 
                                                type="button"
                                                className={`chip-banco ${estaSeleccionado ? 'seleccionado' : ''}`}
                                                onClick={() => setBancoSeleccionado(idBan)}
                                            >
                                                <span className={`dot ${claseDot}`}></span> {nombreBan}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            
                            <div className="input-operacion-wrapper">
                                <label>N° Operación</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: 12345678" 
                                    maxLength="15" 
                                    value={numOperacion} 
                                    onChange={e => setNumOperacion(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} 
                                    required 
                                />
                            </div>
                            
                            <button type="submit" className="btn-registrar-grande" style={{ background: '#E60023' }} disabled={cargando || !cajaAbierta}>
                                {cargando ? 'PROCESANDO...' : 'CONFIRMAR VENTA'}
                            </button>
                        </div>
                        
                    </form>
                </div>

            </div>
        </section>
    );
};

export default VentaYape;