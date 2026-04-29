const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const buildCandidates = [
  path.join(__dirname, 'frontend', 'build'),
  path.join(__dirname, 'frontend-dist'),
];
const buildPath = buildCandidates.find((candidate) => require('fs').existsSync(candidate));

if (buildPath) {
  app.use(express.static(buildPath));
}

// API routes (if backend is integrated)
// app.use('/api', require('./backend/routes'));

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (!buildPath) {
    return res.status(404).send('Frontend build not found. Run npm run build first.');
  }

  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
