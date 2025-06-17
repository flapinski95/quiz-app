module.exports = (req, res, next) => {
  const roles = req.user?.roles || [];

  if (!roles.includes('admin')) {
    return res.status(403).json({ message: 'Brak uprawnień (admin only)' });
  }

  next();
};
