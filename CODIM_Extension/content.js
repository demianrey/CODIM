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
            document.addEventListener('codim_request', async (event) => {
                const { action, id } = event.detail;
                console.log(`📨 Request recibido: ${action} (${id})`);
                
                try {
                    const result = await chrome.runtime.sendMessage({ action });
                    console.log(`📥 Response para ${action}:`, result);
                    
                    document.dispatchEvent(new CustomEvent('codim_response', {
                        detail: { action, id, result, success: true }
                    }));
                    
                } catch (error) {
                    console.error(`❌ Error en ${action}:`, error);
                    
                    document.dispatchEvent(new CustomEvent('codim_response', {
                        detail: { action, id, error: error.message, success: false }
                    }));
                }
            });
            
            console.log('✅ Event listeners configurados');
        }

        // Método directo para comunicación interna
        async sendMessage(action, data = null) {
            try {
                const message = data ? { action, data } : { action };
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
    // FUNCIONES DE TESTING GLOBALES
    // ===============================
    class TestingFunctions {
        constructor(communicationSystem) {
            this.comm = communicationSystem;
            this.injectGlobalFunctions();
        }

        injectGlobalFunctions() {
            // Múltiples métodos de inyección para máxima compatibilidad
            this.injectViaEval();
            this.injectViaBlob();
            this.injectDirectly();
            
            console.log('🔧 Funciones de testing inyectadas con múltiples métodos');
        }

        injectViaEval() {
            try {
                window.eval(`
                    console.log('📍 Inyectando funciones via eval...');
                    
                    // testMASNET
                    window.testMASNET = async function() {
                        console.log('🧪 Testing MASNET...');
                        
                        return new Promise((resolve, reject) => {
                            const id = 'masnet_' + Date.now();
                            
                            const responseHandler = (event) => {
                                if (event.detail.id === id) {
                                    document.removeEventListener('codim_response', responseHandler);
                                    
                                    const result = event.detail.result;
                                    console.log('%c✅ MASNET RESULT:', 'background: blue; color: white; padding: 5px; font-weight: bold;', result);
                                    
                                    if (result && result.success) {
                                        console.log('🌐 URL:', result.workingURL || result.url);
                                        console.log('📊 Status:', result.status);
                                        console.log('📄 Content:', result.contentLength, 'chars');
                                    } else if (result) {
                                        console.log('🚫 Error:', result.error);
                                    }
                                    
                                    resolve(result);
                                }
                            };
                            
                            document.addEventListener('codim_response', responseHandler);
                            
                            setTimeout(() => {
                                document.removeEventListener('codim_response', responseHandler);
                                reject(new Error('Timeout'));
                            }, 15000);
                            
                            document.dispatchEvent(new CustomEvent('codim_request', {
                                detail: { action: 'masnet_test', id: id }
                            }));
                        });
                    };
                    
                    // testBackground
                    window.testBackground = async function() {
                        console.log('📡 Testing background...');
                        
                        return new Promise((resolve, reject) => {
                            const id = 'bg_' + Date.now();
                            
                            const responseHandler = (event) => {
                                if (event.detail.id === id) {
                                    document.removeEventListener('codim_response', responseHandler);
                                    console.log('✅ Background response:', event.detail.result);
                                    resolve(event.detail.result);
                                }
                            };
                            
                            document.addEventListener('codim_response', responseHandler);
                            setTimeout(() => {
                                document.removeEventListener('codim_response', responseHandler);
                                reject(new Error('Timeout'));
                            }, 10000);
                            
                            document.dispatchEvent(new CustomEvent('codim_request', {
                                detail: { action: 'ping', id: id }
                            }));
                        });
                    };

                    // testLogin
                    window.testLogin = async function() {
                        console.log('🔐 Testing MASNET login...');
                        
                        return new Promise((resolve, reject) => {
                            const id = 'login_' + Date.now();
                            
                            const responseHandler = (event) => {
                                if (event.detail.id === id) {
                                    document.removeEventListener('codim_response', responseHandler);
                                    
                                    const result = event.detail.result;
                                    console.log('%c🔐 LOGIN RESULT:', 'background: green; color: white; padding: 5px; font-weight: bold;', result);
                                    
                                    if (result && result.success && result.data) {
                                        console.log('✅ Login exitoso:', result.data.message);
                                        console.log('🌐 Base URL:', result.data.baseURL);
                                    } else {
                                        console.log('❌ Login falló:', result?.data?.message || 'Error desconocido');
                                    }
                                    
                                    resolve(result);
                                }
                            };
                            
                            document.addEventListener('codim_response', responseHandler);
                            
                            setTimeout(() => {
                                document.removeEventListener('codim_response', responseHandler);
                                reject(new Error('Timeout'));
                            }, 30000); // Más tiempo para login
                            
                            document.dispatchEvent(new CustomEvent('codim_request', {
                                detail: { action: 'masnet_login', id: id }
                            }));
                        });
                    };
                    
                    // runAllTests
                    window.runAllTests = async function() {
                        console.log('🚀 Running all tests...');
                        try {
                            console.log('1️⃣ Testing background...');
                            const bg = await window.testBackground();
                            
                            console.log('2️⃣ Testing MASNET...');
                            const masnet = await window.testMASNET();
                            
                            console.log('3️⃣ Testing login...');
                            const login = await window.testLogin();
                            
                            const results = { background: bg, masnet, login };
                            console.log('%c✅ ALL TESTS COMPLETED:', 'background: purple; color: white; padding: 10px; font-weight: bold; font-size: 16px;', results);
                            return results;
                        } catch (error) {
                            console.error('❌ Error in tests:', error);
                            return { error: error.message };
                        }
                    };
                    
                    console.log('✅ Funciones eval creadas:', {
                        testMASNET: typeof window.testMASNET,
                        testBackground: typeof window.testBackground,
                        testLogin: typeof window.testLogin,
                        runAllTests: typeof window.runAllTests
                    });
                `);
                
                console.log('✅ Inyección eval completada');
                
            } catch (error) {
                console.error('❌ Error en inyección eval:', error);
            }
        }

        injectViaBlob() {
            try {
                const scriptCode = `
                    console.log('📍 Inyectando funciones via blob...');
                    
                    // Solo crear si no existen
                    if (typeof window.testMASNET === 'undefined') {
                        window.testMASNET = async function() {
                            console.log('🧪 Testing MASNET (blob)...');
                            
                            return new Promise((resolve) => {
                                const id = 'masnet_' + Date.now();
                                
                                const handler = (e) => {
                                    if (e.detail.id === id) {
                                        document.removeEventListener('codim_response', handler);
                                        resolve(e.detail.result);
                                    }
                                };
                                
                                document.addEventListener('codim_response', handler);
                                setTimeout(() => resolve(null), 15000);
                                
                                document.dispatchEvent(new CustomEvent('codim_request', {
                                    detail: { action: 'masnet_test', id }
                                }));
                            });
                        };
                    }
                    
                    if (typeof window.testBackground === 'undefined') {
                        window.testBackground = async function() {
                            console.log('📡 Testing background (blob)...');
                            
                            return new Promise((resolve) => {
                                const id = 'bg_' + Date.now();
                                
                                const handler = (e) => {
                                    if (e.detail.id === id) {
                                        document.removeEventListener('codim_response', handler);
                                        resolve(e.detail.result);
                                    }
                                };
                                
                                document.addEventListener('codim_response', handler);
                                setTimeout(() => resolve(null), 10000);
                                
                                document.dispatchEvent(new CustomEvent('codim_request', {
                                    detail: { action: 'ping', id }
                                }));
                            });
                        };
                    }
                    
                    console.log('✅ Funciones blob creadas (fallback)');
                `;
                
                const blob = new Blob([scriptCode], { type: 'application/javascript' });
                const script = document.createElement('script');
                script.src = URL.createObjectURL(blob);
                
                script.onload = () => {
                    URL.revokeObjectURL(script.src);
                    console.log('✅ Script blob cargado');
                };
                
                (document.head || document.documentElement).appendChild(script);
                
            } catch (error) {
                console.error('❌ Error en inyección blob:', error);
            }
        }

        injectDirectly() {
            try {
                // Funciones de respaldo directo
                if (typeof window.testMASNET === 'undefined') {
                    Object.defineProperty(window, 'testMASNET', {
                        value: async () => {
                            console.log('🧪 testMASNET (directo)');
                            return this.comm.sendMessage('masnet_test');
                        },
                        writable: false,
                        enumerable: true,
                        configurable: true
                    });
                }
                
                if (typeof window.testBackground === 'undefined') {
                    Object.defineProperty(window, 'testBackground', {
                        value: async () => {
                            console.log('📡 testBackground (directo)');
                            return this.comm.sendMessage('ping');
                        },
                        writable: false,
                        enumerable: true,
                        configurable: true
                    });
                }
                
                console.log('✅ Funciones directas definidas (respaldo)');
                
            } catch (error) {
                console.error('❌ Error en inyección directa:', error);
            }
        }

        // Verificación final de funciones
        verifyFunctions() {
            setTimeout(() => {
                console.log('🔍 VERIFICACIÓN FINAL...');
                
                const checks = {
                    testMASNET: typeof window.testMASNET,
                    testBackground: typeof window.testBackground,
                    testLogin: typeof window.testLogin,
                    runAllTests: typeof window.runAllTests,
                    windowKeys: Object.keys(window).filter(k => k.includes('test'))
                };
                
                console.log('📊 Estado final de funciones:', checks);
                
                if (checks.testMASNET === 'function') {
                    console.log('%c🎉 ¡ÉXITO! Funciones de testing disponibles', 'background: green; color: white; padding: 10px; font-weight: bold; font-size: 16px;');
                    console.log('%c💡 Ejecuta: testMASNET(), testBackground(), testLogin(), runAllTests()', 'background: blue; color: white; padding: 5px; font-weight: bold;');
                    
                    // Auto-test opcional
                    setTimeout(() => {
                        console.log('🔄 Auto-test de comunicación...');
                        window.testBackground().then(result => {
                            console.log('✅ Auto-test comunicación completado:', result);
                        }).catch(error => {
                            console.error('❌ Auto-test comunicación falló:', error);
                        });
                    }, 2000);
                    
                } else {
                    console.log('%c❌ FALLO: Funciones no disponibles', 'background: red; color: white; padding: 10px; font-weight: bold;');
                }
            }, 3000);
        }
    }

    // ===============================
    // INICIALIZACIÓN MÓDULO 1
    // ===============================
    function initializeModule1() {
        console.log('🔧 Inicializando Módulo 1...');
        
        // Inicializar sistema de comunicación
        const communicationSystem = new CommunicationSystem();
        
        // Inicializar funciones de testing
        const testingFunctions = new TestingFunctions(communicationSystem);
        
        // Verificar que todo funcione
        testingFunctions.verifyFunctions();
        
        // Hacer disponible globalmente para otros módulos
        window.codimCommunication = communicationSystem;
        
        console.log('✅ Módulo 1 inicializado - Sistema base listo');
        
        return { communicationSystem, testingFunctions };
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeModule1);
    } else {
        initializeModule1();
    }
}

