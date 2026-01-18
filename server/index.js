const { createApp } = require('./app');

const PORT = Number(process.env.PORT || 3001);
const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

