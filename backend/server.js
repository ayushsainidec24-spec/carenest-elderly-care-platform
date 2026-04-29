const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const authRoutes = require("./routes/auth");
const caregiverRoutes = require("./routes/caregiver");
const healthRoutes = require("./routes/health");
const medicationRoutes = require("./routes/medication");
const sosRoutes = require("./routes/sos");
const bookingsRoutes = require("./routes/bookings");
const telemedicineRoutes = require("./routes/telemedicine");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/caregivers", caregiverRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/medication", medicationRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/telemedicine", telemedicineRoutes);

app.get("/test", (req, res) => {
  res.send("ok");
});

// If the frontend has been built, serve it from the backend so frontend + backend
// run on the same port.
const frontendDir = path.join(__dirname, "..", "frontend");
const buildCandidates = [
  path.join(frontendDir, "build"),
  path.join(frontendDir, "dist"),
  path.join(__dirname, "..", "frontend-dist"),
];
const buildPath = buildCandidates.find((candidate) => fs.existsSync(candidate));

if (buildPath) {
  app.use(express.static(buildPath));

  // Serve index.html for any non-API GET request so React Router works.
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CareNest backend running on port ${PORT}`);
});
