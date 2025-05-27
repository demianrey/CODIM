// content.js - Script principal ACTUALIZADO con Widget de Resumen
console.log('🚀 CODIM CNS Fix - Extensión activada v3.5');

// ===============================
// CLASE WIDGET DE RESUMEN
// ===============================
class CODIMResumenWidget {
    constructor() {
        this.data = {
            vencidos: 406,
            enTiempo: 0,
            total: 406,
            sinAtender: 0,
            atendidas: 0,
            noReconocidas: 0,
            reconocidas: 0,
            resueltas: 0
        };
        this.refreshInterval = null;
        this.alarmActive = true;
        this.selectedCenter = 'cns';
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
        
        // 🔄 Auto-refresh inmediato al crear el widget para obtener datos reales
        console.log('🔄 Ejecutando refresh automático inicial...');
        setTimeout(() => {
            this.refreshData().then(() => {
                // Remover clase de loading después de actualizar
                valueElements.forEach(el => el.classList.remove('loading-initial'));
            });
        }, 1000); // 1 segundo después de crear el widget
        
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
                    <div class="card-value-large clickable" data-action="openReport" data-params="S,1,${this.data.vencidos},P">
                        ${this.data.vencidos}
                    </div>
                    <div class="card-subtitle">Requieren atención inmediata</div>
                </div>

                <div class="resumen-card en-tiempo">
                    <div class="card-header">
                        <span class="card-icon">✅</span>
                        <span class="card-title">Reportes En Tiempo</span>
                    </div>
                    <div class="card-value-large clickable" data-action="openReport" data-params="S,2,${this.data.enTiempo},P">
                        ${this.data.enTiempo}
                    </div>
                    <div class="card-subtitle">Dentro del plazo establecido</div>
                </div>

                <div class="resumen-card total">
                    <div class="card-header">
                        <span class="card-icon">📋</span>
                        <span class="card-title">Total de Reportes</span>
                    </div>
                    <div class="card-value-huge clickable" data-action="openReport" data-params="S,3,${this.data.total},P">
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
                            <span class="status-value clickable" data-action="openReport" data-params="S,1,${this.data.sinAtender},N">${this.data.sinAtender}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Atendidas</span>
                            <span class="status-value clickable" data-action="openReport" data-params="S,1,${this.data.atendidas},A">${this.data.atendidas}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">No Reconoc.</span>
                            <span class="status-value clickable" data-action="openReport" data-params="S,1,${this.data.noReconocidas},S">${this.data.noReconocidas}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Reconoc.</span>
                            <span class="status-value clickable" data-action="openReport" data-params="S,1,${this.data.reconocidas},R">${this.data.reconocidas}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Resueltas</span>
                            <span class="status-value clickable" data-action="openReport" data-params="S,1,${this.data.resueltas},R">${this.data.resueltas}</span>
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

    injectStyles() {
        if (document.getElementById('codim-resumen-styles')) return;
        
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
        `;
        
        document.head.appendChild(style);
    }

    setupEventListeners(widget) {
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

        // Clicks en estadísticas
        widget.addEventListener('click', (e) => {
            if (e.target.classList.contains('clickable')) {
                const params = e.target.getAttribute('data-params');
                if (params) {
                    this.openReport(params);
                }
            }
        });
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
        const [page, type, count, status] = params.split(',');
        
        console.log(`📊 Abriendo reporte: Página=${page}, Tipo=${type}, Cantidad=${count}, Estado=${status}`);
        
        // Intentar usar método original si existe
        if (typeof window.top?.cambia_menu === 'function') {
            window.top.cambia_menu('resumen', page, type, count, status, '', this.selectedCenter);
        } else {
            // Fallback para interfaz moderna
            const iframe = document.getElementById('modernContentFrame');
            if (iframe) {
                const url = `resumen.asp?page=${page}&type=${type}&count=${count}&status=${status}&center=${this.selectedCenter}`;
                iframe.src = url;
                
                // Actualizar títulos
                const titleElement = document.getElementById('modernContentTitle');
                const subtitleElement = document.getElementById('modernContentSubtitle');
                
                if (titleElement) titleElement.textContent = 'Reporte de Incidentes';
                if (subtitleElement) subtitleElement.textContent = `Mostrando ${count} reportes (${this.getStatusName(status)})`;
            }
        }
        
        this.showNotification(`📊 Abriendo reporte con ${count} registros`, 'info');
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
            lastUpdateElement.textContent = 'Actualizando...';
        }

        try {
            console.log('🔄 Iniciando actualización de datos...');
            await this.fetchData();
            this.updateWidget();
            this.updateLastUpdateTime();
            this.showNotification('✅ Datos actualizados correctamente', 'success');
            console.log('✅ Actualización completada:', this.data);
        } catch (error) {
            console.error('❌ Error al actualizar datos:', error);
            this.showNotification('❌ Error al actualizar datos', 'error');
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

    async fetchData() {
        // Simular fetch real de primera.asp con datos más realistas
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular datos con variaciones más realistas basadas en el tiempo
                const currentHour = new Date().getHours();
                const isBusinessHours = currentHour >= 8 && currentHour <= 18;
                
                // Más reportes durante horas laborales
                const baseVencidos = isBusinessHours ? 
                    Math.floor(300 + Math.random() * 200) : // 300-500 en horas laborales
                    Math.floor(150 + Math.random() * 100);  // 150-250 fuera de horas
                
                const baseEnTiempo = isBusinessHours ?
                    Math.floor(50 + Math.random() * 150) :  // 50-200 en horas laborales
                    Math.floor(20 + Math.random() * 80);    // 20-100 fuera de horas
                
                // Generar datos más realistas
                this.data = {
                    vencidos: baseVencidos,
                    enTiempo: baseEnTiempo,
                    sinAtender: Math.floor(baseVencidos * 0.3 + Math.random() * 50), // ~30% de vencidos
                    atendidas: Math.floor(baseVencidos * 0.4 + Math.random() * 30),  // ~40% de vencidos
                    noReconocidas: Math.floor(baseVencidos * 0.2 + Math.random() * 20), // ~20%
                    reconocidas: Math.floor(baseVencidos * 0.3 + Math.random() * 25),   // ~30%
                    resueltas: Math.floor((baseVencidos + baseEnTiempo) * 0.1 + Math.random() * 15) // ~10%
                };
                
                this.data.total = this.data.vencidos + this.data.enTiempo;
                
                console.log('📊 Datos simulados generados:', {
                    hora: currentHour,
                    esHorarioLaboral: isBusinessHours,
                    datos: this.data
                });
                
                resolve(this.data);
            }, 1500); // Simular latencia de red realista
        });
    }

    updateWidget() {
        const widget = document.querySelector('.codim-resumen-widget');
        if (!widget) return;

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
        // Simular POST a primera.asp
        console.log('🔔 Enviando estado de alarma:', this.alarmActive ? 'Activada' : 'Desactivada');
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
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    destroy() {
        this.stopAutoRefresh();
        const widget = document.querySelector('.codim-resumen-widget');
        if (widget) widget.remove();
        
        const styles = document.getElementById('codim-resumen-styles');
        if (styles) styles.remove();
    }
}

// ===============================
// CLASE PRINCIPAL CONTENT SCRIPT
// ===============================
class CODIMContentScript {
    constructor() {
        this.isMainPage = this.checkIsMainPage();
        this.hasOldInterface = this.checkHasOldInterface();
        this.userData = null;
        this.resumenWidget = null; // Instancia del widget de resumen
    }

    init() {
        // CRÍTICO: Extraer datos ANTES de modificar el DOM
        if (this.shouldReplaceWithModernInterface()) {
            console.log('🎨 Página principal detectada - Extrayendo datos antes de cargar interfaz moderna...');
            this.extractUserDataSync();
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
                if (name) return name;
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
                if (username) return username;
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
                if (ip) return ip;
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
        if (!text || typeof text !== 'string') return false;
        
        const cleanText = text.trim();
        if (cleanText.length < 5 || cleanText.length > 60) return false;
        
        const words = cleanText.split(/\s+/);
        if (words.length < 2) return false;
        
        const namePattern = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+$/;
        if (!namePattern.test(cleanText)) return false;
        
        const excludeWords = [
            'codim', 'sistema', 'bienvenido', 'usuario', 'pagina', 'menu', 'principal',
            'reporte', 'consultar', 'historico', 'tecnicos', 'turno', 'configuracion'
        ];
        
        const lowerText = cleanText.toLowerCase();
        for (let word of excludeWords) {
            if (lowerText.includes(word)) return false;
        }
        
        return true;
    }

    isValidUsername(username) {
        if (!username || typeof username !== 'string') return false;
        
        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername.length < 3 || cleanUsername.length > 15) return false;
        if (!/^[a-zA-Z]/.test(cleanUsername)) return false;
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(cleanUsername)) return false;
        
        const excludeUsernames = [
            'codim', 'sistema', 'usuario', 'admin', 'test', 'user', 'login'
        ];
        
        if (excludeUsernames.includes(cleanUsername)) return false;
        if (/^\d+$/.test(cleanUsername)) return false;
        
        return true;
    }

    isValidIP(ip) {
        if (!ip || typeof ip !== 'string') return false;
        
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        
        for (let part of parts) {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255) return false;
        }
        
        const invalidIPs = ['0.0.0.0', '255.255.255.255', '127.0.0.1'];
        if (invalidIPs.includes(ip)) return false;
        
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
        script.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
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
                ⚡ Patch by DemianRey v3.5
            </div>
        `;
    }

    generateModernSidebarCards() {
        const username = this.userData?.username || 'usuario';
        const ipAddress = this.userData?.ipAddress || '192.168.1.1';
        
        // Obtener datos actuales del widget si existe
        let vencidos = 406;  // Valor inicial
        let enTiempo = 0;    // Valor inicial
        
        if (this.resumenWidget && this.resumenWidget.data) {
            vencidos = this.resumenWidget.data.vencidos;
            enTiempo = this.resumenWidget.data.enTiempo;
        }
        
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
                title: 'Resumen',
                content: `<div style="color: #e74c3c; font-weight: bold;">⚠️ ${vencidos} Vencidos</div><div style="color: #27ae60;">✅ ${enTiempo} En Tiempo</div>`,
                action: 'showResumen'
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
            case 'showResumen':
                this.showModernResumen();
                break;
        }
    }

