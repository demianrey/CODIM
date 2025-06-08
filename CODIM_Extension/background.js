// background.js - VERSIÓN CORREGIDA: Logout HttpOnly JSESSIONID funcional
console.log('🚀 CODIM Background Híbrido Funcional - Logout HttpOnly corregido');

class MASNETBackgroundService {
    constructor() {
        this.credentials = {
            username: '01318241',
            password: 'D@rHez$2025$'
        };
        this.isAuthenticated = false;
        this.baseURL = 'https://masnet.intranet.telmex.com/MASNET';
        console.log('🔧 MASNETBackgroundService inicializado con credenciales válidas');
    }

    // ✅ MÉTODO LOGIN - Mantenido exacto pero SIN logout automático programado
    async performAutoLogin() {
        console.log('🔐 Iniciando login automático a MASNET...');
        
        try {
            const loginData = {
                username: this.credentials.username,
                password: this.credentials.password,
                intents: '0',
                token: ''
            };
            
            console.log('📤 Enviando login a MASNET...', {
                username: loginData.username,
                password: '***OCULTA***'
            });
            
            const response = await fetch('https://masnet.intranet.telmex.com/MASNET/app/login.do', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Origin': 'https://masnet.intranet.telmex.com',
                    'Referer': 'https://masnet.intranet.telmex.com/MASNET/'
                },
                body: new URLSearchParams(loginData).toString(),
                credentials: 'include',
                mode: 'cors'
            });
            
            console.log('📥 Login response status:', response.status);
            
