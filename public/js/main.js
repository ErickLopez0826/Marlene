document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita el envío tradicional del formulario

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    // Validación básica para campos no vacíos
    if (username === '' || password === '') {
        errorMessage.textContent = 'Por favor, completa ambos campos.';
        return;
    }

    // Limpia mensajes de error previos
    errorMessage.textContent = '';

    try {
        // Simulamos una llamada a una API real.
        // En un caso real, la URL sería '/api/login'.
        // Para este ejemplo, simulamos una respuesta exitosa y una fallida.
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', { // URL de ejemplo
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        // Simulación de lógica de API:
        // Si el usuario es "admin" y la contraseña es "12345", el login es exitoso.
        if (username === 'admin' && password === '12345') {
            // Simulamos la recepción de un token JWT
            const fakeJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            
            // Guardar el token en localStorage
            localStorage.setItem('jwtToken', fakeJwtToken);
            
            // Redirigir al dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Si las credenciales son incorrectas, muestra un error
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
        }

    } catch (error) {
        // Manejo de errores de red o del servidor
        errorMessage.textContent = 'Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo más tarde.';
        console.error('Error en la solicitud de login:', error);
    }
});