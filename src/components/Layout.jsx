import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const [sidebarColapsado, setSidebarColapsado] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth <= 768) {
            setSidebarMobileOpen(!sidebarMobileOpen);
        } else {
            setSidebarColapsado(!sidebarColapsado);
        }
    };

    // Función para cerrar el menú al hacer clic en una opción (solo en mobile)
    const cerrarMobile = () => setSidebarMobileOpen(false);

    return (
        // 🚀 ESTA LÍNEA ARREGLA TODO: Bloquea el scroll general y crea la grilla flexible
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-fondo-app)] font-sans">
            
            <Sidebar 
                colapsado={sidebarColapsado} 
                mobileOpen={sidebarMobileOpen} 
                onNavigate={cerrarMobile} 
            />

            {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
            {sidebarMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[90] md:hidden transition-opacity backdrop-blur-sm"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Panel Derecho: Contiene Header y Área de Trabajo */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
                
                <Header toggleSidebar={toggleSidebar} isMobileOpen={sidebarMobileOpen} />

                {/* Área donde se renderizan todas las vistas (Yape, Tarjeta, Reportes, etc.) */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar bg-[var(--color-fondo-app)]">
                    <div className="mx-auto w-full h-full">
                        <Outlet />
                    </div>
                </main>
                
            </div>
        </div>
    );
};

export default Layout;