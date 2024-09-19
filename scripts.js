document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener los parámetros de la URL
    function getQueryParams() {
        const queryParams = new URLSearchParams(window.location.search);
        return {
            id: queryParams.get('id'),
            tipo_alerta: queryParams.get('tipo_alerta'),
            fecha: queryParams.get('fecha'),
            opciones: queryParams.get('opciones') ? queryParams.get('opciones').split(',') : []
        };
    }

    const params = getQueryParams();

    // Establecer los valores de los campos
    if (params.id) document.getElementById('id').value = params.id;
    if (params.tipo_alerta) document.getElementById('tipo_alerta').value = params.tipo_alerta;
    if (params.fecha) document.getElementById('fecha').value = params.fecha;

    // Llenar el combo box con las opciones dinámicas
    const select = document.getElementById('justificacion_select');
    select.innerHTML = ''; // Limpiar las opciones existentes

    params.opciones.forEach(opcion => {
        const optionElement = document.createElement('option');
        optionElement.value = opcion;
        optionElement.textContent = opcion;
        select.appendChild(optionElement);
    });

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
                    alert('Datos enviados correctamente');
                } else {
                    alert('Error al enviar los datos');
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error al enviar los datos');
            });
        }
    });

    //Funcion para idioma
});
