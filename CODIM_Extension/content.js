// content.js - Script principal que decide qué interfaz cargar
console.log('🚀 CODIM CNS Fix - Extensión activada');

class CODIMContentScript {
    constructor() {
        this.isMainPage = this.checkIsMainPage();
        this.hasOldInterface = this.checkHasOldInterface();
    }

    init() {
        if (this.shouldReplaceWithModernInterface()) {
            this.loadModernInterface();
        } else {
            this.loadClassicPatch();
        }
    }

    checkIsMainPage() {
        const currentPath = window.location.pathname;
        return currentPath === '/' || 
               currentPath === '/index.html' || 
               currentPath === '/index.asp' || 
               currentPath === '';
    }

    checkHasOldInterface() {
        return document.querySelector('div[style*="position: absolute"]') && 
               document.querySelector('img[src*="menu.bmp"]');
    }

    shouldReplaceWithModernInterface() {
        return this.isMainPage && this.hasOldInterface;
    }

    loadModernInterface() {
        console.log('🎨 Cargando interfaz moderna...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.injectModernInterface();
            });
        } else {
            this.injectModernInterface();
        }
    }

    loadClassicPatch() {
        console.log('🔧 Cargando patch clásico...');
        
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('classic-patch.js');
        script.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    }

    injectModernInterface() {
        console.log('🎨 Inyectando interfaz moderna...');
        
        // Crear contenedor principal
        const container = this.createModernContainer();
        
        // Reemplazar body
        document.body.innerHTML = '';
        document.body.appendChild(container);
        
        // Configurar eventos
        this.setupModernEventListeners(container);
        
        // Inicializar componentes
        this.initializeModernComponents();
        
        console.log('✅ Interfaz moderna aplicada');
    }

    createModernContainer() {
        const container = document.createElement('div');
        container.id = 'modern-codim-interface';
        container.innerHTML = this.getModernHTML();
        return container;
    }

    getModernHTML() {
        return `
            ${this.getModernCSS()}
            
            <!-- Header -->
            <div class="modern-header">
                <div class="modern-header-left">
                    <div class="modern-logo">CODIM</div>
                    <div class="modern-user-info">👤 Damian Reyes Hernandez</div>
                </div>
                <div class="modern-date" id="modernCurrentDate"></div>
            </div>

            <!-- Navegación -->
            <div class="modern-nav">
                <div class="modern-nav-tabs">
                    ${this.generateModernTabs()}
                </div>
                ${this.generateModernSubmenus()}
            </div>

            <!-- Área principal -->
            <div class="modern-main">
                <div class="modern-sidebar">
                    ${this.generateModernSidebarCards()}
                </div>

                <div class="modern-content">
                    <div class="modern-content-header">
                        <h2 id="modernContentTitle">Bienvenido al Sistema CODIM CNS</h2>
                        <p id="modernContentSubtitle">Selecciona una opción del menú para comenzar</p>
                    </div>
                    <div class="modern-content-body">
                        <iframe id="modernContentFrame" class="modern-iframe" src="primera.asp"></iframe>
                    </div>
                </div>
            </div>

            <!-- Patch signature -->
            <div class="modern-patch" data-action="showPatch">
                ⚡ Patch by DemianRey v3.0
            </div>
        `;
    }

    getModernCSS() {
        return `
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
                
                /* Header */
                .modern-header {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modern-header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
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
                
                /* Navegación */
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
                    font-size: 0.9rem;
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
                    font-size: 0.85rem;
                }
                
                .modern-submenu-item:hover {
                    background: #4A90E2;
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
                }
                
                /* Área principal */
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
                
                .sidebar-card-content {
                    font-size: 0.8rem;
                    color: #666;
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
                
                /* Responsive */
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
                    
                    .modern-nav-tab {
                        font-size: 0.8rem;
                        padding: 0.6rem 1.2rem;
                    }
                    
                    .modern-submenu-item {
                        font-size: 0.8rem;
                        padding: 0.5rem 1rem;
                    }
                }
            </style>
        `;
    }

    generateModernTabs() {
        const menuData = this.getMenuData();
        return Object.entries(menuData).map(([key, menu], index) => 
            `<button class="modern-nav-tab ${index === 0 ? 'active' : ''}" data-tab="${key}">
                ${menu.icon} ${menu.title}
            </button>`
        ).join('');
    }

    generateModernSubmenus() {
        const menuData = this.getMenuData();
        return Object.entries(menuData).map(([key, menu], index) => 
            `<div class="modern-submenu ${index === 0 ? 'active' : ''}" id="modern-submenu-${key}">
                ${menu.items.map(item => 
                    `<a href="#" class="modern-submenu-item" data-page="${item.page}">
                        ${item.icon} ${item.title}
                    </a>`
                ).join('')}
            </div>`
        ).join('');
    }

    generateModernSidebarCards() {
        const cards = [
            {
                icon: '🌐',
                title: 'Mi IP',
                content: '<strong>dreyes</strong><br>13.36.3.129',
                action: 'showIP'
            },
            {
                icon: '🔗',
                title: 'Enlaces',
                content: 'Otras Páginas',
                action: 'showLinks'
            },
            {
                icon: '📊',
                title: 'Estado',
                content: '<div style="color: #4CAF50; font-weight: bold;">🟢 Online</div>Sistema Activo',
                action: null
            }
        ];

        return cards.map(card => 
            `<div class="modern-sidebar-card" ${card.action ? `data-action="${card.action}"` : ''}>
                <h3>${card.icon} ${card.title}</h3>
                <div class="sidebar-card-content">${card.content}</div>
            </div>`
        ).join('');
    }

    setupModernEventListeners(container) {
        const self = this;
        
        container.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (e.target.classList.contains('modern-nav-tab')) {
                self.modernSwitchTab(e.target.getAttribute('data-tab'));
            }
            
            if (e.target.classList.contains('modern-submenu-item')) {
                self.modernLoadPage(e.target.getAttribute('data-page'));
            }
            
            const card = e.target.closest('.modern-sidebar-card');
            if (card) {
                const action = card.getAttribute('data-action');
                if (action) self.handleModernSidebarAction(action);
            }
            
            if (e.target.classList.contains('modern-patch')) {
                self.showModernPatchInfo();
            }
        });
    }

    modernSwitchTab(tabName) {
        // Remover active de todos los tabs
        document.querySelectorAll('.modern-nav-tab').forEach(tab => 
            tab.classList.remove('active'));
        document.querySelectorAll('.modern-submenu').forEach(submenu => 
            submenu.classList.remove('active'));
        
        // Activar tab seleccionado
        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        const submenu = document.getElementById(`modern-submenu-${tabName}`);
        
        if (tab) tab.classList.add('active');
        if (submenu) submenu.classList.add('active');
    }

    modernLoadPage(page) {
        const titleElement = document.getElementById('modernContentTitle');
        const subtitleElement = document.getElementById('modernContentSubtitle');
        const frameElement = document.getElementById('modernContentFrame');
        
        if (titleElement) titleElement.textContent = 'Cargando...';
        if (subtitleElement) subtitleElement.textContent = 'Por favor espera...';
        
        if (frameElement) {
            const timestamp = new Date().getTime();
            const separator = page.includes('?') ? '&' : '?';
            frameElement.src = page + separator + '_t=' + timestamp;
            
            frameElement.addEventListener('load', () => {
                this.enhanceIframe(frameElement);
                if (titleElement) titleElement.textContent = 'Página Cargada';
                if (subtitleElement) subtitleElement.textContent = 'Contenido del sistema original';
            });
        }
    }

    enhanceIframe(iframe) {
        if (!iframe) return;
        
        iframe.addEventListener('load', () => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    const style = iframeDoc.createElement('style');
                    style.textContent = this.getIframeCSS();
                    iframeDoc.head.appendChild(style);
                    console.log('✅ Iframe mejorado');
                }
            } catch (error) {
                console.log('⚠️ No se pudo acceder al iframe (CORS)');
            }
        });
    }

    getIframeCSS() {
        return `
            img[src*="fondo.bmp"] { display: none !important; }
            body { 
                font-family: 'Segoe UI', Arial, sans-serif !important;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                padding: 20px !important;
            }
            center { 
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
                padding: 30px !important;
                max-width: 800px !important;
                margin: 0 auto !important;
            }
            table {
                border-radius: 8px !important;
                overflow: hidden !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
            }
            input, select, textarea {
                border: 2px solid #e9ecef !important;
                border-radius: 6px !important;
                padding: 8px 12px !important;
                transition: all 0.3s ease !important;
            }
            input:focus, select:focus, textarea:focus {
                border-color: #4A90E2 !important;
                box-shadow: 0 0 0 3px rgba(74,144,226,0.1) !important;
                outline: none !important;
            }
            input[type="button"], input[type="submit"] {
                background: linear-gradient(135deg, #4A90E2, #357ABD) !important;
                color: white !important;
                border: none !important;
                padding: 10px 20px !important;
                border-radius: 6px !important;
                cursor: pointer !important;
                font-weight: 600 !important;
            }
        `;
    }

    handleModernSidebarAction(action) {
        switch (action) {
            case 'showIP':
                alert('🌐 Información de IP\n\nUsuario: dreyes\nIP: 13.36.3.129\nEstado: Conectado\nUbicación: Red Interna Telmex');
                break;
            case 'showLinks':
                this.showModernLinks();
                break;
        }
    }

    showModernLinks() {
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

    showModernPatchInfo() {
        alert('⚡ CODIM CNS Fix v3.0\n\n✅ Interfaz completamente modernizada\n✅ Código refactorizado y optimizado\n✅ Arquitectura modular\n✅ VBScript convertido a JavaScript\n✅ Responsive design\n✅ Navegación mejorada\n\n🔧 Patch by DemianRey\n📅 Mayo 2025');
    }

    initializeModernComponents() {
        this.updateModernDate();
        setInterval(() => this.updateModernDate(), 60000);
    }

    updateModernDate() {
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

    getMenuData() {
        return {
            incidentes: {
                title: 'Incidentes',
                icon: '📋',
                items: [
                    { title: 'Nuevo Reporte', icon: '📝', page: 'cns2_sup.asp' },
                    { title: 'Pendientes', icon: '⏳', page: 'resumen.asp?c=cns' },
                    { title: 'Consultar Histórico', icon: '📚', page: 'rep_hist.asp' }
                ]
            },
            tecnicos: {
                title: 'Técnicos',
                icon: '👨‍💻',
                items: [
                    { title: 'Técnicos O.S.', icon: '🔧', page: 'opcion1.asp' },
                    { title: 'Tec. Quejas', icon: '📞', page: 'opcion2.asp' },
                    { title: 'Iniciar Turno', icon: '▶️', page: 'opcion3.asp' },
                    { title: 'Programar Turno', icon: '📅', page: 'opcion4.asp' }
                ]
            },
            reportes: {
                title: 'Reportes',
                icon: '📊',
                items: [
                    { title: 'Productividad', icon: '📈', page: 'rep_productividad.asp' },
                    { title: 'Resumen', icon: '📋', page: 'resumen.asp' }
                ]
            },
            turnos: {
                title: 'Turnos',
                icon: '🕐',
                items: [
                    { title: 'Turno OS', icon: '🔧', page: 'pots1.asp' },
                    { title: 'Turno Quejas', icon: '📞', page: 'pots2.asp' },
                    { title: 'Turno Pots', icon: '📡', page: 'pots3.asp' },
                    { title: 'Turno Futuro', icon: '⏭️', page: 'pots4.asp' }
                ]
            },
            config: {
                title: 'Config',
                icon: '⚙️',
                items: [
                    { title: 'Configuración', icon: '⚙️', page: 'configura.asp' }
                ]
            }
        };
    }
}

// Inicializar
const codimFix = new CODIMContentScript();
codimFix.init();

console.log('✅ CODIM CNS Fix - Inicialización completada');