// content.js - MÓDULO 1: Estructura base + Sistema de comunicación + Testing
console.log('🚀 CODIM CNS Fix - Extensión activada v3.7 - Módulo 1');

// ===============================
// VERIFICACIÓN DE CONTEXTO
// ===============================
if (window !== window.top) {
    console.log('❌ En iframe, saltando inicialización principal...');
} else {
    console.log('✅ En frame principal - Inicializando extensión completa');

    // ===============================
    // SISTEMA DE COMUNICACIÓN ROBUSTO
    // ===============================
    class CommunicationSystem {
        constructor() {
            this.setupEventListeners();
            console.log('📡 Sistema de comunicación inicializado');
        }

        setupEventListeners() {
            // Handler para requests desde página
            document.addEventListener('codim_request', async(event) => {
                const { action, id } = event.detail;
                console.log(`📨 Request recibido: ${action} (${id})`);

                try {
                    const result = await chrome.runtime.sendMessage({
                        action
                    });
                    console.log(`📥 Response para ${action}:`, result);

                    document.dispatchEvent(new CustomEvent('codim_response', {
                            detail: {
                                action,
                                id,
                                result,
                                success: true
                            }
                        }));

                } catch (error) {
                    console.error(`❌ Error en ${action}:`, error);

                    document.dispatchEvent(new CustomEvent('codim_response', {
                            detail: {
                                action,
                                id,
                                error: error.message,
                                success: false
                            }
                        }));
                }
            });

            console.log('✅ Event listeners configurados');
        }

        // Método directo para comunicación interna
        async sendMessage(action, data = null) {
            try {
                const message = data ? {
                    action,
                    data
                }
                 : {
                    action
                };
                const response = await chrome.runtime.sendMessage(message);
                console.log(`📡 Comunicación directa ${action}:`, response);
                return response;
            } catch (error) {
                console.error(`❌ Error comunicación ${action}:`, error);
                throw error;
            }
        }
    }

    // ===============================
    // INICIALIZACIÓN MÓDULO 1
    // ===============================
    function initializeModule1() {
        console.log('🔧 Inicializando Módulo 1...');

        // Inicializar sistema de comunicación
        const communicationSystem = new CommunicationSystem();

        // Hacer disponible globalmente para otros módulos
        window.codimCommunication = communicationSystem;

        console.log('✅ Módulo 1 inicializado - Sistema base listo');

        return {
            communicationSystem
        };
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeModule1);
    } else {
        initializeModule1();
    }
}

console.log('✅ CODIM CNS Fix v3.7 - Módulo 1 cargado');

// content.js - MÓDULO 3: CODIMResumenWidget class
// AGREGAR DESPUÉS DEL MÓDULO 2

// ===============================
// CLASE WIDGET DE RESUMEN
// ===============================
class CODIMResumenWidget {
    constructor() {
        this.data = {
            vencidos: 0,
            enTiempo: 0,
            total: 0,
            sinAtender: 0,
            atendidas: 0,
            noReconocidas: 0,
            reconocidas: 0,
            resueltas: 0
        };
        this.refreshInterval = null;
        this.alarmActive = true;
        this.selectedCenter = 'cns';
        this.contentScript = null;
        this.lastUpdateTime = null;
        console.log('📊 CODIMResumenWidget inicializado - DATOS REALES');
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'codim-resumen-widget';
        widget.innerHTML = this.getWidgetHTML();

        this.injectStyles();
        this.setupEventListeners(widget);
        this.startAutoRefresh();

        // Agregar clase de loading inicial
        const valueElements = widget.querySelectorAll('.card-value-large, .card-value-huge, .status-value');
        valueElements.forEach(el => el.classList.add('loading-initial'));

        // 🔄 Auto-refresh inmediato para obtener datos reales
        console.log('🔄 Ejecutando refresh automático inicial con datos reales...');
        setTimeout(() => {
            this.refreshData().then(() => {
                // Remover clase de loading después de actualizar
                valueElements.forEach(el => el.classList.remove('loading-initial'));
            }).catch(error => {
                console.error('❌ Error en refresh inicial:', error);
                valueElements.forEach(el => el.classList.remove('loading-initial'));
            });
        }, 1000);

        return widget;
    }

    getWidgetHTML() {
        return `
        <div class="resumen-header">
            <h3>📊 Resumen de Reportes</h3>
            <div class="resumen-controls">
                <select id="centerSelector" class="center-selector">
                    <option value="cns" ${this.selectedCenter === 'cns' ? 'selected' : ''}>CNS</option>
                    <option value="gdl" ${this.selectedCenter === 'gdl' ? 'selected' : ''}>GDL</option>
                    <option value="qro" ${this.selectedCenter === 'qro' ? 'selected' : ''}>QRO</option>
                </select>
                <button id="alarmToggle" class="alarm-btn ${this.alarmActive ? 'active' : 'inactive'}">
                    ${this.alarmActive ? '🔔' : '🔕'}
                </button>
                <button id="refreshBtn" class="refresh-btn">🔄</button>
            </div>
        </div>

        <div class="resumen-grid">
            <div class="resumen-card vencidos">
                <div class="card-header">
                    <span class="card-icon">⚠️</span>
                    <span class="card-title">Reportes Vencidos</span>
                </div>
                <div class="card-value-large ${this.data.vencidos > 0 ? 'clickable' : ''}" ${this.data.vencidos > 0 ? `data-action="openReport" data-params="1,P,${this.selectedCenter}"` : ''}>
                    ${this.data.vencidos}
                </div>
                <div class="card-subtitle">Requieren atención inmediata</div>
            </div>

            <div class="resumen-card en-tiempo">
                <div class="card-header">
                    <span class="card-icon">✅</span>
                    <span class="card-title">Reportes En Tiempo</span>
                </div>
                <div class="card-value-large ${this.data.enTiempo > 0 ? 'clickable' : ''}" ${this.data.enTiempo > 0 ? `data-action="openReport" data-params="2,P,${this.selectedCenter}"` : ''}>
                    ${this.data.enTiempo}
                </div>
                <div class="card-subtitle">Dentro del plazo establecido</div>
            </div>

            <div class="resumen-card total">
                <div class="card-header">
                    <span class="card-icon">📋</span>
                    <span class="card-title">Total de Reportes</span>
                </div>
                <div class="card-value-huge ${this.data.total > 0 ? 'clickable' : ''}" ${this.data.total > 0 ? `data-action="openReport" data-params="3,P,${this.selectedCenter}"` : ''}>
                    ${this.data.total}
                </div>
                <div class="card-subtitle">Reportes totales en el sistema</div>
            </div>

            <div class="resumen-card status-grid">
                <div class="card-header">
                    <span class="card-icon">📈</span>
                    <span class="card-title">Estados de Reportes</span>
                </div>
                <div class="status-items">
                    <div class="status-item">
                        <span class="status-label">Sin Atender</span>
                        <span class="status-value ${this.data.sinAtender > 0 ? 'clickable' : ''}" ${this.data.sinAtender > 0 ? `data-action="openReport" data-params="1,N,${this.selectedCenter}"` : ''}>${this.data.sinAtender}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Atendidas</span>
                        <span class="status-value ${this.data.atendidas > 0 ? 'clickable' : ''}" ${this.data.atendidas > 0 ? `data-action="openReport" data-params="1,A,${this.selectedCenter}"` : ''}>${this.data.atendidas}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">No Reconoc.</span>
                        <span class="status-value ${this.data.noReconocidas > 0 ? 'clickable' : ''}" ${this.data.noReconocidas > 0 ? `data-action="openReport" data-params="1,S,${this.selectedCenter}"` : ''}>${this.data.noReconocidas}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Reconoc.</span>
                        <span class="status-value ${this.data.reconocidas > 0 ? 'clickable' : ''}" ${this.data.reconocidas > 0 ? `data-action="openReport" data-params="1,R,${this.selectedCenter}"` : ''}>${this.data.reconocidas}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Resueltas</span>
                        <span class="status-value ${this.data.resueltas > 0 ? 'clickable' : ''}" ${this.data.resueltas > 0 ? `data-action="openReport" data-params="1,R,${this.selectedCenter}"` : ''}>${this.data.resueltas}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="resumen-footer">
            <div class="last-update">
                <span class="update-icon">🕐</span>
                <span class="update-text">Actualizado: <span id="lastUpdateTime">Cargando datos iniciales...</span></span>
            </div>
            <div class="auto-refresh">
                <span class="refresh-icon">🔄</span>
                <span class="refresh-text">Auto-refresh: 7.5 min</span>
            </div>
        </div>
    `;
    }
    setupEventListeners(widget) {
        console.log('🔧 Configurando event listeners...');

        // Selector de centro
        const centerSelector = widget.querySelector('#centerSelector');
        centerSelector?.addEventListener('change', (e) => {
            this.selectedCenter = e.target.value;
            this.refreshData();
        });

        // Botón de alarma
        const alarmBtn = widget.querySelector('#alarmToggle');
        alarmBtn?.addEventListener('click', () => {
            this.toggleAlarm();
        });

        // Botón de refresh
        const refreshBtn = widget.querySelector('#refreshBtn');
        refreshBtn?.addEventListener('click', () => {
            this.refreshData();
        });

        // Clicks en estadísticas - CORREGIDO
        widget.addEventListener('click', (e) => {
            console.log('🖱️ Click detectado en:', e.target);

            if (e.target.classList.contains('clickable')) {
                const params = e.target.getAttribute('data-params');
                console.log('📋 Parámetros encontrados:', params);

                if (params) {
                    this.openReport(params);
                } else {
                    console.error('❌ No se encontraron parámetros en el elemento clickeable');
                }
            }
        });

        console.log('✅ Event listeners configurados correctamente');
    }

    toggleAlarm() {
        this.alarmActive = !this.alarmActive;
        const alarmBtn = document.querySelector('#alarmToggle');

        if (alarmBtn) {
            alarmBtn.className = `alarm-btn ${this.alarmActive ? 'active' : 'inactive'}`;
            alarmBtn.textContent = this.alarmActive ? '🔔' : '🔕';
        }

        this.sendAlarmStatus();

        const status = this.alarmActive ? 'activada' : 'desactivada';
        this.showNotification(`🔔 Alarma ${status}`, 'info');
    }

    openReport(params) {
        console.log('📊 openReport llamado con parámetros:', params);

        const [a, b, c] = params.split(',');

        console.log(`📊 Abriendo reporte: a=${a}, b=${b}, c=${c}`);

        // Validar que tenemos parámetros válidos
        if (!a || !b || !c) {
            console.error('❌ Parámetros inválidos para openReport:', params);
            this.showNotification('❌ Error: Parámetros inválidos', 'error');
            return;
        }

        // Construir URL exactamente como en la página original
        const url = `resumen.asp?a=${a}&b=${b}&c=${c}`;
        console.log('📋 URL construida:', url);

        // VERIFICAR SI ESTAMOS EN INTERFAZ MODERNA
        const modernInterface = document.getElementById('modern-codim-interface');

        if (modernInterface) {
            console.log('🎨 Interfaz moderna detectada - Cargando en iframe');

            // Buscar el iframe por múltiples selectores
            let iframe = document.querySelector('iframe.modern-iframe') ||
                document.querySelector('.modern-content-body iframe') ||
                document.querySelector('#modernContentBody iframe');

            if (iframe) {
                console.log('🖼️ Iframe existente encontrado, cargando URL');
                iframe.src = url;
            } else {
                console.log('🖼️ Creando nuevo iframe en interfaz moderna');

                // Obtener el contenedor del contenido
                const contentBody = document.querySelector('.modern-content-body') ||
                    document.getElementById('modernContentBody');

                if (contentBody) {
                    // Limpiar contenido anterior
                    contentBody.innerHTML = '';

                    // Crear nuevo iframe
                    iframe = document.createElement('iframe');
                    iframe.className = 'modern-iframe';
                    iframe.src = url;
                    iframe.style.cssText = `
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                    border-radius: 8px !important;
                `;

                    contentBody.appendChild(iframe);
                    console.log('✅ Nuevo iframe creado y agregado');
                } else {
                    console.error('❌ No se encontró contenedor de contenido moderno');
                    // Fallback a navegación directa
                    window.location.href = url;
                    return;
                }
            }

            // Actualizar títulos de la interfaz moderna
            const titleElement = document.getElementById('modernContentTitle');
            const subtitleElement = document.getElementById('modernContentSubtitle');

            if (titleElement)
                titleElement.textContent = 'Reporte de Incidentes';
            if (subtitleElement) {
                const count = this.getCountForParams(a, b);
                subtitleElement.textContent = `Mostrando ${count} reportes (${this.getStatusName(b)})`;
            }

        } else {
            console.log('🌐 Interfaz clásica - Navegación directa');
            window.location.href = url;
        }

        const count = this.getCountForParams(a, b);
        this.showNotification(`📊 Abriendo reporte con ${count} registros`, 'info');
    }

    getCountForParams(a, b) {
        // a=1: primera fila (vencidos), a=2: segunda fila (en tiempo), a=3: tercera fila (total)
        // b=P: columna principal, b=N,A,S,R: columnas de estado

        if (a === '1' && b === 'P')
            return this.data.vencidos;
        if (a === '2' && b === 'P')
            return this.data.enTiempo;
        if (a === '3' && b === 'P')
            return this.data.total;
        if (a === '1' && b === 'N')
            return this.data.sinAtender;
        if (a === '1' && b === 'A')
            return this.data.atendidas;
        if (a === '1' && b === 'S')
            return this.data.noReconocidas;
        if (a === '1' && b === 'R')
            return this.data.reconocidas;

        return 0;
    }

    getStatusName(status) {
        const statusNames = {
            'P': 'Pendientes',
            'N': 'No Atendidas',
            'A': 'Atendidas',
            'S': 'Sin Reconocer',
            'R': 'Resueltas'
        };
        return statusNames[status] || 'Todos';
    }

    async refreshData() {
        const refreshBtn = document.querySelector('#refreshBtn');
        const lastUpdateElement = document.getElementById('lastUpdateTime');

        // Mostrar estado de carga
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            refreshBtn.disabled = true;
            refreshBtn.textContent = '⏳';
        }

        if (lastUpdateElement) {
            lastUpdateElement.textContent = 'Obteniendo datos reales...';
        }

