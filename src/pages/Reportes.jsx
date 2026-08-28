import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import XLSX from 'xlsx-js-style';
import html2pdf from 'html2pdf.js';
import { sileo, Toaster } from 'sileo';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const toISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const parseISODate = (s) => {
    if (!s) return new Date();
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
};

const hoy = () => toISODate(new Date());
const haceXDias = (x) => { const d = new Date(); d.setDate(d.getDate() - x); return toISODate(d); };
const inicioDeMes = () => { const d = new Date(); d.setDate(1); return toISODate(d); };

const generarDiasMes = (viewDate) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    let offset = primerDia.getDay() - 1;
    if (offset < 0) offset = 6;

    const dias = [];
    for (let i = 0; i < offset; i++) {
        dias.push({ fecha: new Date(year, month, i - offset + 1), delMes: false });
    }
    for (let i = 1; i <= diasEnMes; i++) {
        dias.push({ fecha: new Date(year, month, i), delMes: true });
    }
    while (dias.length < 42) {
        const last = dias[dias.length - 1].fecha;
        dias.push({ fecha: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), delMes: false });
    }
    return dias;
};

const SelectorRangoFechas = ({ inicio, fin, onChange }) => {
    const [abierto, setAbierto] = useState(false);
    const [viewDate, setViewDate] = useState(() => parseISODate(inicio || hoy()));
    const [tempInicio, setTempInicio] = useState(inicio);
    const [tempFin, setTempFin] = useState(fin);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Solución al Cascading Render: 
    // En lugar de usar useEffect para sincronizar el estado cuando 'abierto' cambia,
    // actualizamos el estado justo en el momento en que el usuario hace clic para abrirlo.
    const toggleAbierto = () => {
        if (!abierto) {
            setTempInicio(inicio);
            setTempFin(fin);
            setViewDate(parseISODate(inicio || hoy()));
        }
        setAbierto(!abierto);
    };

    const dias = generarDiasMes(viewDate);
    const hoyISO = hoy();

    const manejarClickDia = (iso) => {
        if (!tempInicio || (tempInicio && tempFin)) {
            setTempInicio(iso);
            setTempFin(null);
            return;
        }
        if (iso < tempInicio) {
            setTempFin(tempInicio);
            setTempInicio(iso);
        } else {
            setTempFin(iso);
        }
    };

    const aplicar = () => {
        if (tempInicio) {
            onChange(tempInicio, tempFin || tempInicio);
            setAbierto(false);
        }
    };

    const aplicarPreset = (pInicio, pFin) => {
        onChange(pInicio, pFin);
        setAbierto(false);
    };

    const mismoDia = inicio === fin;
    const inicioObj = parseISODate(inicio || hoy());
    const finObj = parseISODate(fin || hoy());
    
    let label = 'Seleccionar Fechas';
    if (inicio && fin) {
        label = mismoDia
            ? inicioObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
            : `${inicioObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} – ${finObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }

    const presets = [
        { label: 'Hoy', inicio: hoy(), fin: hoy() },
        { label: 'Ayer', inicio: haceXDias(1), fin: haceXDias(1) },
        { label: 'Últimos 7 días', inicio: haceXDias(7), fin: hoy() },
        { label: 'Últimos 30 días', inicio: haceXDias(30), fin: hoy() },
        { label: 'Este mes', inicio: inicioDeMes(), fin: hoy() },
    ];

    return (
        <div className="relative inline-block w-full sm:w-auto" ref={ref}>
            <button
                type="button"
                onClick={toggleAbierto}
                className={`w-full sm:w-max px-5 py-3.5 bg-[var(--color-header)] border-2 rounded-xl text-sm font-bold text-[var(--texto-principal)] flex items-center justify-between gap-4 transition-all shadow-sm ${abierto ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[var(--border-color)] hover:bg-[var(--color-fondo-app)]'}`}
            >
                <div className="flex items-center gap-2">
                    <i className="fa-regular fa-calendar-days text-blue-500 text-lg"></i>
                    <span className="capitalize">{label}</span>
                </div>
                <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${abierto ? 'rotate-180 text-blue-500' : ''}`}></i>
            </button>

            <div className={`absolute z-[70] left-0 top-full mt-2 sm:left-full sm:top-0 sm:mt-0 sm:ml-4 w-full sm:w-[22rem] origin-top sm:origin-top-left bg-[var(--color-header)] rounded-2xl border border-[var(--border-color)] shadow-2xl p-4 transition-all duration-200 ${abierto ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}`}>
                <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-[var(--border-color)]">
                    {presets.map(p => (
                        <button
                            type="button"
                            key={p.label}
                            onClick={() => aplicarPreset(p.inicio, p.fin)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--texto-secundario)] bg-[var(--color-fondo-app)] hover:bg-blue-50 hover:text-blue-700 transition-colors border border-[var(--border-color)]"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-fondo-app)] text-[var(--texto-secundario)] hover:text-blue-500 transition-colors outline-none">
                        <i className="fa-solid fa-chevron-left text-sm"></i>
                    </button>
                    <span className="text-sm font-black text-[var(--texto-principal)]">{MESES[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                    <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-fondo-app)] text-[var(--texto-secundario)] hover:text-blue-500 transition-colors outline-none">
                        <i className="fa-solid fa-chevron-right text-sm"></i>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-y-2 mb-2">
                    {DIAS_SEMANA.map(d => (
                        <span key={d} className="text-[10px] font-black text-[var(--texto-secundario)] text-center uppercase">{d}</span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1">
                    {dias.map(({ fecha, delMes }, i) => {
                        const iso = toISODate(fecha);
                        const esHoyDia = iso === hoyISO;
                        const esInicio = iso === tempInicio;
                        const esFin = iso === tempFin;
                        const enRango = !!(tempInicio && tempFin && iso > tempInicio && iso < tempFin);
                        
                        return (
                            <div key={i} className="relative h-9 flex items-center justify-center">
                                {(enRango || esInicio || esFin) && tempFin && (
                                    <div className={`absolute inset-y-1 bg-blue-500/20 ${esInicio ? 'left-1/2 right-0' : esFin ? 'left-0 right-1/2' : 'left-0 right-0'}`}></div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => manejarClickDia(iso)}
                                    className={`relative z-10 h-8 w-8 flex items-center justify-center rounded-full text-xs font-bold transition-all outline-none
                                        ${!delMes ? 'text-[var(--texto-secundario)] opacity-50' : 'text-[var(--texto-principal)]'}
                                        ${esInicio || esFin ? 'bg-blue-600 text-white shadow-md' : ''}
                                        ${esHoyDia && !esInicio && !esFin ? 'ring-2 ring-blue-500' : ''}
                                        ${!esInicio && !esFin && !enRango ? 'hover:bg-[var(--color-fondo-app)]' : ''}
                                        ${enRango ? 'bg-blue-500/20' : ''}`}
                                >
                                    {fecha.getDate()}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border-color)]">
                    <span className="text-xs font-bold text-[var(--texto-secundario)]">
                        {tempInicio && !tempFin ? 'Selecciona fin' : 'Rango listo'}
                    </span>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setAbierto(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)] border border-transparent hover:border-[var(--border-color)] transition-all outline-none">
                            Cancelar
                        </button>
                        <button type="button" onClick={aplicar} className="px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all outline-none">
                            <i className="fa-solid fa-check"></i> Aplicar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Reportes = () => {
    const { usuario } = useContext(AuthContext);

    const [fechaInicio, setFechaInicio] = useState(haceXDias(7));
    const [fechaFin, setFechaFin] = useState(hoy());
    
    const [usuarioFiltro, setUsuarioFiltro] = useState('');
    const [usuariosLista, setUsuariosLista] = useState([]);
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [dropdownCajeroAbierto, setDropdownCajeroAbierto] = useState(false);
    
    const [cargando, setCargando] = useState(null);

    const dropdownRef = useRef(null);

    const esAdmin = String(usuario?.rol || '').toUpperCase() === 'ADMINISTRADOR';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownCajeroAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const cargarUsuarios = async () => {
            if (!esAdmin) return;
            try {
                const res = await api.get('/admin/usuarios');
                if (isMounted) setUsuariosLista(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        cargarUsuarios();
        return () => { isMounted = false; };
    }, [esAdmin]);

    const obtenerParametros = useCallback(() => {
        const params = {};
        if (fechaInicio) params.inicio = fechaInicio;
        if (fechaFin) params.fin = fechaFin;
        
        if (esAdmin && usuarioFiltro) {
            params.usuarioID = usuarioFiltro;
        } else if (!esAdmin) {
            params.usuarioID = usuario?.usuarioID || usuario?.UsuarioID;
        }
        return params;
    }, [fechaInicio, fechaFin, esAdmin, usuarioFiltro, usuario]);

    const generarExcel = async (tipo) => {
        setCargando(`EXCEL-${tipo}`);
        try {
            const endpoint = tipo === 'CAJAS' ? '/reportes/cajas' : '/reportes/ventas';
            const res = await api.get(endpoint, { params: obtenerParametros() });
            const data = res.data;

            if (!data || data.length === 0) {
                sileo.warning({ title: 'Atención', description: 'No hay datos para exportar en estas fechas.' });
                return;
            }

            let totalGeneral = 0;
            data.forEach(row => {
               const monto = row["Monto Total"] || row["TotalVendido"] || row["totalvendido"] || row["ImporteTotal"] || row["importetotal"] || row["Monto"] || row["monto"] || row["Saldo Final"] || row["saldofinal"] || row["SaldoFinal"] || row["Total"] || row["total"] || 0;
               totalGeneral += parseFloat(monto);
            });

            const wb = XLSX.utils.book_new();
            const sTitulo = { font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center", vertical: "center" } };
            const sSubTitulo = { font: { sz: 11, bold: true, color: { rgb: "333333" } }, alignment: { horizontal: "left" } };
            const sHeaderTabla = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E293B" } }, border: { bottom: { style: "medium", color: { rgb: "000000" } } }, alignment: { horizontal: "center", vertical: "center" } };
            const sCeldaData = { border: { top: { style: "thin", color: {rgb: "E2E8F0"} }, bottom: { style: "thin", color: {rgb: "E2E8F0"} }, left: { style: "thin", color: {rgb: "E2E8F0"} }, right: { style: "thin", color: {rgb: "E2E8F0"} } }, alignment: { horizontal: "center", vertical: "center" } };
            const sMoneda = { border: { top: { style: "thin", color: {rgb: "E2E8F0"} }, bottom: { style: "thin", color: {rgb: "E2E8F0"} }, left: { style: "thin", color: {rgb: "E2E8F0"} }, right: { style: "thin", color: {rgb: "E2E8F0"} } }, alignment: { horizontal: "right", vertical: "center" }, numFmt: '"S/" #,##0.00' };

            const nombreGenerador = usuario?.nombreCompleto || 'Sistema';
            const textoInicio = fechaInicio || 'Hoy';
            const textoFin = fechaFin || textoInicio;

            const wsData = [
                ["REPORTE OFICIAL - SISTEMA"], 
                [`Rango: ${textoInicio} al ${textoFin}`],  
                [`Generado por: ${nombreGenerador}`], 
                [`MONTO TOTAL DEL REPORTE: S/ ${totalGeneral.toFixed(2)}`], 
                [""], 
                Object.keys(data[0]) 
            ];

            data.forEach(row => wsData.push(Object.values(row)));

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const range = XLSX.utils.decode_range(ws['!ref']);
            const lastCol = range.e.c;

            ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }, { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }];
            ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 5, c: 0 }, e: { r: range.e.r, c: lastCol } }) };

            const headers = Object.keys(data[0]); 
            const colWidths = Array(lastCol + 1).fill({ wch: 15 });

            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
                    if (!ws[cellAddress]) continue;

                    if (R === 0) ws[cellAddress].s = sTitulo; 
                    else if (R >= 1 && R <= 3) {
                        ws[cellAddress].s = sSubTitulo;
                        if(R === 3) ws[cellAddress].s = { ...sSubTitulo, font: { bold: true, color: { rgb: "2563EB" }, sz: 12 } };
                    }
                    else if (R === 5) ws[cellAddress].s = sHeaderTabla;
                    else if (R > 5) {
                        const valor = ws[cellAddress].v;
                        const headerName = (headers[C] || "").toUpperCase();
                        
                        if (headerName.includes("MONTO") || headerName.includes("TOTAL") || headerName.includes("VENDIDO") || headerName.includes("ANULADO") || headerName.includes("SALDO")) {
                            ws[cellAddress].t = 'n';
                            ws[cellAddress].v = parseFloat(valor) || 0;
                            ws[cellAddress].s = sMoneda;
                        } else {
                            ws[cellAddress].s = sCeldaData;
                            ws[cellAddress].t = 's'; 
                        }
                        
                        const len = String(valor).length;
                        if (len + 2 > colWidths[C].wch) colWidths[C].wch = Math.min(len + 2, 40);
                    }
                }
            }
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, "Reporte");
            
            const nombreDoc = `Reporte_${tipo}_${textoInicio}${textoInicio !== textoFin ? '_al_' + textoFin : ''}.xlsx`;
            
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const url = window.URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreDoc);
            document.body.appendChild(link);
            link.click(); 
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            sileo.success({ title: '¡Excel Descargado!' });

        } catch (error) {
            console.error(error);
            sileo.error({ title: 'Error', description: 'Ocurrió un error al generar el Excel' });
        } finally {
            setCargando(null);
        }
    };

    const generarPDF = async (tipo) => {
        setCargando(`PDF-${tipo}`);
        try {
            const endpoint = tipo === 'CAJAS' ? '/reportes/cajas' : '/reportes/ventas';
            const res = await api.get(endpoint, { params: obtenerParametros() });
            const data = res.data;

            if (!data || data.length === 0) {
                sileo.warning({ title: 'Atención', description: 'No hay datos para exportar en estas fechas.' });
                return;
            }

            const container = document.createElement('div');
            container.style.padding = '20px';
            container.style.fontFamily = 'Arial, sans-serif';

            const titulo = document.createElement('h2');
            titulo.style.textAlign = 'center';
            titulo.style.color = '#2563EB';
            titulo.innerText = `REPORTE OFICIAL - ${tipo === 'CAJAS' ? 'CIERRES DE CAJA' : 'VENTAS'}`;
            container.appendChild(titulo);

            const nombreGenerador = usuario?.nombreCompleto || 'Sistema';
            const textoInicio = fechaInicio || 'Hoy';
            const textoFin = fechaFin || textoInicio;
            
            const subtitulo = document.createElement('p');
            subtitulo.style.textAlign = 'center';
            subtitulo.style.fontSize = '12px';
            subtitulo.style.color = '#333';
            subtitulo.innerText = `Rango: ${textoInicio} al ${textoFin} | Generado por: ${nombreGenerador}`;
            container.appendChild(subtitulo);

            const tabla = document.createElement('table');
            tabla.style.width = '100%';
            tabla.style.borderCollapse = 'collapse';
            tabla.style.marginTop = '20px';
            tabla.style.fontSize = '9px';

            const thead = document.createElement('thead');
            const trHead = document.createElement('tr');
            const headers = Object.keys(data[0]);
            
            headers.forEach(h => {
                const th = document.createElement('th');
                th.innerText = h.toUpperCase();
                th.style.border = '1px solid #000';
                th.style.backgroundColor = '#1E293B';
                th.style.color = '#FFF';
                th.style.padding = '6px 4px';
                th.style.textAlign = 'center';
                trHead.appendChild(th);
            });
            thead.appendChild(trHead);
            tabla.appendChild(thead);

            const tbody = document.createElement('tbody');
            let sumaFinal = 0;

            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                if (index % 2 !== 0) tr.style.backgroundColor = '#f8fafc';

                headers.forEach(h => {
                    const td = document.createElement('td');
                    td.style.border = '1px solid #cbd5e1';
                    td.style.padding = '5px 4px';
                    
                    let valor = row[h];
                    const headerName = h.toUpperCase();
                    
                    if (headerName.includes("MONTO") || headerName.includes("TOTAL") || headerName.includes("VENDIDO") || headerName.includes("ANULADO") || headerName.includes("SALDO")) {
                        td.innerText = `S/ ${parseFloat(valor || 0).toFixed(2)}`;
                        td.style.textAlign = 'right';
                    } else {
                        td.innerText = valor || '-';
                        td.style.textAlign = 'center';
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);

                const monto = row["Monto Total"] || row["TotalVendido"] || row["totalvendido"] || row["ImporteTotal"] || row["importetotal"] || row["Monto"] || row["monto"] || row["Saldo Final"] || row["saldofinal"] || row["SaldoFinal"] || row["Total"] || row["total"] || 0;
                sumaFinal += parseFloat(monto);
            });
            
            tabla.appendChild(tbody);
            container.appendChild(tabla);

            const totalText = document.createElement('h3');
            totalText.style.textAlign = 'right';
            totalText.style.marginTop = '15px';
            totalText.style.color = '#1E293B';
            totalText.innerText = `TOTAL GENERAL: S/ ${sumaFinal.toFixed(2)}`;
            container.appendChild(totalText);

            const opt = {
                margin:       0.3,
                filename:     `Reporte_${tipo}_${textoInicio}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(container).save();
            sileo.success({ title: '¡PDF Descargado!' });

        } catch (error) {
            console.error(error);
            sileo.error({ title: 'Error', description: 'Ocurrió un error al generar el PDF' });
        } finally {
            setCargando(null);
        }
    };

    const usuariosFiltrados = usuariosLista.filter(u => {
        const nombre = String(u.nombreCompleto || u.NombreCompleto || u.nombre || u.Nombre || u.username || '').toLowerCase();
        return nombre.includes(busquedaUsuario.toLowerCase());
    });

    const userObj = usuariosLista.find(u => String(u.usuarioID || u.UsuarioID || u.usuarioId || u.usuarioid || u.id) === String(usuarioFiltro));
    const nombreSeleccionado = usuarioFiltro 
        ? (userObj?.nombreCompleto || userObj?.NombreCompleto || userObj?.nombre || userObj?.Nombre || userObj?.username || '')
        : 'Todos los Cajeros';

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
                
                <div className="bg-transparent mb-8 transition-all duration-300">
                    <div className="flex flex-col w-full mb-8">
                        <h2 className="text-3xl font-black text-[var(--texto-principal)] tracking-tight flex items-center gap-3 mb-1">
                            <i className="fa-solid fa-chart-column text-[var(--texto-principal)]"></i>
                            Centro de Reportes
                        </h2>
                        <p className="text-[var(--texto-secundario)] font-medium text-[15px]">
                            Genera y descarga información histórica en Excel y PDF Profesional.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 items-end">
                        <div className="flex-1 w-full lg:w-auto min-w-[300px]">
                            <label className="block mb-2 text-[11px] font-bold text-[var(--texto-secundario)] uppercase tracking-widest">
                                Rango de Fechas
                            </label>
                            <SelectorRangoFechas 
                                inicio={fechaInicio} 
                                fin={fechaFin} 
                                onChange={(i, f) => { setFechaInicio(i); setFechaFin(f); }} 
                            />
                        </div>

                        {esAdmin && (
                            <div className="flex-1 w-full lg:w-auto min-w-[300px] relative" ref={dropdownRef}>
                                <label className="block mb-2 text-[11px] font-bold text-[var(--texto-secundario)] uppercase tracking-widest">
                                    Filtrar por Cajero
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setDropdownCajeroAbierto(!dropdownCajeroAbierto)}
                                    className={`w-full flex items-center justify-between gap-3 bg-[var(--color-header)] border-2 border-[var(--border-color)] px-5 py-3.5 rounded-xl text-sm font-bold text-[var(--texto-principal)] transition-colors shadow-sm outline-none ${dropdownCajeroAbierto ? 'border-blue-500 ring-2 ring-blue-500/20' : 'hover:bg-[var(--color-fondo-app)]'}`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        <span className="truncate">{nombreSeleccionado}</span>
                                    </div>
                                    <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${dropdownCajeroAbierto ? 'rotate-180 text-blue-500' : ''}`}></i>
                                </button>

                                {dropdownCajeroAbierto && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-[fade-slide-down_0.15s_ease-out_forwards]">
                                        <div className="p-3 border-b border-[var(--border-color)] bg-[var(--color-fondo-app)]">
                                            <div className="relative">
                                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--texto-secundario)] text-xs"></i>
                                                <input 
                                                    type="text" 
                                                    placeholder="Buscar cajero..."
                                                    value={busquedaUsuario}
                                                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                                                    className="w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-lg pl-8 pr-3 py-2.5 text-sm font-medium text-[var(--texto-principal)] outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                            <button
                                                onClick={() => { setUsuarioFiltro(''); setDropdownCajeroAbierto(false); setBusquedaUsuario(''); }}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${usuarioFiltro === '' ? 'bg-blue-500/20 text-blue-500' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                            >
                                                <i className="fa-solid fa-users mr-2 w-5 text-center"></i> Todos los Cajeros
                                            </button>
                                            {usuariosFiltrados.length === 0 ? (
                                                <div className="px-3 py-4 text-center text-sm text-[var(--texto-secundario)] font-medium">No se encontraron cajeros</div>
                                            ) : (
                                                usuariosFiltrados.map(u => {
                                                    const uid = String(u.usuarioID || u.UsuarioID || u.usuarioId || u.usuarioid || u.id);
                                                    const nombre = u.nombreCompleto || u.NombreCompleto || u.nombre || u.Nombre || u.username;
                                                    const isSel = String(usuarioFiltro) === uid;
                                                    return (
                                                        <button
                                                            key={uid}
                                                            onClick={() => { setUsuarioFiltro(uid); setDropdownCajeroAbierto(false); }}
                                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${isSel ? 'bg-blue-500/20 text-blue-500' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                        >
                                                            <span className="truncate"><i className="fa-solid fa-user-astronaut mr-2 w-5 text-center text-[var(--texto-secundario)]"></i> {nombre}</span>
                                                            {isSel && <i className="fa-solid fa-check text-blue-500 text-xs"></i>}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    
                    <div className="group relative bg-[var(--color-header)] p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--border-color)] flex flex-col gap-4 overflow-hidden z-10">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
                        
                        <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 text-4xl mx-auto mb-2 transition-all duration-300 shadow-inner group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
                            <i className="fa-solid fa-file-invoice-dollar"></i>
                        </div>
                        
                        <h3 className="text-center text-2xl font-black text-[var(--texto-principal)] tracking-tight">Reporte de Ventas</h3>
                        <p className="text-center text-[var(--texto-secundario)] text-sm font-medium flex-grow px-4">
                            Exporta cada transacción individual incluyendo método de pago, número de operación y categorías detalladas.
                        </p>
                        
                        <div className="flex gap-4 mt-4">
                            <button 
                                onClick={() => generarExcel('GENERAL')} 
                                disabled={cargando !== null}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none outline-none"
                            >
                                {cargando === 'EXCEL-GENERAL' ? <i className="fa-solid fa-spinner fa-spin text-lg"></i> : <i className="fa-solid fa-file-excel text-lg"></i>} 
                                Excel
                            </button>
                            <button 
                                onClick={() => generarPDF('GENERAL')} 
                                disabled={cargando !== null}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgb(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none outline-none"
                            >
                                {cargando === 'PDF-GENERAL' ? <i className="fa-solid fa-spinner fa-spin text-lg"></i> : <i className="fa-solid fa-file-pdf text-lg"></i>} 
                                PDF
                            </button>
                        </div>
                    </div>

                    <div className="group relative bg-[var(--color-header)] p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--border-color)] flex flex-col gap-4 overflow-hidden z-10">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
                        
                        <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 text-4xl mx-auto mb-2 transition-all duration-300 shadow-inner group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110">
                            <i className="fa-solid fa-cash-register"></i>
                        </div>
                        
                        <h3 className="text-center text-2xl font-black text-[var(--texto-principal)] tracking-tight">Cierres de Caja</h3>
                        <p className="text-center text-[var(--texto-secundario)] text-sm font-medium flex-grow px-4">
                            Visualiza aperturas y cierres de turno, montos iniciales, finales y auditoría de cuadres por usuario.
                        </p>
                        
                        <div className="flex gap-4 mt-4">
                            <button 
                                onClick={() => generarExcel('CAJAS')} 
                                disabled={cargando !== null}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none outline-none"
                            >
                                {cargando === 'EXCEL-CAJAS' ? <i className="fa-solid fa-spinner fa-spin text-lg"></i> : <i className="fa-solid fa-file-excel text-lg"></i>} 
                                Excel
                            </button>
                            <button 
                                onClick={() => generarPDF('CAJAS')} 
                                disabled={cargando !== null}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgb(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none outline-none"
                            >
                                {cargando === 'PDF-CAJAS' ? <i className="fa-solid fa-spinner fa-spin text-lg"></i> : <i className="fa-solid fa-file-pdf text-lg"></i>} 
                                PDF
                            </button>
                        </div>
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

export default Reportes;