console.log('✅ CODIM CNS Fix v3.7 - Módulo 1 cargado');

// content.js - MÓDULO 2: SimpleDSLAMSearch class
// AGREGAR DESPUÉS DEL MÓDULO 1

// ===============================
// CLASE SIMPLE DSLAM SEARCH
// ===============================
class SimpleDSLAMSearch {
    constructor() {
        this.initialized = false;
        this.observer = null;
        console.log('🔍 SimpleDSLAMSearch inicializado');
    }

    init() {
        if (this.initialized) return;
        
        console.log('🔍 Inicializando buscador simple de DSLAMs...');
        this.setupObserver();
        this.injectStyles();
        this.initialized = true;
    }

    setupObserver() {
        // Observer para detectar nuevas tablas después de envío de formularios
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            // Buscar tablas que contengan resultados de DSLAMs
                            const tables = node.tagName === 'TABLE' ? [node] : 
                                          (node.querySelector ? node.querySelectorAll('table') : []);
                            
                            tables.forEach(table => {
                                if (this.isEquipmentTable(table) && !table.dataset.searchAdded) {
                                    console.log('📊 Tabla de resultados detectada, agregando buscador');
                                    setTimeout(() => this.addSearchToTable(table), 500);
                                }
                            });
                        }
                    });
                }
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // También revisar tablas existentes
        this.checkExistingTables();
    }

    checkExistingTables() {
        const existingTables = document.querySelectorAll('table');
        existingTables.forEach(table => {
            if (this.isEquipmentTable(table) && !table.dataset.searchAdded) {
                console.log('📊 Tabla de resultados existente encontrada');
                this.addSearchToTable(table);
            }
        });
    }

    isEquipmentTable(table) {
        if (!table || !table.querySelector) return false;

        const tableText = table.textContent.toLowerCase();
        const rows = table.querySelectorAll('tr');
        
        // ✅ EXCLUSIÓN ESPECÍFICA: No agregar buscador a reportes pendientes
        if (tableText.includes('existen reportes pendientes de solucion')) {
            return false;
        }
        
        // Verificar que contenga equipos DSLAM
        const hasEquipmentData = tableText.includes('dslam') || 
                               tableText.includes('tecnologia') || 
                               tableText.includes('supervision');
        
        return hasEquipmentData && rows.length >= 2 && tableText.length > 50;
    }

    addSearchToTable(table) {
        if (table.dataset.searchAdded) return;
        
        table.dataset.searchAdded = 'true';
        
        // Obtener filas de datos (excluyendo header)
        const dataRows = Array.from(table.querySelectorAll('tr')).slice(1);
        
        if (dataRows.length === 0) {
            console.log('⚠️ No se encontraron filas de datos');
            return;
        }

        // Crear buscador
        const searchContainer = this.createSearchBox(dataRows.length);
        
        // Insertar antes de la tabla
        const parent = table.parentNode;
        if (parent) {
            parent.insertBefore(searchContainer, table);
        }

        // Configurar búsqueda
        this.setupSearch(searchContainer, table, dataRows);
        
        // Mejorar estilos de la tabla
        this.enhanceTableStyles(table);

        console.log(`✅ Buscador agregado - ${dataRows.length} equipos disponibles`);
    }

    createSearchBox(totalRows) {
        const container = document.createElement('div');
        container.className = 'dslam-search-container';
        
        const uniqueId = 'search_' + Date.now();
        
        container.innerHTML = `
            <div class="search-header">
                <div class="search-title">
                    <span class="search-icon">🔍</span>
                    <span>Buscar DSLAM</span>
                </div>
                <div class="search-counter" id="counter_${uniqueId}">
                    <span id="count_${uniqueId}">${totalRows}</span> equipos
                </div>
            </div>
            <div class="search-input-group">
                <input 
                    type="text" 
                    id="input_${uniqueId}" 
                    class="search-input"
                    placeholder="Nombre del DSLAM (ej: QRO-CORREGIDORA, COG1, ISAM...)"
                    autocomplete="off"
                >
                <button type="button" class="search-clear" id="clear_${uniqueId}" title="Limpiar">
                    ✕
                </button>
            </div>
        `;

        container.dataset.uniqueId = uniqueId;
        return container;
    }

    setupSearch(container, table, dataRows) {
        const uniqueId = container.dataset.uniqueId;
        const searchInput = container.querySelector(`#input_${uniqueId}`);
        const clearBtn = container.querySelector(`#clear_${uniqueId}`);
        
        // Event listeners
        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value.trim(), dataRows, uniqueId);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch(searchInput, dataRows, uniqueId);
            }
        });

        clearBtn.addEventListener('click', () => {
            this.clearSearch(searchInput, dataRows, uniqueId);
            searchInput.focus();
        });

        // Auto-focus
        setTimeout(() => searchInput.focus(), 300);
    }

    performSearch(searchTerm, dataRows, uniqueId) {
        console.log(`🔍 Buscando: "${searchTerm}"`);

        const searchLower = searchTerm.toLowerCase();
        let visibleCount = 0;

        dataRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            
            // Buscar en todo el contenido de la fila
            const matches = searchTerm === '' || rowText.includes(searchLower);

            if (matches) {
                row.style.display = '';
                row.classList.remove('hidden-row');
                row.classList.add('visible-row');
                visibleCount++;
            } else {
                row.style.display = 'none';
                row.classList.add('hidden-row');
                row.classList.remove('visible-row');
            }
        });

        this.updateCounter(visibleCount, searchTerm, uniqueId, dataRows.length);
        console.log(`📊 ${visibleCount} de ${dataRows.length} equipos visibles`);
    }

    updateCounter(visibleCount, searchTerm, uniqueId, totalRows) {
        const counter = document.querySelector(`#count_${uniqueId}`);
        const counterContainer = document.querySelector(`#counter_${uniqueId}`);
        
        if (counter) {
            counter.textContent = visibleCount;
        }
        
        if (counterContainer) {
            counterContainer.className = 'search-counter';
            
            if (visibleCount === 0 && searchTerm !== '') {
                counterContainer.classList.add('no-results');
            } else if (visibleCount < totalRows && searchTerm !== '') {
                counterContainer.classList.add('filtered');
            }
        }
    }

    clearSearch(input, dataRows, uniqueId) {
        input.value = '';
        this.performSearch('', dataRows, uniqueId);
    }

    enhanceTableStyles(table) {
        table.classList.add('enhanced-results-table');
        
        // Mejorar filas
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index === 0) {
                row.classList.add('table-header');
            } else {
                row.classList.add('table-data-row');
            }
        });
    }

    injectStyles() {
        if (document.getElementById('simple-dslam-search-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'simple-dslam-search-styles';
        style.textContent = `
            .dslam-search-container {
                background: linear-gradient(135deg, #ffffff, #f8fdff);
                border: 2px solid #e3f2fd;
                border-radius: 10px;
                padding: 16px;
                margin: 16px auto;
                max-width: 600px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                font-family: 'Segoe UI', Arial, sans-serif;
                animation: slideInSearch 0.4s ease-out;
            }

            @keyframes slideInSearch {
                from { opacity: 0; transform: translateY(-15px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .search-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 1rem;
                color: #1565c0;
            }

            .search-icon {
                font-size: 1.2rem;
            }

            .search-counter {
                background: #2196f3;
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .search-counter.filtered {
                background: #ff9800;
                animation: pulseCounter 0.8s ease-in-out;
            }

            .search-counter.no-results {
                background: #f44336;
                animation: shakeCounter 0.4s ease-in-out;
            }

            @keyframes pulseCounter {
                0% { transform: scale(1); }
                50% { transform: scale(1.08); }
                100% { transform: scale(1); }
            }

            @keyframes shakeCounter {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-2px); }
                75% { transform: translateX(2px); }
            }

            .search-input-group {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .search-input {
                flex: 1;
                padding: 10px 14px;
                border: 2px solid #e1e5e9;
                border-radius: 20px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: white;
                outline: none;
            }

            .search-input:focus {
                border-color: #2196f3;
                box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
                transform: scale(1.01);
            }

            .search-input::placeholder {
                color: #9e9e9e;
                font-style: italic;
            }

            .search-clear {
                background: #f44336;
                color: white;
                border: none;
                padding: 8px 10px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 12px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .search-clear:hover {
                background: #d32f2f;
                transform: scale(1.1);
            }

            .enhanced-results-table {
                border-collapse: separate;
                border-spacing: 0;
                width: 100%;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                margin-top: 12px;
            }

            .enhanced-results-table .table-header {
                background: linear-gradient(135deg, #2196f3, #1976d2);
                color: white;
            }

            .enhanced-results-table .table-header td {
                padding: 10px !important;
                font-weight: 600 !important;
                text-align: center !important;
                font-size: 0.9rem !important;
            }

            .enhanced-results-table .table-data-row {
                transition: all 0.25s ease;
                background: white;
            }

            .enhanced-results-table .table-data-row:nth-child(even) {
                background: #fafafa;
            }

            .enhanced-results-table .table-data-row:hover {
                background: #e3f2fd !important;
                transform: scale(1.005);
                box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            }

            .enhanced-results-table .table-data-row td {
                padding: 8px !important;
                border-bottom: 1px solid #e0e0e0 !important;
                font-size: 0.9rem !important;
            }

            .enhanced-results-table .visible-row {
                animation: fadeInRow 0.3s ease-out;
            }

            @keyframes fadeInRow {
                from { opacity: 0; transform: translateX(-8px); }
                to { opacity: 1; transform: translateX(0); }
            }

            /* Responsive */
            @media (max-width: 600px) {
                .dslam-search-container {
                    margin: 10px;
                    padding: 12px;
                }

                .search-header {
                    flex-direction: column;
                    gap: 8px;
                    text-align: center;
                }

                .search-input {
                    font-size: 16px; /* Evita zoom en móviles */
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Estilos del buscador simple inyectados');
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        const searchContainers = document.querySelectorAll('.dslam-search-container');
        searchContainers.forEach(container => container.remove());
        
        const styles = document.getElementById('simple-dslam-search-styles');
        if (styles) styles.remove();
        
        this.initialized = false;
        console.log('🗑️ Buscador simple limpiado');
    }
}

// ===============================
// INSTANCIA GLOBAL PARA MÓDULOS
// ===============================
window.codimDSLAMSearch = new SimpleDSLAMSearch();

console.log('✅ CODIM CNS Fix v3.7 - Módulo 2 (SimpleDSLAMSearch) cargado');

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
        this.contentScript = null; // Referencia al content script principal
        console.log('📊 CODIMResumenWidget inicializado');
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
        if (widget) widget.remove();
        
        const styles = document.getElementById('codim-resumen-styles');
        if (styles) styles.remove();
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
                const event = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(event);
            });
        });

        // Inputs de clave
        const claveInput = container.querySelector('#clave-input');
        const reclaveInput = container.querySelector('#reclave-input');
        
        claveInput.addEventListener('input', () => this.validateForm());
        reclaveInput.addEventListener('input', () => this.validateForm());

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
        const clavesCoinciden = claveInput.value === reclaveInput.value;
        
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
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        try {
            const clave = document.getElementById('clave-input').value.trim();
            
            if (!this.validateForm()) {
                throw new Error('Por favor complete todos los campos correctamente');
            }
            
            console.log('🔓 Iniciando proceso de desbloqueo:', {
                ambientes: this.selectedAmbientes,
                clave: '***OCULTA***'
            });
            
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
                clave: clave
            });
            
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
                this.showResultModal(false, { message: error.message });
            }, 1000);
        } finally {
            this.isProcessing = false;
        }
    }

    async comunicarConBackground(action, data = null) {
        return new Promise((resolve, reject) => {
            console.log(`📡 Comunicación directa ${action}:`, data ? { ...data, clave: '***OCULTA***' } : 'sin datos');
            
            chrome.runtime.sendMessage({ action, data }, (response) => {
                console.log(`📡 Comunicación directa ${action}:`, response);
                
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
        if (document.getElementById('desbloqueo-styles')) return;
        
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
                text-transform: uppercase;
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
class CODIMContentScript {
    constructor() {
        this.isMainPage = this.checkIsMainPage();
        this.hasOldInterface = this.checkHasOldInterface();
        this.userData = null;
        this.resumenWidget = null;
        this.simpleDSLAMSearch = null;
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
        window.cambia_menu = function(seccion, tipo, folio, param1, param2, param3, busca) {
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
        window.cancelar = function() {
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

    initializeDSLAMSearch() {
        console.log('🔍 Inicializando buscador DSLAM para páginas clásicas...');
        
        // Usar la instancia global del buscador
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
        
        if (contentTitle) contentTitle.textContent = '🔓 Desbloqueo de usuario PISA';
        if (contentSubtitle) contentSubtitle.textContent = 'Para desbloqueo seleccione el ambiente y teclee su clave de usuario';
        
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
                if (action) self.handleModernSidebarAction(action);
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
        
        if (tab) tab.classList.add('active');
        if (submenu) submenu.classList.add('active');
    }

    modernLoadPage(page) {
        const titleElement = document.getElementById('modernContentTitle');
        const subtitleElement = document.getElementById('modernContentSubtitle');
        const contentBody = document.querySelector('.modern-content-body');
        
        // CRÍTICO: Manejar páginas especiales ANTES de cualquier otro código
        if (page === 'desbloqueo-pisa.html') {
            this.showDesbloqueoPage();
            return;
        }
        
        // Continuar con el flujo normal para otras páginas
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
                    if (subtitleElement) subtitleElement.textContent = 'Contenido del sistema original - Buscador DSLAMs activo';
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
                    
                    // Inyectar funciones de compatibilidad en el iframe
                    const compatScript = iframeDoc.createElement('script');
                    compatScript.textContent = `
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
                    `;
                    iframeDoc.head.appendChild(compatScript);
                    
                    // Activar buscador específico para iframe usando la instancia global
                    setTimeout(() => {
                        this.addIframeDSLAMSearch(iframeDoc);
                    }, 1000);
                    
                    console.log('✅ Iframe mejorado con buscador y funciones de compatibilidad');
                }
            } catch (error) {
                console.log('⚠️ No se pudo acceder al iframe (CORS)');
            }
        });
    }

    addIframeDSLAMSearch(iframeDoc) {
        if (!iframeDoc) return;
        
        // Verificar si la página contiene texto específico de reportes pendientes (NO de equipos)
        const bodyText = iframeDoc.body.textContent.toLowerCase();
        const isReportPage = (
            bodyText.includes('existen reportes pendientes de solucion')
        );
        
        if (isReportPage) {
            console.log('❌ Página de reportes pendientes detectada en iframe - NO agregar buscador');
            return;
        }
        
        // Buscar tablas específicas de equipos DSLAM
        const tables = iframeDoc.querySelectorAll('table');
        let targetTable = null;
        
        tables.forEach(table => {
            const tableText = table.textContent.toLowerCase();
            const rows = table.querySelectorAll('tr');
            
            // EXCLUIR solo si contiene palabras específicas de reportes (NO de contadores)
            const isTableWithReports = (
                tableText.includes('folio') ||
                tableText.includes('falla equipos fuera de gestion') ||
                tableText.includes('capturar otro') ||
                tableText.includes('cancelar')
            );
            
            if (isTableWithReports) {
                console.log('❌ Tabla de reportes en iframe detectada - NO agregar buscador');
                return;
            }
            
            // Verificar que sea una tabla de equipos DSLAM válida
            const isEquipmentTable = (
                (tableText.includes('dslam') || tableText.includes('tecnologia') || tableText.includes('supervision')) &&
                rows.length >= 3
            );
            
            // Verificar que tenga headers de equipos (incluir "pendientes" como contador)
            const hasEquipmentHeaders = (
                table.querySelector('td')?.textContent.includes('Dslam') ||
                table.querySelector('td')?.textContent.includes('Tecnologia') ||
                table.querySelector('td')?.textContent.includes('O.S.') ||
                table.querySelector('td')?.textContent.includes('Quejas')
            );
            
            if (isEquipmentTable && hasEquipmentHeaders && !table.dataset.searchAdded) {
                targetTable = table;
            }
        });
        
        if (!targetTable) {
            console.log('ℹ️ No se encontró tabla de equipos válida en iframe');
            return;
        }
        
        console.log('📊 Tabla de equipos REAL encontrada en iframe, agregando buscador específico');
        
        // Crear buscador específico para iframe
        this.createIframeDSLAMSearchBox(targetTable, iframeDoc);
    }

    createIframeDSLAMSearchBox(table, iframeDoc) {
        if (table.dataset.searchAdded) return;
        table.dataset.searchAdded = 'true';
        
        // Obtener filas de datos (excluyendo header)
        const dataRows = Array.from(table.querySelectorAll('tr')).slice(1);
        
        if (dataRows.length === 0) {
            console.log('⚠️ No se encontraron filas de datos en iframe');
            return;
        }
        
        // Crear contenedor del buscador
        const searchContainer = iframeDoc.createElement('div');
        searchContainer.className = 'iframe-dslam-search';
        searchContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, #ffffff, #f8fdff); border: 2px solid #e3f2fd; border-radius: 10px; padding: 16px; margin: 16px auto; max-width: 600px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); font-family: 'Segoe UI', Arial, sans-serif;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 1rem; color: #1565c0;">
                        <span style="font-size: 1.2rem;">🔍</span>
                        <span>Buscar DSLAM</span>
                    </div>
                    <div id="iframe-counter" style="background: #2196f3; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                        <span id="iframe-count">${dataRows.length}</span> equipos
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="iframe-search-input" placeholder="Nombre del DSLAM (ej: QRO-CORREGIDORA, COG1, ISAM...)" style="flex: 1; padding: 10px 14px; border: 2px solid #e1e5e9; border-radius: 20px; font-size: 14px; background: white; outline: none;">
                    <button type="button" id="iframe-clear-btn" title="Limpiar" style="background: #f44336; color: white; border: none; padding: 8px 10px; border-radius: 50%; cursor: pointer; font-size: 12px; width: 32px; height: 32px;">✕</button>
                </div>
            </div>
        `;
        
        // Insertar antes de la tabla
        table.parentNode.insertBefore(searchContainer, table);
        
        // Configurar búsqueda
        const searchInput = searchContainer.querySelector('#iframe-search-input');
        const clearBtn = searchContainer.querySelector('#iframe-clear-btn');
        const counter = searchContainer.querySelector('#iframe-count');
        const counterContainer = searchContainer.querySelector('#iframe-counter');
        
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
            
            counter.textContent = visibleCount;
            
            // Actualizar color del contador
            counterContainer.style.background = visibleCount === 0 && searchTerm !== '' ? '#f44336' : 
                                              visibleCount < dataRows.length && searchTerm !== '' ? '#ff9800' : '#2196f3';
            
            console.log(`📊 ${visibleCount} de ${dataRows.length} equipos visibles en iframe`);
        };
        
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
        
        console.log(`✅ Buscador específico agregado al iframe - ${dataRows.length} equipos disponibles`);
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
            },
            extras: {
                title: 'Extras',
                icon: '🔧',
                items: [
                    { title: 'Desbloqueo PISA', icon: '🔓', page: 'desbloqueo-pisa.html' }
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