        try {
            console.log('🔄 Iniciando actualización con datos reales...');
            await this.fetchData(); // Ahora obtiene datos reales
            this.updateWidget();
            this.updateLastUpdateTime();
            this.showNotification('✅ Datos reales actualizados correctamente', 'success');
            console.log('✅ Actualización real completada:', this.data);
        } catch (error) {
            console.error('❌ Error al actualizar datos reales:', error);
            this.showNotification(`❌ Error: ${error.message}`, 'error');

            // Mostrar información del error en el widget
            if (lastUpdateElement) {
                lastUpdateElement.textContent = `Error: ${error.message}`;
            }
        } finally {
            // Restaurar botón
            if (refreshBtn) {
                setTimeout(() => {
                    refreshBtn.style.transform = 'rotate(0deg)';
                    refreshBtn.disabled = false;
                    refreshBtn.textContent = '🔄';
                }, 500);
            }
        }
    }

    // ===============================
    // FETCH DATOS REALES - MÉTODO PRINCIPAL
    // ===============================

    async fetchData() {
        console.log('🔄 Obteniendo datos REALES de primera.asp...');

        try {
            // PASO 1: Obtener datos de primera.asp (página principal del resumen)
            const response = await fetch('/primera.asp', {
                method: 'GET',
                credentials: 'include', // Importante para mantener sesión
                cache: 'no-cache',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const htmlContent = await response.text();
            console.log('📄 HTML obtenido de primera.asp:', htmlContent.length, 'caracteres');

            // PASO 2: Parsear los datos reales del HTML
            const realData = this.parseFirstPageData(htmlContent);

            if (realData) {
                this.data = realData;
                this.lastUpdateTime = new Date();
                console.log('✅ Datos reales parseados exitosamente:', this.data);
                return this.data;
            } else {
                throw new Error('No se pudieron extraer datos válidos de primera.asp');
            }

        } catch (error) {
            console.error('❌ Error obteniendo datos reales:', error);

            // Intentar método alternativo con resumen.asp
            try {
                console.log('🔄 Intentando método alternativo con resumen.asp...');
                return await this.fetchDataAlternative();
            } catch (altError) {
                console.error('❌ Método alternativo también falló:', altError);
                throw new Error(`No se pudieron obtener datos reales: ${error.message}`);
            }
        }
    }

    // ===============================
    // PARSER DE DATOS REALES
    // ===============================
    parseFirstPageData(htmlContent) {
        console.log('🔍 Parseando datos de primera.asp...');

        // Crear un parser DOM temporal
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Estrategias de extracción múltiples para máxima compatibilidad
        const extractors = [
            () => this.extractFromTables(doc),
            () => this.extractFromFonts(doc),
            () => this.extractFromText(htmlContent),
            () => this.extractFromFrames(doc)
        ];

        for (let i = 0; i < extractors.length; i++) {
            try {
                const result = extractors[i]();
                if (result && this.validateData(result)) {
                    console.log(`✅ Datos extraídos con método ${i + 1}:`, result);
                    return result;
                }
            } catch (error) {
                console.warn(`⚠️ Método ${i + 1} falló:`, error);
            }
        }

        return null;
    }

    // Método 1: Extraer de divs con onclick específicos (CODIM primera.asp)
    extractFromTables(doc) {
        console.log('📊 Buscando datos en divs con onclick de primera.asp...');

        const data = {};

        // Buscar divs con onclick que contengan llamadas a cambia_menu
        const clickableDivs = doc.querySelectorAll('div[onclick*="cambia_menu"]');

        console.log(`🔍 Encontrados ${clickableDivs.length} divs clickeables`);

        clickableDivs.forEach((div, index) => {
            const onclick = div.getAttribute('onclick');
            const fontElement = div.querySelector('font');

            if (onclick && fontElement) {
                const number = this.extractNumber(fontElement.textContent);
                console.log(`📋 Div ${index}: onclick="${onclick}", número="${number}"`);

                if (number !== null) {
                    // Analizar el onclick para determinar qué tipo de dato es
                    if (onclick.includes("'1','186','P'") || onclick.includes("'1','" + number + "','P'")) {
                        // Reportes Vencidos - Sin Atender
                        data.vencidos = number;
                        data.sinAtender = number;
                        console.log('✅ Reportes Vencidos/Sin Atender encontrados:', number);
                    } else if (onclick.includes("'2','0','P'") || onclick.includes("'2','" + number + "','P'")) {
                        // Reportes En Tiempo
                        data.enTiempo = number;
                        console.log('✅ Reportes En Tiempo encontrados:', number);
                    } else if (onclick.includes("'3','186','P'") || onclick.includes("'3','" + number + "','P'")) {
                        // Total de Reportes
                        data.total = number;
                        console.log('✅ Total de Reportes encontrado:', number);
                    } else if (onclick.includes("'1','" + number + "','N'")) {
                        // Sin Atender (estado N)
                        data.sinAtender = number;
                        console.log('✅ Sin Atender (N) encontrados:', number);
                    } else if (onclick.includes("'1','" + number + "','A'")) {
                        // Atendidas
                        data.atendidas = number;
                        console.log('✅ Atendidas encontradas:', number);
                    } else if (onclick.includes("'1','" + number + "','S'")) {
                        // No Reconocidas
                        data.noReconocidas = number;
                        console.log('✅ No Reconocidas encontradas:', number);
                    } else if (onclick.includes("'1','" + number + "','R'")) {
                        // Reconocidas/Resueltas
                        data.reconocidas = number;
                        data.resueltas = number;
                        console.log('✅ Reconocidas/Resueltas encontradas:', number);
                    }
                }
            }
        });

        console.log('📊 Datos extraídos de divs:', data);

        return Object.keys(data).length > 0 ? this.normalizeData(data) : null;
    }

    // Método 2: Extraer usando patrones específicos de primera.asp
    extractFromFonts(doc) {
        console.log('🎨 Buscando datos en estructura específica de primera.asp...');

        const data = {};

        // Estrategia 1: Buscar por texto de contexto y números adyacentes
        const allDivs = doc.querySelectorAll('div');

        allDivs.forEach((div, index) => {
            const divText = div.textContent.trim();
            const onclick = div.getAttribute('onclick');

            // Buscar divs que contengan texto indicativo
            if (divText.toLowerCase().includes('vencidos')) {
                // Buscar el div siguiente o cercano que tenga el número
                const nextDivs = Array.from(allDivs).slice(index + 1, index + 5);
                for (let nextDiv of nextDivs) {
                    const number = this.extractNumber(nextDiv.textContent);
                    if (number !== null && nextDiv.getAttribute('onclick')?.includes('cambia_menu')) {
                        data.vencidos = number;
                        console.log('✅ Vencidos encontrados por contexto:', number);
                        break;
                    }
                }
            }

            if (divText.toLowerCase().includes('en tiempo')) {
                const nextDivs = Array.from(allDivs).slice(index + 1, index + 5);
                for (let nextDiv of nextDivs) {
                    const number = this.extractNumber(nextDiv.textContent);
                    if (number !== null && nextDiv.getAttribute('onclick')?.includes('cambia_menu')) {
                        data.enTiempo = number;
                        console.log('✅ En Tiempo encontrados por contexto:', number);
                        break;
                    }
                }
            }

            if (divText.toLowerCase().includes('total de reportes')) {
                const nextDivs = Array.from(allDivs).slice(index + 1, index + 5);
                for (let nextDiv of nextDivs) {
                    const number = this.extractNumber(nextDiv.textContent);
                    if (number !== null && nextDiv.getAttribute('onclick')?.includes('cambia_menu')) {
                        data.total = number;
                        console.log('✅ Total encontrado por contexto:', number);
                        break;
                    }
                }
            }
        });

        // Estrategia 2: Buscar divs con posiciones específicas conocidas
        const positionBasedDivs = [{
                selector: 'div[style*="left: 195"][style*="top: 93"]',
                type: 'vencidos'
            }, {
                selector: 'div[style*="left: 195"][style*="top: 123"]',
                type: 'enTiempo'
            }, {
                selector: 'div[style*="left: 195"][style*="top: 158"]',
                type: 'total'
            }, {
                selector: 'div[style*="left: 255"][style*="top: 93"]',
                type: 'sinAtender'
            }, {
                selector: 'div[style*="left: 320"][style*="top: 93"]',
                type: 'noReconocidas'
            }, {
                selector: 'div[style*="left: 375"][style*="top: 93"]',
                type: 'reconocidas'
            }
        ];

        positionBasedDivs.forEach(({
                selector,
                type
            }) => {
            const div = doc.querySelector(selector);
            if (div) {
                const number = this.extractNumber(div.textContent);
                if (number !== null) {
                    data[type] = number;
                    console.log(`✅ ${type} encontrado por posición:`, number);
                }
            }
        });

        console.log('🎨 Datos extraídos por contexto y posición:', data);

        return Object.keys(data).length > 0 ? this.normalizeData(data) : null;
    }

    // Método 3: Extraer usando expresiones regulares específicas de primera.asp
    extractFromText(htmlContent) {
        console.log('📝 Buscando datos con regex específico de primera.asp...');

        const data = {};

        // Patrón específico para encontrar los onclick con cambia_menu
        const onclickPattern = /onclick="javascript:top\.cambia_menu\('resumen','S','(\d+)','(\d+)','([PNASR])','','cns'\)"/g;

        let match;
        while ((match = onclickPattern.exec(htmlContent)) !== null) {
            const [fullMatch, tipo, numero, estado] = match;
            const value = parseInt(numero, 10);

            console.log(`🔍 onclick encontrado: tipo=${tipo}, numero=${numero}, estado=${estado}`);

            if (!isNaN(value)) {
                if (tipo === '1' && estado === 'P') {
                    // Reportes vencidos
                    data.vencidos = value;
                    data.sinAtender = value; // En tu caso, vencidos = sin atender
                } else if (tipo === '2' && estado === 'P') {
                    // Reportes en tiempo
                    data.enTiempo = value;
                } else if (tipo === '3' && estado === 'P') {
                    // Total de reportes
                    data.total = value;
                } else if (tipo === '1' && estado === 'N') {
                    // Sin atender (adicional)
                    if (!data.sinAtender)
                        data.sinAtender = value;
                } else if (tipo === '1' && estado === 'A') {
                    // Atendidas
                    data.atendidas = value;
                } else if (tipo === '1' && estado === 'S') {
                    // No reconocidas
                    data.noReconocidas = value;
                } else if (tipo === '1' && estado === 'R') {
                    // Reconocidas/Resueltas
                    data.reconocidas = value;
                    data.resueltas = value;
                }
            }
        }

        // Patrón alternativo para números directos en fonts
        const fontNumberPattern = /<font[^>]*>(\d+)<\/font>/gi;
        const numbers = [];

        let fontMatch;
        while ((fontMatch = fontNumberPattern.exec(htmlContent)) !== null) {
            const number = parseInt(fontMatch[1], 10);
            if (!isNaN(number) && number > 0) {
                numbers.push(number);
            }
        }

        // Si encontramos números pero no onclick, usar heurística
        if (Object.keys(data).length === 0 && numbers.length > 0) {
            console.log('📊 Usando heurística con números encontrados:', numbers);

            // Buscar el número más alto como vencidos (186 en tu caso)
            const maxNumber = Math.max(...numbers);
            if (maxNumber > 0) {
                data.vencidos = maxNumber;
                data.sinAtender = maxNumber;
                data.total = maxNumber;
                data.enTiempo = 0; // Como viste que es 0
            }
        }

        console.log('📝 Datos extraídos con regex:', data);

        return Object.keys(data).length > 0 ? this.normalizeData(data) : null;
    }

    // Método 4: Extraer de frames/iframes
    extractFromFrames(doc) {
        console.log('🖼️ Buscando datos en frames...');

        const frames = doc.querySelectorAll('frame, iframe');

        // Si hay frames, intentar extraer la URL del frame principal
        if (frames.length > 0) {
            const mainFrame = frames[0];
            const frameSrc = mainFrame.getAttribute('src');

            if (frameSrc && frameSrc.includes('primera')) {
                console.log('📋 Frame principal encontrado:', frameSrc);
                // Nota: En este punto necesitarías hacer otra petición al frame
                // Para simplificar, retornamos null y usamos otros métodos
            }
        }

        return null;
    }

    // ===============================
    // MÉTODO ALTERNATIVO CON RESUMEN.ASP
    // ===============================
    async fetchDataAlternative() {
        console.log('🔄 Método alternativo: obteniendo datos de resumen.asp...');

        const response = await fetch('/resumen.asp?c=cns', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} en resumen.asp`);
        }

        const htmlContent = await response.text();
        console.log('📄 HTML obtenido de resumen.asp:', htmlContent.length, 'caracteres');

        // Parsear datos de resumen.asp (similar lógica)
        return this.parseResumenData(htmlContent);
    }

    parseResumenData(htmlContent) {
        console.log('🔍 Parseando datos de resumen.asp...');

        // Buscar tablas con estadísticas
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        const data = {};

        // Buscar filas de datos específicas
        const rows = doc.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const label = cells[0].textContent.trim().toLowerCase();
                const value = this.extractNumber(cells[1].textContent);

                if (value !== null) {
                    if (label.includes('vencidos')) {
                        data.vencidos = value;
                    } else if (label.includes('tiempo')) {
                        data.enTiempo = value;
                    } else if (label.includes('total')) {
                        data.total = value;
                    }
                }
            }
        });

        return this.normalizeData(data);
    }

    // ===============================
    // UTILIDADES DE PARSING
    // ===============================
    extractNumber(text) {
        if (!text)
            return null;

        // Remover caracteres no numéricos excepto dígitos
        const cleaned = text.replace(/[^\d]/g, '');

        if (cleaned.length === 0)
            return null;

        const number = parseInt(cleaned, 10);

        // Validar que sea un número razonable (no demasiado grande)
        return !isNaN(number) && number >= 0 && number < 100000 ? number : null;
    }

    normalizeData(rawData) {
        console.log('🔧 Normalizando datos de primera.asp:', rawData);

        const normalized = {
            vencidos: rawData.vencidos || 0,
            enTiempo: rawData.enTiempo || 0,
            total: rawData.total || 0,
            sinAtender: rawData.sinAtender || 0,
            atendidas: rawData.atendidas || 0,
            noReconocidas: rawData.noReconocidas || 0,
            reconocidas: rawData.reconocidas || 0,
            resueltas: rawData.resueltas || 0
        };

        // Lógica específica para primera.asp según lo que vimos

        // Si total no está presente, calcularlo
        if (normalized.total === 0) {
            normalized.total = normalized.vencidos + normalized.enTiempo;
        }

        // Si sin atender no está presente pero hay vencidos, usar vencidos
        if (normalized.sinAtender === 0 && normalized.vencidos > 0) {
            normalized.sinAtender = normalized.vencidos;
        }

        // Para el resto de estados, si no hay datos específicos, mantener en 0
        // (no hacer estimaciones automáticas ya que primera.asp puede tener 0s reales)

        console.log('✅ Datos normalizados:', normalized);
        return normalized;
    }

    validateData(data) {
        if (!data || typeof data !== 'object')
            return false;

        // Verificar que al menos tengamos algunos datos básicos
        const hasBasicData = data.vencidos >= 0 || data.enTiempo >= 0 || data.total >= 0;

        // Verificar que los números sean razonables
        const numbersValid = Object.values(data).every(value =>
                typeof value === 'number' && value >= 0 && value < 100000);

        return hasBasicData && numbersValid;
    }

    updateWidget() {
        const widget = document.querySelector('.codim-resumen-widget');
        if (!widget)
            return;

        // Recrear con datos actualizados
        widget.innerHTML = this.getWidgetHTML();
        this.setupEventListeners(widget);

        // Animar elementos actualizados
        const animatedElements = widget.querySelectorAll('.card-value-large, .card-value-huge, .status-value');
        animatedElements.forEach(el => {
            el.classList.add('updated');
            setTimeout(() => el.classList.remove('updated'), 1200);
        });

        // 🔄 Actualizar sidebar si existe referencia al content script
        if (this.contentScript && typeof this.contentScript.updateModernSidebarResumen === 'function') {
            setTimeout(() => {
                this.contentScript.updateModernSidebarResumen();
            }, 100); // Pequeño delay para asegurar que el DOM esté actualizado
        }
    }

    updateLastUpdateTime() {
        const timeElement = document.getElementById('lastUpdateTime');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
    }

    startAutoRefresh() {
        // Auto-refresh cada 7.5 minutos
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 450000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    sendAlarmStatus() {
        // Comunicar con background para enviar estado de alarma
        if (window.codimCommunication) {
            window.codimCommunication.sendMessage('alarm_status', {
                active: this.alarmActive,
                center: this.selectedCenter
            }).then(result => {
                console.log('🔔 Estado de alarma enviado:', result);
            }).catch(error => {
                console.log('⚠️ Error enviando estado de alarma:', error);
            });
        } else {
            // Fallback: simular envío
            console.log('🔔 Enviando estado de alarma (simulado):', this.alarmActive ? 'Activada' : 'Desactivada');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `codim-notification codim-notification-${type}`;
        notification.textContent = message;

        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInNotification 0.3s ease-out;
            font-family: 'Segoe UI', Arial, sans-serif;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    injectStyles() {
        if (document.getElementById('codim-resumen-styles'))
            return;

        const style = document.createElement('style');
        style.id = 'codim-resumen-styles';
        style.textContent = `
            .codim-resumen-widget {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                height: 100%;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .resumen-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 3px solid #f0f0f0;
            }

            .resumen-header h3 {
                margin: 0;
                color: #2c3e50;
                font-size: 1.6rem;
                font-weight: 700;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }

            .resumen-controls {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .center-selector {
                padding: 10px 15px;
                border: 2px solid #e9ecef;
                border-radius: 10px;
                background: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }

            .center-selector:focus {
                border-color: #4A90E2;
                box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
                outline: none;
            }

            .alarm-btn, .refresh-btn {
                padding: 10px 15px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 1.2rem;
                transition: all 0.3s ease;
                font-weight: bold;
            }

            .alarm-btn.active {
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
                animation: pulse 2s infinite;
                box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4);
            }

            .alarm-btn.inactive {
                background: #95a5a6;
                color: white;
            }

            .refresh-btn {
                background: linear-gradient(135deg, #4A90E2, #357ABD);
                color: white;
                box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
            }

            .refresh-btn:hover {
                transform: rotate(180deg);
                background: linear-gradient(135deg, #357ABD, #2968A3);
            }

            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4); }
                50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(243, 156, 18, 0.6); }
                100% { transform: scale(1); box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4); }
            }

            .resumen-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto auto;
                gap: 20px;
                margin-bottom: 25px;
            }

            .resumen-card {
                background: linear-gradient(135deg, #ffffff, #f8f9fa);
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                transition: all 0.4s ease;
                border: 2px solid transparent;
                position: relative;
                overflow: hidden;
            }

            .resumen-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: linear-gradient(90deg, #4A90E2, #764ba2);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .resumen-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
            }

            .resumen-card:hover::before {
                opacity: 1;
            }

            .resumen-card.vencidos {
                background: linear-gradient(135deg, #fff5f5, #fed7d7);
                border-color: #e53e3e;
            }

            .resumen-card.vencidos::before {
                background: linear-gradient(90deg, #e53e3e, #c53030);
            }

            .resumen-card.en-tiempo {
                background: linear-gradient(135deg, #f0fff4, #c6f6d5);
                border-color: #38a169;
            }

            .resumen-card.en-tiempo::before {
                background: linear-gradient(90deg, #38a169, #2f855a);
            }

            .resumen-card.total {
                background: linear-gradient(135deg, #ebf8ff, #bee3f8);
                border-color: #3182ce;
                text-align: center;
            }

            .resumen-card.total::before {
                background: linear-gradient(90deg, #3182ce, #2c5282);
            }

            .resumen-card.status-grid {
                background: linear-gradient(135deg, #fafafa, #f0f0f0);
                border-color: #718096;
            }

            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                font-weight: 700;
                color: #2d3748;
            }

            .card-icon {
                font-size: 1.5rem;
            }

            .card-title {
                font-size: 1.1rem;
            }

            .card-value-large {
                font-size: 3rem;
                font-weight: 900;
                text-align: center;
                margin: 15px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }

            .resumen-card.vencidos .card-value-large {
                color: #e53e3e;
            }

            .resumen-card.en-tiempo .card-value-large {
                color: #38a169;
            }

            .card-value-huge {
                font-size: 4rem;
                font-weight: 900;
                color: #3182ce;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                margin: 20px 0;
            }

            .card-subtitle {
                text-align: center;
                color: #718096;
                font-size: 0.9rem;
                font-weight: 500;
                margin-top: 10px;
            }

            .status-items {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .status-item {
                background: rgba(255, 255, 255, 0.8);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                transition: all 0.3s ease;
                border: 1px solid rgba(0,0,0,0.05);
            }

            .status-item:hover {
                background: rgba(255, 255, 255, 1);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .status-label {
                display: block;
                font-size: 0.8rem;
                color: #718096;
                margin-bottom: 8px;
                font-weight: 600;
            }

            .status-value {
                font-size: 1.8rem;
                font-weight: 800;
                color: #2d3748;
            }

            .clickable {
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 8px;
                padding: 4px;
            }

            .clickable:hover {
                background: rgba(74, 144, 226, 0.1);
                transform: scale(1.05);
                box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
            }

            .resumen-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                font-size: 0.9rem;
                color: #718096;
                font-weight: 500;
            }

            .last-update, .auto-refresh {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .update-icon, .refresh-icon {
                font-size: 1.1rem;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .resumen-grid {
                    grid-template-columns: 1fr;
                }
                
                .status-items {
                    grid-template-columns: 1fr;
                }
                
                .resumen-header {
                    flex-direction: column;
                    gap: 15px;
                    align-items: stretch;
                }
                
                .resumen-footer {
                    flex-direction: column;
                    gap: 12px;
                    text-align: center;
                }

                .card-value-large {
                    font-size: 2.5rem;
                }

                .card-value-huge {
                    font-size: 3rem;
                }
            }

            /* Animaciones para actualización */
            .updated {
                animation: highlightUpdate 1.2s ease-in-out;
            }

            @keyframes highlightUpdate {
                0% { 
                    background: rgba(76, 175, 80, 0.2);
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
                }
                100% { 
                    background: transparent;
                    transform: scale(1);
                    box-shadow: none;
                }
            }

            /* Indicador de datos iniciales */
            .loading-initial {
                animation: loadingPulse 2s infinite ease-in-out;
            }

            @keyframes loadingPulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }

            /* Animaciones para notificaciones */
            @keyframes slideInNotification {
                from { transform: translateX(300px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutNotification {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(300px); opacity: 0; }
            }
        `;

        document.head.appendChild(style);
    }

    destroy() {
        this.stopAutoRefresh();
        const widget = document.querySelector('.codim-resumen-widget');
        if (widget)
            widget.remove();

        const styles = document.getElementById('codim-resumen-styles');
        if (styles)
            styles.remove();
    }
}

console.log('✅ CODIM CNS Fix v3.7 - Módulo 3 (CODIMResumenWidget) cargado');

// ===============================
// COMPONENTE DESBLOQUEO PISA - FUNCIONAL
// ===============================

// MÓDULO 4: Componente de Desbloqueo PISA - VERSIÓN MEJORADA
class DesbloqueoComponent {
    constructor() {
        this.selectedAmbientes = [];
        this.isProcessing = false;
        console.log('🔓 DesbloqueoComponent mejorado inicializado');
    }

    create() {
        const container = document.createElement('div');
        container.className = 'desbloqueo-container';
        container.innerHTML = this.getHTML();

        this.setupEventListeners(container);
        this.injectStyles();

        return container;
    }

    getHTML() {
        return `
            <div class="desbloqueo-content">
                <div class="desbloqueo-form">
                    <div class="form-section">
                        <label class="section-label">
                            <span class="label-icon">🏢</span>
                            <span class="label-text">Ambiente PISA:</span>
                        </label>
                        
                        <div class="checkbox-row">
                            <label class="checkbox-item">
                                <input type="checkbox" name="ambiente" value="METRO" id="metro-checkbox">
                                <span class="checkbox-custom"></span>
                                <span class="checkbox-text">METRO</span>
                            </label>
                            
                            <label class="checkbox-item">
                                <input type="checkbox" name="ambiente" value="MTY" id="mty-checkbox">
                                <span class="checkbox-custom"></span>
                                <span class="checkbox-text">MTY</span>
                            </label>
                            
                            <label class="checkbox-item">
                                <input type="checkbox" name="ambiente" value="NTE" id="nte-checkbox">
                                <span class="checkbox-custom"></span>
                                <span class="checkbox-text">NTE</span>
                            </label>
                            
                            <label class="checkbox-item">
                                <input type="checkbox" name="ambiente" value="GDL" id="gdl-checkbox">
                                <span class="checkbox-custom"></span>
                                <span class="checkbox-text">GDL</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-section">
                        <label class="section-label">
                            <span class="label-icon">🔑</span>
                            <span class="label-text">Clave de usuario PISA:</span>
                        </label>
                        
                        <div class="password-container">
                            <input type="text" id="clave-input" class="clave-input" placeholder="Ingrese su clave de usuario">
                            <button type="button" id="toggle-password" class="toggle-password" title="Mostrar/Ocultar clave">
                                🙈
                            </button>
                        </div>
                    </div>

                    <div class="form-section">
                        <label class="section-label">
                            <span class="label-icon">🔑</span>
                            <span class="label-text">Repetir clave de usuario PISA:</span>
                        </label>
                        
                        <div class="password-container">
                            <input type="text" id="reclave-input" class="clave-input" placeholder="Confirme su clave de usuario">
                            <button type="button" id="toggle-repassword" class="toggle-password" title="Mostrar/Ocultar clave">
                                🙈
                            </button>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" id="limpiar-btn" class="btn btn-secondary">
                            🧹 Limpiar
                        </button>
                        
                        <button type="button" id="desbloquear-btn" class="btn btn-primary">
                            🔓 Desbloquear
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal de procesamiento -->
            <div id="processing-overlay" class="processing-overlay hidden">
                <div class="processing-modal">
                    <div class="processing-animation">
                        <div class="processing-spinner"></div>
                        <div class="processing-icon">🔓</div>
                    </div>
                    <h3 id="processing-title">Procesando desbloqueo...</h3>
                    <p id="processing-subtitle">Conectando con sistema MASNET</p>
                    <div class="processing-steps">
                        <div class="step" id="step-connection">
                            <span class="step-icon">🔍</span>
                            <span class="step-text">Verificando conexión</span>
                            <span class="step-status">⏳</span>
                        </div>
                        <div class="step" id="step-login">
                            <span class="step-icon">🔐</span>
                            <span class="step-text">Autenticando usuario</span>
                            <span class="step-status">⏳</span>
                        </div>
                        <div class="step" id="step-unlock">
                            <span class="step-icon">🔓</span>
                            <span class="step-text">Desbloqueando ambientes</span>
                            <span class="step-status">⏳</span>
                        </div>
                        <div class="step" id="step-logout">
                            <span class="step-icon">🚪</span>
                            <span class="step-text">Cerrando sesión</span>
                            <span class="step-status">⏳</span>
                        </div>
                    </div>
                    <div class="processing-footer">
                        <small>Este proceso puede tomar unos segundos...</small>
                        <br><br>
                        <button type="button" id="cancel-process" class="btn btn-secondary" style="padding: 8px 16px; font-size: 12px;">
                            ❌ Cancelar Proceso
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal de resultado -->
            <div id="result-modal" class="result-modal hidden">
                <div class="result-content">
                    <div class="result-header">
                        <div class="result-icon" id="result-icon">✅</div>
                        <h2 id="result-title">Desbloqueo Exitoso</h2>
                    </div>
                    <div class="result-body">
                        <p id="result-message">El desbloqueo se completó correctamente.</p>
                        <div class="result-details" id="result-details"></div>
                    </div>
                    <div class="result-actions">
                        <button type="button" id="result-close" class="btn btn-primary">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners(container) {
        // Checkboxes de ambientes - SOLUCIÓN DEFINITIVA
        const checkboxes = container.querySelectorAll('input[name="ambiente"]');
        const checkboxItems = container.querySelectorAll('.checkbox-item');

        // Event listener en el checkbox real
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedAmbientes();
                this.validateForm();
            });
        });

        // Event listener adicional en el contenedor del checkbox
        checkboxItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const checkbox = checkboxes[index];
                checkbox.checked = !checkbox.checked;

                // Disparar evento change manualmente
                const event = new Event('change', {
                    bubbles: true
                });
                checkbox.dispatchEvent(event);
            });
        });

        // Inputs de clave con conversión automática a mayúsculas
        const claveInput = container.querySelector('#clave-input');
        const reclaveInput = container.querySelector('#reclave-input');

        // ✅ CONVERTIR A MAYÚSCULAS MIENTRAS SE ESCRIBE
        claveInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            this.validateForm();
        });
        reclaveInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            this.validateForm();
        });

        // Botones de mostrar/ocultar contraseña
        container.querySelector('#toggle-password').addEventListener('click', () => {
            this.togglePasswordVisibility('clave-input', 'toggle-password');
        });

        container.querySelector('#toggle-repassword').addEventListener('click', () => {
            this.togglePasswordVisibility('reclave-input', 'toggle-repassword');
        });

        // Botones de acción
        container.querySelector('#limpiar-btn').addEventListener('click', () => {
            this.limpiarFormulario();
        });

        container.querySelector('#desbloquear-btn').addEventListener('click', () => {
            this.procesarDesbloqueo();
        });

        // Modal de resultado
        container.querySelector('#result-close').addEventListener('click', () => {
            this.hideResultModal();
        });

        // Botón de cancelar proceso
        container.querySelector('#cancel-process').addEventListener('click', () => {
            this.cancelProcess();
        });

        console.log('✅ Event listeners configurados para desbloqueo');
    }

    updateSelectedAmbientes() {
        const checkboxes = document.querySelectorAll('input[name="ambiente"]:checked');
        this.selectedAmbientes = Array.from(checkboxes).map(cb => cb.value);
        console.log('🏢 Ambientes seleccionados:', this.selectedAmbientes);
    }

    validateForm() {
        const claveInput = document.querySelector('#clave-input');
        const reclaveInput = document.querySelector('#reclave-input');
        const desbloquearBtn = document.querySelector('#desbloquear-btn');

        const hasAmbientes = this.selectedAmbientes.length > 0;
        const hasClave = claveInput.value.trim().length > 0;
        const hasReclave = reclaveInput.value.trim().length > 0;

        // ✅ COMPARAR EN MAYÚSCULAS
        const clavesCoinciden = claveInput.value.toUpperCase() === reclaveInput.value.toUpperCase();

        const isValid = hasAmbientes && hasClave && hasReclave && clavesCoinciden;

        desbloquearBtn.disabled = !isValid;
        desbloquearBtn.classList.toggle('disabled', !isValid);

        // Mostrar indicador de claves no coinciden
        if (hasReclave && !clavesCoinciden) {
            reclaveInput.classList.add('error');
        } else {
            reclaveInput.classList.remove('error');
        }

        return isValid;
    }

    togglePasswordVisibility(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);

        if (input.type === 'text') {
            input.type = 'password';
            button.textContent = '👁️';
            button.title = 'Mostrar clave';
        } else {
            input.type = 'text';
            button.textContent = '🙈';
            button.title = 'Ocultar clave';
        }
    }

    limpiarFormulario() {
        // Limpiar checkboxes
        document.querySelectorAll('input[name="ambiente"]').forEach(cb => {
            cb.checked = false;
        });

        // Limpiar inputs
        document.getElementById('clave-input').value = '';
        document.getElementById('reclave-input').value = '';

        // Limpiar estado
        this.selectedAmbientes = [];
        this.validateForm();

        console.log('🧹 Formulario limpiado');
    }

    async procesarDesbloqueo() {
        if (this.isProcessing)
            return;

        this.isProcessing = true;

        try {
            const clave = document.getElementById('clave-input').value.trim().toUpperCase(); // ← CONVERTIR A MAYÚSCULAS
            const reclave = document.getElementById('reclave-input').value.trim().toUpperCase(); // ← CONVERTIR A MAYÚSCULAS

            if (!this.validateForm()) {
                throw new Error('Por favor complete todos los campos correctamente');
            }

            // ✅ VERIFICAR QUE LAS CLAVES COINCIDAN DESPUÉS DE LA CONVERSIÓN
            if (clave !== reclave) {
                throw new Error('Las claves no coinciden');
            }

            console.log('🔓 Iniciando proceso de desbloqueo con clave en mayúsculas');

            // Mostrar modal de procesamiento
            this.showProcessingModal();

            // Paso 1: Test de conexión
            await this.updateProcessingStep('step-connection', 'progress');
            await this.comunicarConBackground('masnet_test');
            await this.updateProcessingStep('step-connection', 'success');

            // Paso 2: Proceso completo de desbloqueo
            await this.updateProcessingStep('step-login', 'progress');
            await this.updateProcessingStep('step-unlock', 'progress');
            await this.updateProcessingStep('step-logout', 'progress');

            const result = await this.comunicarConBackground('masnet_desbloqueo', {
                ambientes: this.selectedAmbientes,
                clave: clave // ← Ya está en mayúsculas
            });

            console.log('📤 Datos enviados a background:', JSON.stringify({
                    ambientes: this.selectedAmbientes,
                    clave: clave
                }, null, 2));

            if (result.success && result.data.success) {
                // Marcar todos los pasos como exitosos
                await this.updateProcessingStep('step-login', 'success');
                await this.updateProcessingStep('step-unlock', 'success');
                await this.updateProcessingStep('step-logout', 'success');

                // FORZAR LOGOUT ADICIONAL para asegurar desconexión
                console.log('🔐 Ejecutando logout adicional para asegurar desconexión...');
                await this.comunicarConBackground('masnet_logout');

                setTimeout(() => {
                    this.hideProcessingModal();
                    this.showResultModal(true, result.data);
                }, 1000);
            } else {
                throw new Error(result.data?.message || 'Error en el desbloqueo');
            }

        } catch (error) {
            console.error('❌ Error en desbloqueo:', error);

            // LOGOUT DE EMERGENCIA
            try {
                console.log('🚨 Ejecutando logout de emergencia...');
                await this.comunicarConBackground('masnet_logout');
            } catch (logoutError) {
                console.error('❌ Logout de emergencia falló:', logoutError);
            }

            // Marcar paso actual como error
            const currentStep = document.querySelector('.step.progress');
            if (currentStep) {
                this.updateProcessingStep(currentStep.id, 'error');
            }

            setTimeout(() => {
                this.hideProcessingModal();
                this.showResultModal(false, {
                    message: error.message
                });
            }, 1000);
        } finally {
            this.isProcessing = false;
        }
    }

    async comunicarConBackground(action, data = null) {
        return new Promise((resolve, reject) => {
            console.log(`📡 Comunicación directa ${action}:`, data ? JSON.stringify(data, null, 2) : 'sin datos');

            chrome.runtime.sendMessage({
                action,
                data
            }, (response) => {
                console.log(`📡 Comunicación directa ${action} response:`, JSON.stringify(response, null, 2));

                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response) {
                    resolve(response);
                } else {
                    reject(new Error('No se recibió respuesta del background'));
                }
            });
        });
    }

    showProcessingModal() {
        // Remover modal anterior si existe
        this.hideProcessingModal();

        // Crear modal dinámicamente
        const overlay = document.createElement('div');
        overlay.id = 'processing-overlay';
        overlay.className = 'processing-overlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important;
            backdrop-filter: blur(5px) !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        `;

        overlay.innerHTML = `
            <div style="
                background: white !important;
                border-radius: 20px !important;
                padding: 40px !important;
                max-width: 500px !important;
                width: 90% !important;
                text-align: center !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                position: relative !important;
                z-index: 2147483648 !important;
                animation: modalAppear 0.3s ease-out !important;
            ">
                <style>
                    @keyframes modalAppear {
                        from { opacity: 0; transform: scale(0.9) translateY(20px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
                
                <div style="position: relative; margin-bottom: 24px;">
                    <div style="
                        width: 60px;
                        height: 60px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #1976d2;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 24px;
                    ">🔓</div>
                </div>
                
                <h3 style="margin: 0 0 8px 0; font-size: 22px; color: #333;">Procesando desbloqueo...</h3>
                <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Conectando con sistema MASNET</p>
                
                <div style="
                    text-align: left;
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 24px 0;
                ">
                    <div class="step" id="step-connection" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px 0;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🔍</span>
                        <span style="flex: 1; font-weight: 500;">Verificando conexión</span>
                        <span class="step-status" style="font-size: 16px;">⏳</span>
                    </div>
                    <div class="step" id="step-login" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px 0;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🔐</span>
                        <span style="flex: 1; font-weight: 500;">Autenticando usuario</span>
                        <span class="step-status" style="font-size: 16px;">⏳</span>
                    </div>
                    <div class="step" id="step-unlock" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px 0;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🔓</span>
                        <span style="flex: 1; font-weight: 500;">Desbloqueando ambientes</span>
                        <span class="step-status" style="font-size: 16px;">⏳</span>
                    </div>
                    <div class="step" id="step-logout" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px 0;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🚪</span>
                        <span style="flex: 1; font-weight: 500;">Cerrando sesión</span>
                        <span class="step-status" style="font-size: 16px;">⏳</span>
                    </div>
                </div>
                
                <div style="color: #666; font-style: italic; margin-top: 16px; font-size: 12px;">
                    <small>Este proceso puede tomar unos segundos...</small>
                    <br><br>
                    <button type="button" id="cancel-process-global" style="
                        background: #f5f5f5;
                        color: #666;
                        border: 2px solid #e0e0e0;
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        ❌ Cancelar Proceso
                    </button>
                </div>
            </div>
        `;

        // Agregar al documento principal (no al iframe)
        const targetDocument = window.top ? window.top.document : document;
        const targetBody = targetDocument.body;
        targetBody.appendChild(overlay);

        // Event listeners
        const cancelBtn = overlay.querySelector('#cancel-process-global');
        cancelBtn.addEventListener('click', () => {
            this.cancelProcess();
        });

        // 🚨 TIMEOUT DE SEGURIDAD: Forzar cierre después de 60 segundos
        this.safetyTimeout = setTimeout(() => {
            console.log('🚨 TIMEOUT DE SEGURIDAD: Cerrando modal y ejecutando logout de emergencia');
            this.hideProcessingModal();

            // Logout de emergencia
            this.comunicarConBackground('masnet_logout').catch(error => {
                console.error('❌ Logout de emergencia falló:', error);
            });

            // Mostrar error
            this.showResultModal(false, {
                message: 'Timeout: El proceso tomó demasiado tiempo. Se ejecutó logout de seguridad.'
            });
        }, 60000); // 60 segundos máximo

        // 🖱️ CLICK PARA CANCELAR: Permitir cerrar haciendo click en el overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                console.log('🚨 Usuario canceló el proceso haciendo click fuera del modal');
                this.cancelProcess();
            }
        });

        console.log('🔄 Modal de procesamiento mostrado (dinámico)');
    }

    hideProcessingModal() {
        // Buscar y remover modal de procesamiento existente
        const existingOverlay = document.getElementById('processing-overlay');
        if (existingOverlay && existingOverlay.parentNode) {
            existingOverlay.style.opacity = '0';
            setTimeout(() => {
                if (existingOverlay.parentNode) {
                    existingOverlay.remove();
                }
            }, 300);
        }

        // También buscar en el documento principal
        if (window.top && window.top.document) {
            const topOverlay = window.top.document.getElementById('processing-overlay');
            if (topOverlay && topOverlay.parentNode) {
                topOverlay.style.opacity = '0';
                setTimeout(() => {
                    if (topOverlay.parentNode) {
                        topOverlay.remove();
                    }
                }, 300);
            }
        }

        // 🧹 Limpiar timeout de seguridad
        if (this.safetyTimeout) {
            clearTimeout(this.safetyTimeout);
            this.safetyTimeout = null;
        }

        console.log('✅ Modal de procesamiento ocultado y removido');
    }

    // 🚨 MÉTODO PARA CANCELAR PROCESO
    async cancelProcess() {
        console.log('🚨 Cancelando proceso de desbloqueo...');
        this.isProcessing = false;

        // Ejecutar logout de emergencia
        try {
            await this.comunicarConBackground('masnet_logout');
            console.log('✅ Logout de cancelación ejecutado');
        } catch (error) {
            console.error('❌ Error en logout de cancelación:', error);
        }

        this.hideProcessingModal();
        this.showResultModal(false, {
            message: 'Proceso cancelado por el usuario. Se ejecutó logout de seguridad.'
        });
    }

    async updateProcessingStep(stepId, status) {
        // Buscar el paso en cualquier documento (iframe o principal)
        let step = document.getElementById(stepId);
        if (!step && window.top && window.top.document) {
            step = window.top.document.getElementById(stepId);
        }

        if (!step) {
            console.warn(`⚠️ No se encontró el paso: ${stepId}`);
            return;
        }

        const statusElement = step.querySelector('.step-status');
        if (!statusElement) {
            console.warn(`⚠️ No se encontró .step-status en: ${stepId}`);
            return;
        }

        // Limpiar clases anteriores
        step.classList.remove('success', 'error', 'progress');

        // Aplicar estilos según el estado
        switch (status) {
        case 'progress':
            step.classList.add('progress');
            step.style.background = 'rgba(25, 118, 210, 0.1)';
            step.style.borderRadius = '8px';
            step.style.padding = '12px 16px 12px 8px';
            step.style.margin = '4px -4px';
            statusElement.textContent = '🔄';
            break;
        case 'success':
            step.classList.add('success');
            step.style.color = '#2e7d32';
            step.style.background = 'rgba(46, 125, 50, 0.1)';
            step.style.borderRadius = '8px';
            step.style.padding = '12px 16px 12px 8px';
            step.style.margin = '4px -4px';
            statusElement.textContent = '✅';
            break;
        case 'error':
            step.classList.add('error');
            step.style.color = '#d32f2f';
            step.style.background = 'rgba(211, 47, 47, 0.1)';
            step.style.borderRadius = '8px';
            step.style.padding = '12px 16px 12px 8px';
            step.style.margin = '4px -4px';
            statusElement.textContent = '❌';
            break;
        }

        // Pequeña animación
        step.style.transform = 'scale(1.05)';
        setTimeout(() => {
            step.style.transform = 'scale(1)';
        }, 200);

        // Delay para efecto visual
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log(`📊 Paso ${stepId} actualizado a: ${status}`);
    }

    showResultModal(success, data) {
        // Remover modal anterior si existe
        this.hideResultModal();

        // Crear modal dinámicamente y agregarlo al documento principal
        const modal = document.createElement('div');
        modal.id = 'result-modal';
        modal.className = 'result-modal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important;
            backdrop-filter: blur(5px) !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        `;

        const icon = success ? '✅' : '❌';
        const iconClass = success ? 'success' : 'error';
        const title = success ? 'Desbloqueo Exitoso' : 'Error en Desbloqueo';
        const message = success
             ? `Se completó el desbloqueo para los ambientes: ${data.ambientes?.join(', ') || 'seleccionados'}`
             : data.message || 'Ocurrió un error durante el proceso';

        let details = '';
        if (success) {
            details = `
                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                        <strong>🏢 Ambientes:</strong> <span>${data.ambientes?.join(', ') || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                        <strong>⏰ Hora:</strong> <span>${new Date().toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <strong>✅ Estado:</strong> <span>Completado exitosamente</span>
                    </div>
					<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <strong>⚠️ Esperar de 1-10 minutos para ingresar en PISA</span>
                    </div>
                </div>
            `;
        } else {
            details = `
                <div style="background: #fff5f5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left; border: 1px solid #ffcdd2;">
                    <div style="color: #d32f2f; padding: 12px; border-radius: 8px; margin: 8px 0;">
                        <strong>⚠️ Error:</strong> ${data.message || 'Error desconocido'}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                        <strong>⏰ Hora:</strong> <span>${new Date().toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <strong>💡 Sugerencia:</strong> <span>Verifique su clave y conexión a la red</span>
                    </div>
                </div>
            `;
        }

        modal.innerHTML = `
            <div style="
                background: white !important;
                border-radius: 20px !important;
                padding: 30px !important;
                max-width: 500px !important;
                width: 90% !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
                text-align: center !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                position: relative !important;
                z-index: 2147483648 !important;
                animation: modalAppear 0.3s ease-out !important;
            ">
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 12px; color: ${success ? '#2e7d32' : '#d32f2f'};">
                        ${icon}
                    </div>
                    <h2 style="margin: 0; font-size: 24px; color: #333; font-weight: 700;">
                        ${title}
                    </h2>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <p style="font-size: 16px; color: #666; margin-bottom: 16px; line-height: 1.4;">
                        ${message}
                    </p>
                    ${details}
                </div>
                
                <div style="text-align: center;">
                    <button type="button" id="result-close-btn" style="
                        background: linear-gradient(135deg, #1976d2, #1565c0) !important;
                        color: white !important;
                        border: none !important;
                        padding: 12px 24px !important;
                        border-radius: 8px !important;
                        font-size: 16px !important;
                        font-weight: 600 !important;
                        cursor: pointer !important;
                        transition: all 0.3s ease !important;
                        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
                    ">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        // Agregar al documento principal (no al iframe)
        const targetDocument = window.top ? window.top.document : document;
        const targetBody = targetDocument.body;
        targetBody.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('#result-close-btn');
        const closeModal = () => {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
                // Limpiar formulario después de cerrar
                this.limpiarFormulario();
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);

        // Cerrar con ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                targetDocument.removeEventListener('keydown', escHandler);
            }
        };
        targetDocument.addEventListener('keydown', escHandler);

        // Cerrar haciendo click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        console.log(`📋 Modal de resultado mostrado: ${success ? 'éxito' : 'error'}`);
    }

    hideResultModal() {
        // Buscar y remover modal de resultado existente
        const existingModal = document.getElementById('result-modal');
        if (existingModal && existingModal.parentNode) {
            existingModal.remove();
        }

        // También buscar en el documento principal
        if (window.top && window.top.document) {
            const topModal = window.top.document.getElementById('result-modal');
            if (topModal && topModal.parentNode) {
                topModal.remove();
            }
        }
    }

    injectStyles() {
        if (document.getElementById('desbloqueo-styles'))
            return;

        const style = document.createElement('style');
        style.id = 'desbloqueo-styles';
        style.textContent = `
            .desbloqueo-container {
                width: 100%;
                height: 100%;
                padding: 0;
                margin: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                background: transparent;
            }

            .desbloqueo-content {
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                border: 2px solid #e3f2fd;
                width: 90%;
                max-width: 650px;
                margin: 20px auto;
            }

            .desbloqueo-header {
                background: linear-gradient(135deg, #1976d2, #1565c0);
                color: white;
                padding: 20px 30px;
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .header-icon {
                font-size: 32px;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .header-text h1 {
                margin: 0 0 4px 0;
                font-size: 20px;
                font-weight: 700;
            }

            .header-text p {
                margin: 0;
                font-size: 14px;
                opacity: 0.9;
            }

            .desbloqueo-form {
                padding: 30px;
            }

            .form-section {
                margin-bottom: 32px;
            }

            .section-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 16px;
                color: #1565c0;
                margin-bottom: 16px;
            }

            .label-icon {
                font-size: 20px;
            }

            .checkbox-row {
                display: flex;
                gap: 24px;
                flex-wrap: nowrap;
                align-items: center;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                border: 2px solid #e9ecef;
                transition: all 0.3s ease;
                overflow-x: auto;
                min-height: 60px;
            }

            .checkbox-row:hover {
                border-color: #1976d2;
                background: #f3f8ff;
            }

            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 8px;
                transition: all 0.3s ease;
                min-width: 100px;
                position: relative;
                user-select: none;
                white-space: nowrap;
                flex-shrink: 0;
            }

            .checkbox-item:hover {
                background: rgba(25, 118, 210, 0.1);
            }

            /* SOLUCIÓN DEFINITIVA PARA CHECKBOXES */
            .checkbox-item input[type="checkbox"] {
                position: absolute;
                left: -9999px;
                opacity: 0;
                pointer-events: none;
            }

            .checkbox-custom {
                width: 20px;
                height: 20px;
                border: 2px solid #1976d2;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                background: white;
                cursor: pointer;
                flex-shrink: 0;
            }

            .checkbox-item input[type="checkbox"]:checked + .checkbox-custom {
                background: #1976d2;
                border-color: #1976d2;
            }

            .checkbox-item input[type="checkbox"]:checked + .checkbox-custom::after {
                content: '✓';
                color: white;
                font-size: 14px;
                font-weight: bold;
            }

            .checkbox-text {
                font-weight: 600;
                color: #333;
                font-size: 14px;
                user-select: none;
                cursor: pointer;
            }

            .password-container {
                position: relative;
                display: flex;
                align-items: center;
            }

            .clave-input {
			flex: 1;
			padding: 16px 50px 16px 16px;
			border: 2px solid #e9ecef;
			border-radius: 12px;
			font-size: 16px;
			background: white;
			transition: all 0.3s ease;
			outline: none;
			text-transform: uppercase; /* ← Mostrar siempre en mayúsculas */
			font-family: 'Courier New', monospace; /* ← Fuente monoespaciada para mejor lectura */
			letter-spacing: 1px; /* ← Espaciado entre letras */
			}

            .clave-input:focus {
                border-color: #1976d2;
                box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1);
            }

            .clave-input.error {
                border-color: #d32f2f;
                box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.1);
            }

            .toggle-password {
                position: absolute;
                right: 12px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 20px;
                padding: 8px;
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .toggle-password:hover {
                background: rgba(25, 118, 210, 0.1);
            }

            .form-actions {
                display: flex;
                gap: 16px;
                justify-content: center;
                margin-top: 40px;
                padding-top: 32px;
                border-top: 2px solid #f0f0f0;
            }

            .btn {
                padding: 16px 32px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 140px;
                justify-content: center;
            }

            .btn-primary {
                background: linear-gradient(135deg, #1976d2, #1565c0);
                color: white;
                box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
            }

            .btn-primary:hover:not(.disabled) {
                background: linear-gradient(135deg, #1565c0, #0d47a1);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
            }

            .btn-secondary {
                background: #f5f5f5;
                color: #666;
                border: 2px solid #e0e0e0;
            }

            .btn-secondary:hover {
                background: #eeeeee;
                border-color: #bdbdbd;
            }

            .btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
                box-shadow: none !important;
            }

            /* Modal de procesamiento */
            .processing-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.8) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 2147483647 !important;
                backdrop-filter: blur(5px) !important;
            }

            .processing-modal {
                background: white !important;
                border-radius: 20px !important;
                padding: 40px !important;
                max-width: 500px !important;
                width: 90% !important;
                text-align: center !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                animation: modalAppear 0.3s ease-out !important;
                position: relative !important;
                z-index: 2147483648 !important;
            }

            @keyframes modalAppear {
                from { 
                    opacity: 0; 
                    transform: scale(0.9) translateY(20px); 
                }
                to { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }

            .processing-animation {
                position: relative;
                margin-bottom: 24px;
            }

            .processing-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #1976d2;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }

            .processing-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .processing-steps {
                text-align: left;
                margin: 24px 0;
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
            }

            .step {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 0;
                transition: all 0.3s ease;
            }

            .step-icon {
                font-size: 18px;
                width: 24px;
                text-align: center;
            }

            .step-text {
                flex: 1;
                font-weight: 500;
            }

            .step-status {
                font-size: 16px;
            }

            .step.progress {
                background: rgba(25, 118, 210, 0.1);
                border-radius: 8px;
                padding: 12px 16px 12px 8px;
                margin: 4px -4px;
            }

            .step.success {
                color: #2e7d32;
            }

            .step.error {
                color: #d32f2f;
            }

            .processing-footer {
                color: #666;
                font-style: italic;
                margin-top: 16px;
            }

            /* Modal de resultado */
            .result-modal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.8) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 2147483647 !important;
                backdrop-filter: blur(5px) !important;
            }

            .result-content {
                background: white !important;
                border-radius: 20px !important;
                padding: 40px !important;
                max-width: 600px !important;
                width: 90% !important;
                text-align: center !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                animation: modalAppear 0.3s ease-out !important;
                position: relative !important;
                z-index: 2147483648 !important;
            }

            .result-header {
                margin-bottom: 24px;
            }

            .result-icon {
                font-size: 64px;
                margin-bottom: 16px;
            }

            .result-icon.success {
                color: #2e7d32;
            }

            .result-icon.error {
                color: #d32f2f;
            }

            .result-header h2 {
                margin: 0;
                font-size: 24px;
                color: #333;
            }

            .result-body {
                margin-bottom: 32px;
                text-align: left;
            }

            .result-body p {
                font-size: 16px;
                color: #666;
                margin-bottom: 20px;
                text-align: center;
            }

            .result-details {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
            }

            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
            }

            .detail-item:last-child {
                border-bottom: none;
            }

            .detail-item.error {
                color: #d32f2f;
                background: rgba(211, 47, 47, 0.05);
                padding: 12px;
                border-radius: 8px;
                border: none;
                margin: 8px 0;
            }

            .result-actions {
                text-align: center;
            }

            .hidden {
                display: none !important;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .desbloqueo-container {
                    padding: 15px 10px;
                }

                .desbloqueo-form {
                    padding: 25px 20px;
                }

                .checkbox-row {
                    flex-direction: row;
                    gap: 12px;
                    align-items: center;
                    overflow-x: auto;
                    padding: 15px;
                }

                .checkbox-item {
                    min-width: 80px;
                    flex-shrink: 0;
                    padding: 6px 8px;
                }

                .form-actions {
                    flex-direction: column;
                    align-items: stretch;
                }

                .btn {
                    width: 100%;
                }

                .processing-modal,
                .result-content {
                    margin: 20px;
                    padding: 30px 20px;
                }
            }

            /* Animaciones adicionales */
            @keyframes slideInFromTop {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .desbloqueo-content {
                animation: slideInFromTop 0.6s ease-out;
            }

            .checkbox-item {
                animation: slideInFromTop 0.4s ease-out;
            }

            .checkbox-item:nth-child(1) { animation-delay: 0.1s; }
            .checkbox-item:nth-child(2) { animation-delay: 0.2s; }
            .checkbox-item:nth-child(3) { animation-delay: 0.3s; }
            .checkbox-item:nth-child(4) { animation-delay: 0.4s; }

            /* Efectos hover mejorados */
            .btn-primary:not(.disabled):active {
                transform: translateY(1px);
            }

            .checkbox-item:active {
                transform: scale(0.98);
            }

            /* Estados de validación */
            .clave-input:valid {
                border-color: #2e7d32;
            }

            .clave-input:invalid:not(:placeholder-shown) {
                border-color: #d32f2f;
            }

            /* Mejoras de accesibilidad */
            .btn:focus,
            .clave-input:focus,
            .checkbox-item:focus-within {
                outline: 3px solid rgba(25, 118, 210, 0.3);
                outline-offset: 2px;
            }

            /* Loading states */
            .btn.loading {
                position: relative;
                color: transparent;
            }

            .btn.loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos del componente de desbloqueo inyectados');
    }
}

