import{f as e,i as t,r as n,t as r}from"./AuthContext-CwAPZXFj.js";import{c as i,s as a}from"./index-CT7pxnHj.js";var o=e(t(),1),s=`/fastcashC1-react/assets/Tolon-BtBJ0Hiy.png`,c=n(),l=()=>{let e=new Date().getHours();return e<12?`Buenos días`:e<18?`Buenas tardes`:`Buenas noches`},u=()=>{let{usuario:e}=(0,o.useContext)(r),t=i(),[n,u]=(0,o.useState)(!0),[d]=(0,o.useState)(l());if((0,o.useEffect)(()=>{let e=setTimeout(()=>{u(!1)},1200);return()=>clearTimeout(e)},[]),n)return(0,c.jsxs)(`div`,{style:{display:`flex`,justifyContent:`center`,alignItems:`center`,height:`100%`,flexDirection:`column`},children:[(0,c.jsx)(`img`,{src:a,alt:`Cargando...`,style:{width:`180px`,animation:`pulseLogo 1.5s infinite ease-in-out`,filter:`drop-shadow(0 0 15px rgba(230,0,35,0.4))`}}),(0,c.jsx)(`p`,{style:{marginTop:`20px`,color:`var(--texto-secundario)`,fontWeight:`600`,letterSpacing:`1px`},children:`Preparando tu área de trabajo...`}),(0,c.jsx)(`style`,{children:`
                        @keyframes pulseLogo {
                            0% { transform: scale(0.95); opacity: 0.8; }
                            50% { transform: scale(1.05); opacity: 1; }
                            100% { transform: scale(0.95); opacity: 0.8; }
                        }
                    `})]});let f=e?.nombreCompleto?.split(` `)[0]||`Humano`;return(0,c.jsxs)(`div`,{style:{animation:`fadeIn 0.6s ease-out`},children:[(0,c.jsxs)(`div`,{className:`card-bienvenida`,children:[(0,c.jsxs)(`div`,{className:`texto-bienvenida`,children:[(0,c.jsxs)(`h1`,{style:{fontSize:`2.5rem`,marginBottom:`0.5rem`,fontWeight:`800`},children:[d,`, `,f,` 👋`]}),(0,c.jsx)(`p`,{style:{fontSize:`1.1rem`,opacity:`0.9`},children:`¿Qué deseas hacer en este turno? Selecciona una acción rápida para comenzar.`})]}),(0,c.jsxs)(`div`,{className:`contenedor-gatito`,children:[(0,c.jsxs)(`div`,{className:`burbuja-gato`,children:[`¡Miau! Bienvenido, `,(0,c.jsx)(`br`,{}),` `,(0,c.jsx)(`span`,{style:{color:`var(--color-primario)`},children:f}),` 🐾`]}),(0,c.jsx)(`img`,{src:s,alt:`Gatito Tolon`,style:{width:`100%`,height:`100%`,borderRadius:`15px`,objectFit:`contain`}})]})]}),(0,c.jsx)(`h3`,{style:{marginBottom:`1.2rem`,color:`var(--texto-principal)`,fontWeight:`800`},children:`Accesos Rápidos`}),(0,c.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(260px, 1fr))`,gap:`1.5rem`},children:[(0,c.jsxs)(`div`,{className:`card-accion`,onClick:()=>t(`/yape`),style:{background:`var(--color-header)`,padding:`1.5rem`,borderRadius:`16px`,boxShadow:`var(--sombra-md)`,cursor:`pointer`,transition:`transform 0.2s, box-shadow 0.2s`,border:`1px solid var(--border-color)`},onMouseOver:e=>{e.currentTarget.style.transform=`translateY(-5px)`,e.currentTarget.style.boxShadow=`var(--sombra-lg)`},onMouseOut:e=>{e.currentTarget.style.transform=`translateY(0)`,e.currentTarget.style.boxShadow=`var(--sombra-md)`},children:[(0,c.jsx)(`div`,{style:{background:`#f3e8ff`,width:`55px`,height:`55px`,borderRadius:`14px`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#9333ea`,fontSize:`1.5rem`,marginBottom:`1rem`},children:(0,c.jsx)(`i`,{className:`fa-solid fa-qrcode`})}),(0,c.jsx)(`h4`,{style:{margin:`0 0 0.5rem 0`,color:`var(--texto-principal)`,fontSize:`1.1rem`},children:`Venta Digital`}),(0,c.jsx)(`p`,{style:{margin:0,fontSize:`0.9rem`,color:`var(--texto-secundario)`},children:`Registrar pagos con Yape o Plin`})]}),(0,c.jsxs)(`div`,{className:`card-accion`,onClick:()=>t(`/tarjeta`),style:{background:`var(--color-header)`,padding:`1.5rem`,borderRadius:`16px`,boxShadow:`var(--sombra-md)`,cursor:`pointer`,transition:`transform 0.2s, box-shadow 0.2s`,border:`1px solid var(--border-color)`},onMouseOver:e=>{e.currentTarget.style.transform=`translateY(-5px)`,e.currentTarget.style.boxShadow=`var(--sombra-lg)`},onMouseOut:e=>{e.currentTarget.style.transform=`translateY(0)`,e.currentTarget.style.boxShadow=`var(--sombra-md)`},children:[(0,c.jsx)(`div`,{style:{background:`#dbeafe`,width:`55px`,height:`55px`,borderRadius:`14px`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#2563eb`,fontSize:`1.5rem`,marginBottom:`1rem`},children:(0,c.jsx)(`i`,{className:`fa-regular fa-credit-card`})}),(0,c.jsx)(`h4`,{style:{margin:`0 0 0.5rem 0`,color:`var(--texto-principal)`,fontSize:`1.1rem`},children:`Venta Tarjeta`}),(0,c.jsx)(`p`,{style:{margin:0,fontSize:`0.9rem`,color:`var(--texto-secundario)`},children:`Cobros con terminal POS`})]}),(0,c.jsxs)(`div`,{className:`card-accion`,onClick:()=>t(`/historial`),style:{background:`var(--color-header)`,padding:`1.5rem`,borderRadius:`16px`,boxShadow:`var(--sombra-md)`,cursor:`pointer`,transition:`transform 0.2s, box-shadow 0.2s`,border:`1px solid var(--border-color)`},onMouseOver:e=>{e.currentTarget.style.transform=`translateY(-5px)`,e.currentTarget.style.boxShadow=`var(--sombra-lg)`},onMouseOut:e=>{e.currentTarget.style.transform=`translateY(0)`,e.currentTarget.style.boxShadow=`var(--sombra-md)`},children:[(0,c.jsx)(`div`,{style:{background:`#fef3c7`,width:`55px`,height:`55px`,borderRadius:`14px`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#d97706`,fontSize:`1.5rem`,marginBottom:`1rem`},children:(0,c.jsx)(`i`,{className:`fa-solid fa-clock-rotate-left`})}),(0,c.jsx)(`h4`,{style:{margin:`0 0 0.5rem 0`,color:`var(--texto-principal)`,fontSize:`1.1rem`},children:`Historial`}),(0,c.jsx)(`p`,{style:{margin:0,fontSize:`0.9rem`,color:`var(--texto-secundario)`},children:`Revisar o anular operaciones`})]})]}),(0,c.jsx)(`style`,{children:`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    /* =========================================
                       DISEÑO DE LA TARJETA PRINCIPAL (DESKTOP)
                       ========================================= */
                    .card-bienvenida {
                        background: linear-gradient(135deg, var(--color-primario) 0%, #8b0000 100%);
                        border-radius: 20px;
                        padding: 3rem;
                        color: white;
                        margin-bottom: 2.5rem;
                        box-shadow: 0 10px 25px rgba(230,0,35,0.2);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .texto-bienvenida {
                        flex: 1;
                    }

                    .contenedor-gatito {
                        position: relative;
                        width: 230px;
                        height: 180px;
                        margin-left: 2rem;
                        flex-shrink: 0;
                    }

                    /* =========================================
                       ESTILOS DE LA BURBUJA (DESKTOP: A LA IZQUIERDA)
                       ========================================= */
                    .burbuja-gato {
                        position: absolute;
                        top: 30px; 
                        right: 100%; 
                        margin-right: -40px; 
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

                    /* =========================================
                       DISEÑO RESPONSIVO (CELULARES Y TABLETS)
                       ========================================= */
                    @media (max-width: 768px) {
                        .card-bienvenida {
                            flex-direction: column;
                            text-align: center;
                            padding: 2rem 1.5rem;
                            gap: 3rem; /* Da espacio para que la burbuja no tape el texto */
                        }

                        .contenedor-gatito {
                            margin-left: 0;
                            width: 200px; /* Gatito un poco más pequeño en celular */
                            height: 140px;
                            margin-top: 0.5rem; /* Ajusta el espacio entre el texto y el gatito */
                        }

                        .texto-bienvenida h1 {
                            font-size: 2rem !important; /* Texto un poco más pequeño */
                        }

                        /* Burbuja pasa arriba del gatito en celular */
                        .burbuja-gato {
                            top: -25px;
                            right: auto;
                            left: 50%;
                            margin-right: 0;
                            transform: translateX(-50%);
                            animation: flotarBurbujaMobile 3s ease-in-out infinite;
                        }

                        /* Piquito de la burbuja apunta hacia abajo */
                        .burbuja-gato::after {
                            top: auto;
                            bottom: -10px;
                            right: auto;
                            left: 50%;
                            transform: translateX(-50%);
                            border-width: 12px 10px 0 10px;
                            border-color: #ffffff transparent transparent transparent;
                        }
                    }

                    /* Animación adaptada para no perder el centrado en celular */
                    @keyframes flotarBurbujaMobile {
                        0% { transform: translate(-50%, 0px); }
                        50% { transform: translate(-50%, -8px); }
                        100% { transform: translate(-50%, 0px); }
                    }
                `})]})};export{u as default};