import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { sileo, Toaster } from 'sileo';

const Configuracion = () => {
    const { usuario } = useContext(AuthContext);
    
    const [tabActiva, setTabActiva] = useState('categorias'); 
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [animacionModal, setAnimacionModal] = useState(''); 
    
    const [formId, setFormId] = useState('');
    const [formNombre, setFormNombre] = useState('');
    const [formActivo, setFormActivo] = useState('true');
    const [formTipo, setFormTipo] = useState('BANCO');
    
    const [formIcono, setFormIcono] = useState('📦');
    const [formColor, setFormColor] = useState('#E60023');

    const [dropdownTipoAbierto, setDropdownTipoAbierto] = useState(false);
    const [dropdownEstadoAbierto, setDropdownEstadoAbierto] = useState(false);

    const tipoRef = useRef(null);
    const estadoRef = useRef(null);

    const esAdmin = String(usuario?.rol || '').toUpperCase() === 'ADMINISTRADOR';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tipoRef.current && !tipoRef.current.contains(event.target)) {
                setDropdownTipoAbierto(false);
            }
            if (estadoRef.current && !estadoRef.current.contains(event.target)) {
                setDropdownEstadoAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Solución al Cascading Render
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (!esAdmin) return;
            setCargando(true);
            try {
                const endpoint = tabActiva === 'categorias' ? '/maestros/categorias' : '/maestros/entidades';
                const res = await api.get(endpoint);
                if (isMounted) setDatos(res.data);
            } catch (error) {
                console.error(error);
                if (isMounted) sileo.error({ title: 'Error', description: 'No se pudieron cargar los datos' });
            } finally {
                if (isMounted) setCargando(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [tabActiva, esAdmin, refreshTrigger]);

    const cargarDatos = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setFormId('');
        setFormNombre('');
        setFormActivo('true');
        setFormTipo('BANCO');
        setFormIcono('📦');
        setFormColor('#E60023');
        setAnimacionModal('mostrar');
        setModalVisible(true);
    };

    const abrirModalEditar = (item) => {
        setModoEdicion(true);
        if (tabActiva === 'categorias') {
            setFormId(item.categoriaID || item.CategoriaID);
            setFormNombre(item.nombre || item.Nombre);
            const activo = item.activo === true || item.Activo === true || String(item.activo) === 'true';
            setFormActivo(activo ? 'true' : 'false');
            
            setFormIcono(item.icono || item.Icono || '📦');
            setFormColor(item.colorHex || item.ColorHex || '#E60023');
        } else {
            setFormId(item.entidadID || item.EntidadID);
            setFormNombre(item.nombre || item.Nombre);
            setFormTipo(item.tipo || item.Tipo || 'BANCO');
            const activo = item.activo === true || item.Activo === true || String(item.activo) === 'true';
            setFormActivo(activo ? 'true' : 'false');
        }
        setAnimacionModal('mostrar');
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setAnimacionModal('saliendo');
        setTimeout(() => {
            setModalVisible(false);
            setAnimacionModal('');
            setDropdownTipoAbierto(false);
            setDropdownEstadoAbierto(false);
        }, 300);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        
        const payload = {
            nombre: formNombre,
            activo: formActivo === 'true'
        };

        if (tabActiva === 'entidades') {
            payload.tipo = formTipo;
        } else {
            payload.colorHex = formColor;
            payload.icono = formIcono;
        }

        try {
            const endpoint = tabActiva === 'categorias' ? '/maestros/categorias' : '/maestros/entidades';
            
            if (modoEdicion) {
                await api.put(`${endpoint}/${formId}`, payload);
                sileo.success({ title: 'Actualizado', description: 'Registro actualizado correctamente' });
            } else {
                await api.post(endpoint, payload);
                sileo.success({ title: 'Creado', description: 'Nuevo registro guardado' });
            }
            
            cerrarModal();
            cargarDatos(); 
        } catch (error) {
            console.error(error);
            sileo.error({ title: 'Error', description: 'No se pudo guardar el registro' });
        }
    };

    const obtenerNombreTipo = (tipo) => {
        if (tipo === 'BANCO') return 'Banco';
        if (tipo === 'BILLETERA') return 'Billetera Digital';
        return 'Otro';
    };

    if (!esAdmin) {
        return (
            <section className="animate-fade-in w-full max-w-full">
                <div className="text-center py-16 px-4">
                    <i className="fa-solid fa-lock text-6xl text-red-500 mb-4"></i>
                    <h2 className="text-2xl font-bold text-[var(--texto-principal)]">Acceso Denegado</h2>
                    <p className="text-[var(--texto-secundario)] mt-2">Esta sección es exclusiva para Administradores.</p>
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
                
                <div className="bg-[var(--color-header)] rounded-[2rem] shadow-sm border border-[var(--border-color)] flex flex-col overflow-hidden transition-colors duration-300">
                    
                    <div className="p-6 md:p-8 border-b border-[var(--border-color)] bg-[var(--color-fondo-app)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors duration-300">
                        <div>
                            <h2 className="text-3xl font-black text-[var(--texto-principal)] tracking-tight flex items-center gap-3 mb-1 transition-colors duration-300">
                                <i className="fa-solid fa-gear text-[var(--texto-principal)] transition-colors duration-300"></i>
                                Configuración del Sistema
                            </h2>
                            <p className="text-[15px] text-[var(--texto-secundario)] font-medium transition-colors duration-300">Gestiona Categorías y Entidades Financieras</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex w-full sm:w-auto bg-[var(--color-header)] p-1.5 rounded-2xl border border-[var(--border-color)] shadow-sm transition-colors duration-300">
                                <button 
                                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${tabActiva === 'categorias' ? 'bg-[var(--color-fondo-app)] text-[var(--texto-principal)] border border-[var(--border-color)]' : 'text-[var(--texto-secundario)] border border-transparent hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`} 
                                    onClick={() => setTabActiva('categorias')}
                                >
                                    <i className="fa-solid fa-box"></i> Categorías
                                </button>
                                <button 
                                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${tabActiva === 'entidades' ? 'bg-[var(--color-fondo-app)] text-[var(--texto-principal)] border border-[var(--border-color)]' : 'text-[var(--texto-secundario)] border border-transparent hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`} 
                                    onClick={() => setTabActiva('entidades')}
                                >
                                    <i className="fa-solid fa-building-columns"></i> Bancos/Billeteras
                                </button>
                            </div>

                            <button 
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed outline-none" 
                                onClick={abrirModalNuevo}
                            >
                                <i className="fa-solid fa-plus transition-transform duration-300 group-hover:rotate-90"></i> 
                                Nuevo Registro
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-[var(--color-header)] border-b border-[var(--border-color)] transition-colors duration-300">
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">ID</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Nombre</th>
                                    {tabActiva === 'entidades' && <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Tipo</th>}
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Estado</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] transition-colors duration-300">
                                {cargando ? (
                                    <tr>
                                        <td colSpan={tabActiva === 'entidades' ? "5" : "4"} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center gap-3 text-[var(--texto-secundario)]">
                                                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                                                <span className="font-semibold text-sm tracking-wide">Cargando registros...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : datos.length === 0 ? (
                                    <tr>
                                        <td colSpan={tabActiva === 'entidades' ? "5" : "4"} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center gap-3 text-[var(--texto-secundario)]">
                                                <div className="w-16 h-16 rounded-full bg-[var(--color-fondo-app)] flex items-center justify-center mb-2 transition-colors duration-300">
                                                    <i className="fa-solid fa-folder-open text-2xl"></i>
                                                </div>
                                                <span className="font-bold">No hay registros disponibles</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    datos.map((item, idx) => {
                                        const id = tabActiva === 'categorias' ? (item.categoriaID || item.CategoriaID) : (item.entidadID || item.EntidadID);
                                        const nombre = item.nombre || item.Nombre;
                                        const activo = item.activo === true || item.Activo === true || String(item.activo) === 'true';
                                        
                                        return (
                                            <tr key={id || idx} className="transition-colors duration-200 hover:bg-[var(--color-fondo-app)] bg-[var(--color-header)] group">
                                                <td className="py-4 px-6 text-[var(--texto-secundario)] font-semibold">{id}</td>
                                                <td className="py-4 px-6 font-bold text-[var(--texto-principal)] transition-colors duration-300">{nombre}</td>
                                                {tabActiva === 'entidades' && <td className="py-4 px-6 text-[var(--texto-secundario)] font-medium transition-colors duration-300">{item.tipo || item.Tipo}</td>}
                                                <td className="py-4 px-6">
                                                    {activo ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold tracking-wide transition-colors duration-300">
                                                            <i className="fa-solid fa-circle-check"></i> ACTIVO
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold tracking-wide transition-colors duration-300">
                                                            <i className="fa-solid fa-circle-xmark"></i> INACTIVO
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        <button 
                                                            className="w-24 py-2 rounded-xl text-xs font-bold text-[var(--texto-principal)] bg-[var(--color-header)] border border-[var(--border-color)] hover:bg-[var(--color-fondo-app)] transition-all flex items-center justify-center gap-1.5 outline-none shadow-sm" 
                                                            onClick={() => abrirModalEditar(item)}
                                                        >
                                                            <i className="fa-solid fa-pen-to-square"></i> Editar
                                                        </button>
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

            {modalVisible && (
                <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${animacionModal === 'mostrar' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className={`bg-[var(--color-header)] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-visible transform transition-all duration-300 border border-[var(--border-color)] ${animacionModal === 'mostrar' ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                        
                        <div className="flex justify-end p-4 pb-0">
                            <button className="text-[var(--texto-secundario)] hover:text-[var(--texto-principal)] hover:rotate-90 hover:scale-110 transition-all duration-300 text-2xl leading-none w-8 h-8 rounded-full bg-[var(--color-fondo-app)] flex items-center justify-center outline-none" onClick={cerrarModal}>
                                &times;
                            </button>
                        </div>

                        <div className="flex flex-col items-center mt-0 mb-6 px-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-4 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.2)]">
                                <i className={`fa-solid ${modoEdicion ? 'fa-pen-to-square' : 'fa-plus'} text-2xl`}></i>
                            </div>
                            <h2 className="text-2xl font-black text-[var(--texto-principal)] tracking-tight text-center m-0 transition-colors duration-300">
                                {modoEdicion ? 'Editar Registro' : 'Nuevo Registro'}
                            </h2>
                            <p className="text-[var(--texto-secundario)] font-medium text-sm text-center mt-1 transition-colors duration-300">
                                {tabActiva === 'categorias' ? 'Configuración de Categoría' : 'Configuración de Entidad Bancaria'}
                            </p>
                        </div>

                        <form onSubmit={handleGuardar} className="px-8 pb-8">
                            <div className="mb-5">
                                <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Nombre del Registro</label>
                                <div className="relative flex items-center">
                                    <i className="fa-solid fa-tag absolute left-4 text-[var(--texto-secundario)]"></i>
                                    <input 
                                        type="text" 
                                        className="w-full py-3.5 pl-11 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all placeholder:font-medium placeholder:text-[var(--texto-secundario)] hover:bg-[var(--border-color)]" 
                                        value={formNombre} 
                                        onChange={(e) => setFormNombre(e.target.value)} 
                                        required 
                                        placeholder="Ej: Abarrotes"
                                    />
                                </div>
                            </div>

                            {tabActiva === 'entidades' && (
                                <div className="mb-5 relative" ref={tipoRef}>
                                    <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Tipo de Entidad</label>
                                    <div className="relative flex items-center">
                                        <button 
                                            type="button"
                                            onClick={() => setDropdownTipoAbierto(!dropdownTipoAbierto)}
                                            className="w-full py-3.5 pl-11 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all flex items-center justify-between hover:bg-[var(--border-color)]"
                                        >
                                            <span>{obtenerNombreTipo(formTipo)}</span>
                                            <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${dropdownTipoAbierto ? 'rotate-180 text-blue-500' : ''}`}></i>
                                        </button>
                                        <i className="fa-solid fa-layer-group absolute left-4 text-[var(--texto-secundario)]"></i>

                                        {dropdownTipoAbierto && (
                                            <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-[fade-slide-down_0.15s_ease-out_forwards] p-1.5 transition-colors duration-300">
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormTipo('BANCO'); setDropdownTipoAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${formTipo === 'BANCO' ? 'bg-[var(--color-fondo-app)] text-[var(--texto-principal)]' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Banco</span>
                                                    {formTipo === 'BANCO' && <i className="fa-solid fa-check text-blue-600"></i>}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormTipo('BILLETERA'); setDropdownTipoAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${formTipo === 'BILLETERA' ? 'bg-[var(--color-fondo-app)] text-[var(--texto-principal)]' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Billetera Digital</span>
                                                    {formTipo === 'BILLETERA' && <i className="fa-solid fa-check text-blue-600"></i>}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormTipo('OTRO'); setDropdownTipoAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${formTipo === 'OTRO' ? 'bg-[var(--color-fondo-app)] text-[var(--texto-principal)]' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Otro</span>
                                                    {formTipo === 'OTRO' && <i className="fa-solid fa-check text-blue-600"></i>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mb-8 relative" ref={estadoRef}>
                                <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Estado</label>
                                <div className="relative flex items-center">
                                    <button 
                                        type="button"
                                        onClick={() => setDropdownEstadoAbierto(!dropdownEstadoAbierto)}
                                        className="w-full py-3.5 pl-11 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all flex items-center justify-between hover:bg-[var(--border-color)]"
                                    >
                                        <span>{formActivo === 'true' ? 'Activo' : 'Inactivo'}</span>
                                        <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${dropdownEstadoAbierto ? 'rotate-180 text-blue-500' : ''}`}></i>
                                    </button>
                                    <i className="fa-solid fa-toggle-on absolute left-4 text-[var(--texto-secundario)]"></i>

                                    {dropdownEstadoAbierto && (
                                        <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-[fade-slide-down_0.15s_ease-out_forwards] p-1.5 transition-colors duration-300">
                                            <button
                                                type="button"
                                                onClick={() => { setFormActivo('true'); setDropdownEstadoAbierto(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${formActivo === 'true' ? 'bg-[var(--color-fondo-app)] text-[var(--texto-principal)]' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                            >
                                                <span>Activo</span>
                                                {formActivo === 'true' && <i className="fa-solid fa-check text-blue-600"></i>}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setFormActivo('false'); setDropdownEstadoAbierto(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${formActivo === 'false' ? 'bg-[var(--color-fondo-app)] text-[var(--texto-principal)]' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                            >
                                                <span>Inactivo</span>
                                                {formActivo === 'false' && <i className="fa-solid fa-check text-blue-600"></i>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <button 
                                    type="submit" 
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 font-bold shadow-md hover:shadow-lg transition-all text-sm outline-none m-0"
                                >
                                    <i className="fa-solid fa-floppy-disk mr-2"></i> Guardar Cambios
                                </button>
                                <button 
                                    type="button" 
                                    className="w-full bg-[var(--color-header)] border-2 border-[var(--border-color)] hover:bg-[var(--color-fondo-app)] text-[var(--texto-principal)] rounded-2xl py-3.5 font-bold transition-all text-sm outline-none m-0" 
                                    onClick={cerrarModal}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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

export default Configuracion;