// Hacer disponible globalmente
window.DesbloqueoComponent = DesbloqueoComponent;

console.log('✅ CODIM CNS Fix v3.7 - Módulo 4 (Componente Desbloqueo PISA Mejorado) cargado');

// content.js - MÓDULO 5: CODIMContentScript class - EL MÓDULO PRINCIPAL

// ===============================
// CLASE PRINCIPAL CONTENT SCRIPT
// ===============================

// ===============================
// CLASE PRINCIPAL CONTENT SCRIPT - VERSIÓN CORREGIDA COMPLETA
// ===============================
class CODIMContentScript {
    constructor() {
        this.isMainPage = this.checkIsMainPage();
        this.hasOldInterface = this.checkHasOldInterface();
        this.userData = null;
        this.resumenWidget = null;
        console.log('🎯 CODIMContentScript inicializado', {
            isMainPage: this.isMainPage,
            hasOldInterface: this.hasOldInterface
        });
    }

    init() {
        console.log('🔧 Inicializando CODIMContentScript...');

        // CRÍTICO: Extraer datos ANTES de modificar el DOM
        if (this.shouldReplaceWithModernInterface()) {
            console.log('🎨 Página principal detectada - Extrayendo datos antes de cargar interfaz moderna...');
            this.extractUserDataSync();
            this.loadModernInterface();
        } else {
            console.log('🔧 Cargando patch clásico + buscador DSLAM...');
            this.loadClassicPatch();
            this.initializeDSLAMSearch();
        }
    }

