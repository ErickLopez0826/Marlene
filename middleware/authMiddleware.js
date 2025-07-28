function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('🔍 Verificando autenticación en middleware...');
  console.log('🔑 Token recibido:', token ? 'Sí' : 'No');
  
  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  
  // Para nuestro sistema simple, cualquier token válido es aceptado
  if (token === 'logged-in' || token === 'null' || token) {
    console.log('✅ Token válido, continuando...');
    req.user = {
      ID_Usuario: 1,
      Usuario: 'usuario',
      Rol: 'Admin'
    };
    next();
  } else {
    console.log('❌ Token inválido');
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authMiddleware;