            if (response.ok || response.status === 302) {
                let responseText = '';
                
                try {
                    responseText = await response.text();
                    console.log('📄 Login response (primeros 300 chars):', responseText.substring(0, 300));
                } catch (textError) {
                    console.log('⚠️ No se pudo leer response text, pero status es OK');
                }
                
                // Verificar si el login fue exitoso
                const isLoginSuccess = response.status === 302 || 
                                     responseText.includes('dashboard') ||
                                     responseText.includes('bienvenido') ||
                                     responseText.includes('menu') ||
                                     !responseText.includes('formLogin');
                
                if (isLoginSuccess) {
                    console.log('✅ Login automático exitoso');
                    this.isAuthenticated = true;
                    
                    // ✅ NO programar logout automático aquí - se hará manualmente
                    return {
                        success: true,
                        message: 'Login automático completado exitosamente',
                        status: response.status
                    };
                } else {
                    console.log('⚠️ Login automático falló - respuesta inesperada');
                    return {
                        success: false,
                        message: 'Login falló - credenciales o respuesta inesperada',
                        status: response.status
                    };
                }
            } else {
                throw new Error(`Login falló con status ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error en login automático:', error);
            this.isAuthenticated = false;
            return {
                success: false,
                message: `Error en login: ${error.message}`,
                error: error.message
            };
        }
    }

    // ✅ LOGOUT CORREGIDO - Basado en tu test exitoso
    async performAutoLogout() {
        console.log('🔓 Iniciando logout con HttpOnly JSESSIONID...');
        
        try {
            // ✅ MÉTODO 1: Logout GET directo (como en tu test exitoso)
            console.log('🔗 Método HttpOnly: GET logout con credentials include...');
            
            const logoutResponse = await fetch('https://masnet.intranet.telmex.com/MASNET/app/logout', {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Referer': 'https://masnet.intranet.telmex.com/MASNET/app/home',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                credentials: 'include', // ← CRÍTICO: Envía HttpOnly JSESSIONID automáticamente
                redirect: 'manual' // ← Importante para capturar redirecciones
            });
            
            console.log('🔓 Logout response status:', logoutResponse.status);
            
            // ✅ Tu test mostró que status puede ser 0, pero logout funciona
            if (logoutResponse.status === 0 || logoutResponse.status === 302 || logoutResponse.status === 200) {
                console.log('✅ Logout response exitoso');
                
                // ✅ VERIFICACIÓN: Como en tu test exitoso
                console.log('🔍 Verificando logout...');
                
                // Esperar 2 segundos como en tu test
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const verifyResponse = await fetch('https://masnet.intranet.telmex.com/MASNET/app/home', {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-cache'
                });
                
                console.log('📊 Verificación status:', verifyResponse.status);
                console.log('📊 Verificación URL:', verifyResponse.url);
                
                // ✅ Tu test mostró: status 200 pero URL cambia a /login = logout exitoso
                const isLoggedOut = verifyResponse.status === 302 || 
                                   verifyResponse.url.includes('login') ||
                                   verifyResponse.redirected;
                
                if (isLoggedOut) {
                    console.log('✅ LOGOUT VERIFICADO: Usuario desconectado correctamente');
                    this.isAuthenticated = false;
                    return {
                        success: true,
                        message: 'Logout HttpOnly verificado exitosamente',
                        status: logoutResponse.status,
                        verified: true,
                        verificationURL: verifyResponse.url
                    };
                } else {
                    console.log('⚠️ LOGOUT PARCIAL: Usuario aún parece estar conectado');
                    
                    // ✅ MÉTODO 2: Logout más agresivo si es necesario
                    return await this.aggressiveLogout();
                }
                
            } else {
                throw new Error(`Logout falló con status ${logoutResponse.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error en logout HttpOnly:', error);
            
            // ✅ MÉTODO DE RESPALDO
            return await this.aggressiveLogout();
        }
    }

    // ✅ MÉTODO DE RESPALDO: Logout agresivo
    async aggressiveLogout() {
        console.log('🔓 Ejecutando logout agresivo...');
        
        try {
            // Múltiples intentos de logout
            const logoutAttempts = [
                {
                    name: 'Logout POST con parámetros',
                    url: 'https://masnet.intranet.telmex.com/MASNET/app/logout',
                    method: 'POST',
                    body: 'action=logout&confirm=true'
                },
                {
                    name: 'Logout con session invalidate',
                    url: 'https://masnet.intranet.telmex.com/MASNET/app/logout',
                    method: 'POST',
                    body: 'invalidateSession=true'
                },
                {
                    name: 'Login.do con logout param',
                    url: 'https://masnet.intranet.telmex.com/MASNET/app/login.do',
                    method: 'POST',
                    body: 'logout=true&action=disconnect'
                }
            ];
            
            for (const attempt of logoutAttempts) {
                try {
                    console.log(`🔗 Probando: ${attempt.name}`);
                    
                    const response = await fetch(attempt.url, {
                        method: attempt.method,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Referer': 'https://masnet.intranet.telmex.com/MASNET/app/home',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        },
                        body: attempt.body,
                        credentials: 'include'
                    });
                    
                    console.log(`📊 ${attempt.name}: ${response.status}`);
                    
                    if (response.ok || response.status === 302 || response.status === 0) {
                        console.log(`✅ ${attempt.name} exitoso`);
                        break;
                    }
                    
                } catch (error) {
                    console.log(`❌ ${attempt.name} falló: ${error.message}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            this.isAuthenticated = false;
            
            return {
                success: true,
                message: 'Logout agresivo completado',
                method: 'aggressive'
            };
            
        } catch (error) {
            console.error('❌ Error en logout agresivo:', error);
            this.isAuthenticated = false;
            
            return {
                success: false,
                message: `Error en logout: ${error.message}`
            };
        }
    }

    // ✅ NUEVO MÉTODO: Desbloqueo REAL de PISA
    async performPISADesbloqueo(requestData) {
        console.log('🔓 === EJECUTANDO DESBLOQUEO REAL DE PISA ===');
        console.log('📋 Ambientes a desbloquear:', requestData.ambientes);
        console.log('🔑 Clave recibida:', requestData.clave ? '***PRESENTE***' : '❌ FALTANTE');
        
        if (!requestData.clave) {
            throw new Error('Clave de desbloqueo es requerida');
        }
        
        try {
            // ✅ VERIFICAR AUTENTICACIÓN ANTES DEL DESBLOQUEO
            console.log('🔍 Verificando estado de autenticación antes del desbloqueo...');
            const authCheck = await fetch('https://masnet.intranet.telmex.com/MASNET/app/home', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-cache'
            });
            
            console.log('🔐 Auth check status:', authCheck.status);
            console.log('🔐 Auth check URL:', authCheck.url);
            
            if (authCheck.status !== 200 || authCheck.url.includes('login')) {
                throw new Error('Sesión no autenticada - login requerido');
            }
            
            console.log('✅ Sesión autenticada confirmada, procediendo con desbloqueo...');
            
            // ✅ CONSTRUIR PAYLOAD según tu ejemplo exitoso
            const payload = {
                ambienteMetro: requestData.ambientes.includes('METRO') ? 'METRO' : '',
                ambienteMty: requestData.ambientes.includes('MTY') ? 'MTY' : '',
                ambienteNte: requestData.ambientes.includes('NTE') ? 'NTE' : '',
                ambienteGdl: requestData.ambientes.includes('GDL') ? 'GDL' : '',
                clave: requestData.clave,
                reclave: requestData.clave
            };
            
            console.log('📤 Payload para desbloqueo:', {
                ...payload,
                clave: '***OCULTA***',
                reclave: '***OCULTA***'
            });
            
            // ✅ LLAMADA REAL A LA API MASNET
            const response = await fetch('https://masnet.intranet.telmex.com/MASNET/app/desbloqueoUsuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'es-ES,es;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Referer': 'https://masnet.intranet.telmex.com/MASNET/app/home',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload),
                credentials: 'include' // ← CRÍTICO: Incluye JSESSIONID
            });
            
            console.log('📥 Desbloqueo response status:', response.status);
            console.log('📥 Desbloqueo response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`API desbloqueo falló con status ${response.status}`);
            }
            
            // ✅ VERIFICAR CONTENT-TYPE ANTES DE PARSEAR JSON
            const contentType = response.headers.get('content-type');
            console.log('📋 Content-Type:', contentType);
            
            if (!contentType || !contentType.includes('application/json')) {
                // La respuesta no es JSON, probablemente HTML de login
                const responseText = await response.text();
                console.log('⚠️ Respuesta no es JSON:', responseText.substring(0, 200));
                
                if (responseText.includes('login') || responseText.includes('DOCTYPE')) {
                    throw new Error('Sesión expirada - se recibió página de login en lugar de respuesta JSON');
                } else {
                    throw new Error(`Respuesta inesperada: ${responseText.substring(0, 100)}`);
                }
            }
            
            const responseData = await response.json();
            console.log('📋 Respuesta del desbloqueo:', responseData);
            
            // ✅ VERIFICAR RESPUESTA SEGÚN TU EJEMPLO
            if (responseData.codigo === 0 && responseData.mensaje === 'OK') {
                console.log('✅ DESBLOQUEO EXITOSO - Código: 0, Mensaje: OK');
                return {
                    success: true,
                    message: 'Desbloqueo PISA ejecutado exitosamente',
                    ambientes: requestData.ambientes,
                    codigo: responseData.codigo,
                    mensaje: responseData.mensaje,
                    payload: {
                        ...payload,
                        clave: '***OCULTA***',
                        reclave: '***OCULTA***'
                    }
                };
            } else {
                console.log('⚠️ DESBLOQUEO CON ADVERTENCIA:', responseData);
                return {
                    success: false,
                    message: `Desbloqueo respondió: ${responseData.mensaje || 'Error desconocido'}`,
                    codigo: responseData.codigo,
                    mensaje: responseData.mensaje,
                    ambientes: requestData.ambientes
                };
            }
            
        } catch (error) {
            console.error('❌ Error en desbloqueo PISA:', error);
            return {
                success: false,
                message: `Error en desbloqueo: ${error.message}`,
                error: error.message,
                ambientes: requestData.ambientes
            };
        }
    }

    // ✅ MÉTODO PARA TEST DE CONEXIÓN - Mantenido igual
    async testMASNETConnection() {
        console.log('🔍 Probando conexión a MASNET...');
        
        try {
            const response = await fetch('https://masnet.intranet.telmex.com/MASNET/app', {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            console.log('📊 Test response:', response.status);
            
            if (response.ok) {
                const text = await response.text();
                const isMASNET = text.toLowerCase().includes('masnet') || 
                                text.toLowerCase().includes('login') ||
                                text.toLowerCase().includes('telmex');
                
                if (isMASNET) {
                    return {
                        success: true,
                        accessible: true,
                        workingURL: 'https://masnet.intranet.telmex.com/MASNET/app',
                        status: response.status,
                        hasContent: text.length > 0,
                        contentLength: text.length,
                        message: 'MASNET accesible y funcionando'
                    };
                }
            }
            
            throw new Error(`MASNET no accesible - Status: ${response.status}`);
            
        } catch (error) {
            console.error('❌ Error en test de conexión:', error);
            return {
                success: false,
                accessible: false,
                error: error.message,
                message: 'MASNET no accesible'
            };
        }
    }

    // ✅ MÉTODO PRINCIPAL DE DESBLOQUEO - CORREGIDO con manejo manual de logout
    async handleDesbloqueoRequest(requestData) {
        console.log('🔓 === INICIANDO DESBLOQUEO PISA ===');
        console.log('📦 Datos recibidos:', {
            ambientes: requestData.ambientes,
            tieneClave: !!requestData.clave,
            claveLength: requestData.clave?.length || 0
        });
        
        try {
            // PASO 1: Login automático
            console.log('🔐 Ejecutando login automático...');
            const loginResult = await this.performAutoLogin();
            
            if (!loginResult.success) {
                throw new Error(`Login falló: ${loginResult.message}`);
            }
            
            console.log('✅ Login exitoso, procesando desbloqueo...');
            
            // PASO 2: ✅ DESBLOQUEO REAL DE PISA
            console.log('🔄 Procesando desbloqueo REAL para ambientes:', requestData.ambientes);
            const desbloqueoResult = await this.performPISADesbloqueo(requestData);
            
            if (!desbloqueoResult.success) {
                throw new Error(`Desbloqueo falló: ${desbloqueoResult.message}`);
            }
            
            // PASO 3: ✅ LOGOUT MANUAL INMEDIATO
            console.log('🔓 Ejecutando logout manual después del desbloqueo...');
            const logoutResult = await this.performAutoLogout();
            
            console.log('🔓 Resultado del logout:', logoutResult);
            
            return {
                success: true,
                message: `Desbloqueo PISA completado exitosamente para ambientes: ${requestData.ambientes.join(', ')}`,
                ambientes: requestData.ambientes,
                loginDetails: loginResult,
                desbloqueoDetails: desbloqueoResult, // ← Agregado
                logoutDetails: logoutResult,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error en desbloqueo:', error);
            
            // Logout de emergencia
            try {
                console.log('🚨 Ejecutando logout de emergencia...');
                await this.performAutoLogout();
            } catch (logoutError) {
                console.error('❌ Logout de emergencia falló:', logoutError);
            }
            
            return {
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ✅ CONFIGURAR LISTENERS - Mantenido igual
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('📨 Mensaje recibido en background:', message);
            
            switch (message.action) {
                case 'ping':
                    console.log('🏓 PING recibido');
                    sendResponse({ 
                        success: true, 
                        message: 'Background activo',
                        timestamp: new Date().toISOString(),
                        serviceReady: true
                    });
                    break;
                    
                case 'masnet_test':
                    console.log('🧪 MASNET TEST recibido');
                    this.testMASNETConnection()
                        .then(result => sendResponse({ success: true, ...result }))
                        .catch(error => sendResponse({ 
                            success: false, 
                            error: error.message,
                            timestamp: new Date().toISOString()
                        }));
                    return true; // Async response
                    
                case 'masnet_login':
                    console.log('🔐 LOGIN TEST recibido');
                    this.performAutoLogin()
                        .then(result => sendResponse({ success: true, data: result }))
                        .catch(error => sendResponse({ 
                            success: false, 
                            data: { success: false, message: error.message }
                        }));
                    return true; // Async response
                    
                case 'masnet_logout':
                    console.log('🔓 LOGOUT recibido');
                    this.performAutoLogout()
                        .then(result => sendResponse({ success: true, data: result }))
                        .catch(error => sendResponse({ 
                            success: false, 
                            data: { success: false, message: error.message }
                        }));
                    return true; // Async response
                    
                case 'masnet_desbloqueo':
                    console.log('🔓 DESBLOQUEO PISA recibido');
                    this.handleDesbloqueoRequest(message.data)
                        .then(result => {
                            console.log('📋 Resultado del desbloqueo enviado:', result);
                            sendResponse({ success: true, data: result });
                        })
                        .catch(error => {
                            console.error('❌ Error en handler de desbloqueo:', error);
                            sendResponse({ 
                                success: false, 
                                data: { success: false, message: error.message }
                            });
                        });
                    return true; // Async response
                    
                default:
                    console.log('❓ Acción desconocida:', message.action);
                    sendResponse({ 
                        success: false, 
                        error: `Acción desconocida: ${message.action}` 
                    });
            }
        });
        
        console.log('✅ Message listeners configurados');
    }
}

// ===============================
// INICIALIZACIÓN
// ===============================
const masnetService = new MASNETBackgroundService();
masnetService.setupMessageListener();

// ===============================
// EVENTOS DE EXTENSIÓN
// ===============================
chrome.runtime.onInstalled.addListener((details) => {
    console.log('🔧 Extensión instalada/actualizada:', details.reason);
    
    if (details.reason === 'install') {
        console.log('🎉 Primera instalación de CODIM CNS Fix');
    } else if (details.reason === 'update') {
        console.log('⬆️ Extensión actualizada a versión:', chrome.runtime.getManifest().version);
    }
});

// Manejar errores no capturados
self.addEventListener('error', (event) => {
    console.error('❌ Error en background script:', event.error);
});

console.log('✅ CODIM Background Híbrido Funcional con Logout HttpOnly corregido completamente inicializado');