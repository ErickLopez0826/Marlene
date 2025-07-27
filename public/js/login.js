document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    if (username === '' || password === '') {
        errorMessage.textContent = 'Por favor, completa ambos campos.';
        return;
    }

    errorMessage.textContent = '';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Usuario: username, Contraseña: password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('jwtToken', data.token);
                window.location.href = '/html/dashboard.html';
            } else {
                errorMessage.textContent = 'Respuesta inválida del servidor.';
            }
        } else {
            const err = await response.json();
            errorMessage.textContent = err.message || 'Usuario o contraseña incorrectos.';
        }
    } catch (error) {
        errorMessage.textContent = 'Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo más tarde.';
        console.error('Error en la solicitud de login:', error);
    }
}); 