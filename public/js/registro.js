// API endpoint para registro
const API_REGISTRO = '/api/auth/registro';

// Elementos del DOM
const registerForm = document.getElementById('register-form');
const registerButton = document.getElementById('register-button');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Elementos de campos
const nombreInput = document.getElementById('nombre');
const rolSelect = document.getElementById('rol');
const usuarioInput = document.getElementById('usuario');
const contrasenhaInput = document.getElementById('contrasenha');

// Elementos de error
const nombreError = document.getElementById('nombre-error');
const rolError = document.getElementById('rol-error');
const usuarioError = document.getElementById('usuario-error');
const contrasenhaError = document.getElementById('contrasenha-error');

// Función para mostrar mensajes
function showMessage(message, type = 'error') {
    // Ocultar todos los mensajes
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    if (type === 'error') {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    } else if (type === 'success') {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }
}

// Función para mostrar errores de campo
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
    }
}

// Función para limpiar errores de campo
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement && inputElement) {
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
    }
}

// Función para validar campos
function validateFields() {
    let isValid = true;
    
    // Limpiar todos los errores
    clearFieldError('nombre');
    clearFieldError('rol');
    clearFieldError('usuario');
    clearFieldError('contrasenha');
    
    // Validar nombre
    if (!nombreInput.value.trim()) {
        showFieldError('nombre', 'El nombre es obligatorio');
        isValid = false;
    } else if (nombreInput.value.trim().length < 2) {
        showFieldError('nombre', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }
    
    // Validar rol
    if (!rolSelect.value) {
        showFieldError('rol', 'Debes seleccionar un rol');
        isValid = false;
    }
    
    // Validar usuario
    if (!usuarioInput.value.trim()) {
        showFieldError('usuario', 'El nombre de usuario es obligatorio');
        isValid = false;
    } else if (usuarioInput.value.trim().length < 3) {
        showFieldError('usuario', 'El usuario debe tener al menos 3 caracteres');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(usuarioInput.value.trim())) {
        showFieldError('usuario', 'El usuario solo puede contener letras, números y guiones bajos');
        isValid = false;
    }
    
    // Validar contraseña
    if (!contrasenhaInput.value) {
        showFieldError('contrasenha', 'La contraseña es obligatoria');
        isValid = false;
    } else if (contrasenhaInput.value.length < 6) {
        showFieldError('contrasenha', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    return isValid;
}

// Función para verificar si el usuario ya existe
async function checkUserExists(username) {
    try {
        const response = await fetch(`/api/auth/check-user/${username}`);
        if (response.ok) {
            const data = await response.json();
            return data.exists;
        }
        return false;
    } catch (error) {
        console.error('Error al verificar usuario:', error);
        return false;
    }
}

// Función para registrar usuario
async function registerUser(userData) {
    try {
        console.log('📤 Enviando datos de registro:', userData);
        
        const response = await fetch(API_REGISTRO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        console.log('📊 Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ Error response:', errorData);
            throw new Error(`Error al registrar usuario: ${response.status} ${response.statusText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Usuario registrado:', resultado);
        
        return resultado;
    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        throw error;
    }
}

// Función para manejar el envío del formulario
async function handleSubmit(event) {
    event.preventDefault();
    
    // Validar campos
    if (!validateFields()) {
        return;
    }
    
    // Verificar si el usuario ya existe
    const username = usuarioInput.value.trim();
    const userExists = await checkUserExists(username);
    
    if (userExists) {
        showFieldError('usuario', 'Este nombre de usuario ya está en uso');
        return;
    }
    
    // Preparar datos del usuario
    const userData = {
        Nombre: nombreInput.value.trim(),
        Rol: rolSelect.value,
        Usuario: username,
        Contrasenha: contrasenhaInput.value
    };
    
    // Cambiar estado del botón
    const buttonText = registerButton.querySelector('span');
    const originalText = buttonText.textContent;
    
    registerButton.disabled = true;
    registerButton.classList.add('loading');
    buttonText.textContent = 'Registrando...';
    
    try {
        // Registrar usuario
        const resultado = await registerUser(userData);
        
        // Mostrar mensaje de éxito
        showMessage('Usuario registrado correctamente. Redirigiendo al login...', 'success');
        
        // Limpiar formulario
        registerForm.reset();
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = '/html/login.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error en el registro:', error);
        showMessage(error.message || 'Error al registrar usuario');
    } finally {
        // Restaurar botón
        registerButton.disabled = false;
        registerButton.classList.remove('loading');
        buttonText.textContent = originalText;
    }
}

// Función para mostrar/ocultar contraseña
function togglePassword() {
    const passwordInput = document.getElementById('contrasenha');
    const icon = document.querySelector('#password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de registro...');
    
    // Event listener para el formulario
    registerForm.addEventListener('submit', handleSubmit);
    
    // Event listener para mostrar/ocultar contraseña
    document.getElementById('password-toggle').addEventListener('click', togglePassword);
    
    // Event listeners para limpiar errores al escribir
    nombreInput.addEventListener('input', () => clearFieldError('nombre'));
    rolSelect.addEventListener('change', () => clearFieldError('rol'));
    usuarioInput.addEventListener('input', () => clearFieldError('usuario'));
    contrasenhaInput.addEventListener('input', () => clearFieldError('contrasenha'));
    
    // Event listener para verificar usuario en tiempo real
    let checkTimeout;
    usuarioInput.addEventListener('input', function() {
        clearTimeout(checkTimeout);
        const username = this.value.trim();
        
        if (username.length >= 3) {
            checkTimeout = setTimeout(async () => {
                const exists = await checkUserExists(username);
                if (exists) {
                    showFieldError('usuario', 'Este nombre de usuario ya está en uso');
                }
            }, 500);
        }
    });
}); 