// inject.js - Script principal CODIM CNS Fix
(function() {
    'use strict';
    
    // Solo ejecutar si NO estamos en la interfaz moderna
    if (document.getElementById('modern-codim-interface')) {
        console.log('Interfaz moderna detectada, saltando inject.js');
        return;
    }
    
    console.log('CODIM CNS Fix - Patch by DemianRey - Iniciando en página interna...');
    
    // ===============================
    // FUNCIONES JAVASCRIPT QUE REEMPLAZAN VBSCRIPT
    // ===============================
    
    // Funciones auxiliares
    function trim(str) {
        if (!str) return '';
        return str.replace(/^\s+|\s+$/g, '');
    }
    
    function len(str) {
        if (!str) return 0;
        return str.length;
    }
    
    function mid(str, start, length) {
        if (!str) return '';
        return str.substring(start - 1, start - 1 + length);
    }
    
    function asc(char) {
        if (!char) return 0;
        return char.charCodeAt(0);
    }
    
    function msgbox(message) {
        alert(message);
    }
    
    // Función principal de validación
    window.valida_datos = function() {
        console.log('Ejecutando valida_datos JavaScript...');
        
        const form = document.envia_datos || document.forms.envia_datos || document.forms[0];
        if (!form) {
            alert('Error: No se encontró el formulario');
            return false;
        }
        
        const fallaField = form.cual_falla;
        if (!fallaField) {
            console.log('Campo cual_falla no encontrado, enviando formulario...');
            form.submit();
            return true;
        }
        
        const varz = trim(fallaField.value);
        console.log('Falla seleccionada:', varz);
        
        if (varz !== "00" && varz !== "") {
            const obsField = form.obsdslam;
            if (!obsField) {
                console.log('Campo obsdslam no encontrado, enviando formulario...');
                form.submit();
                return true;
            }
            
            const obsText = trim(obsField.value);
            const cuenta = len(obsText);
            
            if (cuenta > 2) {
                let pasa = "S";
                
                // Validar caracteres inválidos
                for (let i = 1; i <= cuenta; i++) {
                    const letra = mid(obsText, i, 1);
                    if (letra === "'" || asc(letra) === 10) {
                        msgbox("En el Texto de OBS, Hay un Caracter Invalido.\nNo puedes utilizar apostrofe ni la tecla Enter.");
                        pasa = "N";
                        break;
                    }
                }
                
                if (pasa === "S") {
                    const salvarField = form.salvar;
                    if (salvarField) {
                        salvarField.value = "S";
                    }
                    
                    console.log('Validación exitosa. Enviando formulario...');
                    
                    try {
                        form.submit();
                        return true;
                    } catch (error) {
                        console.error('Error al enviar:', error);
                        alert('Error al enviar el formulario: ' + error.message);
                        return false;
                    }
                }
            } else {
                msgbox("Es indispensable anotar comentarios.");
                return false;
            }
        } else {
            msgbox("Favor de Seleccionar una Falla en el Catalogo.");
            return false;
        }
        return false;
    };
    
    // Función de validación de texto
    window.vertexto = function() {
        const form = document.envia_datos || document.forms.envia_datos || document.forms[0];
        if (!form) return;
        
        const obsField = form.obsdslam;
        if (!obsField) return;
        
        const obsText = trim(obsField.value);
        const cuenta = len(obsText);
        
        if (cuenta > 0) {
            const ultima = mid(obsText, cuenta, 1);
            
            if (ultima === "'") {
                msgbox("Caracter Invalido.");
                obsField.value = mid(obsField.value, 1, cuenta - 1);
            } else if (asc(ultima) === 10) {
                msgbox("Favor de NO utilizar la tecla Enter");
                obsField.value = mid(obsField.value, 1, cuenta - 2);
            } else if (cuenta > 30000) {
                msgbox("Maximo puedes usar 30000 Caracteres.");
                obsField.value = mid(obsField.value, 1, 30000);
            }
        }
    };
    
    // ===============================
    // FUNCIÓN PARA ARREGLAR BOTONES
    // ===============================
    function fixAllButtons() {
        const allButtons = document.querySelectorAll('input[type="button"]');
        let fixed = 0;
        
        allButtons.forEach(function(btn) {
            if (btn.onclick && !btn.dataset.fixed) {
                const onclickStr = btn.onclick.toString();
                
                // Caso 1: Botón con datos_ctl
                if (onclickStr.includes("document.getElementById('datos_ctl').submit()")) {
                    btn.removeAttribute('onclick');
                    btn.onclick = function(e) {
                        e.preventDefault();
                        
                        const form = btn.closest('form') || 
                                    document.forms[0] || 
                                    document.querySelector('form');
                        
                        if (form) {
                            console.log('Enviando formulario de central...');
                            form.submit();
                        } else {
                            alert('Error: No se pudo encontrar el formulario');
                        }
                    };
                    
                    btn.style.backgroundColor = '#4CAF50';
                    btn.style.color = 'white';
                    btn.style.border = '2px solid #45a049';
                    btn.dataset.fixed = 'true';
                    fixed++;
                }
                
                // Caso 2: Botón con VBScript
                else if (onclickStr.includes('vbscript:valida_datos')) {
                    btn.removeAttribute('onclick');
                    btn.onclick = function(e) {
                        e.preventDefault();
                        return window.valida_datos();
                    };
                    
                    btn.style.backgroundColor = '#2196F3';
                    btn.style.color = 'white';
                    btn.style.border = '2px solid #1976D2';
                    btn.dataset.fixed = 'true';
                    fixed++;
                }
            }
        });
        
        return fixed;
    }
    
    // ===============================
    // LIMPIEZA MÍNIMA Y ESPECÍFICA
    // ===============================
    function cleanOnlyProblematicFondo() {
        // SOLO limpiar si detectamos el formulario específico problemático
        const isProblematicForm = document.querySelector('form[name="envia_datos"]') && 
                                 document.querySelector('textarea[name="obsdslam"]');
        
        if (!isProblematicForm) {
            // No es el formulario problemático, no tocar nada
            return;
        }
        
        console.log('📝 Formulario problemático detectado, aplicando limpieza mínima...');
        
        // Buscar TODAS las imágenes fondo.bmp en este formulario problemático
        const fondoImages = document.querySelectorAll('img[src*="fondo.bmp"]');
        let cleaned = 0;
        
        fondoImages.forEach((img, index) => {
            const rect = img.getBoundingClientRect();
            const style = window.getComputedStyle(img);
            
            console.log(`🔍 Analizando imagen fondo.bmp #${index}:`, {
                width: rect.width,
                height: rect.height,
                position: style.position,
                top: rect.top,
                left: rect.left,
                zIndex: style.zIndex,
                visible: rect.width > 0 && rect.height > 0,
                display: style.display,
                visibility: style.visibility
            });
            
            // Criterios MUY amplios para eliminar cualquier imagen fondo.bmp problemática
            const isProblematic = (
                // Cualquier imagen visible mayor a 50x50 (muy permisivo)
                rect.width > 50 && rect.height > 50 &&
                (
                    // Es medianamente grande (más permisivo que antes)
                    (rect.width > 100 || rect.height > 100) ||
                    // O está posicionada de alguna manera específica
                    (style.position !== 'static') ||
                    // O tiene algún z-index
                    (parseInt(style.zIndex) !== 0 && style.zIndex !== 'auto') ||
                    // O simplemente es una imagen en este formulario (más agresivo)
                    true  // TEMPORAL: eliminar TODAS las imágenes fondo.bmp en este formulario
                )
            );
            
            if (isProblematic) {
                console.log(`🚫 Imagen fondo.bmp problemática #${index} ocultada - Criterio: ancho=${rect.width}, alto=${rect.height}, pos=${style.position}`);
                
                // Método más agresivo para ocultar la imagen
                img.remove();  // Eliminar completamente del DOM
                cleaned++;
                
                console.log(`🗑️ Imagen fondo.bmp #${index} eliminada completamente del DOM`);
            } else {
                console.log(`✅ Imagen fondo.bmp #${index} conservada`);
            }
        });
        
        // También buscar elementos con background fondo.bmp problemáticos
        const elementsWithBgFondo = document.querySelectorAll('[style*="fondo.bmp"]');
        elementsWithBgFondo.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const isEmpty = element.children.length === 0 && element.textContent.trim() === '';
            
            if (isEmpty && (rect.width > 200 || rect.height > 100)) {
                console.log(`🧹 Background fondo.bmp problemático #${index} eliminado`);
                element.style.backgroundImage = 'none !important';
                element.style.background = 'transparent !important';
                element.style.display = 'none !important';
                cleaned++;
            }
        });
        
        if (cleaned > 0) {
            console.log(`✅ ${cleaned} elemento(s) fondo.bmp problemático(s) limpiado(s)`);
        } else {
            console.log('ℹ️ No se encontraron elementos fondo.bmp problemáticos');
        }
    }
    
    // ===============================
    // APLICAR ESTILOS MÍNIMOS (SIN CAMBIOS)
    // ===============================
    function applyMinimalStyles() {
        // Solo aplicar si no existe ya
        if (document.querySelector('#codim-minimal-styles')) {
            return;
        }
        
        // Detectar tipo de página con mejor lógica
        const hasFormElements = document.querySelector('form');
        const hasDataTable = document.querySelector('table') && document.querySelectorAll('tr').length > 3;
        const hasLinks = document.querySelectorAll('a').length > 2;
        const hasSelectDropdown = document.querySelector('select[name*="falla"], select[name*="cual"]');
        const hasTextarea = document.querySelector('textarea');
        
        // Es formulario si tiene elementos de form específicos Y no es una tabla de datos
        const isFormPage = (hasSelectDropdown || hasTextarea) && !hasDataTable;
        
        console.log('Detección de página:', {
            hasFormElements,
            hasDataTable,
            hasLinks,
            hasSelectDropdown,
            hasTextarea,
            isFormPage: isFormPage ? 'FORMULARIO' : 'LISTA'
        });
        
        const style = document.createElement('style');
        style.id = 'codim-minimal-styles';
        
        if (isFormPage) {
            // ESTILOS PARA FORMULARIOS - MANTENER LAYOUT ORIGINAL CON MEJOR ESTILO
            style.textContent = `
                /* FORZAR OCULTACIÓN DE FONDO.BMP PROBLEMÁTICO EN FORMULARIOS */
                form[name="envia_datos"] img[src*="fondo.bmp"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                    top: -9999px !important;
                    z-index: -9999 !important;
                }
                
                /* ESTILOS BASE PARA EL BODY */
                body {
                    font-family: 'Segoe UI', Arial, sans-serif !important;
                    margin: 0 !important;
                    padding: 20px !important;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                    min-height: 100vh !important;
                }
                
                /* CONTENEDOR PRINCIPAL - REEMPLAZAR FONDO.BMP */
                center, body > center {
                    display: block !important;
                    max-width: 900px !important;
                    margin: 20px auto !important;
                    background: white !important;
                    border-radius: 12px !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
                    padding: 30px !important;
                    border: 1px solid #e9ecef !important;
                    text-align: center !important;
                }
                
                /* TÍTULO PRINCIPAL */
                center font, center b, center strong, 
                body > center font, body > center b, body > center strong {
                    display: block !important;
                    color: #2c3e50 !important;
                    font-weight: 600 !important;
                    font-size: 22px !important;
                    margin-bottom: 25px !important;
                    text-decoration: underline !important;
                    text-decoration-color: #4A90E2 !important;
                    text-underline-offset: 8px !important;
                }
                
                /* FORMULARIO */
                form {
                    margin: 20px auto !important;
                    text-align: center !important;
                }
                
                /* TABLA DEL FORMULARIO */
                table {
                    margin: 20px auto !important;
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    background: white !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
                    border: 1px solid #e9ecef !important;
                    width: auto !important;
                    max-width: 100% !important;
                }
                
                /* CELDAS */
                td {
                    padding: 12px 18px !important;
                    vertical-align: middle !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                }
                
                /* PRIMERA COLUMNA (LABELS) */
                td:first-child {
                    background: #f8f9fa !important;
                    font-weight: 600 !important;
                    color: #495057 !important;
                    white-space: nowrap !important;
                    text-align: right !important;
                    padding-right: 15px !important;
                    border-right: 1px solid #e9ecef !important;
                    min-width: 140px !important;
                }
                
                /* SEGUNDA COLUMNA (INPUTS) */
                td:nth-child(2) {
                    background: white !important;
                    text-align: left !important;
                    padding-left: 15px !important;
                }
                
                /* INPUTS MEJORADOS */
                input[type="text"], select, textarea {
                    padding: 8px 12px !important;
                    border: 2px solid #e9ecef !important;
                    border-radius: 6px !important;
                    font-size: 14px !important;
                    background: white !important;
                    transition: all 0.3s ease !important;
                    font-family: inherit !important;
                    min-width: 200px !important;
                }
                
                input[type="text"]:focus, select:focus, textarea:focus {
                    border-color: #4A90E2 !important;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1) !important;
                    outline: none !important;
                    transform: scale(1.02) !important;
                }
                
                /* TEXTAREA ESPECÍFICO */
                textarea {
                    width: 400px !important;
                    height: 100px !important;
                    resize: vertical !important;
                    line-height: 1.4 !important;
                }
                
                /* SELECT ESPECÍFICO */
                select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234A90E2' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
                    background-position: right 12px center !important;
                    background-repeat: no-repeat !important;
                    background-size: 14px 14px !important;
                    padding-right: 40px !important;
                    appearance: none !important;
                    cursor: pointer !important;
                    min-width: 250px !important;
                }
                
                /* INPUTS NUMÉRICOS */
                input[name*="quejas"], input[name*="pendientes"], input[name*="reincidencia"] {
                    text-align: center !important;
                    font-weight: 600 !important;
                    background: #f0f8ff !important;
                    color: #1a73e8 !important;
                    width: 80px !important;
                    min-width: 80px !important;
                    border-color: #4A90E2 !important;
                }
                
                /* BOTONES */
                input[type="button"], input[type="submit"] {
                    padding: 12px 25px !important;
                    margin: 20px 10px !important;
                    border-radius: 8px !important;
                    cursor: pointer !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    background: linear-gradient(135deg, #4A90E2, #357ABD) !important;
                    color: white !important;
                    border: none !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 3px 12px rgba(74, 144, 226, 0.3) !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                input[type="button"]:hover, input[type="submit"]:hover {
                    background: linear-gradient(135deg, #357ABD, #2968A3) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4) !important;
                }
                
                /* BOTÓN REGRESAR */
                input[value*="Regresa"], input[value="Regresar"] {
                    background: linear-gradient(135deg, #6c757d, #5a6268) !important;
                    box-shadow: 0 3px 12px rgba(108, 117, 125, 0.3) !important;
                }
                
                /* CONTENEDOR DE BOTONES */
                td[colspan] {
                    text-align: center !important;
                    padding: 25px !important;
                    background: #f8f9fa !important;
                    border-top: 2px solid #e9ecef !important;
                }
                
                /* ÚLTIMA FILA SIN BORDE */
                tr:last-child td {
                    border-bottom: none !important;
                }
                
                /* ANIMACIÓN */
                center, body > center {
                    animation: fadeInForm 0.6s ease-out !important;
                }
                
                @keyframes fadeInForm {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* RESPONSIVE */
                @media (max-width: 768px) {
                    center, body > center {
                        margin: 15px !important;
                        padding: 20px !important;
                    }
                    
                    table {
                        font-size: 13px !important;
                    }
                    
                    td {
                        padding: 10px 12px !important;
                    }
                    
                    input, select, textarea {
                        font-size: 13px !important;
                        min-width: 150px !important;
                    }
                    
                    textarea {
                        width: 300px !important;
                        height: 80px !important;
                    }
                }`;
        } else {
            // ESTILOS PARA LISTAS - Más completos
            style.textContent = `
                /* ESTILOS PARA LISTAS Y TABLAS */
                body {
                    font-family: 'Segoe UI', Arial, sans-serif !important;
                    margin: 15px !important;
                    background: #f8f9fa !important;
                }
                
                /* Mejorar inputs */
                input[type="text"], select, textarea {
                    padding: 6px 10px !important;
                    border: 1px solid #d0d7de !important;
                    border-radius: 4px !important;
                    font-size: 13px !important;
                    transition: border-color 0.2s ease !important;
                    background: white !important;
                }
                
                input[type="text"]:focus, select:focus, textarea:focus {
                    border-color: #0969da !important;
                    box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.1) !important;
                    outline: none !important;
                }
                
                /* Botones mejorados */
                input[type="button"], input[type="submit"] {
                    background: linear-gradient(135deg, #0969da, #0550ae) !important;
                    color: white !important;
                    border: 1px solid #0550ae !important;
                    padding: 8px 16px !important;
                    border-radius: 4px !important;
                    font-weight: 500 !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    margin: 3px !important;
                }
                
                input[type="button"]:hover, input[type="submit"]:hover {
                    background: linear-gradient(135deg, #0550ae, #033d8b) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 8px rgba(9, 105, 218, 0.25) !important;
                }
                
                /* Tablas bonitas */
                table {
                    background: white !important;
                    border-radius: 6px !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                    margin: 10px auto !important;
                    overflow: hidden !important;
                    width: 100% !important;
                }
                
                td {
                    padding: 8px 12px !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                }
                
                /* Headers de tabla */
                tr:first-child td {
                    background: #f6f8fa !important;
                    font-weight: bold !important;
                    border-bottom: 2px solid #d0d7de !important;
                }
                
                /* Enlaces en tabla */
                a {
                    color: #0969da !important;
                    text-decoration: none !important;
                    font-weight: 500 !important;
                }
                
                a:hover {
                    text-decoration: underline !important;
                }
                
                /* Títulos */
                font[size="4"], font[size="3"] {
                    font-size: 18px !important;
                    font-weight: 600 !important;
                    color: #24292f !important;
                }
            `;
        }
        
        document.head.appendChild(style);
        console.log('✅ Estilos aplicados:', isFormPage ? 'FORMULARIO' : 'LISTA');
    }
    
    // ===============================
    // PATCH SIGNATURE PARA PÁGINAS INTERNAS
    // ===============================
    function addPatchSignature() {
        // Solo agregar si no existe ya
        if (document.querySelector('.demianrey-patch')) {
            return;
        }
               
        const statusNotification = document.createElement('div');
        statusNotification.className = 'patch-status';
        statusNotification.innerHTML = 'Fix Aplicado';
        statusNotification.title = 'Clic para ocultar';
        statusNotification.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            right: 15px !important;
            background: linear-gradient(135deg, #4CAF50, #45a049) !important;
            color: white !important;
            padding: 6px 12px !important;
            border-radius: 15px !important;
            font-size: 11px !important;
            font-weight: bold !important;
            z-index: 9999 !important;
            box-shadow: 0 2px 8px rgba(76,175,80,0.3) !important;
            cursor: pointer !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            font-family: Arial, sans-serif !important;
            animation: slideInRight 0.5s ease-out !important;
        `;
        
        statusNotification.onclick = function() {
            this.style.transform = 'translateX(300px)';
            this.style.opacity = '0';
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 500);
        };
        document.body.appendChild(statusNotification);
        
        setTimeout(function() {
            if (statusNotification.parentNode) {
                statusNotification.style.transform = 'translateX(300px)';
                statusNotification.style.opacity = '0';
                setTimeout(function() {
                    if (statusNotification.parentNode) {
                        statusNotification.remove();
                    }
                }, 500);
            }
        }, 3000);
    }
    
    // ===============================
    // INICIALIZACIÓN
    // ===============================
    function initializePatch() {
        console.log('🚀 Iniciando parche CODIM CNS...');
        
        // 1. APLICAR ESTILOS (sin cambios)
        applyMinimalStyles();
        
        // 2. ARREGLAR BOTONES (sin cambios)
        const fixed = fixAllButtons();
        if (fixed > 0) {
            console.log('✅ CODIM Fix: ' + fixed + ' boton(es) arreglado(s) en página interna');
        }
        
        // 3. LIMPIEZA MÍNIMA inmediatamente
        cleanOnlyProblematicFondo();
        
        // 4. AGREGAR SIGNATURE
        addPatchSignature();
        
        // 5. LIMPIEZA ADICIONAL después de que todo cargue
        setTimeout(() => {
            cleanOnlyProblematicFondo();
            console.log('🔄 Segunda limpieza específica completada');
        }, 200);
        
        // 6. LIMPIEZA FINAL después de animaciones
        setTimeout(() => {
            cleanOnlyProblematicFondo();
            console.log('🔄 Limpieza final completada');
        }, 1000);
        
        console.log('✅ CODIM CNS página interna funcional - Patch by DemianRey');
    }
    
    // Aplicar inmediatamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePatch);
    } else {
        initializePatch();
    }
    
    // Observer para nuevos elementos (solo botones)
    const observer = new MutationObserver(function(mutations) {
        let needsFix = false;
        let needsCleanup = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // Verificar si se agregaron botones
                        if (node.tagName === 'INPUT' || 
                            (node.querySelector && node.querySelector('input[type="button"]'))) {
                            needsFix = true;
                        }
                        
                        // Solo limpiar si aparece fondo.bmp en el formulario problemático
                        if (node.tagName === 'IMG' && node.src && node.src.includes('fondo.bmp') &&
                            document.querySelector('form[name="envia_datos"]')) {
                            needsCleanup = true;
                        }
                    }
                });
            }
        });
        
        if (needsFix) {
            setTimeout(function() {
                const fixed = fixAllButtons();
                if (fixed > 0) {
                    console.log('✅ CODIM Fix: ' + fixed + ' boton(es) adicional(es) arreglado(s)');
                }
            }, 100);
        }
        
        if (needsCleanup) {
            setTimeout(cleanOnlyProblematicFondo, 200);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('🎯 CODIM CNS Fix activo - Solo limpieza específica');
    
})();