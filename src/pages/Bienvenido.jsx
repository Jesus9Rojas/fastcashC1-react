import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoAnimado from '../assets/img/img/LogoYapeRojas.png'; 
import Gatito from '../assets/img/img/Tolon.png';

// 1. Calculamos el saludo FUERA del efecto para evitar dobles renderizados
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
    
    // 2. Asignamos el saludo directamente en el estado inicial
    const [saludo] = useState(obtenerSaludo());

    useEffect(() => {
        const timer = setTimeout(() => {
            setCargando(false);
        }, 1200);
        
        return () => clearTimeout(timer);
    }, []);

    // 3. PANTALLA DE CARGA CON LOGO ANIMADO
    if (cargando) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                <img 
                    src={logoAnimado} 
                    alt="Cargando..." 
                    style={{ 
                        width: '180px', 
                        animation: 'pulseLogo 1.5s infinite ease-in-out',
                        filter: 'drop-shadow(0 0 15px rgba(230,0,35,0.4))'
                    }} 
                />
                <p style={{ marginTop: '20px', color: 'var(--texto-secundario)', fontWeight: '600', letterSpacing: '1px' }}>
                    Preparando tu área de trabajo...
                </p>
                <style>
                    {`
                        @keyframes pulseLogo {
                            0% { transform: scale(0.95); opacity: 0.8; }
                            50% { transform: scale(1.05); opacity: 1; }
                            100% { transform: scale(0.95); opacity: 0.8; }
                        }
                    `}
                </style>
            </div>
        );
    }

    // Obtenemos el primer nombre del usuario para la burbuja
    const primerNombre = usuario?.nombreCompleto?.split(' ')[0] || 'Humano';

    // 4. DASHBOARD DE BIENVENIDA MODERNO
    return (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            
            <div style={{ 
                background: 'linear-gradient(135deg, var(--color-primario) 0%, #8b0000 100%)', 
                borderRadius: '20px', padding: '3rem', color: 'white', marginBottom: '2.5rem',
                boxShadow: '0 10px 25px rgba(230,0,35,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                        {saludo}, {primerNombre} 👋
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: '0.9' }}>
                        ¿Qué deseas hacer en este turno? Selecciona una acción rápida para comenzar.
                    </p>
                </div>

                {/* 🚀 CONTENEDOR DEL GATITO CON TAMAÑO RESTAURADO */}
                <div style={{ 
                    position: 'relative', 
                    width: '230px', height: '180px', // <- Medidas originales restauradas
                    marginLeft: '2rem', flexShrink: 0
                }}>
                    
                    {/* 👇 LA BURBUJA A LA IZQUIERDA 👇 */}
                    <div className="burbuja-gato">
                        ¡Miau! Bienvenido, <br/> <span style={{color: 'var(--color-primario)'}}>{primerNombre}</span> 🐾
                    </div>

                    <img src={Gatito} alt="Gatito Tolon" style={{width: '100%', height: '100%', borderRadius: '15px', objectFit: 'cover'}} />
                </div>
            </div>

            <h3 style={{ marginBottom: '1.2rem', color: 'var(--texto-principal)', fontWeight: '800' }}>
                Accesos Rápidos
            </h3>
            
            {/* Grid de Tarjetas de Acción */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                
                <div className="card-accion" onClick={() => navigate('/yape')} style={{ background: 'var(--color-header)', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--sombra-md)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid var(--border-color)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--sombra-lg)' }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--sombra-md)' }}>
                    <div style={{ background: '#f3e8ff', width: '55px', height: '55px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', fontSize: '1.5rem', marginBottom: '1rem' }}>
                        <i className="fa-solid fa-qrcode"></i>
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--texto-principal)', fontSize: '1.1rem' }}>Venta Digital</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--texto-secundario)' }}>Registrar pagos con Yape o Plin</p>
                </div>

                <div className="card-accion" onClick={() => navigate('/tarjeta')} style={{ background: 'var(--color-header)', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--sombra-md)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid var(--border-color)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--sombra-lg)' }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--sombra-md)' }}>
                    <div style={{ background: '#dbeafe', width: '55px', height: '55px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '1.5rem', marginBottom: '1rem' }}>
                        <i className="fa-regular fa-credit-card"></i>
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--texto-principal)', fontSize: '1.1rem' }}>Venta Tarjeta</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--texto-secundario)' }}>Cobros con terminal POS</p>
                </div>

                <div className="card-accion" onClick={() => navigate('/historial')} style={{ background: 'var(--color-header)', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--sombra-md)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid var(--border-color)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--sombra-lg)' }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--sombra-md)' }}>
                    <div style={{ background: '#fef3c7', width: '55px', height: '55px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontSize: '1.5rem', marginBottom: '1rem' }}>
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--texto-principal)', fontSize: '1.1rem' }}>Historial</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--texto-secundario)' }}>Revisar o anular operaciones</p>
                </div>

            </div>
            
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    /* =========================================
                       ESTILOS DE LA BURBUJA DEL GATITO (IZQUIERDA)
                       ========================================= */
                    .burbuja-gato {
                        position: absolute;
                        top: 30px; 
                        right: 100%; 
                        margin-right: -50px; 
                        width: max-content; 
                        background: #ffffff;
                        color: #333333;
                        padding: 12px 20px;
                        border-radius: 20px;
                        font-size: 0.95rem;
                        font-weight: 700;
                        text-align: center;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.25);
                        z-index: 10;
                        animation: flotarBurbuja 3s ease-in-out infinite; 
                    }

                    
                    .burbuja-gato::after {
                        content: '';
                        position: absolute;
                        top: 50%; 
                        right: -12px;
                        transform: translateY(-50%); 
                        border-width: 10px 0 10px 15px;
                        border-style: solid;
                        border-color: transparent transparent transparent #ffffff;
                        display: block;
                        width: 0;
                    }

                    @keyframes flotarBurbuja {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                        100% { transform: translateY(0px); }
                    }
                `}
            </style>
        </div>
    );
};

export default Bienvenida;