// classic-patch.js - Patch para páginas internas del sistema (sin imports)
(function() {
    'use strict';
    
    // Solo ejecutar si NO estamos en la interfaz moderna
    if (document.getElementById('modern-codim-interface')) {
        console.log('Interfaz moderna detectada, saltando patch clásico');
        return;
    }
    
    console.log('🔧 CODIM CNS Fix - Iniciando patch clásico...');
    
    // ===============================
    // CLASE PRINCIPAL DEL PATCH
    // ===============================
    class ClassicPatch {
        constructor() {
            this.isModernInterface = !!document.getElementById('modern-codim-interface');
            this.appliedStyles = new Set();
        }

        init() {
            if (this.isModernInterface) {
                console.log('Interfaz moderna detectada, saltando patch clásico');
                return;
            }

            console.log('🔧 CODIM CNS Fix - Iniciando patch clásico...');
            
            this.applyPatch();
            this.setupMutationObserver();
        }

        applyPatch() {
            // 1. Reemplazar funciones VBScript
            this.replaceVBScriptFunctions();
            
            // 2. Aplicar estilos según tipo de página
            this.applyStyles();
            
            // 3. Arreglar botones problemáticos
            const fixedButtons = this.fixAllButtons();
            
            // 4. Limpiar imágenes problemáticas
            this.cleanProblematicImages();
            
            // 5. Mostrar notificación
            this.showNotification(`Fix aplicado - ${fixedButtons} botones arreglados`);
            
            // 6. Limpiezas adicionales
            this.scheduleAdditionalCleanups();
            
            console.log('✅ CODIM CNS Fix aplicado exitosamente');
        }

        // ===============================
        // LOADING OVERLAY
        // ===============================
        showLoading(title = 'Cargando...', subtitle = 'Por favor espera...') {
            // Remover loading anterior si existe
            this.hideLoading();
            
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'codim-loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <h3 class="loading-title">${title}</h3>
                    <p class="loading-subtitle">${subtitle}</p>
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            
            loadingOverlay.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.8) !important;
                backdrop-filter: blur(5px) !important;
                z-index: 999999 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-family: 'Segoe UI', Arial, sans-serif !important;
                animation: fadeInLoading 0.3s ease-out !important;
            `;
            
            // Agregar estilos del loading
            const loadingStyle = document.createElement('style');
            loadingStyle.id = 'codim-loading-styles';
            loadingStyle.textContent = `
                @keyframes fadeInLoading {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                
                .loading-container {
                    text-align: center !important;
                    background: white !important;
                    padding: 40px !important;
                    border-radius: 15px !important;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
                    max-width: 400px !important;
                    animation: slideInUp 0.5s ease-out !important;
                }
                
                @keyframes slideInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(30px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                
                .loading-spinner {
                    width: 50px !important;
                    height: 50px !important;
                    border: 4px solid #f3f3f3 !important;
                    border-top: 4px solid #4A90E2 !important;
                    border-radius: 50% !important;
                    animation: spin 1s linear infinite !important;
                    margin: 0 auto 20px auto !important;
                }
                
                .loading-title {
                    color: #2c3e50 !important;
                    font-size: 20px !important;
                    font-weight: 600 !important;
                    margin: 0 0 10px 0 !important;
                }
                
                .loading-subtitle {
                    color: #7f8c8d !important;
                    font-size: 14px !important;
                    margin: 0 0 20px 0 !important;
                    line-height: 1.4 !important;
                }
                
                .loading-dots {
                    display: flex !important;
                    justify-content: center !important;
                    gap: 5px !important;
                }
                
                .loading-dots span {
                    width: 8px !important;
                    height: 8px !important;
                    background: #4A90E2 !important;
                    border-radius: 50% !important;
                    display: inline-block !important;
                    animation: bounce 1.4s infinite ease-in-out both !important;
                }
                
                .loading-dots span:nth-child(1) { animation-delay: -0.32s !important; }
                .loading-dots span:nth-child(2) { animation-delay: -0.16s !important; }
                .loading-dots span:nth-child(3) { animation-delay: 0s !important; }
            `;
            
            document.head.appendChild(loadingStyle);
            document.body.appendChild(loadingOverlay);
            
            // Auto-ocultar después de 30 segundos por seguridad
            setTimeout(() => {
                this.hideLoading();
            }, 30000);
            
            console.log('🔄 Loading mostrado:', title);
        }
        
        hideLoading() {
            const overlay = document.getElementById('codim-loading-overlay');
            const styles = document.getElementById('codim-loading-styles');
            
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.remove();
                    }
                }, 300);
            }
            
            if (styles) {
                styles.remove();
            }
            
            console.log('✅ Loading ocultado');
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
            
            // Función principal de validación
			window.valida_datos = () => this.validaDatos();
			window.valida_cobo = () => this.validaCobo();
			window.vertexto = () => this.verTexto();
			

			// Funciones para manejo de ventanas emergentes - GLOBALES
			if (typeof window.ventana === 'undefined') {
				window.ventana = null;
			}

			window.cierra_opcion = function(tiempox, y, x, pagina, tarda) {
				if (window.ventana && window.ventana.style) {
					window.ventana.style.clip = `rect(0,${x},${y},0)`;
				}
				if (pagina && pagina !== "") {
					setTimeout(function() {
						// Navegar en la misma ventana como IE
						window.location.href = `ver_rep.asp?folio=${pagina}`;
					}, tarda || 100);
				}
			};

			window.cambia_menu = function(seccion, tipo, folio, param1, param2, param3, busca) {
	console.log('🔄 cambia_menu llamado:', arguments);
	
	// Si es una consulta de folio - navegar en la misma ventana
	if (seccion === 'consulta' && (folio || busca || param3)) {
		const folioFinal = folio || busca || param3;
		const url = `ver_rep.asp?folio=${folioFinal}&busca=${busca || ''}`;
		console.log('📋 Navegando a consulta:', url);
		window.location.href = url;
		return;
	}
	
	// Casos específicos de modificación
	if (seccion === 'modifica' && folio) {
		const url = `modi_rep.asp?folio=${folio}&opc=${param1 || ''}&tipo_f=${param2 || ''}&ver=${param3 || ''}&busca=${busca || ''}`;
		console.log('📋 Navegando a modificación:', url);
		window.location.href = url;
		return;
	}
	
	if (seccion === 'modifica2' && folio) {
		const url = `modi_rep2.asp?folio=${folio}&falla=${param1 || ''}`;
		console.log('📋 Navegando a modificación 2:', url);
		window.location.href = url;
		return;
	}
	
	// Para otros casos, usar el método original si existe
	if (typeof window.top?.cambia_menu === 'function') {
		window.top.cambia_menu.apply(window.top, arguments);
	}
};

			// Asegurar que las funciones estén en el ámbito global correcto
			if (typeof window.top !== 'undefined') {
				window.top.cierra_opcion = window.cierra_opcion;
				window.top.cambia_menu = window.cambia_menu;
				window.top.ventana = window.ventana;
			}
			
            window.vertexto = () => this.verTexto();
            
            console.log('✅ Funciones VBScript reemplazadas por JavaScript');
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
		
		validaCobo() {
    console.log('🔍 Ejecutando validación de COBO...');
    
    const form = document.envia_datos || 
                 document.forms.envia_datos || 
                 document.forms[0] ||
                 document.querySelector('form[name="envia_datos"]');
    
    if (!form) {
        console.error('❌ No se encontró el formulario envia_datos');
        return false;
    }
    
    const coboField = form.cobo || form.querySelector('[name="cobo"]');
    if (!coboField) {
        console.error('❌ No se encontró el campo cobo');
        return false;
    }
    
    const reporte = window.trim(coboField.value);
    let valido = "N";
    
    console.log('📋 Validando COBO:', reporte);
    
    // Validación: debe empezar con "MA" y tener 11 caracteres
    if (reporte.toUpperCase().substring(0, 2) === "MA" && reporte.length === 11) {
        valido = "S";
        console.log('✅ Formato COBO válido');
    }
    
    if (valido === "N") {
        window.msgbox("Formato Incorrecto de COBO.");
        coboField.value = "";
        coboField.focus();
        console.log('❌ Formato COBO inválido - campo limpiado');
        return false;
    } else {
        // Formatear: MA en mayúsculas + resto del código
        const z1 = reporte.substring(0, 2);  // Primeros 2 caracteres
        const z2 = reporte.substring(2, 11); // Caracteres 3 al 11
        coboField.value = z1.toUpperCase() + z2;
        console.log('✅ COBO formateado:', coboField.value);
        return true;
    }
};

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
            if (!form) return;

            const obsField = form.obsdslam;
            if (!obsField) return;

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
                    this.showLoading('Enviando formulario de central...', 'Buscando equipos en el servidor...');
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
                console.log('📋 Ejecutando validación de datos...');
                return window.valida_datos();
            };
            
            this.markAsFixed(btn, '#2196F3');
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
                    rect.width > 80 && rect.height > 60
                );

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
                /* ESTILOS PARA FORMULARIOS */
                form[name="envia_datos"] img[src*="fondo.bmp"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                    top: -9999px !important;
                    z-index: -9999 !important;
                }
                
                body {
                    font-family: 'Segoe UI', Arial, sans-serif !important;
                    margin: 0 !important;
                    padding: 20px !important;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                    min-height: 100vh !important;
                }
                
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
                
                center font, center b, center strong {
                    display: block !important;
                    color: #2c3e50 !important;
                    font-weight: 600 !important;
                    font-size: 22px !important;
                    margin-bottom: 25px !important;
                    text-decoration: underline !important;
                    text-decoration-color: #4A90E2 !important;
                    text-underline-offset: 8px !important;
                }
                
                table {
                    margin: 20px auto !important;
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    background: white !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
                    border: 1px solid #e9ecef !important;
                }
                
                td {
                    padding: 12px 18px !important;
                    vertical-align: middle !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                }
                
                td:first-child {
                    background: #f8f9fa !important;
                    font-weight: 600 !important;
                    color: #495057 !important;
                    text-align: right !important;
                    border-right: 1px solid #e9ecef !important;
                    min-width: 140px !important;
                }
                
                input[type="text"], select, textarea {
                    padding: 8px 12px !important;
                    border: 2px solid #e9ecef !important;
                    border-radius: 6px !important;
                    font-size: 14px !important;
                    background: white !important;
                    transition: all 0.3s ease !important;
                    min-width: 200px !important;
                }
                
                input[type="text"]:focus, select:focus, textarea:focus {
                    border-color: #4A90E2 !important;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1) !important;
                    outline: none !important;
                }
                
                select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234A90E2' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
                    background-position: right 12px center !important;
                    background-repeat: no-repeat !important;
                    background-size: 14px 14px !important;
                    padding-right: 40px !important;
                    appearance: none !important;
                    min-width: 250px !important;
                    cursor: pointer !important;
                }
                
                textarea {
                    width: 400px !important;
                    height: 100px !important;
                    resize: vertical !important;
                    line-height: 1.4 !important;
                }
                
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
                
                input[value*="Regresa"], input[value="Regresar"] {
                    background: linear-gradient(135deg, #6c757d, #5a6268) !important;
                    box-shadow: 0 3px 12px rgba(108, 117, 125, 0.3) !important;
                }
                
                center {
                    animation: fadeInForm 0.6s ease-out !important;
                }
                
                @keyframes fadeInForm {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
        }

        getListCSS() {
            return `
                /* ESTILOS PARA LISTAS Y TABLAS */
                body {
                    font-family: 'Segoe UI', Arial, sans-serif !important;
                    margin: 15px !important;
                    background: #f8f9fa !important;
                }
                
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
                
                tr:first-child td {
                    background: #f6f8fa !important;
                    font-weight: bold !important;
                    border-bottom: 2px solid #d0d7de !important;
                }
                
                a {
                    color: #0969da !important;
                    text-decoration: none !important;
                    font-weight: 500 !important;
                }
                
                a:hover {
                    text-decoration: underline !important;
                }
                
                input[type="text"], select, textarea {
                    padding: 6px 10px !important;
                    border: 1px solid #d0d7de !important;
                    border-radius: 4px !important;
                    font-size: 13px !important;
                    background: white !important;
                    transition: border-color 0.2s ease !important;
                }
                
                input[type="text"]:focus, select:focus, textarea:focus {
                    border-color: #0969da !important;
                    box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.1) !important;
                    outline: none !important;
                }
                
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
            `;
        }

        // ===============================
        // NOTIFICACIONES
        // ===============================
        showNotification(message, type = 'success', duration = 3000) {
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
                let needsButtonFix = false;
                let needsImageCleanup = false;
                let pageChanged = false;
                
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
                                
                                // Detectar si se cargó nueva página/contenido
                                if (node.tagName === 'TABLE' || node.tagName === 'FORM' || 
                                    (node.querySelector && (node.querySelector('table') || node.querySelector('form')))) {
                                    pageChanged = true;
                                }
                            }
                        });
                    }
                });
                
                // Si cambió la página, ocultar loading
                if (pageChanged) {
                    setTimeout(() => {
                        this.hideLoading();
                    }, 500); // Dar tiempo a que se renderice
                }
                
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
    // INICIALIZACIÓN
    // ===============================
    const patch = new ClassicPatch();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => patch.init());
    } else {
        patch.init();
    }
    
    console.log('🎯 CODIM CNS Classic Patch cargado');
    
})();