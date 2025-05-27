// content.js - Script principal que decide qué interfaz cargar
console.log('🚀 CODIM CNS Fix - Extensión activada');

class CODIMContentScript {
    constructor() {
        this.isMainPage = this.checkIsMainPage();
        this.hasOldInterface = this.checkHasOldInterface();
        this.userData = null; // Inicializar como null
    }

    init() {
        // CRÍTICO: Extraer datos ANTES de modificar el DOM
        if (this.shouldReplaceWithModernInterface()) {
            console.log('🎨 Página principal detectada - Extrayendo datos antes de cargar interfaz moderna...');
            this.extractUserDataSync(); // Extraer sincrónicamente
            this.loadModernInterface();
        } else {
            this.loadClassicPatch();
        }
    }

    // ===============================
    // EXTRACCIÓN DE DATOS DEL USUARIO
    // ===============================
    extractUserDataSync() {
        console.log('👤 Extrayendo datos del usuario SINCRÓNICAMENTE...');
        
        // Extraer datos inmediatamente del DOM original
        this.userData = {
            fullName: this.extractUserName(),
            username: this.extractUsername(),
            ipAddress: this.extractUserIP(),
            location: this.extractUserLocation()
        };
        
        console.log('📝 Datos extraídos sincrónicamente:', this.userData);
    }

    extractUserData() {
        console.log('👤 Extrayendo datos del usuario...');
        
        // Esperar un poco para que el DOM esté completamente cargado
        setTimeout(() => {
            this.userData = {
                fullName: this.extractUserName(),
                username: this.extractUsername(),
                ipAddress: this.extractUserIP(),
                location: this.extractUserLocation()
            };
            
            console.log('📝 Datos extraídos:', this.userData);
            
            // Si ya se cargó la interfaz moderna, actualizar datos
            if (document.getElementById('modern-codim-interface')) {
                this.updateModernInterfaceData();
            }
        }, 500);
        
        // Inicializar con datos temporales
        this.userData = {
            fullName: 'Cargando...',
            username: 'usuario',
            ipAddress: '192.168.1.1',
            location: 'Red Interna Telmex'
        };
    }

    updateModernInterfaceData() {
        // Actualizar nombre en header
        const userInfoElement = document.querySelector('.modern-user-info');
        if (userInfoElement && this.userData.fullName !== 'Cargando...') {
            userInfoElement.textContent = `👤 ${this.userData.fullName}`;
        }
        
        // Actualizar tarjeta de IP
        const ipCard = document.querySelector('.modern-sidebar-card .sidebar-card-content');
        if (ipCard && this.userData.username !== 'usuario') {
            ipCard.innerHTML = `<strong>${this.userData.username}</strong><br>${this.userData.ipAddress}`;
        }
        
        console.log('✅ Interfaz moderna actualizada con datos reales');
    }

