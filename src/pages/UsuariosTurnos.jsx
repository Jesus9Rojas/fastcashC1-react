import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import { sileo, Toaster } from 'sileo';

const UsuariosTurnos = () => {
    const { usuario } = useContext(AuthContext);

    const [usuariosLista, setUsuariosLista] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [verInactivos, setVerInactivos] = useState(false);
    const [animandoTabla, setAnimandoTabla] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [animacionModal, setAnimacionModal] = useState('');
    
    const [formId, setFormId] = useState('');
    const [formNombre, setFormNombre] = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formRol, setFormRol] = useState('CAJERO');
    const [formEstado, setFormEstado] = useState('true');
    const [formTurno, setFormTurno] = useState('1'); 
    const [formPassword, setFormPassword] = useState('');

    const [dropdownRolAbierto, setDropdownRolAbierto] = useState(false);
    const [dropdownEstadoAbierto, setDropdownEstadoAbierto] = useState(false);
    const [dropdownTurnoAbierto, setDropdownTurnoAbierto] = useState(false);

    const rolRef = useRef(null);
    const estadoRef = useRef(null);
    const turnoRef = useRef(null);

    const esAdmin = String(usuario?.rol || '').toUpperCase() === 'ADMINISTRADOR';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rolRef.current && !rolRef.current.contains(event.target)) setDropdownRolAbierto(false);
            if (estadoRef.current && !estadoRef.current.contains(event.target)) setDropdownEstadoAbierto(false);
            if (turnoRef.current && !turnoRef.current.contains(event.target)) setDropdownTurnoAbierto(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Encapsulado en el Effect para evitar el cascading render y advertencias de dependencias
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            if (!esAdmin) return;
            setCargando(true);
            try {
                const res = await api.get('/admin/usuarios', { params: { t: new Date().getTime() } });
                if (isMounted) setUsuariosLista(res.data);
            } catch (error) {
                console.error(error);
                if (isMounted) sileo.error({ title: 'Error', description: 'No se pudieron cargar los usuarios' });
            } finally {
                if (isMounted) setCargando(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [esAdmin, refreshTrigger]);

    const forzarActualizacion = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const cambiarVistaInactivos = (estadoNuevo) => {
        setAnimandoTabla(true);
        setTimeout(() => {
            setVerInactivos(estadoNuevo);
            setAnimandoTabla(false);
        }, 150);
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setFormId('');
        setFormNombre('');
        setFormUsername('');
        setFormRol('CAJERO');
        setFormEstado('true');
        setFormTurno('1');
        setFormPassword('');
        setAnimacionModal('mostrar');
        setModalVisible(true);
    };

    const abrirModalEditar = (item) => {
        setModoEdicion(true);
        
        setFormId(item.usuarioId || item.usuarioID || item.UsuarioID || item.usuarioid || item.id);
        setFormNombre(item.nombreCompleto || item.NombreCompleto || item.nombrecompleto);
        setFormUsername(item.username || item.Username);
        
        const rolMayus = String(item.rol || item.Rol || 'CAJERO').toUpperCase();
        setFormRol(rolMayus.includes('ADMIN') ? 'ADMINISTRADOR' : 'CAJERO');
        
        const activo = item.activo === true || item.Activo === true || String(item.activo) === 'true';
        setFormEstado(activo ? 'true' : 'false');
        
        const turnoId = item.turnoId || item.TurnoID || item.turnoid || 1;
        setFormTurno(String(turnoId));
        
        setFormPassword(''); 
        setAnimacionModal('mostrar');
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setAnimacionModal('saliendo');
        setTimeout(() => {
            setModalVisible(false);
            setAnimacionModal('');
            setDropdownRolAbierto(false);
            setDropdownEstadoAbierto(false);
            setDropdownTurnoAbierto(false);
        }, 300);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (!modoEdicion && (!formPassword || formPassword.trim() === '')) {
            sileo.warning({ title: 'Atención', description: 'Debe ingresar una contraseña para el nuevo usuario' });
            return;
        }

        let rolParseado = (formRol === 'ADMINISTRADOR') ? 1 : 2;

        const payload = {
            nombreCompleto: formNombre,
            username: formUsername,
            rolId: rolParseado,
            rolID: rolParseado,
            turnoId: parseInt(formTurno),
            turnoID: parseInt(formTurno)
        };

        if (formPassword && formPassword.trim() !== '') {
            payload.password = formPassword;
        }

        try {
            if (modoEdicion) {
                payload.usuarioId = parseInt(formId);
                payload.usuarioID = parseInt(formId);
                payload.activo = formEstado === 'true';
                
                await api.put('/admin/usuario', payload);
                sileo.success({ title: 'Actualizado', description: 'Usuario actualizado correctamente' });
            } else {
                const uidActual = usuario?.usuarioID || usuario?.UsuarioID;
                payload.adminId = parseInt(uidActual);
                payload.adminID = parseInt(uidActual);
                payload.activo = true;
                
                await api.post('/admin/usuario', payload);
                sileo.success({ title: 'Creado', description: 'Usuario registrado correctamente' });
            }
            
            cerrarModal();
            forzarActualizacion(); 
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.mensaje || error.response?.data?.error || 'Error al guardar el usuario';
            sileo.error({ title: 'Error', description: msg });
        }
    };

    const handleEliminar = async (idUsuario) => {
        const confirmacion = await Swal.fire({
            html: `
                <div class="flex flex-col items-center mt-2">
                    <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5 shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]">
                        <i class="fa-solid fa-user-xmark text-4xl animate-pulse"></i>
                    </div>
                    <h2 class="text-2xl font-black text-[var(--texto-principal)] tracking-tight mb-2 transition-colors">¿Desactivar Usuario?</h2>
                    <p class="text-[var(--texto-secundario)] font-medium text-sm text-center px-2 transition-colors">
                        El usuario quedará <b class="text-red-500">inhabilitado</b> para entrar al sistema.
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-user-xmark mr-2"></i> Sí, Desactivar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-[2.5rem] p-6 border border-[var(--border-color)] bg-[var(--color-header)] shadow-2xl max-w-md w-full transition-colors',
                actions: 'flex flex-row justify-center gap-4 w-full mt-6 px-2 pb-2 box-border',
                confirmButton: 'whitespace-nowrap flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 px-4 font-bold shadow-md hover:shadow-lg transition-all text-sm outline-none m-0',
                cancelButton: 'whitespace-nowrap flex-1 bg-[var(--color-header)] border-2 border-[var(--border-color)] hover:bg-[var(--color-fondo-app)] text-[var(--texto-principal)] rounded-2xl py-3.5 px-4 font-bold transition-all text-sm outline-none m-0'
            }
        });

        if (confirmacion.isConfirmed) {
            try {
                await api.delete(`/admin/usuario/${idUsuario}`);
                sileo.success({ title: 'Éxito', description: 'Usuario Desactivado' });
                forzarActualizacion();
            } catch (error) {
                console.error(error);
                sileo.error({ title: 'Error', description: 'No se pudo desactivar el usuario' });
            }
        }
    };

    const formatearTurno = (textoTurno) => {
        if (!textoTurno) return '-';
        const str = String(textoTurno).toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const usuariosFiltrados = usuariosLista.filter(u => {
        const esActivo = (u.activo === true || u.Activo === true || String(u.activo) === "true");
        return verInactivos ? !esActivo : esActivo;
    });

    if (!esAdmin) {
        return (
            <section className="animate-fade-in w-full max-w-full">
                <div className="text-center py-16 px-4">
                    <i className="fa-solid fa-lock text-6xl text-red-500 mb-4"></i>
                    <h2 className="text-2xl font-bold text-[var(--texto-principal)] transition-colors">Acceso Denegado</h2>
                    <p className="text-[var(--texto-secundario)] mt-2 transition-colors">Esta sección es exclusiva para Administradores.</p>
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
                    
                    <div className="p-6 md:p-8 border-b border-[var(--border-color)] bg-[var(--color-fondo-app)] flex flex-col sm:flex-row justify-between sm:items-center gap-6 transition-colors duration-300">
                        <div>
                            <h2 className="text-3xl font-black text-[var(--texto-principal)] tracking-tight flex items-center gap-3 mb-1 transition-colors">
                                <i className="fa-solid fa-users text-[var(--texto-principal)] transition-colors"></i>
                                Gestión de Usuarios
                            </h2>
                            <p className="text-[var(--texto-secundario)] font-medium text-[15px] transition-colors">
                                Crea y administra accesos y turnos.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <button 
                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 outline-none shadow-sm ${verInactivos ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[var(--color-header)] text-[var(--texto-principal)] border border-[var(--border-color)] hover:bg-[var(--color-fondo-app)]'}`}
                                onClick={() => cambiarVistaInactivos(!verInactivos)}
                            >
                                <i className="fa-solid fa-user-slash"></i>
                                {verInactivos ? 'Ver Activos' : 'Ver Inactivos'}
                            </button>

                            <button 
                                className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed outline-none" 
                                onClick={abrirModalNuevo}
                            >
                                <i className="fa-solid fa-user-plus transition-transform duration-300 group-hover:scale-110"></i> 
                                Nuevo Usuario
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className={`w-full text-left border-collapse min-w-[900px] transition-opacity duration-200 ease-in-out ${animandoTabla ? 'opacity-0' : 'opacity-100'}`}>
                            <thead>
                                <tr className="bg-[var(--color-header)] border-b border-[var(--border-color)] transition-colors duration-300">
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">ID</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Nombre Completo</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Usuario</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Turno</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Rol</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider">Estado</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wider text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] transition-colors duration-300">
                                {cargando ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center gap-3 text-[var(--texto-secundario)]">
                                                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                                                <span className="font-semibold text-sm tracking-wide">Cargando usuarios...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : usuariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center gap-3 text-[var(--texto-secundario)]">
                                                <div className="w-16 h-16 rounded-full bg-[var(--color-fondo-app)] flex items-center justify-center mb-2 transition-colors duration-300">
                                                    <i className="fa-solid fa-users-slash text-2xl text-[var(--texto-secundario)]"></i>
                                                </div>
                                                <span className="font-bold text-[var(--texto-secundario)]">No hay usuarios {verInactivos ? 'inactivos' : 'activos'} registrados</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosFiltrados.map(u => {
                                        const uid = u.usuarioId || u.usuarioID || u.UsuarioID || u.usuarioid || u.id; 
                                        const rolNombre = u.rol || u.Rol || 'CAJERO';
                                        const esAdminRol = String(rolNombre).toUpperCase().includes('ADMIN');
                                        const esActivo = (u.activo === true || u.Activo === true || String(u.activo) === "true");
                                        const nombre = u.nombreCompleto || u.NombreCompleto || u.nombrecompleto;
                                        const uname = u.username || u.Username;
                                        const turno = formatearTurno(u.turnoActual || u.TurnoActual || u.turnoactual || '-');

                                        if (!uid) return null;

                                        return (
                                            <tr key={uid} className={`transition-colors duration-200 hover:bg-[var(--color-fondo-app)] bg-[var(--color-header)] group ${!esActivo ? 'opacity-60 bg-[var(--color-fondo-app)]' : ''}`}>
                                                <td className="py-4 px-6 text-[var(--texto-secundario)] font-semibold transition-colors">{uid}</td>
                                                <td className="py-4 px-6 font-bold text-[var(--texto-principal)] transition-colors duration-300">{nombre}</td>
                                                <td className="py-4 px-6 text-[var(--texto-principal)] font-bold transition-colors duration-300">{uname}</td>
                                                <td className="py-4 px-6 text-[var(--texto-secundario)] font-medium transition-colors duration-300">{turno}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-3 py-1 rounded-lg text-[0.7rem] font-extrabold uppercase tracking-wide border transition-colors duration-300 ${esAdminRol ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                                                        {rolNombre}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {esActivo ? (
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
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            className="w-9 h-9 rounded-xl bg-[var(--color-header)] border border-[var(--border-color)] text-[var(--texto-principal)] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all flex items-center justify-center outline-none shadow-sm" 
                                                            onClick={() => abrirModalEditar(u)} 
                                                            title="Editar Usuario"
                                                        >
                                                            <i className="fa-solid fa-pen text-xs"></i>
                                                        </button>
                                                        {esActivo && (
                                                            <button 
                                                                className="w-9 h-9 rounded-xl bg-[var(--color-header)] border border-[var(--border-color)] text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all flex items-center justify-center outline-none shadow-sm" 
                                                                onClick={() => handleEliminar(uid)} 
                                                                title="Desactivar Usuario"
                                                            >
                                                                <i className="fa-solid fa-user-xmark text-xs"></i>
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

            {modalVisible && (
                <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${animacionModal === 'mostrar' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className={`bg-[var(--color-header)] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-visible transform transition-all duration-300 flex flex-col max-h-[95vh] border border-[var(--border-color)] ${animacionModal === 'mostrar' ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                        
                        <div className="flex justify-end p-4 pb-0">
                            <button className="text-[var(--texto-secundario)] hover:text-[var(--texto-principal)] hover:rotate-90 hover:scale-110 transition-all duration-300 text-2xl leading-none w-8 h-8 rounded-full bg-[var(--color-fondo-app)] flex items-center justify-center outline-none" onClick={cerrarModal}>
                                &times;
                            </button>
                        </div>

                        <div className="flex flex-col items-center mt-0 mb-4 px-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-4 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.2)]">
                                <i className={`fa-solid ${modoEdicion ? 'fa-user-pen' : 'fa-user-plus'} text-2xl`}></i>
                            </div>
                            <h2 className="text-2xl font-black text-[var(--texto-principal)] tracking-tight text-center m-0 transition-colors duration-300">
                                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <p className="text-[var(--texto-secundario)] font-medium text-sm text-center mt-1 transition-colors duration-300">
                                Administra los accesos, roles y turnos del personal.
                            </p>
                        </div>

                        <form onSubmit={handleGuardar} className="px-8 pb-8 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Nombre Completo</label>
                                    <div className="relative flex items-center">
                                        <i className="fa-solid fa-user absolute left-4 text-[var(--texto-secundario)]"></i>
                                        <input 
                                            type="text" 
                                            className="w-full py-3.5 pl-11 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all placeholder:font-medium placeholder:text-[var(--texto-secundario)] hover:bg-[var(--border-color)]" 
                                            placeholder="Ej: Juan Perez" 
                                            value={formNombre} 
                                            onChange={(e) => setFormNombre(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Usuario (Login)</label>
                                    <div className="relative flex items-center">
                                        <i className="fa-solid fa-at absolute left-4 text-[var(--texto-secundario)]"></i>
                                        <input 
                                            type="text" 
                                            className="w-full py-3.5 pl-11 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all placeholder:font-medium placeholder:text-[var(--texto-secundario)] hover:bg-[var(--border-color)]" 
                                            placeholder="Ej: jperez" 
                                            value={formUsername} 
                                            onChange={(e) => setFormUsername(e.target.value)} 
                                            required 
                                            autoComplete="off" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative" ref={rolRef}>
                                    <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Rol</label>
                                    <div className="relative flex items-center">
                                        <button 
                                            type="button"
                                            onClick={() => setDropdownRolAbierto(!dropdownRolAbierto)}
                                            className="w-full py-3.5 pl-11 pr-10 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all flex items-center justify-between hover:bg-[var(--border-color)]"
                                        >
                                            <span>{formRol}</span>
                                            <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${dropdownRolAbierto ? 'rotate-180 text-blue-500' : ''}`}></i>
                                        </button>
                                        <i className="fa-solid fa-shield-halved absolute left-4 text-[var(--texto-secundario)]"></i>

                                        {dropdownRolAbierto && (
                                            <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-[fade-slide-down_0.15s_ease-out_forwards] p-1.5 transition-colors duration-300">
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormRol('CAJERO'); setDropdownRolAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${formRol === 'CAJERO' ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Cajero</span>
                                                    {formRol === 'CAJERO' && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormRol('ADMINISTRADOR'); setDropdownRolAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${formRol === 'ADMINISTRADOR' ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Administrador</span>
                                                    {formRol === 'ADMINISTRADOR' && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative" ref={estadoRef}>
                                    <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Estado</label>
                                    <div className="relative flex items-center">
                                        <button 
                                            type="button"
                                            onClick={() => setDropdownEstadoAbierto(!dropdownEstadoAbierto)}
                                            className="w-full py-3.5 pl-11 pr-10 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all flex items-center justify-between hover:bg-[var(--border-color)]"
                                        >
                                            <span>{formEstado === 'true' ? 'Activo' : 'Inactivo'}</span>
                                            <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${dropdownEstadoAbierto ? 'rotate-180 text-blue-500' : ''}`}></i>
                                        </button>
                                        <i className="fa-solid fa-toggle-on absolute left-4 text-[var(--texto-secundario)]"></i>

                                        {dropdownEstadoAbierto && (
                                            <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-[fade-slide-down_0.15s_ease-out_forwards] p-1.5 transition-colors duration-300">
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormEstado('true'); setDropdownEstadoAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${formEstado === 'true' ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Activo</span>
                                                    {formEstado === 'true' && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormEstado('false'); setDropdownEstadoAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${formEstado === 'false' ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Inactivo</span>
                                                    {formEstado === 'false' && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative" ref={turnoRef}>
                                    <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">Turno Asignado</label>
                                    <div className="relative flex items-center">
                                        <button 
                                            type="button"
                                            onClick={() => setDropdownTurnoAbierto(!dropdownTurnoAbierto)}
                                            className="w-full py-3.5 pl-11 pr-10 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all flex items-center justify-between hover:bg-[var(--border-color)]"
                                        >
                                            <span>{formTurno === '1' ? 'Mañana' : 'Tarde'}</span>
                                            <i className={`fa-solid fa-chevron-down text-[var(--texto-secundario)] transition-transform duration-300 text-xs ${dropdownTurnoAbierto ? 'rotate-180 text-blue-500' : ''}`}></i>
                                        </button>
                                        <i className="fa-solid fa-clock absolute left-4 text-[var(--texto-secundario)]"></i>

                                        {dropdownTurnoAbierto && (
                                            <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-header)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-[fade-slide-down_0.15s_ease-out_forwards] p-1.5 transition-colors duration-300">
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormTurno('1'); setDropdownTurnoAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${formTurno === '1' ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Mañana</span>
                                                    {formTurno === '1' && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormTurno('2'); setDropdownTurnoAbierto(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-1 flex items-center justify-between ${formTurno === '2' ? 'bg-blue-50 text-blue-700' : 'text-[var(--texto-secundario)] hover:bg-[var(--color-fondo-app)] hover:text-[var(--texto-principal)]'}`}
                                                >
                                                    <span>Tarde</span>
                                                    {formTurno === '2' && <i className="fa-solid fa-check text-blue-600 text-xs"></i>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-bold text-[var(--texto-secundario)] uppercase tracking-wide transition-colors duration-300">
                                        Contraseña {modoEdicion && <span className="text-[var(--texto-secundario)] font-medium normal-case">(Opcional)</span>}
                                    </label>
                                    <div className="relative flex items-center">
                                        <i className="fa-solid fa-lock absolute left-4 text-[var(--texto-secundario)]"></i>
                                        <input 
                                            type="password" 
                                            className="w-full py-3.5 pl-11 pr-4 bg-[var(--color-fondo-app)] border-2 border-[var(--border-color)] focus:bg-[var(--color-header)] focus:border-blue-500 rounded-xl text-[var(--texto-principal)] font-bold outline-none transition-all tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-[var(--texto-secundario)] hover:bg-[var(--border-color)]" 
                                            placeholder={modoEdicion ? "••••••••" : "Ingrese contraseña"} 
                                            value={formPassword} 
                                            onChange={(e) => setFormPassword(e.target.value)} 
                                            autoComplete="new-password" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full pt-2">
                                <button 
                                    type="submit" 
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 font-bold shadow-md hover:shadow-lg transition-all text-sm outline-none m-0"
                                >
                                    <i className="fa-solid fa-floppy-disk mr-2"></i> Guardar Usuario
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

export default UsuariosTurnos;