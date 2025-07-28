// Verificar si el usuario está logueado
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    console.log('🔍 Verificando autenticación...');
    console.log('👤 Usuario:', user ? 'Sí' : 'No');
    console.log('🔑 Token:', token ? 'Sí' : 'No');
    
    if (!user || !token) {
        console.log('❌ No autenticado, redirigiendo al login');
        window.location.href = '/html/login.html';
        return false;
    }
    
    console.log('✅ Usuario autenticado');
    return true;
}

// Verificar autenticación al cargar la página
if (!checkAuth()) {
    // La redirección ya se hace en checkAuth()
    throw new Error('No autenticado');
}
 
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('jwtToken');
    window.location.href = '/html/login.html';
}); 