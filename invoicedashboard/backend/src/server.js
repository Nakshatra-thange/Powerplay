require('dotenv').config();
const app = require('./app');
const { connect } = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connect();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();