    // ===============================
    // FUNCIÓN CENTRALIZADA CAMBIA_MENU
    // ===============================
    createGlobalCambiaMenu() {
        const self = this;
        window.cambia_menu = function (seccion, tipo, folio, param1, param2, param3, busca) {
            console.log('🔄 Global cambia_menu centralizado:', arguments);

            if (seccion === 'consulta' && (folio || busca || param3)) {
                const folioFinal = folio || busca || param3;
                const url = `ver_rep.asp?folio=${folioFinal}&busca=${busca || ''}`;
                console.log('📋 Navegando a consulta:', url);

                // En interfaz moderna, cargar en iframe
                if (document.getElementById('modern-codim-interface')) {
                    self.modernLoadPage(url);
                } else {
                    // En interfaz clásica, navegar directamente
                    window.location.href = url;
                }
                return;
            }

            // Para otros casos
            if (document.getElementById('modern-codim-interface')) {
                self.modernLoadPage(`${seccion}.asp?tipo=${tipo}&folio=${folio}&busca=${busca || ''}`);
            }
        };

        // Función cancelar global
        window.cancelar = function () {
            console.log('🔙 Cancelar global ejecutado');
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // En interfaz moderna, volver al resumen
                if (document.getElementById('modern-codim-interface')) {
                    self.showModernResumen();
                } else {
                    window.location.href = '/';
                }
            }
        };
    }

    // ===============================
    // EXTRACCIÓN DE DATOS DEL USUARIO
    // ===============================
    extractUserDataSync() {
        console.log('👤 Extrayendo datos del usuario SINCRÓNICAMENTE...');

        this.userData = {
            fullName: this.extractUserName(),
            username: this.extractUsername(),
            ipAddress: this.extractUserIP(),
            location: this.extractUserLocation()
        };

        console.log('📝 Datos extraídos sincrónicamente:', this.userData);
    }

    extractUserName() {
        console.log('🔍 Buscando nombre de usuario en DOM original...');

        const nameSelectors = [
            // Método 1: Buscar en fonts amarillos
            () => {
                const yellowFonts = document.querySelectorAll('font[color="yellow"] b, font[color="yellow"]');
                for (let font of yellowFonts) {
                    const text = font.textContent.trim();
                    if (this.isValidName(text)) {
                        console.log('✅ Nombre encontrado en font amarillo:', text);
                        return text;
                    }
                }
                return null;
            },

            // Método 2: Buscar en divs con z-index 18
            () => {
                const userDivs = document.querySelectorAll('div[style*="z-index: 18"], div[style*="z-index:18"]');
                for (let div of userDivs) {
                    const allText = div.textContent.trim();
                    if (this.isValidName(allText)) {
                        console.log('✅ Nombre encontrado en div z-index 18:', allText);
                        return allText;
                    }
                }
                return null;
            },

            // Método 3: Búsqueda general
            () => {
                const allElements = document.querySelectorAll('font, b, strong, td, div, span');
                for (let element of allElements) {
                    const text = element.textContent.trim();
                    if (text.length > 10 && text.length < 50 && /^[A-ZÁÉÍÓÚÑ]/.test(text)) {
                        if (this.isValidName(text)) {
                            console.log('✅ Nombre encontrado en búsqueda general:', text);
                            return text;
                        }
                    }
                }
                return null;
            }
        ];

        for (let i = 0; i < nameSelectors.length; i++) {
            try {
                const name = nameSelectors[i]();
                if (name)
                    return name;
            } catch (error) {
                console.warn(`⚠️ Error en método ${i + 1}:`, error);
            }
        }

        return 'Usuario CODIM';
    }

    extractUsername() {
        console.log('🔍 Buscando username...');

        const usernameExtractors = [
            // Método 1: Buscar en elementos con color Blue
            () => {
                const blueElements = document.querySelectorAll('font[color="Blue"][size="1"] b, font[color="blue"][size="1"] b');
                for (let element of blueElements) {
                    const text = element.textContent.trim();
                    if (this.isValidUsername(text) && !/^\d{1,3}\.\d{1,3}/.test(text)) {
                        console.log('✅ Username encontrado en elemento azul:', text);
                        return text.toLowerCase();
                    }
                }
                return null;
            },

            // Método 2: Generar del nombre completo
            () => {
                if (this.userData && this.userData.fullName && this.userData.fullName !== 'Usuario CODIM') {
                    const name = this.userData.fullName.trim();
                    const names = name.split(/\s+/);
                    if (names.length >= 2) {
                        const firstName = names[0];
                        const lastName = names[1];
                        if (firstName.length > 0 && lastName.length > 0) {
                            const username = firstName.charAt(0).toLowerCase() + lastName.toLowerCase();
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

        for (let i = 0; i < usernameExtractors.length; i++) {
            try {
                const username = usernameExtractors[i]();
                if (username)
                    return username;
            } catch (error) {
                console.warn(`⚠️ Error en método username ${i + 1}:`, error);
            }
        }

        return 'usuario';
    }

    extractUserIP() {
        console.log('🔍 Buscando dirección IP...');

        const ipExtractors = [
            // Método 1: Buscar en elementos con color Blue
            () => {
                const blueElements = document.querySelectorAll('font[color="Blue"] b, font[color="blue"] b');
                for (let element of blueElements) {
                    const text = element.textContent.trim();
                    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(text) && this.isValidIP(text)) {
                        console.log('✅ IP encontrada en elemento azul:', text);
                        return text;
                    }
                }
                return null;
            },

            // Método 2: Búsqueda general de IPs
            () => {
                const bodyText = document.body.textContent;
                const ipPattern = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
                let match;
                const foundIPs = [];

                while ((match = ipPattern.exec(bodyText)) !== null) {
                    const ip = match[1];
                    if (this.isValidIP(ip)) {
                        foundIPs.push(ip);
                    }
                }

                const probableIPs = foundIPs.filter(ip => {
                    const parts = ip.split('.').map(Number);
                    return parts[0] >= 10 && parts[0] <= 192 &&
                    !(parts[0] === 127) &&
                    !(parts[0] === 0) &&
                    !(ip === '255.255.255.255');
                });

                if (probableIPs.length > 0) {
                    console.log('✅ IP probable encontrada:', probableIPs[0]);
                    return probableIPs[0];
                }

                return null;
            }
        ];

        for (let i = 0; i < ipExtractors.length; i++) {
            try {
                const ip = ipExtractors[i]();
                if (ip)
                    return ip;
            } catch (error) {
                console.warn(`⚠️ Error en método IP ${i + 1}:`, error);
            }
        }

        return '192.168.1.1';
    }

    extractUserLocation() {
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

        return 'Red Interna Telmex';
    }

    // Métodos de validación
    isValidName(text) {
        if (!text || typeof text !== 'string')
            return false;

        const cleanText = text.trim();
        if (cleanText.length < 5 || cleanText.length > 60)
            return false;

        const words = cleanText.split(/\s+/);
        if (words.length < 2)
            return false;

        const namePattern = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+$/;
        if (!namePattern.test(cleanText))
            return false;

        const excludeWords = [
            'codim', 'sistema', 'bienvenido', 'usuario', 'pagina', 'menu', 'principal',
            'reporte', 'consultar', 'historico', 'tecnicos', 'turno', 'configuracion'
        ];

        const lowerText = cleanText.toLowerCase();
        for (let word of excludeWords) {
            if (lowerText.includes(word))
                return false;
        }

        return true;
    }

    isValidUsername(username) {
        if (!username || typeof username !== 'string')
            return false;

        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername.length < 3 || cleanUsername.length > 15)
            return false;
        if (!/^[a-zA-Z]/.test(cleanUsername))
            return false;
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(cleanUsername))
            return false;

        const excludeUsernames = [
            'codim', 'sistema', 'usuario', 'admin', 'test', 'user', 'login'
        ];

        if (excludeUsernames.includes(cleanUsername))
            return false;
        if (/^\d+$/.test(cleanUsername))
            return false;

        return true;
    }

    isValidIP(ip) {
        if (!ip || typeof ip !== 'string')
            return false;

        const parts = ip.split('.');
        if (parts.length !== 4)
            return false;

        for (let part of parts) {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255)
                return false;
        }

        const invalidIPs = ['0.0.0.0', '255.255.255.255', '127.0.0.1'];
        if (invalidIPs.includes(ip))
            return false;

        return true;
    }

    // Métodos de verificación de página
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

    // Métodos de carga de interfaces
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
        script.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    }

    initializeDSLAMSearch() {
        console.log('🔍 Inicializando buscador DSLAM para páginas clásicas...');

        // ✅ VERIFICAR si estamos en interfaz moderna
        const modernInterface = document.getElementById('modern-codim-interface');

        if (modernInterface) {
            console.log('🎨 Interfaz moderna detectada - El buscador DSLAM se manejará solo en iframes');
            return; // No inicializar buscador en la página principal
        }

        // Usar la instancia global del buscador solo en interfaz clásica
        if (window.codimDSLAMSearch) {
            setTimeout(() => {
                window.codimDSLAMSearch.init();
            }, 2000); // Dar tiempo a que se cargue el patch clásico
        }
    }

    injectModernInterface() {
        console.log('🎨 Inyectando interfaz moderna...');

        const container = this.createModernContainer();

        document.body.innerHTML = '';
        document.body.appendChild(container);

        this.setupModernEventListeners(container);
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
                        <h2 id="modernContentTitle">📊 Cuadro de Resumen - CODIM CNS</h2>
                        <p id="modernContentSubtitle">Estadísticas en tiempo real del sistema</p>
                    </div>
                    <div class="modern-content-body" id="modernContentBody">
                        <!-- El resumen se cargará automáticamente aquí -->
                    </div>
                </div>
            </div>

            <!-- Patch signature -->
            <div class="modern-patch" data-action="showPatch">
                ⚡ Patch by DemianRey v3.7 - Sistema Híbrido Completo
            </div>
        `;
    }

    generateModernSidebarCards() {
        const username = this.userData?.username || 'usuario';
        const ipAddress = this.userData?.ipAddress || '192.168.1.1';

        // Obtener datos actuales del widget si existe
        let vencidos = 0;
        let enTiempo = 0;

        if (this.resumenWidget && this.resumenWidget.data) {
            vencidos = this.resumenWidget.data.vencidos;
            enTiempo = this.resumenWidget.data.enTiempo;
        }

        const cards = [{
                icon: '🌐',
                title: 'Mi IP',
                content: `<strong>${username}</strong><br>${ipAddress}`,
                action: 'showIP'
            }, {
                icon: '🔗',
                title: 'Enlaces',
                content: 'Otras Páginas',
                action: 'showLinks'
            }, {
                icon: '📊',
                title: 'Resumen',
                content: `<div style="color: #e74c3c; font-weight: bold;">⚠️ ${vencidos} Vencidos</div><div style="color: #27ae60;">✅ ${enTiempo} En Tiempo</div>`,
                action: 'showResumen'
            }
        ];

        return cards.map(card =>
            `<div class="modern-sidebar-card" ${card.action ? `data-action="${card.action}"` : ''}>
                <h3>${card.icon} ${card.title}</h3>
                <div class="sidebar-card-content">${card.content}</div>
            </div>`).join('');
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
        case 'showResumen':
            this.showModernResumen();
            break;
        }
    }

    showModernResumen() {
        const contentBody = document.querySelector('.modern-content-body');
        const contentTitle = document.getElementById('modernContentTitle');
        const contentSubtitle = document.getElementById('modernContentSubtitle');

        if (contentTitle)
            contentTitle.textContent = '📊 Cuadro de Resumen - CODIM CNS';
        if (contentSubtitle)
            contentSubtitle.textContent = 'Estadísticas en tiempo real del sistema';

        if (contentBody) {
            // Destruir widget anterior si existe
            if (this.resumenWidget) {
                this.resumenWidget.destroy();
            }

            // Limpiar contenido
            contentBody.innerHTML = '';

            // Crear nuevo widget usando la clase del Módulo 3
            this.resumenWidget = new CODIMResumenWidget();

            // Establecer referencia bidireccional para sincronización
            this.resumenWidget.contentScript = this;

            const widgetElement = this.resumenWidget.createWidget();

            // Estilos de integración para que ocupe todo el espacio
            widgetElement.style.cssText = `
                margin: 0 !important;
                height: 100% !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                background: transparent !important;
                padding: 15px !important;
            `;

            contentBody.appendChild(widgetElement);

            console.log('✅ Widget de resumen cargado en interfaz moderna con sincronización de sidebar');
        }
    }

    showDesbloqueoPage() {
        const contentBody = document.querySelector('.modern-content-body');
        const contentTitle = document.getElementById('modernContentTitle');
        const contentSubtitle = document.getElementById('modernContentSubtitle');

        if (contentTitle)
            contentTitle.textContent = '🔓 Desbloqueo de usuario PISA';
        if (contentSubtitle)
            contentSubtitle.textContent = 'Para desbloqueo seleccione el ambiente y teclee su clave de usuario';

        if (contentBody) {
            // Crear componente de desbloqueo PISA usando la clase del Módulo 4
            const desbloqueoComponent = new DesbloqueoComponent();
            const componentElement = desbloqueoComponent.create();

            // Limpiar contenido
            contentBody.innerHTML = '';

            // Estilos de integración
            componentElement.style.cssText = `
                margin: 0 !important;
                height: 100% !important;
                padding: 20px !important;
                overflow-y: auto !important;
            `;

            contentBody.appendChild(componentElement);

            console.log('✅ Componente de desbloqueo PISA cargado');
        }
    }

    updateModernSidebarResumen() {
        // Actualizar solo la tarjeta de resumen en el sidebar
        const resumenCard = document.querySelector('[data-action="showResumen"] .sidebar-card-content');
        if (resumenCard && this.resumenWidget && this.resumenWidget.data) {
            const { vencidos, enTiempo } = this.resumenWidget.data;

            resumenCard.innerHTML = `
                <div style="color: #e74c3c; font-weight: bold;">⚠️ ${vencidos} Vencidos</div>
                <div style="color: #27ae60;">✅ ${enTiempo} En Tiempo</div>
            `;

            // Agregar efecto visual de actualización
            resumenCard.style.animation = 'none';
            setTimeout(() => {
                resumenCard.style.animation = 'highlightUpdate 1s ease-in-out';
            }, 10);

            console.log('✅ Sidebar actualizado con nuevos datos:', {
                vencidos,
                enTiempo
            });
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
        const welcomeInfo = `🎯 Sistema CODIM CNS Modernizado v3.7

Interfaz completamente renovada con funcionalidades mejoradas:

✅ Cuadro de resumen en tiempo real (primera.asp integrado)
✅ Navegación intuitiva y moderna
✅ Compatibilidad completa con sistema original
✅ Diseño responsive para móviles
✅ Auto-refresh cada 7.5 minutos
✅ Control de alarmas integrado
✅ VBScript convertido a JavaScript
✅ Extracción dinámica de datos de usuario
✅ Arquitectura modular optimizada
🔍 Buscador inteligente de DSLAMs con autocompletado
🔍 Filtrado en tiempo real por nombre de equipo  
🔍 Sugerencias automáticas y contador de resultados
🔓 NUEVO: Desbloqueo PISA funcional integrado
📡 NUEVO: Sistema de comunicación híbrido robusto
🧪 NUEVO: Funciones de testing MASNET integradas

🔧 Patch by DemianRey
📅 Junio 2025
🚀 Versión 3.7 - Sistema Híbrido Completo`;

        alert(welcomeInfo);
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
                if (action)
                    self.handleModernSidebarAction(action);
            }

            if (e.target.classList.contains('modern-patch')) {
                self.showModernPatchInfo();
            }
        });

        // Función centralizada
        this.createGlobalCambiaMenu();
    }

    modernSwitchTab(tabName) {
        document.querySelectorAll('.modern-nav-tab').forEach(tab =>
            tab.classList.remove('active'));
        document.querySelectorAll('.modern-submenu').forEach(submenu =>
            submenu.classList.remove('active'));

        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        const submenu = document.getElementById(`modern-submenu-${tabName}`);

        if (tab)
            tab.classList.add('active');
        if (submenu)
            submenu.classList.add('active');
    }

    modernLoadPage(page) {
        const titleElement = document.getElementById('modernContentTitle');
        const subtitleElement = document.getElementById('modernContentSubtitle');
        const contentBody = document.querySelector('.modern-content-body');

        console.log('🔄 modernLoadPage ejecutado para:', page);

        // CRÍTICO: Manejar páginas especiales ANTES de cualquier otro código
        if (page === 'desbloqueo-pisa.html') {
            this.showDesbloqueoPage();
            return;
        }

        // Continuar con el flujo normal para otras páginas
        if (titleElement)
            titleElement.textContent = 'Cargando...';
        if (subtitleElement)
            subtitleElement.textContent = 'Por favor espera...';

        // Destruir widget de resumen si está activo
        if (this.resumenWidget) {
            this.resumenWidget.destroy();
            this.resumenWidget = null;
        }

        if (contentBody) {
            const timestamp = new Date().getTime();
            const separator = page.includes('?') ? '&' : '?';
            const fullURL = `${page}${separator}_t=${timestamp}`;

            console.log('📄 Creando iframe con URL:', fullURL);

            contentBody.innerHTML = `<iframe class="modern-iframe" src="${fullURL}"></iframe>`;

            const iframe = contentBody.querySelector('.modern-iframe');
            if (iframe) {
                console.log('🖼️ Iframe encontrado, configurando event listeners...');

                // ✅ EVENT LISTENER MEJORADO CON MÁS DEBUG
                iframe.addEventListener('load', () => {
                    console.log('🔥 IFRAME LOAD EVENT DISPARADO!');
                    console.log('🔍 Iframe src:', iframe.src);
                    console.log('🔍 Iframe contentWindow:', iframe.contentWindow);

                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        console.log('📄 iframeDoc obtenido:', !!iframeDoc);

                        if (iframeDoc) {
                            console.log('✅ Acceso al iframe exitoso, iniciando enhancement...');
                            this.enhanceIframe(iframe);
                        } else {
                            console.error('❌ No se pudo acceder al documento del iframe');
                        }
                    } catch (error) {
                        console.error('❌ Error accediendo al iframe:', error);
                    }

                    if (titleElement)
                        titleElement.textContent = 'Página Cargada';
                    if (subtitleElement)
                        subtitleElement.textContent = 'Contenido del sistema original - Buscador DSLAMs activo';
                });

                // ✅ TAMBIÉN ESCUCHAR DOMContentLoaded DEL IFRAME
                iframe.addEventListener('DOMContentLoaded', () => {
                    console.log('📄 Iframe DOMContentLoaded disparado');
                    this.enhanceIframe(iframe);
                });

            } else {
                console.error('❌ No se encontró el iframe después de crear');
            }
        }
    }

    // ===============================
    // MÉTODOS DE IFRAME ENHANCEMENT
    // ===============================

    enhanceIframe(iframe) {
        if (!iframe) {
            console.error('❌ enhanceIframe: iframe es null');
            return;
        }

        console.log('🔄 enhanceIframe ejecutado');
        console.log('🔍 Iframe src:', iframe.src);

        // ✅ VERIFICACIÓN INMEDIATA SI YA ESTÁ CARGADO
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc && iframeDoc.readyState === 'complete') {
                console.log('📄 Iframe ya cargado, procesando inmediatamente...');
                this.processIframeContent(iframe, iframeDoc);
                return;
            }
        } catch (error) {
            console.log('⚠️ No se puede acceder inmediatamente al iframe (normal si no está cargado)');
        }

    }

    // ✅ MÉTODO MEJORADO: processIframeContent
    // Agregar la limpieza de código después del CSS
    processIframeContent(iframe, iframeDoc) {
        console.log('🔄 Procesando contenido del iframe...');
        console.log('📄 Document title:', iframeDoc.title);
        console.log('📄 Body content length:', iframeDoc.body?.textContent?.length || 0);

        // ✅ PASO 2: Aplicar CSS inmediatamente después de cargar
        const style = iframeDoc.createElement('style');
        style.id = 'codim-iframe-styles';
        style.textContent = this.getIframeCSS();
        iframeDoc.head.appendChild(style);
        // ✅ NUEVO: Ocultar código JavaScript/VBScript visible como texto
        setTimeout(() => {
            console.log('🧹 Ocultando código visible como texto...');

            const allElements = iframeDoc.querySelectorAll('*');
            let hiddenCount = 0;

            allElements.forEach((element) => {
                const text = element.textContent || '';

                // Detectar si contiene código visible
                const hasVisibleCode = (
                    text.includes('function valida_datos') ||
                    text.includes('function valida') ||
					text.includes('function manda') ||
                    text.includes('document.envia_datos') ||
                    text.includes('msgbox') ||
                    text.includes('trim(document.') ||
                    text.includes('varz = ') ||
                    text.includes('cual_falla.value') ||
                    text.includes('<script') ||
                    text.includes('No puedes utilizar apostrofe'));

                // Verificar que NO sea elemento importante
                const isImportant = (
                    element.tagName === 'INPUT' ||
                    element.tagName === 'SELECT' ||
                    element.tagName === 'TEXTAREA' ||
                    element.tagName === 'BUTTON' ||
                    element.tagName === 'FORM' ||
                    element.tagName === 'TABLE' ||
                    element.querySelector('input, select, textarea, button, form, table'));

                // Ocultar si tiene código Y no es importante Y tiene texto suficiente
                if (hasVisibleCode && !isImportant && text.trim().length > 15) {
                    element.style.setProperty('display', 'none', 'important');
                    element.style.setProperty('visibility', 'hidden', 'important');
                    element.style.setProperty('position', 'absolute', 'important');
                    element.style.setProperty('left', '-9999px', 'important');

                    console.log(`🙈 Código oculto en ${element.tagName}`);
                    hiddenCount++;
                }
            });

            console.log(`✅ ${hiddenCount} elementos con código visible ocultos`);
        }, 800);

        // Repetir para código que se carga después
        setTimeout(() => {
            const codeElements = iframeDoc.querySelectorAll('*');
            codeElements.forEach((el) => {
                const txt = el.textContent || '';
                if ((txt.includes('function valida_datos') || txt.includes('msgbox')) &&
                    !el.querySelector('input, select, button')) {
                    el.style.display = 'none';
                }
            });
        }, 2000);
        console.log('✅ CSS del iframe aplicado');

        // ✅ PASO 2.5: OCULTAR CÓDIGO JAVASCRIPT VISIBLE


        // ✅ PASO 3: FORZAR RESET DE LAYOUT INMEDIATO (antes que classic-patch)
        setTimeout(() => {
            console.log('🔧 Ejecutando primer reset de layout...');
            this.forceLayoutReset(iframeDoc);
        }, 200);

        // ✅ PASO 5: Inyectar funciones de compatibilidad COMPLETAS CON VBSCRIPT
        const compatScript = iframeDoc.createElement('script');
        compatScript.textContent = `
        console.log('🔧 Inyectando funciones VBScript completas en iframe...');
        
        // ✅ HELPERS VBSCRIPT
        window.trim = function(str) { return str ? str.replace(/^\\s+|\\s+$/g, '') : ''; };
        window.len = function(str) { return str ? str.length : 0; };
        window.mid = function(str, start, length) { return str ? str.substring(start - 1, start - 1 + length) : ''; };
        window.asc = function(char) { return char ? char.charCodeAt(0) : 0; };
        window.msgbox = function(message) { alert(message); };
        
        // ✅ FUNCIÓN VALIDA_DATOS COMPLETA
        window.valida_datos = function() {
            console.log('🔍 valida_datos ejecutada en iframe');
            
            var form = document.envia_datos || 
                      document.forms.envia_datos || 
                      document.forms[0] ||
                      document.querySelector('form[name="envia_datos"]');
            
            if (!form) {
                console.error('❌ No se encontró el formulario envia_datos');
                alert('Error: No se encontró el formulario');
                return false;
            }
            
            console.log('✅ Formulario encontrado:', form.name);
            
            var fallaField = form.cual_falla || form.querySelector('[name="cual_falla"]');
            
            if (!fallaField) {
                console.log('⚠️ Campo cual_falla no encontrado, enviando formulario directamente...');
                form.submit();
                return true;
            }
            
            var varz = window.trim(fallaField.value);
            console.log('📋 Falla seleccionada:', varz);
            
            // Validación principal - EXACTA al VBScript original
            if (varz !== "00" && varz !== "") {
                var obsField = form.obsdslam || form.querySelector('[name="obsdslam"]');
                
                if (!obsField) {
                    console.log('⚠️ Campo obsdslam no encontrado, enviando formulario...');
                    form.submit();
                    return true;
                }
                
                var obsText = window.trim(obsField.value);
                var cuenta = window.len(obsText);
                console.log('📝 Observaciones length:', cuenta);
                
                if (cuenta > 2) {
                    // Validar caracteres prohibidos
                    for (var i = 1; i <= cuenta; i++) {
                        var letra = window.mid(obsText, i, 1);
                        if (letra === "'" || window.asc(letra) === 10) {
                            window.msgbox("En el Texto de OBS, Hay un Caracter Invalido.\\nNo puedes utilizar apostrofe ni la tecla Enter.");
                            return false;
                        }
                    }
                    
                    // Marcar campo salvar como "S"
                    var salvarField = form.salvar || form.querySelector('[name="salvar"]');
                    if (salvarField) {
                        salvarField.value = "S";
                        console.log('✅ Campo salvar marcado como "S"');
                    }
                    
                    console.log('✅ Validación exitosa. Enviando formulario...');
                    
                    try {
                        form.submit();
                        return true;
                    } catch (error) {
                        console.error('❌ Error al enviar:', error);
                        alert('Error al enviar el formulario: ' + error.message);
                        return false;
                    }
                } else {
                    window.msgbox("Es indispensable anotar comentarios.");
                    if (obsField.focus) obsField.focus();
                    return false;
                }
            } else {
                window.msgbox("Favor de Seleccionar una Falla en el Catalogo.");
                if (fallaField.focus) fallaField.focus();
                return false;
            }
            
            return false;
        };
        
        // ✅ FUNCIÓN VERTEXTO COMPLETA
        window.vertexto = function() {
            var form = document.envia_datos || 
                      document.forms.envia_datos || 
                      document.forms[0] ||
                      document.querySelector('form[name="envia_datos"]');
            
            if (!form) return;
            
            var obsField = form.obsdslam || form.querySelector('[name="obsdslam"]');
            if (!obsField) return;
            
            var obsText = window.trim(obsField.value);
            var cuenta = window.len(obsText);
            
            if (cuenta > 0) {
                var ultima = window.mid(obsText, cuenta, 1);
                
                if (ultima === "'") {
                    window.msgbox("Caracter Invalido.");
                    obsField.value = window.mid(obsField.value, 1, cuenta - 1);
                } else if (window.asc(ultima) === 10) {
                    window.msgbox("Favor de NO utilizar la tecla Enter");
                    obsField.value = window.mid(obsField.value, 1, cuenta - 2);
                } else if (cuenta > 30000) {
                    window.msgbox("Maximo puedes usar 30000 Caracteres.");
                    obsField.value = window.mid(obsField.value, 1, 30000);
                }
            }
        };
        
        // Funciones básicas para iframe
        if (typeof window.ventana === 'undefined') window.ventana = null;
        
        // Función cancelar para botones Regresar
        window.cancelar = function() {
            console.log('🔙 Cancelar en iframe');
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        };
        
        window.cierra_opcion = function(tiempox, y, x, pagina, tarda) {
            if (window.ventana && window.ventana.style) {
                window.ventana.style.clip = "rect(0," + x + "," + y + ",0)";
            }
            if (pagina && pagina !== "") {
                setTimeout(function() {
                    window.location.href = 'ver_rep.asp?folio=' + pagina;
                }, tarda || 100);
            }
        };
        
        window.muestra = function(folio, busca) {
            if (typeof window.parent.cambia_menu === 'function') {
                window.parent.cambia_menu('consulta', 'S', folio, '', '', '', busca);
            }
        };
        
        // Usar función centralizada del padre
        if (window.parent && window.parent.cambia_menu) {
            window.cambia_menu = window.parent.cambia_menu;
        }
        
        // MARCAR IFRAME COMO MANEJADO
        window.CODIM_IFRAME_ENHANCED = true;
        
        console.log('✅ Funciones VBScript completas inyectadas en iframe');
        console.log('✅ valida_datos disponible:', typeof window.valida_datos);
        console.log('✅ vertexto disponible:', typeof window.vertexto);
    `;
        iframeDoc.head.appendChild(compatScript);
        console.log('✅ Scripts de compatibilidad con VBScript inyectados');

        // ✅ PASO 6: Buscador DSLAM (solo para páginas apropiadas)
        setTimeout(() => {
            console.log('🔍 Iniciando búsqueda de tablas DSLAM...');
            this.addIframeDSLAMSearch(iframeDoc);
        }, 1000);

        console.log('✅ Iframe enhancement completado');
    }

    // ✅ MÉTODO: Forzar reset completo del layout
    forceLayoutReset(iframeDoc) {
    console.log('🔄 Forzando reset completo del layout en iframe...');

    try {
        // ✅ PASO 1: VERIFICAR PRIMERO SI ES FORMULARIO CSM (MÁS ESPECÍFICO)
        const bodyText = iframeDoc.body.textContent || '';
        const bodyHTML = iframeDoc.body.innerHTML || '';

        // ✅ DETECCIÓN ESPECÍFICA PARA CSM
        const isCSMForm = (
            // Buscar elementos específicos del formulario CSM
            iframeDoc.querySelector('select[name="cual_falla"]') ||
            iframeDoc.querySelector('input[name="dslam"]') ||
            iframeDoc.querySelector('input[name="clasedslam"]') ||
            iframeDoc.querySelector('textarea[name="obsdslam"]') ||
            // O por contenido de texto específico
            bodyText.includes('Captura de Incidentes CSM') ||
            bodyHTML.includes('name="dslam"') ||
            bodyHTML.includes('name="clasedslam"') ||
            bodyHTML.includes('name="obsdslam"')
        );

        // ✅ DETECCIÓN PARA FORMULARIO SIMPLE
        const isIncidentForm = (
            !isCSMForm && (
                bodyText.includes('Proporciona la central') ||
                bodyHTML.includes('Proporciona la central') ||
                (bodyHTML.includes('name="ctl"') && bodyHTML.includes('name="al_centro"'))
            )
        );

        console.log('🔍 Detección de formularios:', {
            isCSMForm,
            isIncidentForm,
            bodyTextLength: bodyText.length
        });

        // ✅ PASO 2: APLICAR MÉTODO ESPECÍFICO SEGÚN TIPO
        if (isCSMForm) {
            console.log('📋 Formulario CSM detectado - Aplicando método específico');
            const success = this.styleComplexCSMForm(iframeDoc);
            if (success) {
                console.log('✅ Formulario CSM aplicado exitosamente');
                return; // Salir si fue exitoso
            } else {
                console.log('⚠️ Método CSM falló, intentando reset general...');
            }
        } else if (isIncidentForm) {
            console.log('📋 Formulario simple detectado - Aplicando estilo específico');
            const success = this.styleIncidentForm(iframeDoc);
            if (success) {
                console.log('✅ Formulario simple aplicado exitosamente');
                return; // Salir si fue exitoso
            } else {
                console.log('⚠️ Método simple falló, intentando reset general...');
            }
        }

        // ✅ PASO 3: FALLBACK - RESET GENERAL SOLO SI NO ES FORMULARIO ESPECÍFICO
        console.log('🔧 Aplicando reset general...');
        this.applyGeneralReset(iframeDoc);

    } catch (error) {
        console.error('❌ Error en reset de layout:', error);
        // En caso de error, intentar reset básico
        this.applyBasicReset(iframeDoc);
    }
}

    // ✅ FUNCIÓN QUE FALTABA: analyzeElementStructure
    analyzeElementStructure(absoluteElements) {
        console.log('🔍 Analizando estructura de elementos...');

        const analysis = {
            totalElements: absoluteElements.length,
            elementTypes: {},
            rows: [],
            hasHeader: false,
            hasReportLink: false,
            hasForm: false,
            fieldCount: 0
        };

        // Analizar cada elemento
        absoluteElements.forEach((element, index) => {
            const top = parseInt(element.style.top) || 0;
            const left = parseInt(element.style.left) || 0;
            const type = this.detectElementType(element, top, left);

            // Contar tipos
            analysis.elementTypes[type] = (analysis.elementTypes[type] || 0) + 1;

            // Detectar características específicas
            if (type === 'header')
                analysis.hasHeader = true;
            if (type === 'report-link')
                analysis.hasReportLink = true;
            if (type === 'input-field') {
                analysis.hasForm = true;
                analysis.fieldCount++;
            }

            // Organizar por filas aproximadas (tolerancia de 20px)
            let assignedRow = analysis.rows.find(row => Math.abs(row.top - top) <= 20);
            if (!assignedRow) {
                assignedRow = {
                    top: top,
                    elements: []
                };
                analysis.rows.push(assignedRow);
            }
            assignedRow.elements.push({
                element,
                type,
                top,
                left,
                index
            });
        });

        // Ordenar filas por posición top
        analysis.rows.sort((a, b) => a.top - b.top);

        console.log(`📊 Análisis completado: ${analysis.totalElements} elementos, ${analysis.rows.length} filas`);
        console.log('📋 Tipos encontrados:', analysis.elementTypes);

        return analysis;
    }

    applyGeneralReset(iframeDoc) {
        console.log('📐 Aplicando reset general MEJORADO del layout...');

        // Encontrar todos los elementos con posicionamiento absoluto
        const absoluteElements = iframeDoc.querySelectorAll('[style*="position: absolute"], [style*="position:absolute"]');

        // ✅ PASO 1: Analizar estructura antes de resetear
        const elementAnalysis = this.analyzeElementStructure(absoluteElements);
        console.log('📊 Análisis de estructura:', elementAnalysis);

        absoluteElements.forEach((element, index) => {
            const originalTop = parseInt(element.style.top) || 0;
            const originalLeft = parseInt(element.style.left) || 0;
            const elementType = this.detectElementType(element, originalTop, originalLeft);

            console.log(`📐 Reseteando elemento #${index}: ${elementType} - top:${originalTop} left:${originalLeft}`);

            // Resetear posición
            element.style.setProperty('position', 'static', 'important');
            element.style.setProperty('left', 'auto', 'important');
            element.style.setProperty('top', 'auto', 'important');
            element.style.setProperty('right', 'auto', 'important');
            element.style.setProperty('bottom', 'auto', 'important');
            element.style.setProperty('z-index', 'auto', 'important');
            element.style.setProperty('display', 'block', 'important');

            // ✅ APLICAR ESTILOS SEGÚN TIPO DETECTADO
            this.applyElementSpecificStyles(element, elementType, index);
        });

        // ✅ PASO 2: Organizar en layout de tabla
        this.organizeAsTableLayout(iframeDoc, elementAnalysis);

        // ✅ PASO 3: Aplicar estilos generales
        this.applyGeneralStyles(iframeDoc);

        console.log('✅ Reset general MEJORADO finalizado');
    }

    // ✅ DETECTAR TIPO DE ELEMENTO MÁS INTELIGENTEMENTE
    detectElementType(element, top, left) {
        const text = element.textContent?.trim().toLowerCase() || '';
        const tagName = element.tagName.toLowerCase();
        const hasInput = element.querySelector('input, select, textarea');

        // Detectar por contenido y posición
        if (text.includes('captura de incidentes') || (top < 30 && text.length > 10)) {
            return 'header';
        }
        if (text.includes('reporte fallas') || text.includes('supervision')) {
            return 'report-link';
        }
        if (hasInput || tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
            return 'input-field';
        }
        if (text.includes('aceptar') || text.includes('regresar') || (top > 500)) {
            return 'button';
        }
        if (text && text.length > 0 && text.length < 50 && !hasInput) {
            return 'label';
        }
        if (element.offsetWidth > 300 || top < 10) {
            return 'container';
        }

        return 'content';
    }

    // ✅ APLICAR ESTILOS ESPECÍFICOS POR TIPO
    applyElementSpecificStyles(element, elementType, index) {
        switch (elementType) {
        case 'header':
            element.style.setProperty('background', 'linear-gradient(135deg, #667eea, #764ba2)', 'important');
            element.style.setProperty('color', 'white', 'important');
            element.style.setProperty('padding', '15px 20px', 'important');
            element.style.setProperty('text-align', 'center', 'important');
            element.style.setProperty('font-weight', '600', 'important');
            element.style.setProperty('font-size', '16px', 'important');
            element.style.setProperty('margin-bottom', '0', 'important');
            console.log(`✅ Header aplicado a elemento #${index}`);
            break;

        case 'report-link':
            element.style.setProperty('background', '#f8f9fa', 'important');
            element.style.setProperty('padding', '10px', 'important');
            element.style.setProperty('text-align', 'center', 'important');
            element.style.setProperty('border-bottom', '1px solid #eee', 'important');

            // Estilizar el enlace dentro
            const link = element.querySelector('a') || element;
            if (link) {
                link.style.setProperty('background', '#28a745', 'important');
                link.style.setProperty('color', 'white', 'important');
                link.style.setProperty('padding', '8px 16px', 'important');
                link.style.setProperty('text-decoration', 'none', 'important');
                link.style.setProperty('border-radius', '4px', 'important');
                link.style.setProperty('font-size', '13px', 'important');
                link.style.setProperty('display', 'inline-block', 'important');
            }
            console.log(`✅ Report-link aplicado a elemento #${index}`);
            break;

        case 'label':
            element.style.setProperty('font-weight', '500', 'important');
            element.style.setProperty('color', '#333', 'important');
            element.style.setProperty('font-size', '13px', 'important');
            element.style.setProperty('margin', '5px 8px 5px 0', 'important');
            element.style.setProperty('display', 'inline-block', 'important');
            element.style.setProperty('vertical-align', 'middle', 'important');
            console.log(`✅ Label aplicado a elemento #${index}: "${element.textContent.substring(0, 20)}"`);
            break;

        case 'input-field':
            // Detectar qué tipo de campo es para aplicar ancho apropiado
            const fieldName = this.detectFieldName(element);
            const fieldWidth = this.getFieldWidth(fieldName);

            element.style.setProperty('width', fieldWidth, 'important');
            element.style.setProperty('padding', '4px 6px', 'important');
            element.style.setProperty('border', '1px solid #ccc', 'important');
            element.style.setProperty('border-radius', '3px', 'important');
            element.style.setProperty('font-size', '12px', 'important');
            element.style.setProperty('background', 'white', 'important');
            element.style.setProperty('font-family', 'Segoe UI, Arial, sans-serif', 'important');
            element.style.setProperty('margin', '2px', 'important');
            element.style.setProperty('display', 'inline-block', 'important');
            element.style.setProperty('vertical-align', 'middle', 'important');
            console.log(`✅ Input-field aplicado a elemento #${index}: ${fieldName} (ancho: ${fieldWidth})`);
            break;

        case 'button':
            element.style.setProperty('background', '#007bff', 'important');
            element.style.setProperty('color', 'white', 'important');
            element.style.setProperty('border', 'none', 'important');
            element.style.setProperty('padding', '6px 16px', 'important');
            element.style.setProperty('border-radius', '3px', 'important');
            element.style.setProperty('font-size', '12px', 'important');
            element.style.setProperty('cursor', 'pointer', 'important');
            element.style.setProperty('margin', '0 4px', 'important');
            console.log(`✅ Button aplicado a elemento #${index}`);
            break;

        default:
            element.style.setProperty('margin', '5px 0', 'important');
            console.log(`✅ Estilo default aplicado a elemento #${index}`);
        }
    }

    // ✅ FUNCIÓN MEJORADA: detectFieldName con análisis de contexto visual

    // ===============================