    extractUserName() {
        console.log('🔍 Buscando nombre de usuario en DOM original...');
        console.log('📄 Contenido HTML disponible:', document.body.innerHTML.substring(0, 500) + '...');
        
        // Buscar el nombre en diferentes posibles ubicaciones
        const nameSelectors = [
            // Método 1: Buscar en el elemento específico donde está el nombre
            () => {
                console.log('🔄 Método 1: Buscando fonts amarillos...');
                const yellowFonts = document.querySelectorAll('font[color="yellow"] b, font[color="yellow"]');
                console.log(`🔍 Encontrados ${yellowFonts.length} elementos font amarillos`);
                
                for (let font of yellowFonts) {
                    const text = font.textContent.trim();
                    console.log('🔍 Revisando font amarillo:', `"${text}"`);
                    if (this.isValidName(text)) {
                        console.log('✅ Nombre encontrado en font amarillo:', text);
                        return text;
                    }
                }
                return null;
            },
            
            // Método 2: Buscar en tabla con height=10 y width=190 (estructura específica del usuario)
            () => {
                console.log('🔄 Método 2: Buscando en tablas específicas...');
                const userTables = document.querySelectorAll('table[height="10"] font b, table[width="190"] font b');
                console.log(`🔍 Encontradas ${userTables.length} tablas específicas`);
                
                for (let element of userTables) {
                    const text = element.textContent.trim();
                    console.log('🔍 Revisando tabla usuario:', `"${text}"`);
                    if (this.isValidName(text)) {
                        console.log('✅ Nombre encontrado en tabla usuario:', text);
                        return text;
                    }
                }
                return null;
            },
            
            // Método 3: Buscar por posición absoluta específica (top: 51; left: 120)
            () => {
                console.log('🔄 Método 3: Buscando divs posicionados...');
                const userDivs = document.querySelectorAll('div[style*="top: 51"], div[style*="top:51"]');
                console.log(`🔍 Encontrados ${userDivs.length} divs con top:51`);
                
                for (let div of userDivs) {
                    console.log('🔍 Encontrado div con top:51, buscando contenido...');
                    const fonts = div.querySelectorAll('font b, b, font');
                    console.log(`🔍 Encontrados ${fonts.length} elementos font en div`);
                    
                    for (let font of fonts) {
                        const text = font.textContent.trim();
                        console.log('🔍 Revisando font en div posicionado:', `"${text}"`);
                        if (this.isValidName(text)) {
                            console.log('✅ Nombre encontrado en div posicionado:', text);
                            return text;
                        }
                    }
                }
                return null;
            },
            
            // Método 4: Buscar en elementos con font face="Trebuchet MS" (más específico)
            () => {
                console.log('🔄 Método 4: Buscando fonts Trebuchet...');
                const trebuchetFonts = document.querySelectorAll('font[face*="Trebuchet"] b, font[face*="trebuchet"] b');
                console.log(`🔍 Encontrados ${trebuchetFonts.length} fonts Trebuchet`);
                
                for (let font of trebuchetFonts) {
                    const text = font.textContent.trim();
                    console.log('🔍 Revisando Trebuchet font:', `"${text}"`);
                    if (this.isValidName(text)) {
                        console.log('✅ Nombre encontrado en Trebuchet font:', text);
                        return text;
                    }
                }
                return null;
            },
            
            // Método 5: Buscar solo en contexto específico del HTML
            () => {
                console.log('🔄 Método 5: Buscando en divs con z-index 18...');
                const userDivs = document.querySelectorAll('div[style*="z-index: 18"], div[style*="z-index:18"]');
                console.log(`🔍 Encontrados ${userDivs.length} divs con z-index:18`);
                
                for (let div of userDivs) {
                    console.log('🔍 Encontrado div con z-index:18, buscando contenido...');
                    const allText = div.textContent.trim();
                    console.log('🔍 Contenido completo del div z-index 18:', `"${allText}"`);
                    
                    if (this.isValidName(allText)) {
                        console.log('✅ Nombre encontrado en div z-index 18:', allText);
                        return allText;
                    }
                    
                    // También revisar elementos internos
                    const fonts = div.querySelectorAll('font b, b, font');
                    console.log(`🔍 Encontrados ${fonts.length} fonts internos en z-index 18`);
                    
                    for (let font of fonts) {
                        const text = font.textContent.trim();
                        console.log('🔍 Revisando font interno en z-index 18:', `"${text}"`);
                        if (this.isValidName(text)) {
                            console.log('✅ Nombre encontrado en font interno z-index 18:', text);
                            return text;
                        }
                    }
                }
                return null;
            },
            
            // Método 6: Buscar en TODO el documento con patrones específicos
            () => {
                console.log('🔄 Método 6: Búsqueda general con patrones...');
                const allElements = document.querySelectorAll('font, b, strong, td, div, span');
                console.log(`🔍 Revisando ${allElements.length} elementos totales`);
                
                for (let element of allElements) {
                    const text = element.textContent.trim();
                    
                    // Solo revisar elementos que parezcan nombres
                    if (text.length > 10 && text.length < 50 && /^[A-ZÁÉÍÓÚÑ]/.test(text)) {
                        console.log('🔍 Revisando elemento potencial:', `"${text}"`);
                        if (this.isValidName(text)) {
                            console.log('✅ Nombre encontrado en búsqueda general:', text);
                            return text;
                        }
                    }
                }
                return null;
            }
        ];

        // Ejecutar todos los métodos de extracción
        for (let i = 0; i < nameSelectors.length; i++) {
            try {
                console.log(`🔄 Ejecutando método ${i + 1} de extracción de nombre...`);
                const name = nameSelectors[i]();
                if (name) {
                    console.log(`✅ Método ${i + 1} exitoso:`, name);
                    return name;
                }
                console.log(`❌ Método ${i + 1} no encontró nombre válido`);
            } catch (error) {
                console.warn(`⚠️ Error en método ${i + 1}:`, error);
            }
        }

        console.log('⚠️ No se pudo extraer el nombre, usando fallback');
        return 'Usuario CODIM';
    }

