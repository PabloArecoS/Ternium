document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener los parámetros de la URL
    function getQueryParams() {
        const queryParams = new URLSearchParams(window.location.search);
        return {
            id: queryParams.get('id'),
            tipo_alerta: queryParams.get('tipo_alerta'),
            fecha: queryParams.get('fecha'),
            opciones: queryParams.get('opciones') ? queryParams.get('opciones').split(';') : [],
            idioma: queryParams.get('idioma') || 'ESPAÑOL'
        };
    }

    const params = getQueryParams();

    // Diccionario de traducciones
    const traducciones = {
        ESPAÑOL: {
            titulo: "Justificación de Alerta",
            idMonitoreo: "ID de Monitoreo",
            tipoAlerta: "Tipo de Alerta",
            fechaAlerta: "Fecha de Alerta",
            justificacionSeleccionable: "Justificación Seleccionable",
            justificacionManual: "Justificación Manual",
            enviar: "Enviar Justificación",
            noAplica: "No aplica",
            invalidFeedback: "Por favor, seleccione una opción.",
            invalidFeedbackManual: "Por favor, escriba una justificación en sus propias palabras.",
            confirmacion: "Justificación enviada.",
            cerrar: "Puede cerrar esta página."
        },
        INGLES: {
            titulo: "Alert Justification",
            idMonitoreo: "Monitoring ID",
            tipoAlerta: "Alert Type",
            fechaAlerta: "Alert Date",
            justificacionSeleccionable: "Selectable Justification",
            justificacionManual: "Manual Justification",
            enviar: "Submit Justification",
            noAplica: "Not applicable",
            invalidFeedback: "Please select an option.",
            invalidFeedbackManual: "Please provide a justification in your own words.",
            confirmacion: "Justification submitted.",
            cerrar: "You can close this page."
        },
        PORTUGUES: {
            titulo: "Justificativa de Alerta",
            idMonitoreo: "ID de Monitoramento",
            tipoAlerta: "Tipo de Alerta",
            fechaAlerta: "Data da Alerta",
            justificacionSeleccionable: "Justificativa Selecionável",
            justificacionManual: "Justificativa Manual",
            enviar: "Enviar Justificativa",
            noAplica: "Não aplicável",
            invalidFeedback: "Por favor, selecione uma opção.",
            invalidFeedbackManual: "Por favor, escreva uma justificativa com suas próprias palavras.",
            confirmacion: "Justificativa enviada.",
            cerrar: "Você pode fechar esta página."
        },
        INTERNACIONAL: {
            titulo: "Justificación de Alerta / Alert Justification",
            idMonitoreo: "ID de Monitoreo / Monitoring ID",
            tipoAlerta: "Tipo de Alerta / Alert Type",
            fechaAlerta: "Fecha de Alerta / Alert Date",
            justificacionSeleccionable: "Justificación Seleccionable / Selectable Justification",
            justificacionManual: "Justificación Manual / Manual Justification",
            enviar: "Enviar Justificación / Submit Justification",
            noAplica: "No aplica / Not applicable",
            invalidFeedback: "Por favor, seleccione una opción. / Please select an option.",
            invalidFeedbackManual: "Por favor, escriba una justificación en sus propias palabras. / Please provide a justification in your own words.",
            confirmacion: "Justificación enviada. / Justification submitted.",
            cerrar: "Puede cerrar esta página. / You can close this page."
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

    // Manejar el envío del formulario
    document.getElementById('justificacion-form').addEventListener('submit', function(event) {
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
                justificacion_manual: document.getElementById('justificacion_manual').value
            };

            fetch('https://prod-81.westus.logic.azure.com:443/workflows/0909078705b741b58fae9a8c9029688f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=wB_tlU_5fTaEmHImv6OU-zDEN1PxupJx_lUcJtJPTpc', {
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