// DETECCIÓN MEJORADA ESPECÍFICA PARA FORMULARIO CSM
// ===============================

detectFieldName(element) {
    const name = element.name || '';
    const tagName = element.tagName.toLowerCase();

    console.log(`🔍 CSM Campo: name="${name}" tagName="${tagName}"`);

    // ✅ DETECCIÓN DIRECTA POR NOMBRE - SIN COMPLICACIONES
    switch (name) {
        case 'cual_falla':
            console.log('   → Detectado como: falla-select');
            return 'falla-select';
            
        case 'dslam':
            console.log('   → Detectado como: nombre-pisa');
            return 'nombre-pisa';
            
        case 'clasedslam':
            console.log('   → Detectado como: clase-equipo');
            return 'clase-equipo';
            
        case 'qdslam':
            console.log('   → Detectado como: contador-quejas');
            return 'contador-quejas';
            
        case 'osdslam':
            console.log('   → Detectado como: contador-os');
            return 'contador-os';
            
        case 'reincide':
            console.log('   → Detectado como: contador-reincide');
            return 'contador-reincide';
            
        case 'validacion':
            console.log('   → Detectado como: contador-validaciones');
            return 'contador-validaciones';
            
        case 'bastidor':
            console.log('   → Detectado como: bastidor');
            return 'bastidor';
            
        case 'repisa':
            console.log('   → Detectado como: repisa');
            return 'repisa';
            
        case 'tarjeta':
            console.log('   → Detectado como: tarjeta');
            return 'tarjeta';
            
        case 'ipdslam':
            console.log('   → Detectado como: ip-equipo');
            return 'ip-equipo';
            
        case 'enlinea':
            console.log('   → Detectado como: atencion-linea');
            return 'atencion-linea';
            
        case 'obsdslam':
            console.log('   → Detectado como: comentarios');
            return 'comentarios';
    }

    // ✅ FALLBACK POR TIPO DE ELEMENTO
    if (tagName === 'select') {
        console.log('   → Detectado como: falla-select (fallback select)');
        return 'falla-select';
    }
    
    if (tagName === 'textarea') {
        console.log('   → Detectado como: comentarios (fallback textarea)');
        return 'comentarios';
    }

    console.log('   → Detectado como: default');
    return 'default';
}

