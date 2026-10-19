const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Rota de Registo
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Este nome de utilizador já existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Utilizador registado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor ao registar.' });
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Utilizador ou senha incorretos.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Utilizador ou senha incorretos.' });
    }

    res.status(200).json({ message: 'Login efetuado com sucesso!', username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor ao fazer login.' });
  }
});

// Rota de Recuperação / Redefinição de Palavra-passe
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Palavra-passe alterada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor ao redefinir a palavra-passe.' });
  }
});

module.exports = router;