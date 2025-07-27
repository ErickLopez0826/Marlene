// Redirige al login si no hay token JWT
if (!localStorage.getItem('jwtToken')) {
    window.location.href = '/html/login.html';
}
 
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('jwtToken');
    window.location.href = '/html/login.html';
}); 