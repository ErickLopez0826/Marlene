const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  // Permitir mayúsculas/minúsculas y tildes/no tildes
  const Usuario = req.body.Usuario || req.body.usuario;
  const Contraseña = req.body.Contraseña || req.body.contrasena || req.body.contrasenha;
  if (!Usuario || !Contraseña) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }

  db.query('SELECT * FROM usuario WHERE Usuario = ?', [Usuario], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en la base de datos', error: err });
    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    const user = results[0];
    if (Contraseña !== user.Contrasenha) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    // Generar JWT
    const token = jwt.sign(
      { ID_Usuario: user.ID_Usuario, Usuario: user.Usuario, Rol: user.Rol },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    res.json({ token });
  });
};