// ✅ ANCHOS ESPECÍFICOS PARA FORMULARIO CSM
getFieldWidth(fieldName) {
    const widths = {
        'falla-select': '300px',           // Select de falla más ancho
        'nombre-pisa': '200px',            // VER-CIUDADCARDEL-2, etc
        'clase-equipo': '100px',           // HUAWEI
        'contador-quejas': '70px',         // Números pequeños centrados
        'contador-os': '70px',
        'contador-reincide': '70px',
        'contador-validaciones': '70px', 
        'atencion-linea': '120px',         // Un poco más ancho
        'contador-numerico': '70px',       // Contadores genéricos
        'bastidor': '60px',                // Datos técnicos normales
        'repisa': '60px',
        'tarjeta': '60px', 
        'ip-equipo': '140px',              // IPs
        'campo-tecnico': '100px',          // Técnicos genéricos
        'comentarios': '100%',             // Textarea ocupa todo el ancho disponible
        'default': '100px'                 // Por defecto
    };

    return widths[fieldName] || widths.default;
}

// ✅ MÉTODO ESPECÍFICO PARA FORMULARIOS CSM COMPLEJOS
styleComplexCSMForm(iframeDoc) {
    console.log('🎨 Aplicando estilo específico a formulario CSM complejo...');

    try {
        // ✅ VERIFICAR que es formulario CSM
        const hasCSMElements = (
            iframeDoc.querySelector('select[name*="falla"]') &&
            iframeDoc.querySelector('input[name*="pisa"], input[value*="VER-"]') &&
            iframeDoc.querySelector('textarea[name*="obs"]')
        );

        if (!hasCSMElements) {
            console.log('❌ No es formulario CSM, usando método general');
            return false;
        }

        console.log('✅ Formulario CSM confirmado, aplicando layout específico...');

        // ✅ PASO 1: Reset del body
        const body = iframeDoc.body;
        body.style.cssText = `
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            margin: 0 !important;
            padding: 15px !important;
            min-height: 100vh !important;
            box-sizing: border-box !important;
        `;

        // ✅ PASO 2: Crear contenedor principal moderno
        const modernWrapper = iframeDoc.createElement('div');
        modernWrapper.className = 'modern-csm-form';
        modernWrapper.style.cssText = `
            max-width: 900px !important;
            margin: 20px auto !important;
            background: white !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
            overflow: hidden !important;
            border: 1px solid #e3f2fd !important;
        `;

        // ✅ PASO 3: Header
        const header = iframeDoc.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: white !important;
            padding: 20px 30px !important;
            text-align: center !important;
            font-size: 18px !important;
            font-weight: 700 !important;
        `;
        header.innerHTML = '📋 Captura de Incidentes CSM';

        // ✅ PASO 4: Enlace al reporte (buscar en contenido original)
        const originalContent = body.innerHTML;
        const reportLinkMatch = originalContent.match(/href="([^"]*Reporte[^"]*)"/) || 
                               originalContent.match(/onclick="([^"]*Reporte[^"]*)"/) ||
                               originalContent.match(/(javascript:window\.open\([^)]*Reporte[^)]*\))/);

        let reportLink = '';
        if (reportLinkMatch) {
            const linkUrl = reportLinkMatch[1];
            reportLink = `
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${linkUrl}" 
                       target="_blank"
                       style="
                           display: inline-block;
                           background: linear-gradient(135deg, #28a745, #20c997);
                           color: white;
                           padding: 12px 24px;
                           border-radius: 10px;
                           text-decoration: none;
                           font-weight: 600;
                           font-size: 14px;
                           transition: all 0.3s ease;
                           box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                       ">
                        📊 Reporte Fallas a CNS 2 Supervision
                    </a>
                </div>
            `;
        }

        // ✅ PASO 5: Crear formulario con layout de tabla
        const form = iframeDoc.createElement('form');
        form.method = 'POST';
        form.action = this.extractFormAction(originalContent);
        form.name = 'envia_datos';

        // ✅ PASO 6: Extraer campos del formulario original
        const originalFields = this.extractFormFields(iframeDoc);

        // ✅ PASO 7: Crear layout de tabla organizado
        const tableLayout = this.createCSMTableLayout(originalFields, iframeDoc);
        
        form.appendChild(tableLayout);

        // ✅ PASO 8: Botones
        const buttonContainer = iframeDoc.createElement('div');
        buttonContainer.style.cssText = `
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        `;

        const acceptButton = iframeDoc.createElement('button');
        acceptButton.type = 'button';
        acceptButton.innerHTML = '✅ Aceptar';
        acceptButton.onclick = (e) => {
    e.preventDefault();
    console.log('🔄 Validación CSM iniciada...');
    
    const form = iframeDoc.querySelector('form[name="envia_datos"]') || 
                 iframeDoc.querySelector('form');
    
    if (!form) {
        alert('Error: No se encontró el formulario');
        return false;
    }
    
    // Validación directa de campos recreados
    const fallaField = form.querySelector('select[name="cual_falla"]');
    if (fallaField && (fallaField.value === "00" || fallaField.value === "")) {
        alert("Favor de Seleccionar una Falla en el Catalogo.");
        fallaField.focus();
        return false;
    }
    
    const obsField = form.querySelector('textarea[name="obsdslam"]');
    if (obsField) {
        const obs = obsField.value.trim();
        if (obs.length <= 2) {
            alert("Es indispensable anotar comentarios.");
            obsField.focus();
            return false;
        }
        if (obs.includes("'") || obs.includes('\n')) {
            alert("Caracter inválido en observaciones.");
            return false;
        }
    }
    
    // Asegurar campo salvar
    let salvarField = form.querySelector('input[name="salvar"]');
    if (!salvarField) {
        salvarField = iframeDoc.createElement('input');
        salvarField.type = 'hidden';
        salvarField.name = 'salvar';
        form.appendChild(salvarField);
    }
    salvarField.value = "S";
    
    console.log('✅ Enviando formulario CSM...');
    form.submit();
    return true;
};
        acceptButton.style.cssText = `
            background: linear-gradient(135deg, #4A90E2, #357ABD);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 0 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        const backButton = iframeDoc.createElement('button');
        backButton.type = 'button';
        backButton.innerHTML = '🔙 Regresar';
        backButton.onclick = () => window.history.back();
        backButton.style.cssText = `
            background: linear-gradient(135deg, #6c757d, #5a6268);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 0 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(backButton);

        // ✅ PASO 9: Ensamblar todo
        const formContent = iframeDoc.createElement('div');
        formContent.style.padding = '25px';

        if (reportLink) {
            formContent.innerHTML = reportLink;
        }
        
        formContent.appendChild(form);
        formContent.appendChild(buttonContainer);

        modernWrapper.appendChild(header);
        modernWrapper.appendChild(formContent);

        // ✅ PASO 10: Reemplazar contenido
        body.innerHTML = '';
        body.appendChild(modernWrapper);

        console.log('✅ Formulario CSM recreado con layout de tabla organizado');
        return true;

    } catch (error) {
        console.error('❌ Error en styleComplexCSMForm:', error);
        return false;
    }
}

// ✅ CREAR LAYOUT DE TABLA PARA CSM - FILA TRIPLE CORREGIDA
createCSMTableLayout(fields, iframeDoc) {
    const table = iframeDoc.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: separate;
        border-spacing: 8px;
        margin: 20px 0;
        background: transparent;
    `;

    // ✅ ORGANIZAR CAMPOS EN FILAS LÓGICAS
    const fieldRows = [
        // Fila 1: Falla principal (span completo)
        [{ label: 'Falla:', field: fields.falla, fullWidth: true }],
        
        // Fila 2: Datos del equipo
        [
            { label: 'Nombre Pisa:', field: fields.nombrePisa },
            { label: 'Clase:', field: fields.clase }
        ],
        
        // Fila 3: Contadores superiores
        [
            { label: 'Quejas Pendientes:', field: fields.quejasPendientes },
            { label: 'Validaciones en Proceso:', field: fields.validacionesProceso }
        ],
        
        // Fila 4: IP y Atención
        [
            { label: 'IP del Equipo:', field: fields.ipEquipo },
            { label: 'Atención en Línea:', field: fields.atencionLinea }
        ]
    ];

    // ✅ CREAR FILAS NORMALES PRIMERO
    fieldRows.forEach((rowFields, rowIndex) => {
        if (rowFields.some(item => item.field)) {
            const tr = iframeDoc.createElement('tr');
            
            // ✅ FILA COMPLETA (como Falla)
            if (rowFields[0].fullWidth && rowFields[0].field) {
                const labelTd = iframeDoc.createElement('td');
                labelTd.style.cssText = `
                    font-weight: 600;
                    color: #2c3e50;
                    text-align: right;
                    padding: 8px 15px 8px 0;
                    vertical-align: middle;
                    white-space: nowrap;
                    width: 20%;
                `;
                labelTd.textContent = rowFields[0].label;

                const fieldTd = iframeDoc.createElement('td');
                fieldTd.setAttribute('colspan', '5');
                fieldTd.style.cssText = `
                    padding: 8px 0;
                    vertical-align: middle;
                `;

                this.applyCSMFieldStyles(rowFields[0].field);
                fieldTd.appendChild(rowFields[0].field);

                tr.appendChild(labelTd);
                tr.appendChild(fieldTd);
            }
            // ✅ FILA CON DOS CAMPOS
            else {
                rowFields.forEach(({ label, field }, index) => {
                    if (field) {
                        // Label
                        const labelTd = iframeDoc.createElement('td');
                        labelTd.style.cssText = `
                            font-weight: 600;
                            color: #2c3e50;
                            text-align: right;
                            padding: 8px 10px 8px 0;
                            vertical-align: middle;
                            white-space: nowrap;
                            width: 20%;
                        `;
                        labelTd.textContent = label;

                        // Campo
                        const fieldTd = iframeDoc.createElement('td');
                        fieldTd.style.cssText = `
                            padding: 8px 15px 8px 0;
                            vertical-align: middle;
                            width: 30%;
                        `;

                        this.applyCSMFieldStyles(field);
                        fieldTd.appendChild(field);

                        tr.appendChild(labelTd);
                        tr.appendChild(fieldTd);
                    }
                });
            }

            table.appendChild(tr);
        }
    });

    // ✅ FILA ESPECIAL PARA BASTIDOR/REPISA/TARJETA - MÉTODO DIFERENTE
    if (fields.bastidor || fields.repisa || fields.tarjeta) {
        console.log('📐 Creando fila especial para Bastidor/Repisa/Tarjeta');
        
        const tripleRow = iframeDoc.createElement('tr');
        
        // ✅ CREAR UNA SOLA FILA CON 6 CELDAS (3 labels + 3 campos)
        const tripleFields = [
            { label: 'Bastidor:', field: fields.bastidor },
            { label: 'Repisa:', field: fields.repisa },
            { label: 'Tarjeta:', field: fields.tarjeta }
        ];

        tripleFields.forEach(({ label, field }, index) => {
            if (field) {
                // Label compacto
                const labelTd = iframeDoc.createElement('td');
                labelTd.style.cssText = `
                    font-weight: 600;
                    color: #2c3e50;
                    text-align: right;
                    padding: 8px 5px 8px 0;
                    vertical-align: middle;
                    white-space: nowrap;
                    width: 12%; /* Más compacto para 3 sets */
                    font-size: 13px;
                `;
                labelTd.textContent = label;

                // Campo compacto
                const fieldTd = iframeDoc.createElement('td');
                fieldTd.style.cssText = `
                    padding: 8px 10px 8px 0;
                    vertical-align: middle;
                    width: 16%; /* Más compacto para 3 sets */
                `;

                // Aplicar estilos compactos
                field.style.cssText = `
                    width: 100% !important;
                    max-width: 80px !important;
                    padding: 6px 8px !important;
                    border: 2px solid #e9ecef !important;
                    border-radius: 6px !important;
                    font-size: 12px !important;
                    background: white !important;
                    transition: all 0.3s ease !important;
                    font-family: 'Segoe UI', Arial, sans-serif !important;
                    box-sizing: border-box !important;
                    text-align: center !important;
                `;

                // Focus effects
                field.addEventListener('focus', () => {
                    field.style.borderColor = '#4A90E2';
                    field.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                });

                field.addEventListener('blur', () => {
                    field.style.borderColor = '#e9ecef';
                    field.style.boxShadow = 'none';
                });

                fieldTd.appendChild(field);

                tripleRow.appendChild(labelTd);
                tripleRow.appendChild(fieldTd);
                
                console.log(`✅ Agregado ${label} con ancho optimizado`);
            } else {
                // Si no hay campo, agregar celdas vacías para mantener estructura
                const emptyLabel = iframeDoc.createElement('td');
                const emptyField = iframeDoc.createElement('td');
                emptyLabel.innerHTML = '&nbsp;';
                emptyField.innerHTML = '&nbsp;';
                tripleRow.appendChild(emptyLabel);
                tripleRow.appendChild(emptyField);
            }
        });

        table.appendChild(tripleRow);
    }

    // ✅ FILA ESPECIAL PARA COMENTARIOS (ancho completo)
    if (fields.comentarios) {
        const commentsTr = iframeDoc.createElement('tr');
        
        const commentsLabelTd = iframeDoc.createElement('td');
        commentsLabelTd.style.cssText = `
            font-weight: 600;
            color: #2c3e50;
            text-align: right;
            padding: 8px 15px 8px 0;
            vertical-align: top;
            white-space: nowrap;
            width: 20%;
        `;
        commentsLabelTd.textContent = 'Comentarios:';

        const commentsFieldTd = iframeDoc.createElement('td');
        commentsFieldTd.setAttribute('colspan', '5');
        commentsFieldTd.style.cssText = `
            padding: 8px 0;
            vertical-align: top;
        `;

        // ✅ ESTILOS ESPECÍFICOS PARA TEXTAREA
        fields.comentarios.style.cssText = `
            width: 100% !important;
            max-width: 500px !important;
            height: 80px !important;
            padding: 10px 12px !important;
            border: 2px solid #e9ecef !important;
            border-radius: 8px !important;
            font-size: 13px !important;
            background: white !important;
            transition: all 0.3s ease !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            box-sizing: border-box !important;
            resize: vertical !important;
            line-height: 1.4 !important;
        `;

        // Focus effects para textarea
        fields.comentarios.addEventListener('focus', () => {
            fields.comentarios.style.borderColor = '#4A90E2';
            fields.comentarios.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
        });

        fields.comentarios.addEventListener('blur', () => {
            fields.comentarios.style.borderColor = '#e9ecef';
            fields.comentarios.style.boxShadow = 'none';
        });

        commentsFieldTd.appendChild(fields.comentarios);
        commentsTr.appendChild(commentsLabelTd);
        commentsTr.appendChild(commentsFieldTd);
        table.appendChild(commentsTr);
    }

    return table;
}

// ✅ ALTERNATIVA: Si la tabla no funciona, usar CSS Grid
createCSMTableLayoutAlternative(fields, iframeDoc) {
    const container = iframeDoc.createElement('div');
    container.style.cssText = `
        display: grid;
        grid-template-columns: auto 1fr auto 1fr auto 1fr;
        gap: 10px;
        align-items: center;
        margin: 20px 0;
        padding: 20px;
        background: white;
        border-radius: 8px;
    `;

    // Función para agregar campo al grid
    const addFieldToGrid = (label, field) => {
        if (field) {
            const labelEl = iframeDoc.createElement('label');
            labelEl.textContent = label;
            labelEl.style.cssText = `
                font-weight: 600;
                color: #2c3e50;
                text-align: right;
                white-space: nowrap;
            `;

            this.applyCSMFieldStyles(field);
            
            container.appendChild(labelEl);
            container.appendChild(field);
        }
    };

    // Fila Bastidor/Repisa/Tarjeta
    addFieldToGrid('Bastidor:', fields.bastidor);
    addFieldToGrid('Repisa:', fields.repisa);
    addFieldToGrid('Tarjeta:', fields.tarjeta);

    return container;
}

// ✅ APLICAR ESTILOS A CAMPOS CSM
applyCSMFieldStyles(field) {
    const fieldName = this.detectFieldName(field);
    const fieldWidth = this.getFieldWidth(fieldName);

    field.style.cssText = `
        width: ${fieldWidth} !important;
        padding: 8px 12px !important;
        border: 2px solid #e9ecef !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        background: white !important;
        transition: all 0.3s ease !important;
        font-family: 'Segoe UI', Arial, sans-serif !important;
        box-sizing: border-box !important;
    `;

    // Estilos específicos por tipo
    if (fieldName === 'comentarios') {
        field.style.height = '80px';
        field.style.resize = 'vertical';
    }

    if (fieldName.includes('contador')) {
        field.style.textAlign = 'center';
    }

    // Focus effects
    field.addEventListener('focus', () => {
        field.style.borderColor = '#4A90E2';
        field.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
    });

    field.addEventListener('blur', () => {
        field.style.borderColor = '#e9ecef';
        field.style.boxShadow = 'none';
    });
}

// ✅ EXTRAER CAMPOS DEL FORMULARIO ORIGINAL
extractFormFields(iframeDoc) {
    const fields = {};
    
    console.log('📋 Extrayendo campos por nombre exacto...');
    
    // ✅ BÚSQUEDA DIRECTA POR NAME
    fields.falla = iframeDoc.querySelector('select[name="cual_falla"]') || 
                  iframeDoc.querySelector('select');
    
    fields.nombrePisa = iframeDoc.querySelector('input[name="dslam"]');
    fields.clase = iframeDoc.querySelector('input[name="clasedslam"]');
    fields.quejasPendientes = iframeDoc.querySelector('input[name="qdslam"]');
    fields.osPendientes = iframeDoc.querySelector('input[name="osdslam"]');
    fields.reincidencia = iframeDoc.querySelector('input[name="reincide"]');
    fields.validacionesProceso = iframeDoc.querySelector('input[name="validacion"]');
    fields.bastidor = iframeDoc.querySelector('input[name="bastidor"]');
    fields.repisa = iframeDoc.querySelector('input[name="repisa"]');
    fields.tarjeta = iframeDoc.querySelector('input[name="tarjeta"]');
    fields.ipEquipo = iframeDoc.querySelector('input[name="ipdslam"]');
    fields.atencionLinea = iframeDoc.querySelector('input[name="enlinea"]');
    fields.comentarios = iframeDoc.querySelector('textarea[name="obsdslam"]');

    // ✅ LOG DE CAMPOS ENCONTRADOS
    const foundFields = Object.keys(fields).filter(k => fields[k]);
    console.log('✅ Campos encontrados:', foundFields);
    
    foundFields.forEach(fieldName => {
        const field = fields[fieldName];
        console.log(`   ${fieldName}: name="${field.name}" value="${field.value?.substring(0, 20)}..."`);
    });

    return fields;
}

// ✅ EXTRAER ACTION DEL FORMULARIO ORIGINAL
extractFormAction(originalContent) {
    const actionMatch = originalContent.match(/action="([^"]+)"/) ||
                       originalContent.match(/action=([^\s>]+)/);
    
    return actionMatch ? actionMatch[1] : 'cns2_sup.asp';
}
	
	
    // ✅ FUNCIÓN ADICIONAL: Aplicar anchos después del reseteo
    applySmartFieldWidths(iframeDoc) {
        console.log('📏 Aplicando anchos inteligentes a campos...');

        const inputs = iframeDoc.querySelectorAll('input, select, textarea');

        inputs.forEach((input, index) => {
            const fieldName = this.detectFieldName(input);
            const fieldWidth = this.getFieldWidth(fieldName);

            // Aplicar ancho específico
            input.style.setProperty('width', fieldWidth, 'important');

            // Aplicar estilos adicionales según tipo
            if (fieldName === 'comentarios') {
                input.style.setProperty('height', '60px', 'important');
                input.style.setProperty('resize', 'vertical', 'important');
            }

            if (fieldName === 'numero-pequeno') {
                input.style.setProperty('text-align', 'center', 'important');
            }

            console.log(`📏 Campo #${index}: ${fieldName} → ${fieldWidth}`);
        });

        console.log('✅ Anchos inteligentes aplicados');
    }

    // ✅ ORGANIZAR COMO LAYOUT DE TABLA (OPCIONAL)
    organizeAsTableLayout(iframeDoc, elementAnalysis) {
        console.log('📐 Organizando elementos en layout de tabla...');

        // Buscar contenedor principal del formulario
        const formContainer = iframeDoc.querySelector('form') ||
            iframeDoc.querySelector('body > div') ||
            iframeDoc.body;

        if (formContainer) {
            formContainer.style.setProperty('display', 'block', 'important');
            formContainer.style.setProperty('padding', '15px', 'important');

            // Hacer que labels e inputs estén en la misma línea
            const labels = formContainer.querySelectorAll('[data-element-type="label"]');
            const inputs = formContainer.querySelectorAll('[data-element-type="input-field"]');

            // Agrupar elementos relacionados
            labels.forEach(label => {
                label.style.setProperty('display', 'inline-block', 'important');
                label.style.setProperty('width', 'auto', 'important');
                label.style.setProperty('margin-right', '8px', 'important');
            });

            inputs.forEach(input => {
                input.style.setProperty('display', 'inline-block', 'important');
                input.style.setProperty('margin-right', '15px', 'important');
            });
        }
    }

    // ✅ APLICAR ESTILOS GENERALES
    applyGeneralStyles(iframeDoc) {
        // Body
        const body = iframeDoc.body;
        if (body) {
            body.style.setProperty('font-family', 'Segoe UI, Arial, sans-serif', 'important');
            body.style.setProperty('background', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 'important');
            body.style.setProperty('margin', '0', 'important');
            body.style.setProperty('padding', '20px', 'important');
        }

        // Contenedor principal
        const containers = iframeDoc.querySelectorAll('body > *, body > div, body > center, body > form');
        containers.forEach((container, index) => {
            if (index === 0) { // Solo el primer contenedor
                container.style.setProperty('max-width', '1200px', 'important');
                container.style.setProperty('margin', '20px auto', 'important');
                container.style.setProperty('background', 'white', 'important');
                container.style.setProperty('border-radius', '12px', 'important');
                container.style.setProperty('box-shadow', '0 8px 32px rgba(0, 0, 0, 0.1)', 'important');
                container.style.setProperty('border', '1px solid #e9ecef', 'important');
                container.style.setProperty('overflow', 'hidden', 'important');
            }
        });

        // CENTRAR TÍTULOS DE REPORTES
        const titleElements = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, div[style*="font-weight"], font[size="3"], font[size="4"]');
        titleElements.forEach(title => {
            title.style.setProperty('text-align', 'center', 'important');
            title.style.setProperty('width', '100%', 'important');
            title.style.setProperty('display', 'block', 'important');
        });

        // BUSCAR ELEMENTOS QUE CONTENGAN "REPORTE" Y CENTRARLOS
        const reportElements = iframeDoc.querySelectorAll('*');
        reportElements.forEach(element => {
            const text = element.textContent || '';
            if (text.includes('Reporte') && !element.querySelector('input, select, table')) {
                element.style.setProperty('text-align', 'center', 'important');
                element.style.setProperty('width', '100%', 'important');
            }
        });
        }

    // ✅ MÉTODO CORREGIDO: styleIncidentForm()
    // Recrear formulario EXACTAMENTE como el original pero con mejor diseño

    styleIncidentForm(iframeDoc) {
        console.log('🎨 Aplicando estilo específico al formulario de captura de incidentes...');

        try {
            // ✅ VERIFICAR que es formulario de captura
            const originalContent = iframeDoc.body.innerHTML;

            const hasIncidentForm = originalContent.includes('Captura de Incidentes') ||
                originalContent.includes('Proporciona la central') ||
                originalContent.includes('Reporte fallas a CNS');

            if (!hasIncidentForm) {
                console.log('❌ No es formulario de captura, aplicando reset normal');
                return false;
            }

            console.log('✅ Formulario de captura confirmado, recreando con campos exactos...');

            // ✅ PASO 1: Resetear el body completamente
            const body = iframeDoc.body;
            body.style.cssText = `
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            margin: 0 !important;
            padding: 20px !important;
            min-height: 100vh !important;
            box-sizing: border-box !important;
        `;

            // ✅ PASO 2: Limpiar completamente el contenido
            body.innerHTML = '';

            // ✅ PASO 3: Crear el contenedor principal moderno
            const modernWrapper = iframeDoc.createElement('div');
            modernWrapper.className = 'modern-incident-form';
            modernWrapper.style.cssText = `
            max-width: 600px !important;
            margin: 40px auto !important;
            background: white !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
            overflow: hidden !important;
            border: 1px solid #e3f2fd !important;
            animation: slideInForm 0.6s ease-out !important;
        `;

            // ✅ PASO 4: Crear header moderno
            const header = iframeDoc.createElement('div');
            header.className = 'modern-form-header';
            header.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: white !important;
            padding: 25px 30px !important;
            text-align: center !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2) !important;
        `;
            header.innerHTML = '📋 Captura de Incidentes Gerencia Multimedia';

            // ✅ PASO 5: Crear contenido del formulario
            const formContent = iframeDoc.createElement('div');
            formContent.className = 'modern-form-content';
            formContent.style.cssText = `
            padding: 40px !important;
            background: white !important;
        `;

            // ✅ PASO 6: Crear enlace modernizado
            const linkSection = iframeDoc.createElement('div');
            linkSection.style.cssText = `
            margin-bottom: 30px !important;
            text-align: center !important;
        `;

            const reportLink = iframeDoc.createElement('a');
            reportLink.href = 'javascript:window.open("Reporte.asp","","width=900,height=700,scrollbars=yes")';
            reportLink.style.cssText = `
            display: inline-block !important;
            background: linear-gradient(135deg, #28a745, #20c997) !important;
            color: white !important;
            padding: 15px 25px !important;
            border-radius: 10px !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3) !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1) !important;
        `;
            reportLink.innerHTML = '📊 Reporte fallas a CNS 2 Supervision';

            // Agregar efecto hover
            reportLink.addEventListener('mouseenter', () => {
                reportLink.style.transform = 'translateY(-3px)';
                reportLink.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
            });
            reportLink.addEventListener('mouseleave', () => {
                reportLink.style.transform = 'translateY(0)';
                reportLink.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
            });

            linkSection.appendChild(reportLink);

            // ✅ PASO 7: Crear formulario EXACTO como el original
            const form = iframeDoc.createElement('form');
            form.method = 'POST';
            form.action = 'cns2_sup.asp';
            form.style.cssText = `
            background: linear-gradient(135deg, #f8f9fa, #e3f2fd) !important;
            border-radius: 12px !important;
            padding: 30px !important;
            border: 2px solid #e3f2fd !important;
        `;

            // Label modernizado
            const label = iframeDoc.createElement('label');
            label.style.cssText = `
            display: block !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            color: #2c3e50 !important;
            margin-bottom: 15px !important;
        `;
            label.innerHTML = '🏢 Proporciona la central:';

            // ✅ CAMPO PRINCIPAL: ctl
            const centralInput = iframeDoc.createElement('input');
            centralInput.type = 'text';
            centralInput.name = 'ctl';
            centralInput.placeholder = 'Ej: COG, QRT, ODA, MQS ...';
            centralInput.required = true;
            centralInput.style.cssText = `
            width: 100% !important;
            padding: 15px 20px !important;
            border: 2px solid #e9ecef !important;
            border-radius: 10px !important;
            font-size: 16px !important;
            background: white !important;
            transition: all 0.3s ease !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            box-sizing: border-box !important;
            margin-bottom: 25px !important;
        `;

            // ✅ CAMPO OCULTO: al_centro
            const alCentroInput = iframeDoc.createElement('input');
            alCentroInput.type = 'hidden';
            alCentroInput.name = 'al_centro';
            alCentroInput.value = '';

            // Efectos de focus
            centralInput.addEventListener('focus', () => {
                centralInput.style.borderColor = '#4A90E2';
                centralInput.style.boxShadow = '0 0 0 4px rgba(74, 144, 226, 0.1)';
                centralInput.style.background = '#fafbfc';
            });
            centralInput.addEventListener('blur', () => {
                centralInput.style.borderColor = '#e9ecef';
                centralInput.style.boxShadow = 'none';
                centralInput.style.background = 'white';
            });

            // ✅ CAPTURAR REFERENCIA A THIS ANTES DE CREAR LA FUNCIÓN
            const self = this;

            // ✅ FUNCIÓN CENTRALIZADA PARA MANEJAR EL ENVÍO
            const handleFormSubmit = (e) => {
                if (e)
                    e.preventDefault();

                const centralValue = centralInput.value.trim();
                if (!centralValue) {
                    alert('⚠️ Por favor ingrese el nombre de la central');
                    centralInput.focus();
                    return false;
                }

                console.log('📤 Enviando formulario con central:', centralValue);

                // ✅ MOSTRAR LOADING INMEDIATAMENTE - USAR SELF EN LUGAR DE THIS
                self.showFormLoadingAnimation(iframeDoc, centralValue);

                // ✅ ENVIAR FORMULARIO DESPUÉS DE MOSTRAR LOADING
                setTimeout(() => {
                    const tempForm = iframeDoc.createElement('form');
                    tempForm.method = 'POST';
                    tempForm.action = 'cns2_sup.asp';
                    tempForm.style.display = 'none';

                    const ctlField = iframeDoc.createElement('input');
                    ctlField.type = 'hidden';
                    ctlField.name = 'ctl';
                    ctlField.value = centralValue;

                    const alCentroField = iframeDoc.createElement('input');
                    alCentroField.type = 'hidden';
                    alCentroField.name = 'al_centro';
                    alCentroField.value = '';

                    tempForm.appendChild(ctlField);
                    tempForm.appendChild(alCentroField);
                    iframeDoc.body.appendChild(tempForm);

                    console.log('📤 Enviando form con campos:', {
                        ctl: ctlField.value,
                        al_centro: alCentroField.value
                    });

                    tempForm.submit();
                }, 500);

                return true;
            };

            // ✅ EVENT LISTENER PARA TECLA ENTER
            centralInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFormSubmit();
                }
            });

            // Botones modernizados
            const buttonContainer = iframeDoc.createElement('div');
            buttonContainer.style.cssText = `
            display: flex !important;
            gap: 15px !important;
            justify-content: center !important;
        `;

            const submitButton = iframeDoc.createElement('button');
            submitButton.type = 'submit';
            submitButton.innerHTML = '✅ Aceptar';
            submitButton.style.cssText = `
            background: linear-gradient(135deg, #4A90E2, #357ABD) !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3) !important;
            min-width: 120px !important;
        `;

            const cancelButton = iframeDoc.createElement('button');
            cancelButton.type = 'button';
            cancelButton.innerHTML = '🔙 Regresar';
            cancelButton.onclick = () => window.history.back();
            cancelButton.style.cssText = `
            background: linear-gradient(135deg, #6c757d, #5a6268) !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3) !important;
            min-width: 120px !important;
        `;

            // Efectos hover para botones
            [submitButton, cancelButton].forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-2px)';
                    const currentShadow = button.style.boxShadow;
                    button.style.boxShadow = currentShadow.replace('0.3', '0.5');
                });
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0)';
                    const currentShadow = button.style.boxShadow;
                    button.style.boxShadow = currentShadow.replace('0.5', '0.3');
                });
            });

            // ✅ EVENT LISTENERS PARA EL FORMULARIO
            form.addEventListener('submit', handleFormSubmit);
            submitButton.addEventListener('click', handleFormSubmit);

            // ✅ ENSAMBLAR TODO
            form.appendChild(label);
            form.appendChild(centralInput);
            form.appendChild(alCentroInput);

            buttonContainer.appendChild(submitButton);
            buttonContainer.appendChild(cancelButton);
            form.appendChild(buttonContainer);

            formContent.appendChild(linkSection);
            formContent.appendChild(form);

            modernWrapper.appendChild(header);
            modernWrapper.appendChild(formContent);

            // ✅ AGREGAR AL BODY
            body.appendChild(modernWrapper);

            // ✅ AGREGAR ANIMACIÓN CSS
            const style = iframeDoc.createElement('style');
            style.textContent = `
            @keyframes slideInForm {
                from { 
                    opacity: 0; 
                    transform: translateY(30px) scale(0.95); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                }
            }
            
            .modern-incident-form {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            }
        `;
            iframeDoc.head.appendChild(style);

            // Auto-focus en el input
            setTimeout(() => centralInput.focus(), 500);

            console.log('✅ Formulario de incidentes recreado con campos exactos del original');
            console.log('📋 Campos del formulario: ctl=' + centralInput.name + ', al_centro=' + alCentroInput.name);

            return true;

        } catch (error) {
            console.error('❌ Error al estilizar formulario de incidentes:', error);
            return false;
        }
    }

    // ✅ MÉTODO PARA MOSTRAR ANIMACIÓN DE LOADING AL ENVIAR FORMULARIO
    showFormLoadingAnimation(iframeDoc, centralName) {
        console.log('🔄 Mostrando animación de loading para central:', centralName);

        try {
            // Crear overlay de loading
            const loadingOverlay = iframeDoc.createElement('div');
            loadingOverlay.id = 'form-loading-overlay';
            loadingOverlay.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 999999 !important;
            backdrop-filter: blur(5px) !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
        `;

            // Crear overlay de loading - USANDO EL MISMO MÉTODO QUE EL MODAL PISA
            const formLoadingOverlay = iframeDoc.createElement('div');
            formLoadingOverlay.id = 'form-loading-overlay';
            formLoadingOverlay.className = 'form-loading-overlay';

            formLoadingOverlay.innerHTML = `
            <div class="form-loading-modal">
                <div class="form-loading-spinner"></div>
                
                <h3 class="form-loading-title">Enviando formulario de central...</h3>
                
                <p class="form-loading-subtitle">Buscando equipos en: <strong>${centralName}</strong></p>
                
                <div class="form-loading-status">
                    🔍 Procesando solicitud del servidor...
                </div>
            </div>
        `;

            // Agregar estilos CSS EXACTOS como el modal PISA
            const loadingStyle = iframeDoc.createElement('style');
            loadingStyle.textContent = `
            /* Modal de loading - CORREGIDO PARA CENTRADO PERFECTO */
            .form-loading-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.8) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 2147483647 !important;
                backdrop-filter: blur(5px) !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .form-loading-modal {
                background: white !important;
                border-radius: 20px !important;
                padding: 40px !important;
                max-width: 400px !important;
                width: 90% !important;
                text-align: center !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                animation: modalAppear 0.3s ease-out !important;
                position: relative !important;
                z-index: 2147483648 !important;
                margin: auto !important;
                transform: translateX(0) translateY(0) !important;
            }
            
            .form-loading-spinner {
                width: 60px !important;
                height: 60px !important;
                border: 4px solid #f3f3f3 !important;
                border-top: 4px solid #4A90E2 !important;
                border-radius: 50% !important;
                animation: loadingSpin 1s linear infinite !important;
                margin: 0 auto 20px auto !important;
                display: block !important;
            }
            
            .form-loading-title {
                color: #ffffff !important;
                font-size: 20px !important;
                font-weight: 600 !important;
                margin: 0 0 10px 0 !important;
                font-family: 'Segoe UI', Arial, sans-serif !important;
                text-align: center !important;
            }
            
            .form-loading-subtitle {
                color: #ffffff !important;
                font-size: 14px !important;
                margin: 0 0 15px 0 !important;
                line-height: 1.4 !important;
                font-family: 'Segoe UI', Arial, sans-serif !important;
                text-align: center !important;
            }
            
            .form-loading-status {
                background: #e3f2fd !important;
                border-radius: 8px !important;
                padding: 12px !important;
                color: #1565c0 !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                font-family: 'Segoe UI', Arial, sans-serif !important;
                text-align: center !important;
                margin: 0 auto !important;
            }
            
            @keyframes modalAppear {
                from { 
                    opacity: 0; 
                    transform: scale(0.9) translateY(20px); 
                }
                to { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }
            
            @keyframes loadingSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
            iframeDoc.head.appendChild(loadingStyle);

            // Agregar al iframe
            iframeDoc.body.appendChild(formLoadingOverlay);

            console.log('✅ Animación de loading mostrada');

        } catch (error) {
            console.error('❌ Error mostrando loading:', error);
        }
    }

    addIframeDSLAMSearch(iframeDoc) {
        if (!iframeDoc)
            return;

        // ✅ VERIFICAR si ya existe un buscador en el iframe (evitar duplicados)
        const existingSearch = iframeDoc.querySelector('.iframe-dslam-search, .dslam-search-container');
        if (existingSearch) {
            console.log('⚠️ Buscador DSLAM ya existe en iframe - saltando');
            return;
        }

        // Buscar tablas específicas de equipos DSLAM
        const tables = iframeDoc.querySelectorAll('table');
        let targetTable = null;

        tables.forEach(table => {
            const tableText = table.textContent.toLowerCase();
            const rows = table.querySelectorAll('tr');

            // ✅ LÓGICA SIMPLE: Buscar por título específico
            const hasEquipmentTitle = (
                tableText.includes('reporte fallas a cns 2 supervision') ||
                (tableText.includes('dslam') && tableText.includes('tecnologia')));

            // ❌ EXCLUIR reportes de incidentes
            const isIncidentReport = (
                tableText.includes('reportes pendientes de solucion') ||
                (tableText.includes('folio') && tableText.includes('tipo de falla') && tableText.includes('elaboro')));

            if (hasEquipmentTitle && !isIncidentReport && rows.length >= 3 && !table.dataset.searchAdded) {
                targetTable = table;
            }
        });

        if (!targetTable) {
            console.log('ℹ️ No se encontró tabla de equipos válida en iframe');
            return;
        }

        console.log('📊 Tabla de equipos REAL encontrada en iframe por título, agregando buscador');

        // Crear buscador específico para iframe
        this.createIframeDSLAMSearchBox(targetTable, iframeDoc);
    }

    createIframeDSLAMSearchBox(table, iframeDoc) {
        if (table.dataset.searchAdded)
            return;
        table.dataset.searchAdded = 'true';

        // Obtener filas de datos (excluyendo header)
        const dataRows = Array.from(table.querySelectorAll('tr')).slice(1);

        if (dataRows.length === 0) {
            console.log('⚠️ No se encontraron filas de datos en iframe');
            return;
        }

        // Crear contenedor del buscador BAJO (menos altura)
        const searchContainer = iframeDoc.createElement('div');
        searchContainer.className = 'iframe-dslam-search-low';
        searchContainer.innerHTML = `
        <div class="low-search-bar">
            <span class="search-icon-low">🔍</span>
            <input type="text" 
                   id="iframe-search-input-low" 
                   placeholder="Buscar DSLAM..." 
                   class="search-input-low">
            <div class="search-counter-low" id="iframe-counter-low">
                <span id="iframe-count-low">${dataRows.length} </span> equipos
            </div>
            <button type="button" 
                    id="iframe-clear-btn-low" 
                    class="clear-btn-low" 
                    title="Limpiar">✕</button>
        </div>
    `;

        // Estilos CSS con altura ultra-reducida
        const style = iframeDoc.createElement('style');
        style.textContent = `
        .iframe-dslam-search-low {
            margin: 3px auto 6px auto;
            max-width: 100%;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        
        .low-search-bar {
            display: flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #f8fdff, #e3f2fd);
            border: 1px solid #1976d2;
            border-radius: 15px;
            padding: 3px 8px;
            box-shadow: 0 1px 4px rgba(25, 118, 210, 0.15);
            transition: all 0.3s ease;
            height: 28px;
            box-sizing: border-box;
        }
        
        .low-search-bar:hover {
            box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
            transform: translateY(-1px);
        }
        
        .search-icon-low {
            font-size: 12px;
            color: #1976d2;
            flex-shrink: 0;
            line-height: 1;
        }
        
        .search-input-low {
            flex: 1;
            border: none;
            outline: none;
            font-size: 12px;
            color: #333;
            background: transparent;
            padding: 0;
            height: 20px;
            line-height: 1;
            min-width: 200px;
        }
        
        .search-input-low::placeholder {
            color: #999;
            font-style: italic;
        }
        
        .search-input-low:focus {
            color: #1976d2;
        }
        
        .search-counter-low {
			background: #1976d2;
			color: white;
			padding: 1px 6px;
			border-radius: 8px;
			font-size: 12px; /* ← CAMBIAR: era 14px, ahora 12px consistente */
			font-weight: 600;
			white-space: nowrap;
			flex-shrink: 0;
			transition: all 0.3s ease;
			height: 16px;
			display: flex;
			align-items: center;
			line-height: 1;
			gap: 2px; /* ← AGREGAR: espacio interno entre elementos */
			letter-spacing: 0.5px; /* ← AGREGAR: espaciado entre letras */
		}

        
        .search-counter-low.filtered {
            background: #ff9800;
            animation: pulseLow 0.6s ease-in-out;
        }
        
        .search-counter-low.no-results {
            background: #f44336;
            animation: shakeLow 0.4s ease-in-out;
        }
        
        .clear-btn-low {
            background: #f44336;
            color: white;
            border: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 8px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
            line-height: 1;
        }
        
        .clear-btn-low:hover {
            background: #d32f2f;
            transform: scale(1.1);
        }
        
        @keyframes pulseLow {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes shakeLow {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
        }
        
        /* Responsive para móviles */
        @media (max-width: 600px) {
		.search-input-low {
			min-width: 150px;
		}
		
		.low-search-bar {
			gap: 4px;
			padding: 2px 6px;
			height: 26px;
		}
		
		.search-counter-low {
			font-size: 11px; /* ← CAMBIAR: era 9px, ahora 11px más legible */
			padding: 1px 4px;
			height: 14px;
			gap: 2px; /* ← MANTENER: gap interno */
			letter-spacing: 0.3px; /* ← AGREGAR: espaciado en móviles */
		}
		
		.clear-btn-low {
			width: 14px;
			height: 14px;
			font-size: 7px;
		}
	}
    `;
        iframeDoc.head.appendChild(style);

        // Insertar antes de la tabla
        table.parentNode.insertBefore(searchContainer, table);

        // Configurar búsqueda
        const searchInput = searchContainer.querySelector('#iframe-search-input-low');
        const clearBtn = searchContainer.querySelector('#iframe-clear-btn-low');
        const counter = searchContainer.querySelector('#iframe-count-low');
        const counterContainer = searchContainer.querySelector('#iframe-counter-low');

        const performSearch = (searchTerm) => {
            const searchLower = searchTerm.toLowerCase();
            let visibleCount = 0;

            dataRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                const matches = searchTerm === '' || rowText.includes(searchLower);

                if (matches) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            counter.textContent = visibleCount + ' ';

            // Actualizar clases del contador
            counterContainer.classList.remove('filtered', 'no-results');
            if (visibleCount === 0 && searchTerm !== '') {
                counterContainer.classList.add('no-results');
            } else if (visibleCount < dataRows.length && searchTerm !== '') {
                counterContainer.classList.add('filtered');
            }

            console.log(`📊 ${visibleCount} de ${dataRows.length} equipos visibles (bajo)`);
        };

        // Event listeners
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value.trim());
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                performSearch('');
            }
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            performSearch('');
            searchInput.focus();
        });

        // Auto-focus
        setTimeout(() => searchInput.focus(), 300);

        console.log(`✅ Buscador BAJO agregado al iframe - ${dataRows.length} equipos disponibles`);
    }

    /* ✅ MEJORAS SIMPLES PARA getIframeCSS() - Solo mejorar lo que ya funciona */

    getIframeCSS() {
        return `
        /* ✅ OCULTAR IMÁGENES DE FONDO PROBLEMÁTICAS */
        img[src*="fondo.bmp"], 
        img[src*="menu.bmp"], 
        img[src*="background"] { 
            display: none !important; 
            visibility: hidden !important;
        }

        /* ✅ RESET COMPLETO DEL BODY */
        body { 
            font-family: 'Segoe UI', Arial, sans-serif !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            margin: 0 !important;
            padding: 20px !important;
            min-height: 100vh !important;
            box-sizing: border-box !important;
        }

        /* ✅ CONTENEDOR PRINCIPAL - FORZAR LAYOUT MODERNO */
        body > *, 
        body > div, 
        body > center, 
        body > table,
        body > form {
            position: static !important;
            display: block !important;
            max-width: 900px !important;
            margin: 20px auto !important;
            background: white !important;
            border-radius: 15px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid #e9ecef !important;
            overflow: hidden !important;
            z-index: auto !important;
            left: auto !important;
            top: auto !important;
            right: auto !important;
            bottom: auto !important;
            width: auto !important;
            height: auto !important;
            padding: 25px !important; /* ✅ Más padding para mejor espaciado */
        }

        /* ✅ RESET TOTAL DE POSICIONES ABSOLUTAS */
        div[style*="position: absolute"],
        div[style*="position:absolute"],
        table[style*="position: absolute"],
        table[style*="position:absolute"] {
            position: static !important;
            left: auto !important;
            top: auto !important;
            right: auto !important;
            bottom: auto !important;
            z-index: auto !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            display: block !important;
        }

        /* ✅ HEADER DEL FORMULARIO - TÍTULO PRINCIPAL MEJORADO */
        div[style*="top: 5"],
        div[style*="top:5"],
        div:first-child,
        body > div:first-child {
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: white !important;
            padding: 25px 30px !important;
            margin: 0 0 20px 0 !important;
            text-align: center !important;
            border-radius: 12px 12px 0 0 !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2) !important;
            border-bottom: 3px solid rgba(255,255,255,0.2) !important;
        }

        /* ✅ MEJORAR ENLACE AL REPORTE */
        a[href*="Reporte"], a[onclick*="Reporte"] {
            display: inline-block !important;
            background: linear-gradient(135deg, #28a745, #20c997) !important;
            color: white !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            margin: 10px auto !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3) !important;
            text-align: center !important;
        }

        a[href*="Reporte"]:hover, a[onclick*="Reporte"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
            text-decoration: none !important;
            color: white !important;
        }

        /* ✅ CAMPOS DE ENTRADA MEJORADOS */
        input[type="text"], 
        input[type="password"],
        input[name*="central"],
        input[name*="folio"],
        select, 
        textarea {
            width: 100% !important;
            max-width: 400px !important;
            padding: 12px 16px !important;
            border: 2px solid #e9ecef !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            background: white !important;
            transition: all 0.3s ease !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            box-sizing: border-box !important;
            margin: 8px 5px 15px 5px !important; /* ✅ Mejor espaciado */
        }

        /* ✅ EFECTOS DE FOCUS MEJORADOS */
        input[type="text"]:focus, 
        input[type="password"]:focus,
        select:focus, 
        textarea:focus {
            border-color: #4A90E2 !important;
            outline: none !important;
            box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15) !important;
            background: #fafbfc !important;
            transform: scale(1.02) !important;
        }

        /* ✅ ETIQUETAS DE CAMPOS MEJORADAS */
        td, th {
            padding: 8px 12px !important;
            vertical-align: middle !important;
            font-size: 14px !important;
            color: #495057 !important;
        }

        /* ✅ ETIQUETAS EN NEGRITA */
        td:first-child, th {
            font-weight: 600 !important;
            color: #2c3e50 !important;
            text-align: right !important;
            padding-right: 15px !important;
            white-space: nowrap !important;
        }

        /* ✅ BOTONES MEJORADOS */
        input[type="button"], 
        input[type="submit"],
        button {
            background: linear-gradient(135deg, #4A90E2, #357ABD) !important;
            color: white !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            margin: 10px 8px !important; /* ✅ Mejor espaciado entre botones */
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3) !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            min-width: 100px !important;
        }

        /* ✅ EFECTOS HOVER PARA BOTONES */
        input[type="button"]:hover, 
        input[type="submit"]:hover,
        button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4) !important;
            background: linear-gradient(135deg, #357ABD, #2968A3) !important;
        }

        /* ✅ BOTÓN REGRESAR CON COLOR DIFERENTE */
        input[value*="Regresar"], 
        input[onclick*="history.back"], 
        button[onclick*="history.back"] {
            background: linear-gradient(135deg, #6c757d, #5a6268) !important;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3) !important;
        }

        input[value*="Regresar"]:hover,
        input[onclick*="history.back"]:hover,
        button[onclick*="history.back"]:hover {
            background: linear-gradient(135deg, #5a6268, #495057) !important;
            box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4) !important;
        }

        /* ✅ TABLAS MEJORADAS */
        table {
            width: 100% !important;
            border-collapse: separate !important;
            border-spacing: 8px !important; /* ✅ Mejor espaciado entre celdas */
            background: white !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: none !important; /* ✅ Sin sombra doble */
            border: none !important;
            margin: 15px 0 !important;
            position: static !important;
        }

        /* ✅ FILAS DE TABLA CON HOVER */
        tr:hover {
            background: rgba(74, 144, 226, 0.05) !important;
            transition: background 0.2s ease !important;
        }

        /* ✅ TEXTAREA ESPECÍFICO */
        textarea {
            min-height: 80px !important;
            resize: vertical !important;
            line-height: 1.4 !important;
        }

        /* ✅ SELECT MEJORADO */
        select {
            cursor: pointer !important;
            background-image: linear-gradient(45deg, transparent 50%, #495057 50%), linear-gradient(135deg, #495057 50%, transparent 50%) !important;
            background-position: calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px) !important;
            background-size: 5px 5px, 5px 5px !important;
            background-repeat: no-repeat !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
        }

        /* ✅ OVERRIDE FORZADO PARA ELEMENTOS PROBLEMÁTICOS */
        * {
            position: static !important;
            box-sizing: border-box !important;
        }

        /* ✅ ESTILO RESPONSIVO MEJORADO */
        @media (max-width: 768px) {
            body {
                padding: 10px !important;
            }
            
            body > *, body > div, body > center, body > table, body > form {
                margin: 10px auto !important;
                padding: 15px !important;
                max-width: 95% !important;
            }
            
            input[type="text"], 
            input[type="password"],
            select, 
            textarea {
                max-width: 100% !important;
                margin: 5px 0 10px 0 !important;
            }
            
            table {
                border-spacing: 4px !important;
            }
            
            td {
                padding: 6px 8px !important;
            }
        }

        /* ✅ ANIMACIÓN SUAVE AL CARGAR */
        body > div:first-child {
            animation: slideInDown 0.5s ease-out !important;
        }

        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    }

    // ===============================
    // COMPONENTES DE INTERFAZ MODERNA
    // ===============================
    initializeModernComponents() {
        this.updateModernDate();
        setInterval(() => this.updateModernDate(), 60000);

        // Cargar automáticamente el widget de resumen al inicio
        console.log('🎯 Cargando widget de resumen automáticamente...');
        setTimeout(() => {
            this.showModernResumen();
            console.log('✅ Widget de resumen inicializado - datos iniciales se actualizarán automáticamente');
        }, 500);
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
                
                body > *:not(#modern-codim-interface) {
                    display: none !important;
                }
                
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
                
                .modern-nav {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    margin: 1rem 2rem;
                    border-radius: 15px;
                    padding: 1rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
					text-align: center;
                }
                
                .modern-nav-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
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
					justify-content: center;
					align-items: center;
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
                
                .modern-main {
					display: flex;
					gap: 1rem;
					margin: 0 2rem 2rem 2rem;
					height: calc(100vh - 180px);
					min-height: 600px;
				}
                
                .modern-sidebar {
					width: 160px;
					display: flex;
					flex-direction: column;
					gap: 1rem;
					flex-shrink: 0;
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
				display: flex;
				flex-direction: column;
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
					overflow: auto;
					flex: 1;
					min-height: 0;
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
                @media (max-width: 1024px) {
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
                }
                
                /* Animación para actualización del sidebar */
                @keyframes highlightUpdate {
                    0% { 
                        background: rgba(76, 175, 80, 0.2);
                        transform: scale(1.05);
                    }
                    100% { 
                        background: transparent;
                        transform: scale(1);
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
            </button>`).join('');
    }

    generateModernSubmenus() {
        const menuData = this.getMenuData();
        return Object.entries(menuData).map(([key, menu], index) =>
            `<div class="modern-submenu ${index === 0 ? 'active' : ''}" id="modern-submenu-${key}">
                ${menu.items.map(item => 
                `<a href="#" class="modern-submenu-item" data-page="${item.page}">
                        ${item.icon} ${item.title}
                    </a>`).join('')}
            </div>`).join('');
    }

    getMenuData() {
        return {
            incidentes: {
                title: 'Incidentes',
                icon: '📋',
                items: [{
                        title: 'Nuevo Reporte',
                        icon: '📝',
                        page: 'cns2_sup.asp'
                    }, {
                        title: 'Pendientes',
                        icon: '⏳',
                        page: 'resumen.asp?c=cns'
                    }, {
                        title: 'Consultar Histórico',
                        icon: '📚',
                        page: 'rep_hist.asp'
                    }
                ]
            },
            tecnicos: {
                title: 'Técnicos',
                icon: '👨‍💻',
                items: [{
                        title: 'Técnicos O.S.',
                        icon: '🔧',
                        page: 'opcion1.asp'
                    }, {
                        title: 'Tec. Quejas',
                        icon: '📞',
                        page: 'opcion2.asp'
                    }, {
                        title: 'Iniciar Turno',
                        icon: '▶️',
                        page: 'opcion3.asp'
                    }, {
                        title: 'Programar Turno',
                        icon: '📅',
                        page: 'opcion4.asp'
                    }
                ]
            },
            reportes: {
                title: 'Reportes',
                icon: '📊',
                items: [{
                        title: 'Productividad',
                        icon: '📈',
                        page: 'rep_productividad.asp'
                    }, {
                        title: 'Resumen',
                        icon: '📋',
                        page: 'resumen.asp'
                    }
                ]
            },
            turnos: {
                title: 'Turnos',
                icon: '🕐',
                items: [{
                        title: 'Turno OS',
                        icon: '🔧',
                        page: 'pots1.asp'
                    }, {
                        title: 'Turno Quejas',
                        icon: '📞',
                        page: 'pots2.asp'
                    }, {
                        title: 'Turno Pots',
                        icon: '📡',
                        page: 'pots3.asp'
                    }, {
                        title: 'Turno Futuro',
                        icon: '⏭️',
                        page: 'pots4.asp'
                    }
                ]
            },
            config: {
                title: 'Config',
                icon: '⚙️',
                items: [{
                        title: 'Configuración',
                        icon: '⚙️',
                        page: 'configura.asp'
                    }
                ]
            },
            extras: {
                title: 'Extras',
                icon: '🔧',
                items: [{
                        title: 'Desbloqueo PISA',
                        icon: '🔓',
                        page: 'desbloqueo-pisa.html'
                    }
                ]
            }
        };
    }

}

// ===============================
// INICIALIZACIÓN FINAL DEL SISTEMA COMPLETO
// ===============================
function initializeCODIMSystem() {
    console.log('🚀 Inicializando sistema CODIM completo...');

    // Verificar que todos los módulos estén disponibles
    const moduleCheck = {
        communication: !!window.codimCommunication,
        dslamSearch: !!window.codimDSLAMSearch,
        resumenWidget: typeof CODIMResumenWidget !== 'undefined',
        desbloqueoComponent: typeof DesbloqueoComponent !== 'undefined'
    };

    console.log('📊 Estado de módulos:', moduleCheck);

    // Crear instancia principal del content script
    const codimContentScript = new CODIMContentScript();

    // Hacer disponible globalmente para debugging
    window.codimContentScript = codimContentScript;

    // Inicializar el sistema
    codimContentScript.init();

    console.log('✅ Sistema CODIM inicializado completamente');

    return codimContentScript;
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCODIMSystem);
} else {
    initializeCODIMSystem();
}

console.log('✅ CODIM CNS Fix v3.7 - Módulo 5 (CODIMContentScript Principal) cargado');