    extractUsername() {
        console.log('🔍 Buscando username...');
        
        // Buscar username en diferentes formatos
        const usernameExtractors = [
            // Método 1: Buscar específicamente en la sección de IP donde aparece "dreyes"
            () => {
                // En el HTML: <td><font size="1" face="helvetica" color="Blue"><b>dreyes</b></font></td>
                const ipSections = document.querySelectorAll('div[id="ip"] font b');
                for (let element of ipSections) {
                    const text = element.textContent.trim();
                    console.log('🔍 Revisando elemento en sección IP:', `"${text}"`);
                    if (this.isValidUsername(text)) {
                        console.log('✅ Username encontrado en sección IP:', text);
                        return text.toLowerCase();
                    }
                }
                return null;
            },
            
            // Método 2: Buscar en contexto específico con IP
            () => {
                const bodyText = document.body.textContent;
                
                // Buscar patrón específico: texto seguido de IP
                const ipPattern = /\b([a-zA-Z]{3,12})\s*\n?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
                let match;
                
                while ((match = ipPattern.exec(bodyText)) !== null) {
                    const potentialUsername = match[1].trim();
                    const ipAddress = match[2];
                    
                    console.log('🔍 Revisando patrón username-IP:', `"${potentialUsername}" - "${ipAddress}"`);
                    
                    if (this.isValidUsername(potentialUsername)) {
                        console.log('✅ Username encontrado con IP:', potentialUsername);
                        return potentialUsername.toLowerCase();
                    }
                }
                return null;
            },
            
            // Método 3: Buscar en elementos con color Blue y tamaño 1
            () => {
                const blueElements = document.querySelectorAll('font[color="Blue"][size="1"] b, font[color="blue"][size="1"] b');
                for (let element of blueElements) {
                    const text = element.textContent.trim();
                    console.log('🔍 Revisando elemento azul pequeño:', `"${text}"`);
                    
                    // Verificar si NO es una IP y parece username
                    if (this.isValidUsername(text) && !/^\d{1,3}\.\d{1,3}/.test(text)) {
                        console.log('✅ Username encontrado en elemento azul:', text);
                        return text.toLowerCase();
                    }
                }
                return null;
            },
            
            // Método 4: Extraer del nombre completo como último recurso
            () => {
                console.log('🔍 Intentando generar username del nombre completo...');
                if (this.userData && this.userData.fullName && this.userData.fullName !== 'Usuario CODIM' && this.userData.fullName !== 'Cargando...') {
                    const name = this.userData.fullName.trim();
                    console.log('🔍 Nombre disponible para generar username:', `"${name}"`);
                    
                    const names = name.split(/\s+/);
                    if (names.length >= 2) {
                        // Crear username con primera letra del nombre + apellido
                        const firstName = names[0];
                        const lastName = names[1];
                        
                        if (firstName.length > 0 && lastName.length > 0) {
                            const username = firstName.charAt(0).toLowerCase() + lastName.toLowerCase();
                            console.log('🔍 Username generado:', username);
                            
                            if (username.length >= 3 && username.length <= 15) {
                                console.log('✅ Username generado del nombre válido:', username);
                                return username;
                            }
                        }
                    }
                }
                return null;
            }
        ];

        // Ejecutar extractores
        for (let i = 0; i < usernameExtractors.length; i++) {
            try {
                console.log(`🔄 Ejecutando método ${i + 1} de extracción de username...`);
                const username = usernameExtractors[i]();
                if (username) {
                    console.log(`✅ Método username ${i + 1} exitoso:`, username);
                    return username;
                }
                console.log(`❌ Método username ${i + 1} no encontró resultado válido`);
            } catch (error) {
                console.warn(`⚠️ Error en método username ${i + 1}:`, error);
            }
        }

        console.log('⚠️ No se pudo extraer username, usando fallback');
        return 'usuario';
    }

