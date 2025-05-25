// content.js - Script que se ejecuta automáticamente en todas las páginas de CODIM
console.log('🚀 CODIM CNS Fix - Extensión activada');

// Detectar si estamos en la página principal y reemplazarla
function shouldReplaceWithModernInterface() {
    const currentPath = window.location.pathname;
    const isMainPage = currentPath === '/' || currentPath === '/index.html' || currentPath === '/index.asp' || currentPath === '';
    const hasOldInterface = document.querySelector('div[style*="position: absolute"]') && 
                           document.querySelector('img[src*="menu.bmp"]');
    
    return isMainPage && hasOldInterface;
}

function enhanceIframeContent() {
    const iframe = document.getElementById('modernContentFrame');
    if (!iframe) return;
    
    iframe.addEventListener('load', function() {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Crear CSS personalizado para el iframe
            const style = iframeDoc.createElement('style');
            style.textContent = `
                /* MEJORAS PARA EL FORMULARIO DEL IFRAME */
                body {
                    margin: 0 !important;
                    padding: 15px !important;
                    font-family: 'Segoe UI', Arial, sans-serif !important;
                    background: #f8f9fa !important;
                    /* REMOVIDO: zoom: 1.1 !important; */
                    box-sizing: border-box !important;
                }
                
                /* Contenedor principal del formulario */
                table, td, tr {
                    border-collapse: collapse !important;
                    box-sizing: border-box !important;
                }
                
                /* Mejorar inputs SIN afectar el tamaño */
                input[type="text"], 
                input[type="password"], 
                select, 
                textarea {
                    padding: 6px 10px !important;
                    border: 1px solid #d0d7de !important;
                    border-radius: 4px !important;
                    font-size: 13px !important;
                    font-family: inherit !important;
                    transition: all 0.2s ease !important;
                    background: white !important;
                    box-sizing: border-box !important;
                    /* REMOVIDO: min-width fijo para evitar problemas de layout */
                }
                
                input[type="text"]:focus, 
                input[type="password"]:focus, 
                select:focus, 
                textarea:focus {
                    border-color: #0969da !important;
                    box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.1) !important;
                    outline: none !important;
                }
                
                /* Mejorar botones */
                input[type="button"], 
                input[type="submit"], 
                button {
                    background: linear-gradient(135deg, #0969da, #0550ae) !important;
                    color: white !important;
                    border: 1px solid #0550ae !important;
                    padding: 8px 16px !important;
                    border-radius: 4px !important;
                    font-weight: 500 !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    font-size: 13px !important;
                    margin: 3px !important;
                    box-sizing: border-box !important;
                }
                
                input[type="button"]:hover, 
                input[type="submit"]:hover, 
                button:hover {
                    background: linear-gradient(135deg, #0550ae, #033d8b) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 8px rgba(9, 105, 218, 0.25) !important;
                }
                
                /* Botón Regresar diferente */
                input[value="Regresar"], 
                input[value*="Regresa"] {
                    background: linear-gradient(135deg, #6e7681, #57606a) !important;
                }
                
                /* Títulos y headers más sutiles */
                font[size="4"], 
                font[size="3"] {
                    font-size: 20px !important;
                    font-weight: 600 !important;
                    color: #24292f !important;
                    text-shadow: none !important;
                }
                
                /* Mejorar tablas SIN zoom */
                table {
                    width: 100% !important;
                    max-width: none !important;
                    margin: 10px auto !important;
                    background: white !important;
                    border-radius: 6px !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                    overflow: visible !important;
                    box-sizing: border-box !important;
                }
                
                /* Asegurar que las tablas con formularios se vean correctamente */
                table[cellpadding], table[cellspacing] {
                    margin: 5px auto !important;
                    width: auto !important;
                    min-width: 90% !important;
                }
                
                td {
                    padding: 8px 12px !important;
                    vertical-align: middle !important;
                    box-sizing: border-box !important;
                }
                
                /* Labels mejorados */
                td:first-child {
                    font-weight: 500 !important;
                    color: #24292f !important;
                    white-space: nowrap !important;
                    background: #f6f8fa !important;
                    border-right: 1px solid #d0d7de !important;
                    min-width: 120px !important;
                }
                
                /* TextArea específico */
                textarea {
                    min-height: 100px !important;
                    resize: vertical !important;
                    font-family: inherit !important;
                    line-height: 1.4 !important;
                }
                
                /* Select mejorado */
                select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
                    background-position: right 8px center !important;
                    background-repeat: no-repeat !important;
                    background-size: 16px 16px !important;
                    padding-right: 35px !important;
                    appearance: none !important;
                }
                
                /* Campos numéricos */
                input[type="text"][name*="numero"], 
                input[type="text"][value*="0"] {
                    text-align: center !important;
                    font-weight: 500 !important;
                    background: #f6f8fa !important;
                }
                
                /* Asegurar que todo sea visible */
                * {
                    box-sizing: border-box !important;
                }
                
                /* Arreglar posicionamiento absoluto que pueda existir */
                [style*="position: absolute"] {
                    position: static !important;
                }
                
                /* Centrar contenido de formularios */
                center {
                    display: block !important;
                    text-align: center !important;
                    margin: 10px auto !important;
                }
                
                /* Asegurar que los divs contenedores se vean */
                div {
                    position: relative !important;
                }
                
                /* Formularios específicos */
                form {
                    margin: 10px auto !important;
                    max-width: 95% !important;
                }
                
                /* Responsive mejorado */
                @media (max-width: 768px) {
                    body {
                        padding: 8px !important;
                    }
                    
                    table {
                        font-size: 12px !important;
                    }
                    
                    input, select, textarea {
                        font-size: 12px !important;
                        padding: 4px 8px !important;
                    }
                    
                    td {
                        padding: 6px 8px !important;
                    }
                }
            `;
            
            // Insertar el CSS en el iframe
            iframeDoc.head.appendChild(style);
            
            console.log('✅ Estilos mejorados aplicados al iframe');
            
        } catch (error) {
            console.log('No se pudo acceder al contenido del iframe (posible CORS)');
        }
    });
}

