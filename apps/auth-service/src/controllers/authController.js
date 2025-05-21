const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const prisma = require('../prisma');
const redis = require('../redisClient');

const generate2FACode = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res, next) => {
  try {
    const { email, password, username, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        role: role || 'user',
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const code = generate2FACode();
    await redis.set(`2fa:${email}`, code, { EX: 300 }); 

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your 2FA Code',
      text: `Your 2FA code is: ${code}`,
    });

    res.json({ message: '2FA code sent to email' });
  } catch (err) {
    next(err);
  }
};

exports.verify2FA = async (req, res, next) => {
    try {
      const { email, code } = req.body;
      const savedCode = await redis.get(`2fa:${email}`);
  
      if (!savedCode || savedCode !== code) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }
  
      await redis.del(`2fa:${email}`); 
  
      const user = await prisma.user.findUnique({ where: { email } });
  
      const token = jwt.sign(
        { email: user.email, role: user.role, id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
  
      res.json({ token });
    } catch (err) {
      next(err);
    }
  };