document.addEventListener('DOMContentLoaded', function () {
    // Función para obtener los parámetros de la URL
    function getQueryParams() {
        // Obtener los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        // Extraer el parámetro "data" que contiene la cadena codificada en base64
        const encodedParams = urlParams.get('data');
        if (encodedParams) {
            // Decodificar la cadena base64
            const decodedParams = decodeBase64ToUTF8(encodedParams); // Decodificar base64
            const queryParams = new URLSearchParams(decodedParams); // Convertir a parámetros de consulta

            console.log('Parametros decodificados:', decodedParams);
            // Acceder a los valores:
            const id = queryParams.get('id');
            const idioma = queryParams.get('idioma');
            const fecha = queryParams.get('fecha');
            const opciones = queryParams.get('opciones');

            console.log('ID:', id);
            console.log('Idioma:', idioma);
            console.log('Fecha:', fecha);
            console.log('Opciones:', opciones);
            return {
                id: queryParams.get('id'),
                tipo_alerta: queryParams.get('tipo_alerta'),
                fecha: queryParams.get('fecha'),
                opciones: queryParams.get('opciones') ? queryParams.get('opciones').split(';') : [],
                idioma: queryParams.get('idioma') || 'ESPAÑOL'
            };
        } else {
            console.error('No se encontró el parámetro codificado en la URL.');
            const queryParams = new URLSearchParams(window.location.search);
            return {
                id: queryParams.get('id'),
                tipo_alerta: queryParams.get('tipo_alerta'),
                fecha: queryParams.get('fecha'),
                opciones: queryParams.get('opciones') ? queryParams.get('opciones').split(';') : [],
                idioma: queryParams.get('idioma') || 'ESPAÑOL'
            };
        }
    }

    const params = getQueryParams();

    function decodeBase64ToUTF8(base64String) {
        // Decodificar la cadena base64 a una cadena binaria
        const binaryString = atob(base64String);

        // Convertir la cadena binaria a un arreglo de bytes
        const byteArray = Uint8Array.from(binaryString, char => char.charCodeAt(0));

        // Decodificar el arreglo de bytes usando UTF-8
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(byteArray);
    }

    // Mostrar el mensaje de validación y ocultar el formulario al iniciar
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('justificacion-form').style.display = 'none';
    document.getElementById('formularioCCTV').style.display = 'none';

    // Hacer la llamada al flujo de Power Automate usando el ID
    if (params.id) {
        console.log("ID enviado al flujo:", params.id); // Verificar el ID que se envía

        fetch('https://prod-47.westus.logic.azure.com:443/workflows/a25cb4f1cd5142798d48287903968328/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=gK1t32xsHbu3JwV9JBTaCfO2G0fv22lTOZTW59_kV5w', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: params.id }) // Pasar el ID al flujo
        })
            .then(response => {
                console.log("Estado de la respuesta:", response.status); // Mostrar el estado HTTP de la respuesta

                // Verificar si la respuesta fue exitosa (status 200)
                if (!response.ok) {
                    throw new Error('Respuesta no exitosa, estado: ' + response.status);
                }

                // Intentar convertir la respuesta a JSON
                return response.json();
            })
            .then(data => {
                console.log("Datos recibidos del flujo:", data); // Mostrar los datos recibidos

                // Ocultar el mensaje de validación
                document.getElementById('loadingMessage').style.display = 'none';

                // Verificar si los datos contienen lo que esperamos
                document.getElementById('tipo_alerta').value = data.tipo_alerta || "Sin datos";
                document.getElementById('fecha').value = data.usuario || "Sin datos";
                document.getElementById('justificacion_manual').value = data.justificacion || "";
                const seEnvia = data.validacion;

                // Lógica adicional si la justificación está vacía
                if (seEnvia == "True") {
                    //Mostrar el formulario
                    document.getElementById('justificacion-form').style.display = 'block';
                    // Lógica adicional si el tipo_alerta es CCTV
                    if (data.tipo_alerta == "DESCARGAS CCTV") {
                        //Mostrar el formulario CCTV
                        document.getElementById('formularioCCTV').style.display = 'block';
                    } else {
                        //Quitar el atributo required de los campos para CCTV
                        document.getElementById("exportedMedia").removeAttribute("required"),
                        document.getElementById("storageLocation").removeAttribute("required"),
                        document.getElementById("areaLabelProtection").removeAttribute("required"),
                        document.getElementById("activityPurpose").removeAttribute("required"),
                        document.getElementById("sharedWithUser").removeAttribute("required"),
                        document.getElementById("hasFile").removeAttribute("required")
                    }
                } else {
                    document.getElementById('justificacion-form').style.display = 'none';
                    const elementos = traducciones[params.idioma];
                    document.getElementById('validationMessage').innerHTML = `<p>${elementos.validacion}</p><p>${elementos.contacto}<a href="mailto:protecciondeinformac@ternium.com">protecciondeinformac@ternium.com</a></p>`;
                    document.getElementById('validationMessage').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error.message); // Mostrar el mensaje de error
                alert('Hubo un error al consultar los datos.');
            });
    }

    // Diccionario de traducciones
    const traducciones = {
        ESPAÑOL: {
            titulo: "Justificación de Evento",
            idMonitoreo: "ID de Monitoreo",
            tipoAlerta: "Tipo de Evento",
            fechaAlerta: "Usuario de Evento",
            justificacionSeleccionable: "Justificación Seleccionable",
            justificacionManual: "Justificación Manual",
            enviar: "Enviar Justificación",
            noAplica: "No aplica",
            invalidFeedback: "Por favor, seleccione una opción.",
            invalidFeedbackManual: "Por favor escriba una breve justificación con sus propias palabras.",
            confirmacion: "Justificación enviada.",
            cerrar: "Puede cerrar esta página.",
            validacion: "Su justificación ya fue respondida o su caso fue cerrado.",
            contacto: "Por consultas contactar a: ",
            cargando: "Validando datos..."
        },
        INGLES: {
            titulo: "Event Justification",
            idMonitoreo: "Monitoring ID",
            tipoAlerta: "Event Type",
            fechaAlerta: "Event User",
            justificacionSeleccionable: "Selectable Justification",
            justificacionManual: "Manual Justification",
            enviar: "Submit Justification",
            noAplica: "Not applicable",
            invalidFeedback: "Please select an option.",
            invalidFeedbackManual: "Please write a brief justification in your own words.",
            confirmacion: "Justification submitted.",
            cerrar: "You can close this page.",
            validacion: "Your justification has already been answered or your case has been closed.",
            contacto: "For inquiries contact: ",
            cargando: "Validating data..."
        },
        PORTUGUES: {
            titulo: "Justificativa de Evento",
            idMonitoreo: "ID de Monitoramento",
            tipoAlerta: "Tipo de Evento",
            fechaAlerta: "Usuário da Evento",
            justificacionSeleccionable: "Justificativa Selecionável",
            justificacionManual: "Justificativa Manual",
            enviar: "Enviar Justificativa",
            noAplica: "Não aplicável",
            invalidFeedback: "Por favor, selecione uma opção.",
            invalidFeedbackManual: "Por favor, escreva uma breve justificativa com suas próprias palavras.",
            confirmacion: "Justificativa enviada.",
            cerrar: "Você pode fechar esta página.",
            validacion: "Sua justificativa já foi respondida ou seu caso foi encerrado.",
            contacto: "Para dúvidas entre em contato: ",
            cargando: "Validando dados..."
        },
        INTERNACIONAL: {
            titulo: "Justificación de Evento / Event Justification",
            idMonitoreo: "ID de Monitoreo / Monitoring ID",
            tipoAlerta: "Tipo de Evento / Event Type",
            fechaAlerta: "Usuario de Evento / Event User",
            justificacionSeleccionable: "Justificación Seleccionable / Selectable Justification",
            justificacionManual: "Justificación Manual / Manual Justification",
            enviar: "Enviar Justificación / Submit Justification",
            noAplica: "No aplica / Not applicable",
            invalidFeedback: "Por favor, seleccione una opción. / Please select an option.",
            invalidFeedbackManual: "Por favor escriba una breve justificación con sus propias palabras. / Please write a brief justification in your own words.",
            confirmacion: "Justificación enviada. / Justification submitted.",
            cerrar: "Puede cerrar esta página. / You can close this page.",
            validacion: "Su justificación ya fue respondida o su caso fue cerrado. / Your justification has already been answered or your case has been closed.",
            contacto: "Por consultas contactar a / For inquiries contact: ",
            cargando: "Validando datos... / Validating data..."
        }
    };

    // Función para aplicar las traducciones
    function aplicarTraducciones(idioma) {
        const elementos = traducciones[idioma];
        // Cambiar los textos del formulario
        document.querySelector('h1').textContent = elementos.titulo;
        document.querySelector('label[for="id"]').textContent = elementos.idMonitoreo;
        document.querySelector('label[for="tipo_alerta"]').textContent = elementos.tipoAlerta;
        document.querySelector('label[for="fecha"]').textContent = elementos.fechaAlerta;
        document.querySelector('label[for="justificacion_select"]').textContent = elementos.justificacionSeleccionable;
        document.querySelector('label[for="justificacion_manual"]').textContent = elementos.justificacionManual;
        document.querySelector('button[type="submit"]').textContent = elementos.enviar;
        //Cambiar los mensajes de validación
        document.querySelector('#feedback-select').textContent = elementos.invalidFeedback;
        document.querySelector('#feedback-manual').textContent = elementos.invalidFeedbackManual;
        document.querySelector('#loadingMessage').textContent = elementos.cargando;
    }

    // Llamar a la función al cargar la página
    aplicarTraducciones(params.idioma);

    // Establecer los valores de los campos
    if (params.id) document.getElementById('id').value = params.id;
    if (params.tipo_alerta) document.getElementById('tipo_alerta').value = params.tipo_alerta;
    if (params.fecha) document.getElementById('fecha').value = params.fecha;

    // Llenar el combo box con las opciones dinámicas
    const select = document.getElementById('justificacion_select');
    select.innerHTML = ''; // Limpiar las opciones existentes

    // Verificar si hay opciones en los parámetros de la URL
    if (params.opciones.length > 0) {
        params.opciones.forEach(opcion => {
            const optionElement = document.createElement('option');
            optionElement.value = opcion;
            optionElement.textContent = opcion;
            select.appendChild(optionElement);
        });
    } else {
        // Si no hay opciones, agregar "No aplica"
        const optionElement = document.createElement('option');
        optionElement.value = "No aplica";
        optionElement.textContent = "No aplica";
        //optionElement.textContent = elementos.noAplica;
        select.appendChild(optionElement);
    }

    //Funciones para eventos del mouse
    select.addEventListener('mouseover', (event) => {
        if (event.target.tagName === 'OPTION') {
            event.target.style.backgroundColor = 'orange';
        }
    });
    select.addEventListener('mouseout', (event) => {
        if (event.target.tagName === 'OPTION') {
            event.target.style.backgroundColor = ''; // Restaurar el color original
        }
    });

    // Inicializar el estado del campo de archivo
    const hasFile = document.getElementById("hasFile").value;
    const fileUpload = document.getElementById("exportApprovalFile");

    if (hasFile === "NO") {
        fileUpload.removeAttribute("required");
        fileUpload.value = ""; // Reinicia el valor
    }

    // Referencias de elementos
    const hasFileSelect = document.getElementById("hasFile");
    const fileUploadGroup = document.getElementById("fileUploadGroup");
    const exportApprovalFileInput = document.getElementById("exportApprovalFile");
    const fileErrorSpan = document.getElementById("fileError");

    // Escuchar cambios en el campo de selección
    hasFileSelect.addEventListener("change", () => {
        if (hasFileSelect.value === "SI") {
            // Mostrar el campo de archivo
            fileUploadGroup.style.display = "block";
            exportApprovalFileInput.setAttribute("required", "required");
        } else {
            // Ocultar el campo de archivo y reiniciar el valor
            fileUploadGroup.style.display = "none";
            exportApprovalFileInput.value = ""; // Reiniciar el archivo
            exportApprovalFileInput.removeAttribute("required");
            fileErrorSpan.style.display = "none"; // Ocultar cualquier error previo
        }
    });

    // Variable global para almacenar el archivo en Base64
    let selectedFileBase64 = "";

    // Función para convertir el archivo a Base64
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); // Eliminar el prefijo "data:..."
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
    // Escuchar el evento de cambio en el input de archivo
    document.getElementById("exportApprovalFile").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        const errorElement = document.getElementById("fileError");
        if (file) {
            const fileName = file.name.toLowerCase();
            const fileExtension = fileName.split('.').pop();
            // Verifica si la extensión es .msg
            if (fileExtension !== "msg") {
                errorElement.style.display = "block"; // Muestra el mensaje de error
                event.target.setCustomValidity("Invalid file type"); // Marca el campo como inválido
                event.target.value = ""; // Resetea el campo de archivo
            } else {
                errorElement.style.display = "none"; // Oculta el mensaje de error
                event.target.setCustomValidity(""); // Limpia el estado de validez del campo

                try {
                    // Convierte el archivo a Base64
                    selectedFileBase64 = await convertFileToBase64(file);
                    console.log("Archivo en Base64:", selectedFileBase64);
                } catch (error) {
                    console.error("Error al convertir el archivo a Base64:", error);
                }
            }
        }
    });

    // Manejar el envío del formulario
    document.getElementById('justificacion-form').addEventListener('submit', function (event) {
        const form = event.target;

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        form.classList.add('was-validated');

        if (form.checkValidity()) {
            event.preventDefault();

            const data = {
                id: document.getElementById('id').value,
                tipo_alerta: document.getElementById('tipo_alerta').value,
                fecha: document.getElementById('fecha').value,
                justificacion_select: document.getElementById('justificacion_select').value,
                justificacion_manual: document.getElementById('justificacion_manual').value,
                exportedMedia: document.getElementById("exportedMedia").value,
                storageLocation: document.getElementById("storageLocation").value,
                areaLabelProtection: document.getElementById("areaLabelProtection").value,
                activityPurpose: document.getElementById("activityPurpose").value,
                sharedWithUser: document.getElementById("sharedWithUser").value,
                hasFile: document.getElementById("hasFile").value,
                exportApprovalFile: selectedFileBase64  // Archivo en formato Base64
            };
            //Mostrar datos antes de enviar
            console.log("Datos a enviar a PA:", data);
            //fetch('https://prod-81.westus.logic.azure.com:443/workflows/0909078705b741b58fae9a8c9029688f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=wB_tlU_5fTaEmHImv6OU-zDEN1PxupJx_lUcJtJPTpc', {
            fetch('https://prod-122.westus.logic.azure.com:443/workflows/1eb1e77b6f444e6c806ff6d96631f0cd/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=i2Rt4rM5VQONe8zHMDvsPfa83qjGpcCgGdzQfhBCS_s', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    // Ocultar el formulario
                    document.getElementById('justificacion-form').style.display = 'none';
                    // Mostrar el mensaje de confirmación
                    //document.getElementById('confirmationMessage').style.display = 'block';
                    const elementos = traducciones[params.idioma];
                    document.getElementById('confirmationMessage').innerHTML = `<p>${elementos.confirmacion}</p><p>${elementos.cerrar}</p>`;
                    document.getElementById('confirmationMessage').style.display = 'block';
                    //alert('Datos enviados correctamente');
                } else {
                    alert('Error al enviar los datos');
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error al enviar los datos');
            });
        }
    });
});
