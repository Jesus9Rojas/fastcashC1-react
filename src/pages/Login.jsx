import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/img/img/LogoYapeRojas.png'; 

function sanitizarEntrada(texto) {
    if (!texto) return '';
    const elemento = document.createElement('div');
    elemento.innerText = texto;
    return elemento.innerHTML;
}

const Login = () => {
    const { login } = useContext(AuthContext); 
    const [username, setUsername] = useState(() => localStorage.getItem('fastcash_saved_user') || '');
    const [chkRemember, setChkRemember] = useState(() => !!localStorage.getItem('fastcash_saved_user'));
    const [password, setPassword] = useState('');
    const [mostrarPass, setMostrarPass] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errorVisual, setErrorVisual] = useState(false); 
    const [loginExitoso, setLoginExitoso] = useState(false); 

    const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'info' });

    const mostrarToast = (mensaje, tipo = 'info') => {
        setToast({ visible: true, mensaje, tipo });
        setTimeout(() => setToast({ visible: false, mensaje: '', tipo: 'info' }), 3000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const userSanitizado = sanitizarEntrada(username.trim());
        const passLimpio = password.trim();

        if (!userSanitizado || !passLimpio) {
            mostrarToast('Por favor complete todos los campos', 'error');
            return;
        }

        setCargando(true);

        try {
            const response = await api.post('/auth/login', { 
                username: userSanitizado, 
                password: passLimpio 
            });

            const data = response.data;
            const idLeido = data.usuarioID || data.UsuarioID;
            const nombreLeido = data.nombreCompleto || data.NombreCompleto;
            const rolLeido = data.rol || data.Rol;
            const userLeido = data.username || data.Username;
            const tokenLeido = data.token || data.Token || 'token-temporal';

            if (!idLeido) throw new Error("El servidor no devolvió un ID de usuario válido.");

            const sessionData = {
                usuarioID: idLeido,
                nombreCompleto: nombreLeido,
                rol: rolLeido,
                username: userLeido,
                token: tokenLeido 
            };

            if (chkRemember) {
                localStorage.setItem('fastcash_saved_user', userSanitizado);
            } else {
                localStorage.removeItem('fastcash_saved_user');
            }

            setLoginExitoso(true);
            mostrarToast(`¡Bienvenido, ${sessionData.nombreCompleto}!`, 'success');
            
            setTimeout(() => {
                login(sessionData); 
            }, 900);

        } catch (error) {
            console.error("Error en Login:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Credenciales incorrectas o servidor no disponible';
            
            mostrarToast(errorMsg, 'error');
            setErrorVisual(true);
            setTimeout(() => setErrorVisual(false), 2000);
            setCargando(false); 
        } 
    };

    return (
        <>
            <style>
                {`
                    @keyframes slideIn { 
                        from { transform: translateX(120%); opacity: 0; } 
                        to { transform: translateX(0); opacity: 1; } 
                    }
                    @keyframes shake { 
                        0%, 100% { transform: translateX(0); } 
                        25% { transform: translateX(-5px); } 
                        75% { transform: translateX(5px); } 
                    }
                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes shine {
                        0% { left: -100%; opacity: 0; }
                        50% { opacity: 0.4; }
                        100% { left: 100%; opacity: 0; }
                    }
                `}
            </style>

            {toast.visible && (
                <div className={`fixed top-5 right-5 z-[1000] px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 text-white animate-[slideIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] ${toast.tipo === 'error' ? 'bg-red-600' : 'bg-emerald-500'}`}>
                    <i className={`fas ${toast.tipo === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'} text-2xl`}></i>
                    <span className="tracking-wide">{toast.mensaje}</span>
                </div>
            )}
            
            <div 
                className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center font-sans px-4 sm:px-8"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop')" }}
            >

                <div className={`absolute inset-0 bg-black/75 z-0 transition-opacity duration-1000 ${loginExitoso ? 'opacity-0' : 'opacity-100'}`}></div>
                
                <div className="relative z-10 w-full max-w-[950px] flex flex-col lg:flex-row perspective-1000 animate-[fadeUp_0.6s_ease_forwards] isolate">
                    
                    <div 
                        className={`w-full lg:w-[45%] bg-black/40 backdrop-blur-2xl rounded-3xl lg:rounded-r-none lg:rounded-l-3xl border border-white/10 p-8 sm:p-10 flex flex-col justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.8,0,0.2,1)] transform-gpu ${
                            loginExitoso ? 'translate-y-[100vh] lg:translate-y-0 lg:-translate-x-[150vw] rotate-12 lg:-rotate-[10deg] opacity-0' : 'translate-x-0 translate-y-0 opacity-100'
                        }`}
                    >
                        
                        <div className="text-left mb-8 relative">
                            <div className="h-16 mb-6 relative w-full">
                                <img 
                                    src={logo} 
                                    className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 h-[140px] w-auto max-w-[140px] object-contain drop-shadow-md z-20" 
                                    alt="Logo Rojas Ya" 
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Iniciar Sesión</h2>
                            <p className="text-gray-300 font-medium text-sm relative z-10">Ingresa tus credenciales para acceder a tu turno.</p>
                        </div>

                        <form onSubmit={handleLogin} autoComplete="off" className="flex flex-col gap-5 relative z-10">
                            
                            <div>
                                <label htmlFor="username" className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Usuario</label>
                                <div className={`relative flex items-center ${errorVisual ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                                    <i className="fas fa-user absolute left-4 text-gray-500"></i>
                                    <input 
                                        type="text" 
                                        id="username" 
                                        placeholder="Ej: jesus" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required 
                                        className={`w-full bg-[#f8fafc] border-2 ${errorVisual ? 'border-red-500' : 'border-transparent'} rounded-xl py-3.5 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 font-medium outline-none focus:border-[var(--color-primario)] focus:bg-white transition-all text-base`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Contraseña</label>
                                <div className={`relative flex items-center ${errorVisual ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                                    <i className="fas fa-lock absolute left-4 text-gray-500"></i>
                                    <input 
                                        type={mostrarPass ? "text" : "password"} 
                                        id="password" 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        className={`w-full bg-[#f8fafc] border-2 ${errorVisual ? 'border-red-500' : 'border-transparent'} rounded-xl py-3.5 pl-11 pr-12 text-gray-900 placeholder:text-gray-400 font-medium outline-none focus:border-[var(--color-primario)] focus:bg-white transition-all text-base tracking-widest placeholder:tracking-normal`}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setMostrarPass(!mostrarPass)}
                                        title="Ver contraseña"
                                        className="absolute right-4 text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        <i className={`far ${mostrarPass ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center mt-1 mb-2">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={chkRemember}
                                            onChange={(e) => setChkRemember(e.target.checked)}
                                            className="peer hidden"
                                        />
                                        <div className="w-5 h-5 rounded border border-gray-400 bg-transparent peer-checked:bg-[var(--color-primario)] peer-checked:border-[var(--color-primario)] transition-all flex items-center justify-center">
                                            <i className={`fas fa-check text-white text-[10px] transform transition-transform ${chkRemember ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></i>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors select-none">Recordar mi usuario</span>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={cargando || loginExitoso}
                                className="group relative overflow-hidden w-full py-3.5 bg-[#E60023] hover:bg-[#cc001f] text-white rounded-xl font-bold text-base shadow-[0_4px_12px_rgba(230,0,35,0.4)] hover:shadow-[0_8px_25px_rgba(230,0,35,0.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mt-2"
                            >
                                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover:animate-[shine_0.8s_ease-in-out]"></div>

                                {cargando ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin text-lg"></i>
                                        <span>Iniciando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative z-10">Ingresar al Sistema</span>
                                        <i className="fas fa-arrow-right relative z-10 transition-transform duration-300 group-hover:translate-x-1"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-left relative z-10">
                            <p className="text-[11px] text-gray-500 font-medium">© {new Date().getFullYear()} Rojas Super. Todos los derechos reservados.</p>
                        </div>
                    </div>

                    <div 
                        className={`hidden lg:flex w-full lg:w-[55%] bg-gradient-to-br from-red-900/40 to-black/80 backdrop-blur-2xl rounded-r-3xl border border-white/10 p-12 flex-col justify-center relative transition-all duration-[900ms] ease-[cubic-bezier(0.8,0,0.2,1)] transform-gpu ${
                            loginExitoso ? '-translate-y-[100vh] lg:translate-y-0 lg:translate-x-[150vw] -rotate-12 lg:rotate-[10deg] opacity-0' : 'translate-x-0 translate-y-0 opacity-100'
                        }`}
                    >
                        
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primario)] rounded-full blur-[120px] opacity-20 pointer-events-none transform-gpu"></div>

                        <h1 className="text-[3.2rem] sm:text-[3.8rem] font-black leading-[1.05] tracking-tighter mb-4 text-white drop-shadow-md">
                            Sistema de <br/>
                            Gestión <br/>
                            <span className="text-[#E60023]">Comercial</span>
                        </h1>
                        
                        <p className="text-base text-gray-300 font-medium mb-10 drop-shadow-md max-w-md">
                            Control integral de ventas, inventarios y finanzas.
                        </p>

                        <div className="flex flex-col gap-6 relative z-10">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg text-white transition-all duration-300 group-hover:bg-[#E60023] group-hover:border-[#E60023] group-hover:scale-110 will-change-transform">
                                    <i className="fas fa-shield-alt"></i>
                                </div>
                                <div>
                                    <h4 className="text-[1.05rem] font-black tracking-tight text-white mb-0.5">Seguridad Bancaria</h4>
                                    <span className="text-gray-400 text-xs font-medium">Encriptación de datos SSL</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg text-white transition-all duration-300 group-hover:bg-[#E60023] group-hover:border-[#E60023] group-hover:scale-110 will-change-transform">
                                    <i className="fas fa-bolt"></i>
                                </div>
                                <div>
                                    <h4 className="text-[1.05rem] font-black tracking-tight text-white mb-0.5">Tiempo Real</h4>
                                    <span className="text-gray-400 text-xs font-medium">Sincronización instantánea</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg text-white transition-all duration-300 group-hover:bg-[#E60023] group-hover:border-[#E60023] group-hover:scale-110 will-change-transform">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div>
                                    <h4 className="text-[1.05rem] font-black tracking-tight text-white mb-0.5">Analítica Avanzada</h4>
                                    <span className="text-gray-400 text-xs font-medium">Reportes inteligentes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Login;