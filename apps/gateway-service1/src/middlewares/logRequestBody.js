module.exports = (req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl} → body:`, req.body);
    next();
  };