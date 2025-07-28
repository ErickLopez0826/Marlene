document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');
    const button = document.getElementById('login-button');
    const buttonText = button.querySelector('span');

    // Validación básica
    if (username === '' || password === '') {
        errorMessage.textContent = 'Por favor, completa ambos campos.';
        errorMessage.style.display = 'block';
        return;
    }

    // Limpiar mensaje de error anterior
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Mostrar estado de carga
    button.classList.add('loading');
    buttonText.textContent = 'Iniciando...';

    console.log('Intentando login con:', { username, password: '***' });

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: username, 
                password: password 
            })
        });

        console.log('Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Datos de respuesta:', data);
            
            // Guardar información del usuario en localStorage
            if (data.user) {
                console.log('Usuario autenticado, guardando datos en localStorage');
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('jwtToken', 'logged-in'); // Token temporal
                
                // Mostrar mensaje de éxito
                buttonText.textContent = '¡Éxito!';
                setTimeout(() => {
                    console.log('Redirigiendo al dashboard...');
                    window.location.href = '/html/dashboard.html';
                }, 1000);
            } else {
                console.error('No se recibió información del usuario en la respuesta');
                errorMessage.textContent = 'Respuesta inválida del servidor.';
                errorMessage.style.display = 'block';
                button.classList.remove('loading');
                buttonText.textContent = 'Iniciar Sesión';
            }
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('Error en la respuesta:', errorData);
            
            errorMessage.textContent = errorData.message || 'Usuario o contraseña incorrectos.';
            errorMessage.style.display = 'block';
            button.classList.remove('loading');
            buttonText.textContent = 'Iniciar Sesión';
        }
    } catch (error) {
        console.error('Error en la solicitud de login:', error);
        
        errorMessage.textContent = 'Error de conexión. Verifica que el servidor esté funcionando.';
        errorMessage.style.display = 'block';
        button.classList.remove('loading');
        buttonText.textContent = 'Iniciar Sesión';
    }
});

// Función para probar la conexión a la base de datos
async function testDatabaseConnection() {
    try {
        console.log('Probando conexión a la base de datos...');
        const response = await fetch('/api/auth/test');
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Conexión a la base de datos exitosa:', data);
        } else {
            console.error('❌ Error de conexión a la base de datos:', data);
        }
    } catch (error) {
        console.error('❌ Error al probar conexión:', error);
    }
}

// Probar conexión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de login cargada');
    testDatabaseConnection();
}); 