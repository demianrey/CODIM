// classic-patch.js - Patch para páginas internas del sistema (sin imports)
(function () {
    'use strict';

    // ✅ VERIFICACIÓN MEJORADA: Esperar y verificar múltiples veces
    function checkForModernInterface() {
        // Verificar si estamos en página principal que será reemplazada
        const isMainPage = window.location.pathname === '/' ||
            window.location.pathname === '/index.html' ||
            window.location.pathname === '/index.asp' ||
            window.location.pathname === '';

        const hasOldInterface = document.querySelector('div[style*="position: absolute"]') &&
            document.querySelector('img[src*="menu.bmp"]');

        // Si es página principal con interfaz antigua, NO ejecutar patch clásico
        if (isMainPage && hasOldInterface) {
            console.log('🎨 Página principal detectada - será reemplazada por interfaz moderna, saltando patch clásico');
            return true; // Saltar patch
        }

        // Verificar si ya existe interfaz moderna
        if (document.getElementById('modern-codim-interface')) {
            console.log('🎨 Interfaz moderna detectada, saltando patch clásico');
            return true; // Saltar patch
        }

        return false; // Continuar con patch
    }

    function shouldSkipClassicPatch() {
        // ✅ 1. Si estamos en iframe, SOLO aplicar funciones VBScript (sin estilos)
        if (window !== window.top) {
            console.log('🖼️ Estamos en iframe - aplicando SOLO funciones VBScript');

            // ✅ APLICAR SOLO LAS FUNCIONES VBSCRIPT EN IFRAME
            initVBScriptFunctionsOnly();
            return true; // Saltar el resto del patch
        }

        // ✅ 2. Si hay indicador de que el iframe está siendo manejado
        if (window.CODIM_IFRAME_ENHANCED || document.documentElement.getAttribute('data-codim-enhanced')) {
            console.log('🎯 Página marcada como manejada por content script - saltando classic patch');
            return true;
        }

        // ✅ 3. Verificar interfaz moderna
        if (checkForModernInterface()) {
            return true;
        }

        return false; // Continuar con patch
    }

    function initVBScriptFunctionsOnly() {
        console.log('🔧 Aplicando SOLO funciones VBScript en iframe...');

        // Helpers globales
        window.trim = (str) => str ? str.replace(/^\s+|\s+$/g, '') : '';
        window.len = (str) => str ? str.length : 0;
        window.mid = (str, start, length) => str ? str.substring(start - 1, start - 1 + length) : '';
        window.asc = (char) => char ? char.charCodeAt(0) : 0;
        window.msgbox = (message) => alert(message);

        // ✅ FUNCIÓN valida_datos PARA IFRAME
        window.valida_datos = function () {
            console.log('🔍 Ejecutando validación en iframe...');

            const form = document.envia_datos ||
                document.forms.envia_datos ||
                document.forms[0] ||
                document.querySelector('form[name="envia_datos"]');

            if (!form) {
                console.error('❌ No se encontró el formulario');
                alert('Error: No se encontró el formulario');
                return false;
            }

            const fallaField = form.cual_falla || form.querySelector('[name="cual_falla"]');

            if (!fallaField) {
                console.log('⚠️ Campo cual_falla no encontrado, enviando formulario...');
                form.submit();
                return true;
            }

            const varz = window.trim(fallaField.value);
            console.log('📋 Falla seleccionada:', varz);

            if (varz !== "00" && varz !== "") {
                const obsField = form.obsdslam || form.querySelector('[name="obsdslam"]');

                if (!obsField) {
                    console.log('⚠️ Campo obsdslam no encontrado, enviando formulario...');
                    form.submit();
                    return true;
                }

                const obsText = window.trim(obsField.value);
                const cuenta = window.len(obsText);

                if (cuenta > 2) {
                    for (let i = 1; i <= cuenta; i++) {
                        const letra = window.mid(obsText, i, 1);
                        if (letra === "'" || window.asc(letra) === 10) {
                            window.msgbox("En el Texto de OBS, Hay un Caracter Invalido.\nNo puedes utilizar apostrofe ni la tecla Enter.");
                            return false;
                        }
                    }

                    const salvarField = form.salvar || form.querySelector('[name="salvar"]');
                    if (salvarField) {
                        salvarField.value = "S";
                    }

                    console.log('✅ Validación exitosa en iframe. Enviando formulario...');
                    form.submit();
                    return true;
                } else {
                    window.msgbox("Es indispensable anotar comentarios.");
                    if (obsField.focus)
                        obsField.focus();
                    return false;
                }
            } else {
                window.msgbox("Favor de Seleccionar una Falla en el Catalogo.");
                if (fallaField.focus)
                    fallaField.focus();
                return false;
            }

            return false;
        };

        // ✅ FUNCIÓN vertexto PARA IFRAME
        window.vertexto = function () {
            const form = document.envia_datos ||
                document.forms.envia_datos ||
                document.forms[0] ||
                document.querySelector('form[name="envia_datos"]');

            if (!form)
                return;

            const obsField = form.obsdslam || form.querySelector('[name="obsdslam"]');
            if (!obsField)
                return;

            const obsText = window.trim(obsField.value);
            const cuenta = window.len(obsText);

            if (cuenta > 0) {
                const ultima = window.mid(obsText, cuenta, 1);

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

        // Función cancelar
        window.cancelar = function () {
            console.log('🔙 Cancelar en iframe');
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        };

        console.log('✅ Funciones VBScript aplicadas SOLO en iframe');
    }

    // ✅ VERIFICACIÓN INICIAL
    if (shouldSkipClassicPatch()) {
        return;
    }

    // ✅ VERIFICACIÓN ADICIONAL CON TIMEOUT
    setTimeout(() => {
        if (shouldSkipClassicPatch()) {
            console.log('🎨 Verificación secundaria: saltando classic patch');
            return;
        }

        // Si llegamos aquí, es seguro ejecutar el patch clásico
        console.log('🔧 CODIM CNS Fix - Iniciando patch clásico...');
        initClassicPatch();
    }, 500);

    function initClassicPatch() {
        // ===============================
        // CLASE PRINCIPAL DEL PATCH
        // ===============================
        class ClassicPatch {
            constructor() {
                this.isModernInterface = !!document.getElementById('modern-codim-interface');
                this.appliedStyles = new Set();
            }

            init() {
                // ✅ VERIFICACIÓN FINAL antes de aplicar
                if (shouldSkipClassicPatch()) {
                    console.log('🎨 Verificación final: saltando classic patch');
                    return;
                }

                console.log('🔧 CODIM CNS Fix - Aplicando patch clásico...');

                this.applyPatch();
                this.setupMutationObserver();
            }

            applyPatch() {
                // 1. Reemplazar funciones VBScript
                this.replaceVBScriptFunctions();

                // 2. Aplicar estilos según tipo de página (SOLO si no hay interfaz moderna)
                if (!document.getElementById('modern-codim-interface')) {
                    this.applyStyles();
                }

                // 3. Arreglar botones problemáticos
                const fixedButtons = this.fixAllButtons();

                // 4. Limpiar imágenes problemáticas
                this.cleanProblematicImages();

                // ✅ NUEVO: Ocultar código JavaScript visible
                this.hideVisibleJavaScript();

                // 5. Mostrar notificación
                this.showNotification(`Fix aplicado - ${fixedButtons} botones arreglados`);

                // 6. Limpiezas adicionales
                this.scheduleAdditionalCleanups();

                console.log('✅ CODIM CNS Fix aplicado exitosamente');
            }

            // ===============================
            // REEMPLAZO DE VBSCRIPT
            // ===============================
            replaceVBScriptFunctions() {
                console.log('🔄 Reemplazando funciones VBScript...');

                // Helpers globales
                window.trim = (str) => str ? str.replace(/^\s+|\s+$/g, '') : '';
                window.len = (str) => str ? str.length : 0;
                window.mid = (str, start, length) => str ? str.substring(start - 1, start - 1 + length) : '';
                window.asc = (char) => char ? char.charCodeAt(0) : 0;
                window.msgbox = (message) => alert(message);

                // ✅ CORREGIDO: Function declaration en lugar de arrow function
                window.valida_datos = function () {
                    console.log('🔍 Ejecutando validación de datos (CORREGIDA)...');

                    const form = document.envia_datos ||
                        document.forms.envia_datos ||
                        document.forms[0] ||
                        document.querySelector('form[name="envia_datos"]');

                    if (!form) {
                        console.error('❌ No se encontró el formulario envia_datos');
                        alert('Error: No se encontró el formulario');
                        return false;
                    }

                    console.log('✅ Formulario encontrado:', form.name);

                    const fallaField = form.cual_falla || form.querySelector('[name="cual_falla"]');

                    if (!fallaField) {
                        console.log('⚠️ Campo cual_falla no encontrado, enviando formulario directamente...');
                        form.submit();
                        return true;
                    }

                    const varz = window.trim(fallaField.value);
                    console.log('📋 Falla seleccionada:', varz);

                    if (varz !== "00" && varz !== "") {
                        const obsField = form.obsdslam || form.querySelector('[name="obsdslam"]');

                        if (!obsField) {
                            console.log('⚠️ Campo obsdslam no encontrado, enviando formulario...');
                            form.submit();
                            return true;
                        }

                        const obsText = window.trim(obsField.value);
                        const cuenta = window.len(obsText);
                        console.log('📝 Observaciones length:', cuenta);

                        if (cuenta > 2) {
                            for (let i = 1; i <= cuenta; i++) {
                                const letra = window.mid(obsText, i, 1);
                                if (letra === "'" || window.asc(letra) === 10) {
                                    window.msgbox("En el Texto de OBS, Hay un Caracter Invalido.\nNo puedes utilizar apostrofe ni la tecla Enter.");
                                    return false;
                                }
                            }

                            const salvarField = form.salvar || form.querySelector('[name="salvar"]');
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
                            if (obsField.focus)
                                obsField.focus();
                            return false;
                        }
                    } else {
                        window.msgbox("Favor de Seleccionar una Falla en el Catalogo.");
                        if (fallaField.focus)
                            fallaField.focus();
                        return false;
                    }

                    return false;
                };

                // ✅ CORREGIDO: Function declaration en lugar de arrow function
                window.vertexto = function () {
                    const form = document.envia_datos ||
                        document.forms.envia_datos ||
                        document.forms[0] ||
                        document.querySelector('form[name="envia_datos"]');

                    if (!form)
                        return;

                    const obsField = form.obsdslam || form.querySelector('[name="obsdslam"]');
                    if (!obsField)
                        return;

                    const obsText = window.trim(obsField.value);
                    const cuenta = window.len(obsText);

                    if (cuenta > 0) {
                        const ultima = window.mid(obsText, cuenta, 1);

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

                // Resto del código igual...
                if (typeof window.ventana === 'undefined') {
                    window.ventana = null;
                }

                window.cierra_opcion = function (tiempox, y, x, pagina, tarda) {
                    if (window.ventana && window.ventana.style) {
                        window.ventana.style.clip = `rect(0,${x},${y},0)`;
                    }
                    if (pagina && pagina !== "") {
                        setTimeout(function () {
                            window.location.href = `ver_rep.asp?folio=${pagina}`;
                        }, tarda || 100);
                    }
                };

                window.cambia_menu = function (seccion, tipo, folio, param1, param2, param3, busca) {
                    console.log('🔄 cambia_menu llamado:', arguments);

                    if (seccion === 'consulta' && (folio || busca || param3)) {
                        const folioFinal = folio || busca || param3;
                        const url = `ver_rep.asp?folio=${folioFinal}&busca=${busca || ''}`;
                        console.log('📋 Navegando a consulta:', url);
                        window.location.href = url;
                        return;
                    }

                    if (typeof window.top?.cambia_menu === 'function') {
                        window.top.cambia_menu.apply(window.top, arguments);
                    }
                };

                window.cancelar = function () {
                    console.log('🔙 Función cancelar ejecutada');
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = '/';
                    }
                };

                if (typeof window.top !== 'undefined') {
                    window.top.cierra_opcion = window.cierra_opcion;
                    window.top.cambia_menu = window.cambia_menu;
                    window.top.ventana = window.ventana;
                }

                console.log('✅ Funciones VBScript reemplazadas por JavaScript');
            }

            hideVisibleJavaScript() {
                // Ocultar elementos que contienen código JavaScript visible
                const codeElements = document.querySelectorAll('*');

                codeElements.forEach(element => {
                    const text = element.textContent || '';
                    const isCodeElement = (
                        text.includes('function valida_datos') ||
                        text.includes('document.envia_datos') ||
                        text.includes('Sub valida_datos') ||
                        text.includes('document.write(') ||
                        (text.includes('function') && text.includes('document.') && element.children.length === 0));

                    if (isCodeElement && element.tagName !== 'SCRIPT') {
                        element.style.display = 'none';
                        element.style.visibility = 'hidden';
                        element.style.position = 'absolute';
                        element.style.left = '-9999px';
                        element.style.top = '-9999px';
                        console.log('🙈 Código JavaScript oculto:', element);
                    }
                });
            }

            validaDatos() {
                console.log('🔍 Ejecutando validación de datos...');

                const form = this.getForm();
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

                const varz = window.trim(fallaField.value);
                console.log('Falla seleccionada:', varz);

                if (varz !== "00" && varz !== "") {
                    const obsField = form.obsdslam;
                    if (!obsField) {
                        console.log('Campo obsdslam no encontrado, enviando formulario...');
                        form.submit();
                        return true;
                    }

                    const obsText = window.trim(obsField.value);
                    const cuenta = window.len(obsText);

                    if (cuenta > 2) {
                        if (this.validateText(obsText, cuenta)) {
                            const salvarField = form.salvar;
                            if (salvarField) {
                                salvarField.value = "S";
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
                        }
                    } else {
                        window.msgbox("Es indispensable anotar comentarios.");
                        return false;
                    }
                } else {
                    window.msgbox("Favor de Seleccionar una Falla en el Catalogo.");
                    return false;
                }
                return false;
            }

            validateText(text, length) {
                for (let i = 1; i <= length; i++) {
                    const letra = window.mid(text, i, 1);
                    if (letra === "'" || window.asc(letra) === 10) {
                        window.msgbox("En el Texto de OBS, Hay un Caracter Invalido.\nNo puedes utilizar apostrofe ni la tecla Enter.");
                        return false;
                    }
                }
                return true;
            }

            verTexto() {
                const form = this.getForm();
                if (!form)
                    return;

                const obsField = form.obsdslam;
                if (!obsField)
                    return;

                const obsText = window.trim(obsField.value);
                const cuenta = window.len(obsText);

                if (cuenta > 0) {
                    const ultima = window.mid(obsText, cuenta, 1);

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
            }

            getForm() {
                return document.envia_datos ||
                document.forms.envia_datos ||
                document.forms[0];
            }

            // ===============================
            // ARREGLO DE BOTONES
            // ===============================
            fixAllButtons() {
                const buttons = document.querySelectorAll('input[type="button"]');
                let fixed = 0;

                buttons.forEach(btn => {
                    if (btn.onclick && !btn.dataset.fixed) {
                        const onclickStr = btn.onclick.toString();

                        if (this.isDataCtlButton(onclickStr)) {
                            this.fixDataCtlButton(btn);
                            fixed++;
                            console.log('🔧 Botón datos_ctl arreglado:', btn.value);
                        } else if (this.isVBScriptButton(onclickStr)) {
                            this.fixVBScriptButton(btn);
                            fixed++;
                            console.log('🔧 Botón VBScript arreglado:', btn.value);
                        }
                    }
                });

                if (fixed > 0) {
                    console.log(`✅ ${fixed} botones arreglados exitosamente`);
                }

                return fixed;
            }

            isDataCtlButton(onclickStr) {
                return onclickStr.includes("document.getElementById('datos_ctl').submit()");
            }

            isVBScriptButton(onclickStr) {
                return onclickStr.includes('vbscript:valida_datos');
            }

            fixDataCtlButton(btn) {
                btn.removeAttribute('onclick');
                btn.onclick = (e) => {
                    e.preventDefault();

                    const form = this.findForm(btn);
                    if (form) {
                        console.log('📝 Enviando formulario de central...');
                        form.submit();
                    } else {
                        alert('Error: No se pudo encontrar el formulario');
                    }
                };

                this.markAsFixed(btn, '#4CAF50');
            }

            fixVBScriptButton(btn) {
                btn.removeAttribute('onclick');

                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log('📋 Ejecutando validación desde botón VBScript...');

                    try {
                        // Llamar directamente a la función global
                        const result = window.valida_datos();
                        console.log('✅ Resultado validación:', result);
                        return result;
                    } catch (error) {
                        console.error('❌ Error en validación:', error);
                        alert('Error en validación: ' + error.message);
                        return false;
                    }
                };

                this.markAsFixed(btn, '#2196F3');
                console.log('🔧 Botón VBScript corregido:', btn.value);
            }

            findForm(btn) {
                return btn.closest('form') ||
                document.forms[0] ||
                document.querySelector('form');
            }

            markAsFixed(btn, color) {
                btn.style.backgroundColor = color;
                btn.style.color = 'white';
                btn.style.border = `2px solid ${color}`;
                btn.style.transition = 'all 0.2s ease';
                btn.style.position = 'relative';
                btn.dataset.fixed = 'true';

                // Agregar indicador visual
                const indicator = document.createElement('span');
                indicator.innerHTML = '✓';
                indicator.style.cssText = `
                    position: absolute !important;
                    top: -3px !important;
                    right: -3px !important;
                    background: ${color} !important;
                    color: white !important;
                    border-radius: 50% !important;
                    width: 14px !important;
                    height: 14px !important;
                    font-size: 9px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
                    font-weight: bold !important;
                    pointer-events: none !important;
                `;

                btn.appendChild(indicator);
            }

            // ===============================
            // LIMPIEZA DE IMÁGENES
            // ===============================
            cleanProblematicImages() {
                const isProblematicForm = document.querySelector('form[name="envia_datos"]') &&
                    document.querySelector('textarea[name="obsdslam"]');

                if (!isProblematicForm) {
                    console.log('ℹ️ No es formulario problemático, saltando limpieza');
                    return 0;
                }

                console.log('🧹 Formulario problemático detectado, iniciando limpieza específica...');

                let totalCleaned = 0;

                // Limpiar imágenes fondo.bmp problemáticas
                totalCleaned += this.cleanFondoImages();

                // Limpiar fondos CSS problemáticos
                totalCleaned += this.cleanProblematicBackgrounds();

                if (totalCleaned > 0) {
                    console.log(`✅ ${totalCleaned} elemento(s) fondo.bmp problemático(s) limpiado(s)`);
                } else {
                    console.log('ℹ️ No se encontraron elementos fondo.bmp problemáticos');
                }

                return totalCleaned;
            }

            cleanFondoImages() {
                const fondoImages = document.querySelectorAll('img[src*="fondo.bmp"]');
                let cleaned = 0;

                fondoImages.forEach((img, index) => {
                    const rect = img.getBoundingClientRect();
                    const style = window.getComputedStyle(img);

                    const isProblematic = (
                        rect.width > 200 && rect.height > 150 ||
                        rect.width > 100 && rect.height > 100 && style.position === 'absolute' ||
                        rect.width > 50 && rect.height > 50 && (parseInt(style.zIndex) > 0 || style.zIndex === '0') ||
                        rect.width > 80 && rect.height > 60);

                    if (isProblematic) {
                        console.log(`🚫 Imagen fondo.bmp problemática #${index} eliminada - ` +
`Tamaño: ${rect.width}x${rect.height}, Posición: ${style.position}`);

                        this.removeImageSafely(img);
                        cleaned++;
                    } else {
                        console.log(`✅ Imagen fondo.bmp #${index} conservada - No problemática`);
                    }
                });

                return cleaned;
            }

            removeImageSafely(img) {
                try {
                    img.style.display = 'none';
                    img.style.visibility = 'hidden';
                    img.style.opacity = '0';
                    img.style.position = 'absolute';
                    img.style.left = '-9999px';
                    img.style.top = '-9999px';
                    img.style.zIndex = '-9999';

                    setTimeout(() => {
                        if (img.parentNode) {
                            img.remove();
                        }
                    }, 100);

                } catch (error) {
                    console.warn('⚠️ Error al eliminar imagen:', error);
                }
            }

            cleanProblematicBackgrounds() {
                const elementsWithBgFondo = document.querySelectorAll('[style*="fondo.bmp"]');
                let cleaned = 0;

                elementsWithBgFondo.forEach((element, index) => {
                    const rect = element.getBoundingClientRect();
                    const isEmpty = element.children.length === 0 &&
                        element.textContent.trim() === '';

                    if (isEmpty && (rect.width > 200 || rect.height > 100)) {
                        console.log(`🧹 Background fondo.bmp problemático #${index} eliminado - ` +
`Tamaño: ${rect.width}x${rect.height}`);

                        element.style.backgroundImage = 'none !important';
                        element.style.background = 'transparent !important';
                        element.style.display = 'none !important';
                        cleaned++;
                    }
                });

                return cleaned;
            }

            // ===============================
            // APLICACIÓN DE ESTILOS
            // ===============================
            applyStyles() {
                // ✅ VERIFICACIÓN ADICIONAL: No aplicar estilos si hay interfaz moderna
                if (document.getElementById('modern-codim-interface')) {
                    console.log('🎨 Interfaz moderna detectada, NO aplicando estilos clásicos');
                    return;
                }

                if (this.appliedStyles.has('main-styles')) {
                    console.log('ℹ️ Estilos ya aplicados anteriormente');
                    return;
                }

                const isFormPage = this.detectFormPage();
                const style = document.createElement('style');
                style.id = 'codim-page-styles';

                if (isFormPage) {
                    style.textContent = this.getFormCSS();
                    console.log('🎨 Estilos de formulario aplicados');
                } else {
                    style.textContent = this.getListCSS();
                    console.log('🎨 Estilos de lista aplicados');
                }

                document.head.appendChild(style);
                this.appliedStyles.add('main-styles');
            }

            detectFormPage() {
                const hasSelectDropdown = document.querySelector('select[name*="falla"], select[name*="cual"]');
                const hasTextarea = document.querySelector('textarea');
                const hasDataTable = document.querySelector('table') && document.querySelectorAll('tr').length > 3;

                return (hasSelectDropdown || hasTextarea) && !hasDataTable;
            }

            getFormCSS() {
                return `
                    /* ESTILOS PARA FORMULARIOS - SOLO APLICAR SI NO HAY INTERFAZ MODERNA */
                    body:not(:has(#modern-codim-interface)) form[name="envia_datos"] img[src*="fondo.bmp"] {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        position: absolute !important;
                        left: -9999px !important;
                        top: -9999px !important;
                        z-index: -9999 !important;
                    }
                    
                    /* OCULTAR CÓDIGO JAVASCRIPT/VBSCRIPT VISIBLE */
                    body:not(:has(#modern-codim-interface)) div:contains("function valida_datos"),
                    body:not(:has(#modern-codim-interface)) div:contains("document.envia_datos"),
                    body:not(:has(#modern-codim-interface)) script[type="text/vbscript"] {
                        display: none !important;
                        visibility: hidden !important;
                    }
                    
                    body:not(:has(#modern-codim-interface)) {
                        font-family: 'Segoe UI', Arial, sans-serif !important;
                        margin: 0 !important;
                        padding: 20px !important;
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                        min-height: 100vh !important;
                    }
                    
                    body:not(:has(#modern-codim-interface)) center,
                    body:not(:has(#modern-codim-interface)) body > center {
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
                `;
            }

            getListCSS() {
                return `
                    /* ESTILOS PARA LISTAS Y TABLAS - SOLO SI NO HAY INTERFAZ MODERNA */
                    body:not(:has(#modern-codim-interface)) {
                        font-family: 'Segoe UI', Arial, sans-serif !important;
                        margin: 15px !important;
                        background: #f8f9fa !important;
                    }
                    
                    /* OCULTAR CÓDIGO JAVASCRIPT/VBSCRIPT VISIBLE */
                    body:not(:has(#modern-codim-interface)) *:contains("function valida_datos"),
                    body:not(:has(#modern-codim-interface)) *:contains("document.envia_datos") {
                        display: none !important;
                        visibility: hidden !important;
                    }
                `;
            }

            // ===============================
            // NOTIFICACIONES
            // ===============================
            showNotification(message, type = 'success', duration = 3000) {
                // ✅ NO mostrar notificaciones si hay interfaz moderna
                if (document.getElementById('modern-codim-interface')) {
                    return;
                }

                const notification = document.createElement('div');
                notification.className = 'codim-notification';
                notification.textContent = message;

                const colors = {
                    success: '#4CAF50',
                    error: '#f44336',
                    warning: '#ff9800'
                };

                notification.style.cssText = `
                    position: fixed !important;
                    top: 10px !important;
                    right: 15px !important;
                    background: ${colors[type]} !important;
                    color: white !important;
                    padding: 8px 16px !important;
                    border-radius: 6px !important;
                    font-size: 12px !important;
                    font-weight: bold !important;
                    z-index: 9999 !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
                    cursor: pointer !important;
                    font-family: Arial, sans-serif !important;
                    animation: slideInRight 0.3s ease-out !important;
                `;

                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(300px); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;

                if (!document.querySelector('#codim-notification-styles')) {
                    style.id = 'codim-notification-styles';
                    document.head.appendChild(style);
                }

                notification.onclick = () => this.hideNotification(notification);
                document.body.appendChild(notification);

                if (duration > 0) {
                    setTimeout(() => {
                        this.hideNotification(notification);
                    }, duration);
                }

                console.log(`📢 Notificación ${type}: ${message}`);
            }

            hideNotification(notification) {
                notification.style.transform = 'translateX(300px)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }

            // ===============================
            // LIMPIEZAS ADICIONALES
            // ===============================
            scheduleAdditionalCleanups() {
                setTimeout(() => {
                    this.cleanProblematicImages();
                }, 200);

                setTimeout(() => {
                    this.cleanProblematicImages();
                }, 1000);
            }

            // ===============================
            // MUTATION OBSERVER
            // ===============================
            setupMutationObserver() {
                const observer = new MutationObserver((mutations) => {
                    // ✅ VERIFICAR si apareció interfaz moderna y abortar
                    if (shouldSkipClassicPatch()) {
                        console.log('🎨 Verificación en observer: abortando classic patch');
                        observer.disconnect();
                        return;
                    }

                    let needsButtonFix = false;
                    let needsImageCleanup = false;

                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length > 0) {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === 1) {
                                    if (this.hasNewButtons(node)) {
                                        needsButtonFix = true;
                                    }

                                    if (this.hasProblematicImages(node)) {
                                        needsImageCleanup = true;
                                    }
                                }
                            });
                        }
                    });

                    if (needsButtonFix) {
                        setTimeout(() => {
                            const fixed = this.fixAllButtons();
                            if (fixed > 0) {
                                console.log(`✅ ${fixed} botones adicionales arreglados`);
                            }
                        }, 100);
                    }

                    if (needsImageCleanup) {
                        setTimeout(() => {
                            this.cleanProblematicImages();
                        }, 200);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }

            hasNewButtons(node) {
                return node.tagName === 'INPUT' && node.type === 'button' ||
                (node.querySelector && node.querySelector('input[type="button"]'));
            }

            hasProblematicImages(node) {
                return node.tagName === 'IMG' && node.src && node.src.includes('fondo.bmp') &&
                document.querySelector('form[name="envia_datos"]');
            }
        }

        // ===============================
        // INICIALIZACIÓN DEL PATCH CLÁSICO
        // ===============================
        const patch = new ClassicPatch();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => patch.init());
        } else {
            patch.init();
        }

        console.log('🎯 CODIM CNS Classic Patch cargado');
    }

})();