    isValidUsername(username) {
        if (!username || typeof username !== 'string') return false;
        
        const cleanUsername = username.trim().toLowerCase();
        
        // Verificaciones básicas
        if (cleanUsername.length < 3 || cleanUsername.length > 15) return false;
        
        // Debe empezar con letra
        if (!/^[a-zA-Z]/.test(cleanUsername)) return false;
        
        // Solo letras, números y guión bajo
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(cleanUsername)) return false;
        
        // Lista de palabras que NO son usernames válidos
        const excludeUsernames = [
            'codim', 'sistema', 'usuario', 'admin', 'test', 'user', 'login',
            'nombre', 'datos', 'info', 'paginas', 'otras', 'enlaces', 'ligas',
            'interes', 'menu', 'principal', 'reporte', 'consultar', 'historico',
            'tecnicos', 'turno', 'configuracion', 'pendientes', 'productividad',
            'resumen', 'semaforos', 'infinitum', 'pots', 'redi', 'all', 'any'
        ];
        
        if (excludeUsernames.includes(cleanUsername)) return false;
        
        // No debe ser solo números
        if (/^\d+$/.test(cleanUsername)) return false;
        
        // No debe contener palabras del sistema
        const systemWords = ['codim', 'cns', 'telmex', 'sistema'];
        for (let word of systemWords) {
            if (cleanUsername.includes(word)) return false;
        }
        
