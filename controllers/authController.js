const authService = require('../services/authService');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
    }
    
    const user = await authService.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    res.json({
      message: 'Login exitoso',
      user: {
        ID_Usuario: user.ID_Usuario,
        Nombre: user.Nombre,
        Usuario: user.Usuario,
        Rol: user.Rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.registro = async (req, res) => {
  try {
    const { Nombre, Rol, Usuario, Contrasenha } = req.body;
    
    // Validar campos obligatorios
    if (!Nombre || !Rol || !Usuario || !Contrasenha) {
      return res.status(400).json({ 
        message: 'Todos los campos son obligatorios' 
      });
    }
    
    // Validar longitud mínima de contraseña
    if (Contrasenha.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Verificar si el usuario ya existe
    const userExists = await authService.checkUserExists(Usuario);
    if (userExists) {
      return res.status(400).json({ 
        message: 'El nombre de usuario ya está en uso' 
      });
    }
    
    // Crear el usuario
    const newUser = await authService.createUser({
      Nombre,
      Rol,
      Usuario,
      Contrasenha
    });
    
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        ID_Usuario: newUser.ID_Usuario,
        Nombre: newUser.Nombre,
        Usuario: newUser.Usuario,
        Rol: newUser.Rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

exports.checkUserExists = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ message: 'Nombre de usuario requerido' });
    }
    
    const exists = await authService.checkUserExists(username);
    
    res.json({ exists });
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    res.status(500).json({ message: 'Error al verificar usuario', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.ID_Usuario;
    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      user: {
        ID_Usuario: user.ID_Usuario,
        Nombre: user.Nombre,
        Usuario: user.Usuario,
        Rol: user.Rol
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

exports.testConnection = async (req, res) => {
  try {
    console.log('🧪 Probando conexión a la base de datos...');
    
    // Intentar hacer una consulta simple
    const db = require('../config/db');
    const [result] = await db.promise.query('SELECT 1 as test');
    
    console.log('✅ Conexión exitosa:', result);
    res.json({ 
      message: 'Conexión a la base de datos exitosa',
      test: result[0].test 
    });
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    res.status(500).json({ 
      message: 'Error de conexión a la base de datos', 
      error: error.message 
    });
  }
};
