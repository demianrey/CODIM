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
    // PATCH SIGNATURE PARA PÁGINAS INTERNAS
    // ===============================
    function addPatchSignature() {
        // Solo agregar si no existe ya
        if (document.querySelector('.demianrey-patch')) {
            return;
        }
        
        const patchSignature = document.createElement('div');
        patchSignature.className = 'demianrey-patch';
        patchSignature.innerHTML = '* Patch by DemianRey';
        patchSignature.title = 'CODIM CNS Fix - Página interna arreglada';
        patchSignature.onclick = function() {
            alert('CODIM CNS Fix v2.0\n\nVBScript convertido a JavaScript\nBotones arreglados\nCompatibilidad con Chrome\n\nPatch by DemianRey');
        };
        document.body.appendChild(patchSignature);
        
        const statusNotification = document.createElement('div');
        statusNotification.className = 'patch-status';
        statusNotification.innerHTML = 'Fix Aplicado';
        statusNotification.title = 'Clic para ocultar';
        statusNotification.onclick = function() {
            this.classList.add('hidden');
            setTimeout(function() {
                if (statusNotification.parentNode) {
                    statusNotification.remove();
                }
            }, 500);
        };
        document.body.appendChild(statusNotification);
        
        setTimeout(function() {
            if (statusNotification.parentNode) {
                statusNotification.classList.add('hidden');
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
        addPatchSignature();
        
        const fixed = fixAllButtons();
        if (fixed > 0) {
            console.log('CODIM Fix: ' + fixed + ' boton(es) arreglado(s) en página interna');
        }
        
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