        return true;
    }

    extractUserIP() {
        console.log('🔍 Buscando dirección IP...');
        
        // Buscar IP en diferentes contextos
        const ipExtractors = [
            // Método 1: Buscar en la sección específica de IP (div id="ip")
            () => {
                const ipSection = document.getElementById('ip');
                if (ipSection) {
                    console.log('🔍 Encontrada sección IP, buscando...');
                    const ipText = ipSection.textContent;
                    const ipMatch = ipText.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
                    
                    if (ipMatch && this.isValidIP(ipMatch[1])) {
                        console.log('✅ IP encontrada en sección específica:', ipMatch[1]);
                        return ipMatch[1];
                    }
                }
                return null;
            },
            
            // Método 2: Buscar IP en elementos con color Blue
            () => {
                const blueElements = document.querySelectorAll('font[color="Blue"] b, font[color="blue"] b');
                for (let element of blueElements) {
                    const text = element.textContent.trim();
                    console.log('🔍 Revisando elemento azul para IP:', `"${text}"`);
                    
                    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(text) && this.isValidIP(text)) {
                        console.log('✅ IP encontrada en elemento azul:', text);
                        return text;
                    }
                }
                return null;
            },
            
            // Método 3: Buscar IP en todo el contenido (más restrictivo)
            () => {
                const bodyText = document.body.textContent;
                const ipPattern = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
                let match;
                const foundIPs = [];
                
                while ((match = ipPattern.exec(bodyText)) !== null) {
                    const ip = match[1];
                    if (this.isValidIP(ip)) {
                        foundIPs.push(ip);
                        console.log('🔍 IP válida encontrada:', ip);
                    }
                }
                
                // Filtrar IPs más probables (no localhost, no broadcast, etc.)
                const probableIPs = foundIPs.filter(ip => {
                    const parts = ip.split('.').map(Number);
                    return parts[0] >= 10 && parts[0] <= 192 && // Rangos privados típicos
                           !(parts[0] === 127) && // No localhost
                           !(parts[0] === 0) && // No invalid
                           !(ip === '255.255.255.255'); // No broadcast
                });
                
                if (probableIPs.length > 0) {
                    console.log('✅ IP probable encontrada:', probableIPs[0]);
                    return probableIPs[0];
                }
                
                return null;
            }
        ];

        // Ejecutar extractores de IP
        for (let i = 0; i < ipExtractors.length; i++) {
            try {
                console.log(`🔄 Ejecutando método ${i + 1} de extracción de IP...`);
                const ip = ipExtractors[i]();
                if (ip) {
                    console.log(`✅ Método IP ${i + 1} exitoso:`, ip);
                    return ip;
                }
                console.log(`❌ Método IP ${i + 1} no encontró IP válida`);
            } catch (error) {
                console.warn(`⚠️ Error en método IP ${i + 1}:`, error);
            }
        }

        console.log('⚠️ No se pudo extraer IP, usando fallback');
        return '192.168.1.1';
    }

    isValidIP(ip) {
        if (!ip || typeof ip !== 'string') return false;
        
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        
        for (let part of parts) {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255) return false;
        }
        
        // Excluir IPs obvias que no son válidas
        const invalidIPs = ['0.0.0.0', '255.255.255.255', '127.0.0.1'];
        if (invalidIPs.includes(ip)) return false;
        
        return true;
    }

    extractUserLocation() {
        // Buscar ubicación en el contenido
        const locationPatterns = [
            /(?:oficina|central|ubicación|sede):\s*([A-Za-z\s]+)/i,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*-\s*(?:Oficina|Central)/i
        ];

        const bodyText = document.body.textContent;
        
        for (let pattern of locationPatterns) {
            const match = bodyText.match(pattern);
            if (match && match[1]) {
                console.log('✅ Ubicación encontrada:', match[1]);
                return match[1].trim();
            }
        }

        console.log('⚠️ No se pudo extraer ubicación, usando fallback');
        return 'Red Interna Telmex';
    }

    isValidName(text) {
        // Validar que sea un nombre válido
        if (!text || typeof text !== 'string') return false;
        
        const cleanText = text.trim();
        
        // Verificaciones básicas
        if (cleanText.length < 5 || cleanText.length > 60) return false;
        
        // Debe tener al menos 2 palabras (nombre y apellido)
        const words = cleanText.split(/\s+/);
        if (words.length < 2) return false;
        
        // Patrón para nombres en español (con acentos)
        const namePattern = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+$/;
        if (!namePattern.test(cleanText)) return false;
        
        // Lista de palabras que NO son nombres
        const excludeWords = [
            'codim', 'sistema', 'bienvenido', 'usuario', 'pagina', 'menu', 'principal',
            'reporte', 'consultar', 'historico', 'tecnicos', 'turno', 'configuracion',
            'pendientes', 'productividad', 'resumen', 'semaforos', 'infinitum'
        ];
        
        const lowerText = cleanText.toLowerCase();
        for (let word of excludeWords) {
            if (lowerText.includes(word)) return false;
        }
        
        // Verificar que no sean solo números o caracteres especiales
        if (/^\d+$/.test(cleanText) || /^[^a-zA-ZáéíóúñÁÉÍÓÚÑ]+$/.test(cleanText)) return false;
        
        return true;
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
        // Usar los datos extraídos dinámicamente
        const displayName = this.userData?.fullName || 'Usuario CODIM';
        
        return `
            ${this.getModernCSS()}
            
            <!-- Header -->
            <div class="modern-header">
                <div class="modern-header-left">
                    <div class="modern-logo">CODIM</div>
                    <div class="modern-user-info">👤 ${displayName}</div>
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

    generateModernSidebarCards() {
        // Usar los datos extraídos dinámicamente
        const username = this.userData?.username || 'usuario';
        const ipAddress = this.userData?.ipAddress || '192.168.1.1';
        const location = this.userData?.location || 'Red Interna Telmex';
        
        const cards = [
            {
                icon: '🌐',
                title: 'Mi IP',
                content: `<strong>${username}</strong><br>${ipAddress}`,
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

    handleModernSidebarAction(action) {
        const username = this.userData?.username || 'usuario';
        const ipAddress = this.userData?.ipAddress || '192.168.1.1';
        const location = this.userData?.location || 'Red Interna Telmex';
        
        switch (action) {
            case 'showIP':
                alert(`🌐 Información de IP\n\nUsuario: ${username}\nIP: ${ipAddress}\nEstado: Conectado\nUbicación: ${location}`);
                break;
            case 'showLinks':
                this.showModernLinks();
                break;
        }
    }

    // ===============================
    // RESTO DE MÉTODOS (sin cambios)
    // ===============================
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
                    max-width: 250px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
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
                    
                    .modern-user-info {
                        max-width: 200px;
                        font-size: 0.9rem;
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
        alert('⚡ CODIM CNS Fix v3.0\n\n✅ Interfaz completamente modernizada\n✅ Código refactorizado y optimizado\n✅ Arquitectura modular\n✅ VBScript convertido a JavaScript\n✅ Responsive design\n✅ Navegación mejorada\n✅ Extracción dinámica de datos de usuario\n\n🔧 Patch by DemianRey\n📅 Mayo 2025');
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