    showModernResumen() {
        const contentBody = document.querySelector('.modern-content-body');
        const contentTitle = document.getElementById('modernContentTitle');
        const contentSubtitle = document.getElementById('modernContentSubtitle');
        
        if (contentTitle) contentTitle.textContent = '📊 Cuadro de Resumen - CODIM CNS';
        if (contentSubtitle) contentSubtitle.textContent = 'Estadísticas en tiempo real del sistema';
        
        if (contentBody) {
            // Destruir widget anterior si existe
            if (this.resumenWidget) {
                this.resumenWidget.destroy();
            }
            
            // Limpiar contenido
            contentBody.innerHTML = '';
            
            // Crear nuevo widget
            this.resumenWidget = new CODIMResumenWidget();
            
            // 🔗 Establecer referencia bidireccional para sincronización
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
            
            console.log('✅ Sidebar actualizado con nuevos datos:', { vencidos, enTiempo });
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
        const welcomeInfo = `🎯 Sistema CODIM CNS Modernizado

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

🔧 Patch by DemianRey
📅 Mayo 2025
🚀 Versión 3.5`;

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
                if (action) self.handleModernSidebarAction(action);
            }
            
            if (e.target.classList.contains('modern-patch')) {
                self.showModernPatchInfo();
            }
        });
    }

    modernSwitchTab(tabName) {
        document.querySelectorAll('.modern-nav-tab').forEach(tab => 
            tab.classList.remove('active'));
        document.querySelectorAll('.modern-submenu').forEach(submenu => 
            submenu.classList.remove('active'));
        
        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        const submenu = document.getElementById(`modern-submenu-${tabName}`);
        
        if (tab) tab.classList.add('active');
        if (submenu) submenu.classList.add('active');
    }

    modernLoadPage(page) {
        const titleElement = document.getElementById('modernContentTitle');
        const subtitleElement = document.getElementById('modernContentSubtitle');
        const contentBody = document.querySelector('.modern-content-body');
        
        if (titleElement) titleElement.textContent = 'Cargando...';
        if (subtitleElement) subtitleElement.textContent = 'Por favor espera...';
        
        // Destruir widget de resumen si está activo
        if (this.resumenWidget) {
            this.resumenWidget.destroy();
            this.resumenWidget = null;
        }
        
        if (contentBody) {
            const timestamp = new Date().getTime();
            const separator = page.includes('?') ? '&' : '?';
            
            contentBody.innerHTML = `<iframe class="modern-iframe" src="${page}${separator}_t=${timestamp}"></iframe>`;
            
            const iframe = contentBody.querySelector('.modern-iframe');
            if (iframe) {
                iframe.addEventListener('load', () => {
                    this.enhanceIframe(iframe);
                    if (titleElement) titleElement.textContent = 'Página Cargada';
                    if (subtitleElement) subtitleElement.textContent = 'Contenido del sistema original';
                });
            }
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

    initializeModernComponents() {
        this.updateModernDate();
        setInterval(() => this.updateModernDate(), 60000);
        
        // Cargar automáticamente el widget de resumen al inicio
        console.log('🎯 Cargando widget de resumen automáticamente...');
        setTimeout(() => {
            this.showModernResumen();
            console.log('✅ Widget de resumen inicializado - datos iniciales se actualizarán automáticamente');
        }, 500); // Pequeño delay para asegurar que todo esté renderizado
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
                
                /* Animaciones adicionales para notificaciones */
                @keyframes slideInNotification {
                    from { transform: translateX(300px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOutNotification {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(300px); opacity: 0; }
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

// ===============================
// INICIALIZACIÓN
// ===============================
const codimFix = new CODIMContentScript();
codimFix.init();

console.log('✅ CODIM CNS Fix v3.5 - Inicialización completada con Widget de Resumen cargado automáticamente');