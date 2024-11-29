// Función para mostrar alertas con SweetAlert2
function showAlert(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text
    });
}

document.addEventListener("DOMContentLoaded", function() {

    // Formulario de registro
    document.getElementById('formregistro').addEventListener('submit', function(event) {
        event.preventDefault();
    
        const usuario = document.getElementById('Usuario_r').value;
        const correo = document.getElementById('correo_r').value;
        const contra = document.getElementById('contra_r').value;
        const contraConfirm = document.getElementById('contra_r2').value;
        
        // Asignamos un rol por defecto
        const rol = 'cliente';  // Rol predeterminado

        // Validación del formulario de registro
        if (!val_regis(usuario, contra, contraConfirm, correo)) {
            return; 
        }
    
        const data = {
            usuario: usuario,
            correo: correo,
            contra: contra,
            rol: rol  // Enviamos el rol predeterminado
        };
    
        fetch('/registrarus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Usamos la función showAlert para mostrar el mensaje de éxito
                showAlert('success', '¡Registro exitoso!', 'Bienvenido a La Desesperanza');
                window.location.href = '/login'; // Redirige al inicio de sesión
            } else {
                // Usamos la función showAlert para mostrar el mensaje de error
                showAlert('error', '¡Error!', 'Hubo un problema con tu registro: ' + (data.error || 'intenta nuevamente'));
            }
        })
        .catch(error => {
            console.error('Error al registrar:', error);
            // Usamos la función showAlert para mostrar el mensaje de error
            showAlert('error', '¡Error!', 'Error en el registro, por favor intente nuevamente');
        });
    });

    // Formulario de inicio de sesión
    document.getElementById("formlogin").addEventListener("submit", function(event) {
        event.preventDefault();
        const correo = document.getElementById("correo_i").value;
        const contra = document.getElementById("contra_i").value;
    
        if (valid_inicio_s(correo, contra)) {
            fetch('/iniciarsesion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo_i: correo, contra_i: contra })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    // Usamos la función showAlert para mostrar el mensaje de éxito
                    showAlert('success', '¡Éxito!', data.message || 'Inicio de sesión exitoso.');
                    // Redirige según el rol
                    if (data.redirectTo) {
                        window.location.href = data.redirectTo;
                    }
                } else if (data.error) {
                    // Usamos la función showAlert para mostrar el mensaje de error
                    showAlert('error', '¡Error!', data.error || 'Hubo un error al iniciar sesión.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('error', '¡Error!', 'Hubo un error al intentar iniciar sesión.');
            });
        }
    });
});

function valid_inicio_s(correo, contraseña) {
    if (correo.length === 0 || contraseña.length === 0) {
        showAlert('error', '¡Error!', "Por favor, completa todos los campos.");
        return false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(correo)) {
        showAlert('error', '¡Error!', "El correo debe ser un correo válido.");
        return false;
    } else {
        return true;
    }
}

function val_regis(usuario, cont, cont2, correo) {
    if (!usuario) {
        showAlert('error', '¡Error!', 'Por favor, ingresa un nombre de usuario.');
        return false;
    } else if (!correo || !correo.endsWith('@gmail.com')) {
        showAlert('error', '¡Error!', 'El correo debe ser de tipo Gmail.');
        return false;
    } else if (cont.length < 8) {
        showAlert('error', '¡Error!', 'La contraseña debe tener al menos 8 caracteres.');
        return false;
    } else if (cont !== cont2) {
        showAlert('error', '¡Error!', 'Las contraseñas no coinciden.');
        return false;
    } else {
        return true;
    }
}
