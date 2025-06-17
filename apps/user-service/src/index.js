const app = require('./app');
const PORT = process.env.PORT || 3002;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`User service listening on port ${PORT}`);
});
