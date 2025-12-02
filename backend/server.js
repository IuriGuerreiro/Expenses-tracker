const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to expense tracker' });
});

app.get('/api/transactions', (req, res) => {
  res.json({ transactions: [] });
});

app.post('/api/transactions', (req, res) => {
  const transaction = req.body;
  res.json({ success: true, transaction });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
