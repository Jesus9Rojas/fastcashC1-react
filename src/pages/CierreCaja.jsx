import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ContadorAnimado from '../components/ContadorAnimado';
import api from '../services/api';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import logoTicket from '../assets/img/img/LogoYapeRojas.png';
import yapeIcon from '../assets/img/icon/codigo-qr-icon.png';
import tarjetaIcon from '../assets/img/icon/tarjeta-icon.png';  
import transfIcon from '../assets/img/icon/transferencia-movil.png';

const CierreCaja = () => {
    const { usuario, logout, cajaAbierta, setCajaAbierta } = useContext(AuthContext);
    const navigate = useNavigate();
    const ticketRef = useRef(null);

    const [resumen, setResumen] = useState({
        yape: 0, tarjeta: 0, transferencia: 0, anulado: 0, total: 0, saldoEsperado: 0
    });
    const [detalles, setDetalles] = useState([]);
    const [mostrarDetallesTicket, setMostrarDetallesTicket] = useState(false);
    
    const [cargando, setCargando] = useState(true);
    const [procesandoCierre, setProcesandoCierre] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const cargarDatos = async () => {
            if (!cajaAbierta) {
                if (isMounted) setCargando(false);
                return;
            }
            try {
                const uid = usuario?.usuarioID || usuario?.UsuarioID;
                const res = await api.get(`/reportes/cierre-actual/${uid}`);
                const d = res.data;

                if (isMounted) {
                    setResumen({
                        yape: parseFloat(d.ventasQR || d.VentasQR || d.ventasqr || 0),
                        tarjeta: parseFloat(d.ventasTarjeta || d.VentasTarjeta || d.ventastarjeta || 0),
                        transferencia: parseFloat(d.ventasTransferencia || d.VentasTransferencia || d.ventastransferencia || 0),
                        anulado: parseFloat(d.totalAnulado || d.TotalAnulado || d.totalanulado || 0),
                        total: parseFloat(d.totalVendido || d.TotalVendido || d.totalvendido || 0),
                        saldoEsperado: parseFloat(d.saldoEsperadoEnCaja || d.SaldoEsperadoEnCaja || d.saldoesperadoencaja || 0)
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo cargar el resumen del día', 'error');
            } finally {
                if (isMounted) setCargando(false);
            }
        };

        cargarDatos();
        return () => { isMounted = false; };
    }, [cajaAbierta, usuario]);

    const imprimirTicketNativo = () => {
        const contenido = ticketRef.current.innerHTML;
        const ventana = window.open('', 'PRINT', 'height=600,width=400');
        
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Ticket de Cierre</title>
                    <style>
                        @page { margin: 0; size: auto; }
                        body { 
                            margin: 0; 
                            padding: 10px;
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 12px; 
                            color: #000;
                            width: 100%;
                            box-sizing: border-box;
                        }
                        
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .text-right { text-align: right; }
                        .font-bold, .font-extrabold, .font-black { font-weight: bold; }
                        .text-[11px], .text-xs { font-size: 10px; }
                        .text-sm { font-size: 13px; }
                        .text-base, .text-[15px] { font-size: 15px; }
                        
                        .m-0 { margin: 0; }
                        .m-1 { margin: 4px; }
                        .m-0\\.5 { margin: 2px; }
                        .my-2 { margin-top: 8px; margin-bottom: 8px; }
                        .my-3 { margin-top: 12px; margin-bottom: 12px; }
                        .mt-2 { margin-top: 8px; }
                        .mt-3 { margin-top: 12px; }
                        .mt-4 { margin-top: 16px; }
                        .mt-5 { margin-top: 20px; }
                        .mb-1 { margin-bottom: 4px; }
                        .mb-2 { margin-bottom: 8px; }
                        .pb-2 { padding-bottom: 8px; }
                        .px-3 { padding-left: 12px; padding-right: 12px; }
                        .py-1 { padding-top: 4px; padding-bottom: 4px; }
                        
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .w-full { width: 100%; }
                        .inline-block { display: inline-block; }
                        .block { display: block; }
                        
                        .border-t { border-top: 1px solid #000; }
                        .border-b { border-bottom: 1px solid #000; }
                        .border-2 { border: 2px solid #000; }
                        .border-dashed { border-style: dashed; }
                        
                        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                        th, td { padding: 4px 2px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
                        th { border-bottom: 1px dashed #000; }
                        .w-\\[22\\%\\] { width: 22%; }
                        .w-\\[50\\%\\] { width: 50%; }
                        .w-\\[28\\%\\] { width: 28%; text-align: right; }
                        
                        .italic { font-style: italic; }
                        .break-all { word-break: break-all; }
                        
                        img { 
                            max-width: 140px; 
                            height: auto; 
                            margin: 0 auto 8px auto; 
                            display: block; 
                            filter: grayscale(100%) contrast(1.5); 
                        }
                    </style>
                </head>
                <body>
                    ${contenido}
                </body>
            </html>
        `);
        
        ventana.document.close();
        ventana.focus();
        
        setTimeout(() => {
            ventana.print();
            ventana.close();
        }, 500);
    };

    const procesarCierre = async (tipo) => {
        if (!cajaAbierta) {
            Swal.fire('Aviso', 'La caja ya se encuentra cerrada.', 'info');
            return;
        }

        const esDetallado = tipo === 'DETALLE';

        const confirmacion = await Swal.fire({
            html: `
                <div class="flex flex-col items-center mt-2">
                    <div class="w-20 h-20 bg-red-50 rounded-[1.5rem] flex items-center justify-center text-red-500 mb-5 shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]">
                        <i class="fa-solid fa-cash-register text-4xl animate-pulse"></i>
                    </div>
                    <h2 class="text-2xl font-black text-[var(--texto-principal)] tracking-tight mb-2">¿Cerrar Turno ${esDetallado ? 'Detallado' : 'Resumen'}?</h2>
                    <p class="text-[var(--texto-secundario)] font-medium text-sm text-center px-2">
                        Esta acción finalizará tu turno, generará los reportes impresos y en PDF, y <b class="text-red-500">cerrará tu sesión actual</b> de forma segura.
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-lock mr-2"></i> Sí, Cerrar Caja',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-[2.5rem] p-6 border-2 border-[var(--border-color)] bg-[var(--color-header)] shadow-2xl max-w-md w-full',
                actions: 'flex flex-row justify-center gap-4 w-full mt-6 px-2 pb-2 box-border',
                confirmButton: 'whitespace-nowrap flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 px-4 font-bold shadow-md hover:shadow-lg transition-all text-sm outline-none m-0',
                cancelButton: 'whitespace-nowrap flex-1 bg-[var(--color-header)] border-2 border-[var(--border-color)] hover:bg-[var(--color-fondo-app)] text-[var(--texto-principal)] rounded-2xl py-3.5 px-4 font-bold transition-all text-sm outline-none m-0'
            }
        });

        if (!confirmacion.isConfirmed) return;

        setProcesandoCierre(tipo);

        try {
            const uid = usuario?.usuarioID || usuario?.UsuarioID;
            const nomCajero = usuario?.nombreCompleto || usuario?.NombreCompleto || usuario?.username || "CAJERO";

            if (esDetallado) {
                const resDetalle = await api.get(`/reportes/cierre-detalle/${uid}`);
                setDetalles(resDetalle.data);
            }
            setMostrarDetallesTicket(esDetallado);

            await api.post('/caja/cerrar', {
                usuarioID: parseInt(uid),
                usuarioId: parseInt(uid),
                saldoFinalReal: resumen.saldoEsperado,
                saldofinalreal: resumen.saldoEsperado
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            const fechaParaNombre = new Date().toISOString().slice(0, 10);
            const altoTicketera = esDetallado && detalles.length > 10 ? 200 + (detalles.length * 10) : 250;
            const nombrePDF = `Cierre_${esDetallado ? 'Detallado' : 'Resumen'}_${nomCajero.replace(/\s+/g, '_')}_${fechaParaNombre}.pdf`;

            const opt = {
                margin: 0.1,
                filename: nombrePDF,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: [80, altoTicketera], orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(ticketRef.current).save();

            setTimeout(() => {
                imprimirTicketNativo();
                
                Swal.fire({
                    html: `
                        <div class="flex flex-col items-center mt-2">
                            <div class="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-500 mb-5 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]">
                                <i class="fa-solid fa-check text-4xl"></i>
                            </div>
                            <h2 class="text-2xl font-black text-[var(--texto-principal)] tracking-tight mb-2">Caja Cerrada</h2>
                            <p class="text-[var(--texto-secundario)] font-medium text-sm text-center px-2">
                                Se cerrará tu sesión automáticamente.
                            </p>
                        </div>
                    `,
                    timer: 2000, 
                    showConfirmButton: false, 
                    customClass: { popup: 'rounded-[2.5rem] p-6 border-2 border-[var(--border-color)] bg-[var(--color-header)] shadow-2xl max-w-sm w-full' } 
                });
                
                setTimeout(() => {
                    setCajaAbierta(false);
                    logout();
                    navigate('/login');
                }, 1500);
            }, 800);

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.mensaje || error.response?.data?.error || "Error al cerrar la caja";
            
            Swal.fire({
                html: `
                    <div class="flex flex-col items-center mt-2">
                        <div class="w-20 h-20 bg-red-50 rounded-[1.5rem] flex items-center justify-center text-red-500 mb-5 shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]">
                            <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
                        </div>
                        <h2 class="text-2xl font-black text-[var(--texto-principal)] tracking-tight mb-2">Error Crítico</h2>
                        <p class="text-[var(--texto-secundario)] font-medium text-sm text-center px-2">
                            ${msg}
                        </p>
                    </div>
                `,
                confirmButtonText: 'Aceptar',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-[2.5rem] p-6 border-2 border-[var(--border-color)] bg-[var(--color-header)] shadow-2xl max-w-sm w-full',
                    actions: 'flex w-full mt-6 px-2 pb-2',
                    confirmButton: 'w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 font-bold shadow-md hover:shadow-lg transition-all text-sm outline-none m-0'
                }
            });

            setProcesandoCierre(null);
        }
    };

    if (!cajaAbierta) {
        return (
            <section className="block animate-fade-in w-full max-w-full">
                <div className="text-center py-16 px-4">
                    <i className="fa-solid fa-lock text-6xl text-gray-400 mb-4"></i>
                    <h2 className="text-2xl font-bold text-[var(--texto-principal)]">Caja Cerrada</h2>
                    <p className="text-[var(--texto-secundario)] mt-2">Abre la caja desde la barra superior para iniciar tu turno.</p>
                </div>
            </section>
        );
    }

    if (cargando) {
        return (
            <div className="text-center py-20 text-[var(--texto-secundario)] flex flex-col items-center">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
                <span className="font-bold tracking-wide">Cargando resumen del día...</span>
            </div>
        );
    }

    const fechaHoy = new Date().toLocaleDateString('es-PE');
    const horaHoy = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const nomCajero = (usuario?.nombreCompleto || usuario?.NombreCompleto || usuario?.username || "CAJERO").toUpperCase();

    return (
        <section className="block animate-fade-in w-full max-w-full pb-8 pt-4">
            <div className="bg-[var(--color-header)] rounded-[2rem] shadow-sm border border-[var(--border-color)] flex flex-col overflow-hidden transition-colors duration-300 p-6 md:p-8">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full mb-8 pb-6 border-b border-[var(--border-color)] gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-[var(--texto-principal)] tracking-tight flex items-center gap-3 mb-1">
                            <i className="fa-solid fa-flag-checkered text-[var(--texto-principal)]"></i>
                            Cierre de Turno
                        </h2>
                        <p className="text-[var(--texto-secundario)] font-medium text-[15px]">
                            Resumen de operaciones y auditoría del día.
                        </p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-blue-100 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                        <i className="fa-regular fa-calendar-days"></i> <span>{fechaHoy}</span>
                    </div>
                </div>

                {/* GRID STATS (RESTAURADO A SU DISEÑO VIBRANTE Y ADAPTADO A TEMAS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    
                    {/* Yape */}
                    <div className="group relative bg-[var(--color-header)] rounded-3xl p-7 overflow-hidden transition-all duration-300 border border-[var(--border-color)] border-l-4 border-l-red-600 shadow-sm hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-56 z-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner bg-gradient-to-br from-red-500 to-red-700">
                            <img src={yapeIcon} alt="Yape" className="w-7 h-7 object-contain brightness-0 invert" />
                        </div>
                        <div>
                            <span className="text-[0.85rem] text-[var(--texto-secundario)] font-bold uppercase tracking-wider block mb-1.5">Billeteras Digitales</span>
                            <h3 className="text-3xl font-extrabold text-[var(--texto-principal)] m-0 font-mono tracking-tight">S/ <ContadorAnimado valorFinal={resumen.yape} /></h3>
                        </div>
                        <div className="text-sm mt-auto pt-4 font-bold text-red-600">Yape / Plin</div>
                        {/* Marca de agua */}
                        <div className="absolute -right-5 -bottom-5 w-28 h-28 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 -z-10 bg-contain bg-no-repeat bg-center grayscale" style={{ backgroundImage: `url(${yapeIcon})` }}></div>
                    </div>

                    {/* Tarjeta */}
                    <div className="group relative bg-[var(--color-header)] rounded-3xl p-7 overflow-hidden transition-all duration-300 border border-[var(--border-color)] border-l-4 border-l-blue-500 shadow-sm hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-56 z-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner bg-gradient-to-br from-blue-400 to-blue-600">
                            <img src={tarjetaIcon} alt="Tarjeta" className="w-6 h-6 object-contain brightness-0 invert" />
                        </div>
                        <div>
                            <span className="text-[0.85rem] text-[var(--texto-secundario)] font-bold uppercase tracking-wider block mb-1.5">Cobros Tarjeta</span>
                            <h3 className="text-3xl font-extrabold text-[var(--texto-principal)] m-0 font-mono tracking-tight">S/ <ContadorAnimado valorFinal={resumen.tarjeta} /></h3>
                        </div>
                        <div className="text-sm mt-auto pt-4 font-bold text-blue-500">Visa / Master</div>
                        <div className="absolute -right-5 -bottom-5 w-28 h-28 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 -z-10 bg-contain bg-no-repeat bg-center grayscale" style={{ backgroundImage: `url(${tarjetaIcon})` }}></div>
                    </div>

                    {/* Transferencias */}
                    <div className="group relative bg-[var(--color-header)] rounded-3xl p-7 overflow-hidden transition-all duration-300 border border-[var(--border-color)] border-l-4 border-l-emerald-600 shadow-sm hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-56 z-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner bg-gradient-to-br from-emerald-500 to-emerald-700">
                            <img src={transfIcon} alt="Transferencia" className="w-6 h-6 object-contain brightness-0 invert" />
                        </div>
                        <div>
                            <span className="text-[0.85rem] text-[var(--texto-secundario)] font-bold uppercase tracking-wider block mb-1.5">Transferencias</span>
                            <h3 className="text-3xl font-extrabold text-[var(--texto-principal)] m-0 font-mono tracking-tight">S/ <ContadorAnimado valorFinal={resumen.transferencia} /></h3>
                        </div>
                        <div className="text-sm mt-auto pt-4 font-bold text-emerald-600">Bancos Directos</div>
                        <div className="absolute -right-5 -bottom-5 w-28 h-28 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 -z-10 bg-contain bg-no-repeat bg-center grayscale" style={{ backgroundImage: `url(${transfIcon})` }}></div>
                    </div>

                    {/* TOTAL */}
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-7 overflow-hidden transition-all duration-300 shadow-lg hover:-translate-y-1 flex flex-col justify-between h-56 z-10 text-white animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/10 backdrop-blur-sm text-emerald-400 text-2xl">
                            <i className="fa-solid fa-money-bill-wave"></i>
                        </div>
                        <div>
                            <span className="text-[0.85rem] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Venta Total Real</span>
                            <h1 className="text-4xl font-black text-emerald-400 m-0 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                S/ <ContadorAnimado valorFinal={resumen.total} />
                            </h1>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                    </div>
                </div>

                {/* ÁREA INFERIOR: TICKET Y BOTONES */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* TICKET WRAPPER */}
                    <div className="bg-[var(--color-fondo-app)] p-8 rounded-[2rem] border border-[var(--border-color)] flex flex-col items-center w-full lg:w-7/12 shadow-inner min-h-[450px]">
                        <div className="text-[11px] uppercase text-[var(--texto-secundario)] mb-6 font-bold tracking-widest flex items-center gap-2">
                            <i className="fa-regular fa-file-lines"></i> Previsualización del Ticket
                        </div>

                        {/* TICKET PAPER */}
                        <div 
                            ref={ticketRef} 
                            id="ticketImpresion" 
                            className="bg-white w-full max-w-[320px] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] font-mono text-[13px] text-black relative pb-10 transition-all duration-300 hover:-translate-y-1"
                            style={{ 
                                maskImage: 'radial-gradient(circle at bottom, transparent 6px, black 6.5px)', 
                                maskSize: '20px 100%', 
                                maskPosition: 'bottom', 
                                maskRepeat: 'repeat-x',
                                WebkitMaskImage: 'radial-gradient(circle at bottom, transparent 6px, black 6.5px)',
                                WebkitMaskSize: '20px 100%',
                                WebkitMaskPosition: 'bottom',
                                WebkitMaskRepeat: 'repeat-x'
                            }}
                        >
                            <div className="text-center">
                                <img src={logoTicket} className="w-28 h-auto mx-auto mb-2 block grayscale contrast-150" alt="Logo" />
                                <h3 className="m-1 text-base font-bold">ROJAS SUPER NV</h3>
                                <p className="m-0 leading-tight">RUC: 20606916061</p>
                                <p className="m-0 leading-tight text-[11px]">MZA-A23 LT.13 A.H MARIA REICHE</p>
                                <div className="border-t border-dashed border-black my-3"></div>
                                <h4 className="border-2 border-black inline-block px-3 py-1 my-2 font-extrabold text-sm">CIERRE DE TURNO</h4>
                                
                                <div className="text-left mt-2">
                                    <p className="m-0.5 flex justify-between"><span>Fecha:</span> <span>{fechaHoy}</span></p>
                                    <p className="m-0.5 flex justify-between"><span>Hora:</span> <span>{horaHoy}</span></p>
                                    <p className="m-0.5 flex justify-between"><span>Cajero:</span> <span>{nomCajero}</span></p>
                                </div>
                                <div className="border-t border-dashed border-black my-3"></div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between mb-1"><span>YAPE/PLIN:</span><span>S/ {resumen.yape.toFixed(2)}</span></div>
                                <div className="flex justify-between mb-1"><span>TARJETAS:</span><span>S/ {resumen.tarjeta.toFixed(2)}</span></div>
                                <div className="flex justify-between mb-1"><span>TRANSF:</span><span>S/ {resumen.transferencia.toFixed(2)}</span></div>
                                <div className="flex justify-between mb-1 text-red-600 font-semibold"><span>(-) ANULADO:</span><span>S/ {resumen.anulado.toFixed(2)}</span></div>
                                
                                <div className="border-t border-dashed border-black my-2 mt-3"></div>
                                <div className="flex justify-between mt-2 font-black text-[15px]"><span>TOTAL VENDIDO:</span><span>S/ {resumen.total.toFixed(2)}</span></div>

                                {/* Zona de Detalles */}
                                {mostrarDetallesTicket && (
                                    <div className="mt-4 pb-2">
                                        <div className="border-t border-dashed border-black mb-2"></div>
                                        <h4 className="text-center m-0 mb-2 text-[11px] font-bold">DETALLE DE TRANSACCIONES</h4>
                                        <table className="w-full text-[10px] text-left border-collapse font-mono leading-tight">
                                            <thead>
                                                <tr className="border-b border-dashed border-black">
                                                    <th className="py-1 w-[22%]">HORA</th>
                                                    <th className="p-1 w-[50%]">OP/REF</th>
                                                    <th className="text-right py-1 w-[28%]">MONTO</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detalles.length === 0 ? (
                                                    <tr><td colSpan="3" className="text-center py-2">Sin transacciones</td></tr>
                                                ) : (
                                                    detalles.map((d, i) => {
                                                        const fechaStr = d.fechaemision || d.fechaEmision || d.FechaEmision;
                                                        const formaPago = String(d.formapago || d.formaPago || d.FormaPago || '').toUpperCase();
                                                        const entidad = String(d.entidadbancaria || d.entidadBancaria || d.EntidadBancaria || '-').toUpperCase();
                                                        const numOp = d.numerooperacion || d.numeroOperacion || d.NumeroOperacion || '-';
                                                        const monto = parseFloat(d.montopagado || d.montoPagado || d.MontoPagado || 0).toFixed(2);
                                                        
                                                        const hr = new Date(fechaStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                                                        
                                                        let infoOp = 'EFECTIVO';
                                                        if (formaPago !== 'EFECTIVO') {
                                                            let prefijo = formaPago;
                                                            if (formaPago === 'TARJETA' && entidad !== '-') prefijo = entidad;
                                                            else if (formaPago === 'TRANSFERENCIA') prefijo = 'TRANSF';
                                                            else if (formaPago === 'QR' || formaPago === 'YAPE' || formaPago === 'PLIN') {
                                                                prefijo = `QR ${entidad !== '-' ? entidad : ''}`.trim();
                                                            }
                                                            infoOp = `${prefijo}: ${numOp}`;
                                                        }

                                                        return (
                                                            <tr key={i}>
                                                                <td className="py-1 align-top">{hr}</td>
                                                                <td className="p-1 break-all align-top">{infoOp}</td>
                                                                <td className="py-1 text-right align-top">S/ {monto}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="border-t border-dashed border-black mt-2"></div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="text-center mt-5 text-[10px] italic">
                                <p>• Firma Conforme •</p>
                            </div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN (PANEL DERECHO) */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-5 sticky top-6">
                        <div className="bg-[var(--color-fondo-app)] rounded-[2rem] p-8 border border-[var(--border-color)] shadow-sm flex flex-col h-full">
                            <div className="mb-6">
                                <h3 className="font-black text-[var(--texto-principal)] text-xl mb-2 flex items-center gap-2">
                                    <i className="fa-solid fa-power-off text-red-500"></i> Finalizar Turno
                                </h3>
                                <p className="text-sm text-[var(--texto-secundario)] font-medium">
                                    Selecciona el formato de cierre que deseas imprimir y descargar. Esta acción cerrará tu sesión de forma automática.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 mt-auto">
                                <button 
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group outline-none"
                                    onClick={() => procesarCierre('RESUMEN')} 
                                    disabled={procesandoCierre !== null}
                                >
                                    <i className={`fa-solid ${procesandoCierre === 'RESUMEN' ? 'fa-spinner fa-spin' : 'fa-print'} text-lg group-hover:scale-110 transition-transform`}></i>
                                    <span className="tracking-wide">{procesandoCierre === 'RESUMEN' ? 'Cerrando...' : 'Cierre Resumido'}</span>
                                </button>

                                <button 
                                    className="w-full bg-[var(--color-header)] border-2 border-[var(--border-color)] hover:bg-gray-100 text-[var(--texto-principal)] py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group outline-none"
                                    onClick={() => procesarCierre('DETALLE')} 
                                    disabled={procesandoCierre !== null}
                                >
                                    <i className={`fa-solid ${procesandoCierre === 'DETALLE' ? 'fa-spinner fa-spin' : 'fa-file-invoice-dollar'} text-lg group-hover:scale-110 transition-transform`}></i>
                                    <span className="tracking-wide">{procesandoCierre === 'DETALLE' ? 'Procesando...' : 'Cierre Detallado'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <style>
                {`
                    /* FIX CRÍTICO: Previene el error de "oklch" de html2canvas (incompatibilidad con Tailwind v4) */
                    #ticketImpresion, #ticketImpresion * {
                        border-color: transparent !important;
                        outline-color: transparent !important;
                        text-decoration-color: transparent !important;
                        color: #000000 !important;
                    }
                    #ticketImpresion {
                        background-color: #ffffff !important;
                    }
                    #ticketImpresion .border-black {
                        border-color: #000000 !important;
                    }
                    #ticketImpresion .text-red-600, #ticketImpresion .text-red-600 * {
                        color: #dc2626 !important;
                    }
                    @keyframes fade-slide-down {
                        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}
            </style>
        </section>
    );
};

export default CierreCaja;