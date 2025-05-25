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
    // IDENTIFICAR ELEMENTOS PROBLEMÁTICOS
    // ===============================
    function identifyProblematicElements() {
        console.log('🔍 Analizando elementos que podrían causar el recuadro gris...');
        
        // Buscar todos los elementos con altura significativa
        const allElements = document.querySelectorAll('*');
        const problematicElements = [];
        
        allElements.forEach((element, index) => {
            const computedStyle = window.getComputedStyle(element);
            const height = parseInt(computedStyle.height);
            const backgroundColor = computedStyle.backgroundColor;
            const border = computedStyle.border;
            
            // Identificar elementos sospechosos
            if (height > 80 || backgroundColor !== 'rgba(0, 0, 0, 0)' || border !== '0px none rgb(0, 0, 0)') {
                const info = {
                    tag: element.tagName,
                    id: element.id || 'sin-id',
                    class: element.className || 'sin-clase',
                    height: height + 'px',
                    backgroundColor: backgroundColor,
                    border: border,
                    text: element.textContent?.substring(0, 50) || 'sin-texto',
                    isEmpty: element.children.length === 0 && element.textContent.trim() === ''
                };
                
                problematicElements.push(info);
            }
        });
        
        console.log('📋 Elementos encontrados:', problematicElements);
        
        // Buscar específicamente elementos que podrían ser el recuadro gris
        const grayElements = [];
        allElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const bg = style.backgroundColor;
            
            // Buscar elementos con fondo gris o similar
            if (bg.includes('rgb(240, 240, 240)') || 
                bg.includes('rgb(245, 245, 245)') || 
                bg.includes('rgb(248, 248, 248)') ||
                bg.includes('lightgray') ||
                bg.includes('gray')) {
                grayElements.push({
                    element: element,
                    tag: element.tagName,
                    id: element.id,
                    class: element.className,
                    backgroundColor: bg,
                    height: style.height,
                    width: style.width
                });
            }
        });
        
        if (grayElements.length > 0) {
            console.log('🔍 Elementos GRISES encontrados:', grayElements);
            
            // Intentar ocultar elementos grises vacíos grandes
            grayElements.forEach(item => {
                const element = item.element;
                const height = parseInt(item.height);
                
                if (height > 100 && element.children.length === 0 && element.textContent.trim() === '') {
                    console.log('🚫 Ocultando elemento gris vacío:', item);
                    element.style.display = 'none !important';
                }
            });
        }
        
        return { problematicElements, grayElements };
    }
    
    // ===============================
    // LIMPIAR ELEMENTOS VACÍOS PROBLEMÁTICOS
    // ===============================
    function cleanEmptyElements() {
        // Buscar y ocultar elementos vacíos que puedan estar causando el espacio en blanco
        const emptyElements = [];
        
        // BUSCAR FONDO.BMP PROBLEMÁTICO SOLO SI ESTÁ CAUSANDO PROBLEMAS
        const fondoImages = document.querySelectorAll('img[src*="fondo.bmp"]');
        fondoImages.forEach(img => {
            // Solo ocultar si la imagen tiene características problemáticas
            const width = img.getAttribute('width') || img.clientWidth;
            const height = img.getAttribute('height') || img.clientHeight;
            const hasTitle = img.getAttribute('title') || img.getAttribute('alt');
            
            // Ocultar solo si es una imagen pequeña (1x1) o sin alt/title (probablemente decorativa problemática)
            if ((width == 1 || height == 1) || (!hasTitle && (width < 50 && height < 50))) {
                img.style.display = 'none';
                emptyElements.push('imagen fondo.bmp problemática');
            }
        });
        
        // Buscar elementos con background fondo.bmp solo si están vacíos
        const elementsWithBackground = document.querySelectorAll('[style*="fondo.bmp"]');
        elementsWithBackground.forEach(element => {
            // Solo remover background si el elemento está vacío
            if (element.children.length === 0 && element.textContent.trim() === '') {
                element.style.backgroundImage = 'none';
                element.style.minHeight = '0';
                emptyElements.push('background fondo.bmp vacío');
            }
        });
        
        // Buscar iframes vacíos o sin contenido
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (!iframe.src || iframe.src === '' || iframe.src === 'about:blank') {
                iframe.style.display = 'none';
                emptyElements.push('iframe vacío');
            }
        });
        
        // Buscar divs vacíos grandes PERO sin atributos importantes
        const divs = document.querySelectorAll('div');
        divs.forEach(div => {
            const computedStyle = window.getComputedStyle(div);
            const height = parseInt(computedStyle.height);
            const hasBackground = computedStyle.backgroundImage !== 'none';
            const hasImportantAttrs = div.id || div.className || div.onclick || hasBackground;
            
            // Solo ocultar divs grandes vacíos SIN atributos importantes
            if (height > 80 && div.children.length === 0 && div.textContent.trim() === '' && !hasImportantAttrs) {
                div.style.display = 'none';
                emptyElements.push('div vacío grande sin atributos');
            }
        });
        
        if (emptyElements.length > 0) {
            console.log('🧹 Elementos problemáticos ocultados:', emptyElements);
        }
    }
    
    // ===============================
    // APLICAR ESTILOS MÍNIMOS
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
                /* ESTILOS PARA FORMULARIOS - CONSERVADOR PERO ELEGANTE */
                body {
                    font-family: 'Segoe UI', Arial, sans-serif !important;
                    margin: 0 !important;
                    padding: 20px !important;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                    text-align: center !important;
                    min-height: 100vh !important;
                }
                
                /* OCULTAR IMAGEN DE FONDO PROBLEMÁTICA SOLO EN FORMULARIOS */
                img[src*="fondo.bmp"][width="1"],
                img[src*="fondo.bmp"][height="1"],
                img[src*="fondo.bmp"]:not([alt]):not([title]) {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                /* Ocultar elementos con fondo.bmp como background solo si están vacíos */
                div:empty[style*="fondo.bmp"],
                td:empty[style*="fondo.bmp"] {
                    background-image: none !important;
                    background: transparent !important;
                    height: auto !important;
                    min-height: 0 !important;
                }
                
                /* OCULTAR ELEMENTOS VACÍOS PROBLEMÁTICOS */
                iframe:empty,
                div:empty:not([style*="background"]),
                td:empty:not([style*="background"]),
                table:empty {
                    display: none !important;
                }
                
                /* Centrar todo */
                body > * {
                    margin-left: auto !important;
                    margin-right: auto !important;
                    text-align: left !important;
                }
                
                /* Contenedor principal centrado */
                center {
                    display: block !important;
                    text-align: center !important;
                    margin: 25px auto !important;
                }
                
                /* Formulario centrado con mejor estilo */
                form {
                    max-width: 800px !important;
                    margin: 25px auto !important;
                    background: white !important;
                    border-radius: 10px !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
                    padding: 25px !important;
                    text-align: center !important;
                    border: 1px solid #e9ecef !important;
                }
                
                /* Títulos del formulario */
                font[size="4"], font[size="3"], h1, h2, h3,
                form > center, form center {
                    text-align: center !important;
                    margin: 0 0 20px 0 !important;
                    color: #2c3e50 !important;
                    font-weight: 600 !important;
                    font-size: 20px !important;
                }
                
                /* Tablas manteniendo distribución original */
                table {
                    margin: 15px auto !important;
                    border-collapse: collapse !important;
                    background: white !important;
                    border-radius: 6px !important;
                    overflow: hidden !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                    border: 1px solid #e9ecef !important;
                }
                
                /* Celdas manteniendo tamaño original */
                td {
                    padding: 8px 15px !important;
                    vertical-align: middle !important;
                    border: 1px solid #e9ecef !important;
                }
                
                /* Labels (primera columna) con mejor estilo */
                td:first-child {
                    background: #f8f9fa !important;
                    font-weight: 500 !important;
                    color: #495057 !important;
                    white-space: nowrap !important;
                    text-align: right !important;
                    padding-right: 12px !important;
                }
                
                /* Inputs mejorados pero con tamaño original */
                input[type="text"], select, textarea {
                    padding: 6px 10px !important;
                    border: 1px solid #ced4da !important;
                    border-radius: 4px !important;
                    font-size: 14px !important;
                    background: white !important;
                    transition: all 0.2s ease !important;
                    font-family: inherit !important;
                }
                
                input[type="text"]:focus, select:focus, textarea:focus {
                    border-color: #4A90E2 !important;
                    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1) !important;
                    outline: none !important;
                }
                
                /* Inputs numéricos */
                input[type="text"][value="0"],
                input[name*="quejas"],
                input[name*="pendientes"],
                input[name*="reincidencia"] {
                    text-align: center !important;
                    font-weight: 600 !important;
                    background: #f0f8ff !important;
                    color: #1a73e8 !important;
                    width: 60px !important;
                }
                
                /* Select mejorado */
                select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234A90E2' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
                    background-position: right 8px center !important;
                    background-repeat: no-repeat !important;
                    background-size: 12px 12px !important;
                    padding-right: 30px !important;
                    appearance: none !important;
                    cursor: pointer !important;
                }
                
                /* Textarea manteniendo tamaño */
                textarea {
                    width: 350px !important;
                    height: 80px !important;
                    resize: vertical !important;
                    line-height: 1.4 !important;
                }
                
                /* Campos específicos */
                input[name*="pisa"], 
                input[name*="clase"] {
                    background: #e8f4fd !important;
                    border-color: #4A90E2 !important;
                    font-weight: 500 !important;
                    width: 180px !important;
                }
                
                /* Campos de texto normales */
                input[type="text"]:not([name*="quejas"]):not([name*="pendientes"]):not([name*="reincidencia"]):not([value="0"]) {
                    width: 150px !important;
                }
                
                /* Botones mejorados */
                input[type="button"], input[type="submit"] {
                    padding: 10px 20px !important;
                    margin: 15px 8px 5px 8px !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    background: linear-gradient(135deg, #4A90E2, #357ABD) !important;
                    color: white !important;
                    border: none !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3) !important;
                }
                
                input[type="button"]:hover, input[type="submit"]:hover {
                    background: linear-gradient(135deg, #357ABD, #2968A3) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4) !important;
                }
                
                /* Botón regresar */
                input[value*="Regresa"], input[value="Regresar"] {
                    background: linear-gradient(135deg, #6c757d, #5a6268) !important;
                    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3) !important;
                }
                
                input[value*="Regresa"]:hover, input[value="Regresar"]:hover {
                    background: linear-gradient(135deg, #5a6268, #495057) !important;
                    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4) !important;
                }
                
                /* Contenedor de botones centrado */
                td[colspan] {
                    text-align: center !important;
                    padding: 15px !important;
                    background: #f8f9fa !important;
                }
                
                /* Animación sutil */
                form {
                    animation: fadeInForm 0.5s ease-out !important;
                }
                
                @keyframes fadeInForm {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Hover en filas */
                tr:hover td {
                    background: #f1f3f5 !important;
                }
                
                tr:hover td:first-child {
                    background: #e9ecef !important;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    body {
                        padding: 10px !important;
                    }
                    
                    form {
                        margin: 15px auto !important;
                        padding: 15px !important;
                    }
                    
                    table {
                        font-size: 13px !important;
                    }
                    
                    td {
                        padding: 6px 10px !important;
                    }
                    
                    input[type="text"], select, textarea {
                        font-size: 13px !important;
                        width: auto !important;
                        max-width: 140px !important;
                    }
                    
                    textarea {
                        width: 250px !important;
                        height: 60px !important;
                    }
                }
            `;
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
        // Primero identificar elementos problemáticos
        identifyProblematicElements();
        
        cleanEmptyElements();
        applyMinimalStyles();
        addPatchSignature();
        
        const fixed = fixAllButtons();
        if (fixed > 0) {
            console.log('CODIM Fix: ' + fixed + ' boton(es) arreglado(s) en página interna');
        }
        
        // Limpiar elementos vacíos después de un pequeño delay
        setTimeout(() => {
            cleanEmptyElements();
            identifyProblematicElements();
        }, 500);
        
        console.log('CODIM CNS página interna funcional - Patch by DemianRey');
    }
    
    // Aplicar inmediatamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePatch);
    } else {
        initializePatch();
    }
    
    // Observer para nuevos elementos
    const observer = new MutationObserver(function(mutations) {
        let needsFix = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'INPUT' || 
                            (node.querySelector && node.querySelector('input[type="button"]'))) {
                            needsFix = true;
                        }
                    }
                });
            }
        });
        
        if (needsFix) {
            setTimeout(function() {
                const fixed = fixAllButtons();
                if (fixed > 0) {
                    console.log('CODIM Fix: ' + fixed + ' boton(es) adicional(es) arreglado(s)');
                }
            }, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('CODIM CNS Fix activo en página interna - Patch by DemianRey');
    
})();