// Función para inyectar la interfaz moderna
function injectModernInterface() {
    console.log('🎨 Reemplazando interfaz antigua con versión moderna...');
    
    // Crear un contenedor para la nueva interfaz
    const modernContainer = document.createElement('div');
    modernContainer.id = 'modern-codim-interface';
    modernContainer.innerHTML = `
        <!-- INTERFAZ MODERNA INYECTADA -->
        <style>
            #modern-codim-interface {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 999999 !important;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            }
            
            /* Ocultar interfaz antigua */
            body > *:not(#modern-codim-interface) {
                display: none !important;
            }
            
            /* Estilos para la interfaz moderna */
            .modern-header {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                padding: 1rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modern-logo {
                font-size: 2rem;
                font-weight: bold;
                color: #4A90E2;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            
            .modern-user-info {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 25px;
                font-weight: 500;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            .modern-date {
                background: #4A90E2;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 15px;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .modern-nav {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                margin: 1rem 2rem;
                border-radius: 15px;
                padding: 1rem;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .modern-nav-tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }
            
            .modern-nav-tab {
                background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .modern-nav-tab:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }
            
            .modern-nav-tab.active {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                transform: translateY(-2px);
            }
            
            .modern-submenu {
                display: none;
                flex-wrap: wrap;
                gap: 0.75rem;
                margin-top: 1rem;
            }
            
            .modern-submenu.active {
                display: flex;
            }
            
            .modern-submenu-item {
                background: rgba(255, 255, 255, 0.8);
                border: 2px solid transparent;
                padding: 0.6rem 1.2rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                color: #333;
                text-decoration: none;
                display: inline-block;
            }
            
            .modern-submenu-item:hover {
                background: #4A90E2;
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
            }
            
            .modern-main {
                display: flex;
                gap: 1rem;
                margin: 0 2rem 2rem 2rem;
                height: calc(100vh - 300px);
            }
            
            .modern-sidebar {
                width: 200px;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .modern-sidebar-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 1.5rem;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                cursor: pointer;
                border: 2px solid transparent;
                text-align: center;
            }
            
            .modern-sidebar-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                border-color: #4A90E2;
            }
            
            .modern-sidebar-card h3 {
                color: #4A90E2;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .modern-content {
                flex: 1;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .modern-content-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 0.75rem 1rem;
                text-align: center;
            }
            
            .modern-content-header h2 {
                margin: 0;
                font-size: 1.2rem;
            }
            
            .modern-content-header p {
                margin: 0.25rem 0 0 0;
                font-size: 0.9rem;
                opacity: 0.9;
            }
            
            .modern-content-body {
                padding: 0;
                overflow-y: auto;
                height: calc(100% - 70px);
            }
            
            .modern-iframe {
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 8px;
                /* Sin escalado para evitar problemas */
                transform: none;
                transform-origin: top left;
                overflow: auto;
            }
            
            .modern-patch {
                position: fixed;
                bottom: 1rem;
                right: 1rem;
                background: rgba(0, 0, 0, 0.8);
                color: #4CAF50;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.8rem;
                font-weight: bold;
                z-index: 1000000;
                border: 1px solid #4CAF50;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .modern-patch:hover {
                background: rgba(76, 175, 80, 0.2);
                color: white;
                transform: scale(1.05);
            }
            
            @media (max-width: 768px) {
                .modern-header {
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .modern-main {
                    flex-direction: column;
                    margin: 0 1rem 1rem 1rem;
                }
                
                .modern-sidebar {
                    width: 100%;
                    flex-direction: row;
                    overflow-x: auto;
                }
                
                .modern-nav-tabs {
                    flex-wrap: wrap;
                }
            }
        </style>
        
        <!-- Header -->
        <div class="modern-header">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="modern-logo">CODIM</div>
                <div class="modern-user-info">👤 Damian Reyes Hernandez</div>
            </div>
            <div class="modern-date" id="modernCurrentDate">25 de Mayo de 2025</div>
        </div>

        <!-- Navegación -->
        <div class="modern-nav">
            <div class="modern-nav-tabs">
                <button class="modern-nav-tab active" data-tab="incidentes">📋 Incidentes</button>
                <button class="modern-nav-tab" data-tab="tecnicos">👨‍💻 Técnicos</button>
                <button class="modern-nav-tab" data-tab="reportes">📊 Reportes</button>
                <button class="modern-nav-tab" data-tab="turnos">🕐 Turnos</button>
                <button class="modern-nav-tab" data-tab="config">⚙️ Config</button>
            </div>

            <div class="modern-submenu active" id="modern-submenu-incidentes">
                <a href="#" class="modern-submenu-item" data-page="cns2_sup.asp">📝 Nuevo Reporte</a>
                <a href="#" class="modern-submenu-item" data-page="resumen.asp?c=cns">⏳ Pendientes</a>
                <a href="#" class="modern-submenu-item" data-page="rep_hist.asp">📚 Consultar Histórico</a>
            </div>

            <div class="modern-submenu" id="modern-submenu-tecnicos">
                <a href="#" class="modern-submenu-item" data-page="opcion1.asp">🔧 Técnicos O.S.</a>
                <a href="#" class="modern-submenu-item" data-page="opcion2.asp">📞 Tec. Quejas</a>
                <a href="#" class="modern-submenu-item" data-page="opcion3.asp">▶️ Iniciar Turno</a>
                <a href="#" class="modern-submenu-item" data-page="opcion4.asp">📅 Programar Turno</a>
            </div>

            <div class="modern-submenu" id="modern-submenu-reportes">
                <a href="#" class="modern-submenu-item" data-page="rep_productividad.asp">📈 Productividad</a>
                <a href="#" class="modern-submenu-item" data-page="resumen.asp">📋 Resumen</a>
            </div>

            <div class="modern-submenu" id="modern-submenu-turnos">
                <a href="#" class="modern-submenu-item" data-page="pots1.asp">🔧 Turno OS</a>
                <a href="#" class="modern-submenu-item" data-page="pots2.asp">📞 Turno Quejas</a>
                <a href="#" class="modern-submenu-item" data-page="pots3.asp">📡 Turno Pots</a>
                <a href="#" class="modern-submenu-item" data-page="pots4.asp">⏭️ Turno Futuro</a>
            </div>

            <div class="modern-submenu" id="modern-submenu-config">
                <a href="#" class="modern-submenu-item" data-page="configura.asp">⚙️ Configuración</a>
            </div>
        </div>

        <!-- Área principal -->
        <div class="modern-main">
            <div class="modern-sidebar">
                <div class="modern-sidebar-card" data-action="showIP">
                    <h3>🌐 Mi IP</h3>
                    <div style="font-size: 0.8rem; color: #666;">
                        <strong>dreyes</strong><br>
                        13.36.3.129
                    </div>
                </div>

                <div class="modern-sidebar-card" data-action="showLinks">
                    <h3>🔗 Enlaces</h3>
                    <div style="font-size: 0.8rem; color: #666;">Otras Páginas</div>
                </div>

                <div class="modern-sidebar-card">
                    <h3>📊 Estado</h3>
                    <div style="font-size: 0.8rem; color: #666;">
                        <div style="color: #4CAF50; font-weight: bold;">🟢 Online</div>
                        Sistema Activo
                    </div>
                </div>
            </div>

            <div class="modern-content">
                <div class="modern-content-header">
                    <h2 id="modernContentTitle">Bienvenido al Sistema CODIM CNS</h2>
                    <p id="modernContentSubtitle">Selecciona una opción del menú para comenzar</p>
                </div>
                <div class="modern-content-body" id="modernContentBody">
                    <iframe id="modernContentFrame" class="modern-iframe" src="primera.asp"></iframe>
                </div>
            </div>
        </div>

        <!-- Patch signature -->
        <div class="modern-patch" data-action="showPatch">
            ⚡ Patch by DemianRey v2.1
        </div>
    `;
    
    // Reemplazar el body completamente
    document.body.innerHTML = '';
    document.body.appendChild(modernContainer);
    
    // Definir funciones directamente en el contexto del content script
    function modernSwitchTab(tabName) {
        console.log('Cambiando a tab:', tabName);
        
        // Remover clase active de todos los tabs
        const tabs = document.querySelectorAll('.modern-nav-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Remover clase active de todos los submenus
        const submenus = document.querySelectorAll('.modern-submenu');
        submenus.forEach(submenu => submenu.classList.remove('active'));
        
        // Activar el tab clickeado
        const clickedTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (clickedTab) {
            clickedTab.classList.add('active');
        }
        
        // Activar el submenu correspondiente
        const submenu = document.getElementById(`modern-submenu-${tabName}`);
        if (submenu) {
            submenu.classList.add('active');
        }
    }

    function modernLoadOriginalPage(page) {
        console.log('Cargando página:', page);
        
        const titleElement = document.getElementById('modernContentTitle');
        const subtitleElement = document.getElementById('modernContentSubtitle');
        const frameElement = document.getElementById('modernContentFrame');
        
        if (titleElement) titleElement.textContent = 'Cargando...';
        if (subtitleElement) subtitleElement.textContent = 'Por favor espera...';
        if (frameElement) {
            frameElement.src = page;
            
            // Mejorar el contenido cuando se cargue
            frameElement.addEventListener('load', function() {
                enhanceIframeContent();
            });
        }
        
        setTimeout(() => {
            if (titleElement) titleElement.textContent = 'Página Cargada';
            if (subtitleElement) subtitleElement.textContent = 'Contenido del sistema original';
        }, 1000);
    }

    function modernShowIP() {
        alert('🌐 Información de IP\n\nUsuario: dreyes\nIP: 13.36.3.129\nEstado: Conectado\nUbicación: Red Interna Telmex');
    }

    function modernShowLinks() {
        const links = [
            'http://intranet/',
            'http://10.192.5.18/cobo',
            'http://10.192.5.18/emma',
            'http://tmxjalcns01',
            'http://10.94.138.27/cgi-bin/solmer/Sidecci/sd_bienvenida.jsp'
        ];
        
        const choice = prompt('🔗 Enlaces Rápidos\n\n1. Intranet Telmex\n2. COBO\n3. EMMA\n4. COQUI\n5. SIDECCI\n\nEscribe el número del enlace:');
        const linkIndex = parseInt(choice) - 1;
        
        if (linkIndex >= 0 && linkIndex < links.length) {
            window.open(links[linkIndex], '_blank');
        }
    }

    function modernShowPatch() {
        alert('⚡ CODIM CNS Fix v2.1\n\n✅ Interfaz completamente modernizada\n✅ VBScript convertido a JavaScript\n✅ Responsive design\n✅ Navegación mejorada\n✅ Formularios arreglados\n✅ Layout responsive\n\n🔧 Patch by DemianRey\n📅 Mayo 2025');
    }

    function modernUpdateDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        const dateElement = document.getElementById('modernCurrentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('es-ES', options);
        }
    }
    
    // Configurar event listeners usando delegación de eventos
    modernContainer.addEventListener('click', function(e) {
        console.log('Click detectado en:', e.target);
        
        // Manejo de tabs
        if (e.target.classList.contains('modern-nav-tab')) {
            e.preventDefault();
            const tabName = e.target.getAttribute('data-tab');
            console.log('Tab clickeado:', tabName);
            if (tabName) {
                modernSwitchTab(tabName);
            }
        }
        
        // Manejo de items de submenu
        if (e.target.classList.contains('modern-submenu-item')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            console.log('Submenu item clickeado:', page);
            if (page) {
                modernLoadOriginalPage(page);
            }
        }
        
        // Manejo de acciones de sidebar
        if (e.target.closest('.modern-sidebar-card')) {
            const card = e.target.closest('.modern-sidebar-card');
            const action = card.getAttribute('data-action');
            console.log('Sidebar card clickeada:', action);
            
            if (action === 'showIP') {
                modernShowIP();
            } else if (action === 'showLinks') {
                modernShowLinks();
            }
        }
        
        // Manejo del patch
        if (e.target.classList.contains('modern-patch')) {
            modernShowPatch();
        }
    });
    
    // Inicializar fecha
    modernUpdateDate();
    setInterval(modernUpdateDate, 60000);
    
    console.log('✅ Interfaz moderna aplicada exitosamente');
    console.log('✅ Event listeners configurados');
}

// Verificar si debemos reemplazar la interfaz
if (shouldReplaceWithModernInterface()) {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectModernInterface);
    } else {
        injectModernInterface();
    }
} else {
    // Si no es la página principal, inyectar el script normal
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

console.log('✅ CODIM CNS Fix - Monitoreo activo');