import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./db.js";

// Route imports
import authRoutes          from "./routes/auth.js";
import tournamentRoutes    from "./routes/tournaments.js";
import registrationRoutes  from "./routes/registrations.js";
import notificationRoutes  from "./routes/notifications.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ─── API Routes ─────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/tournaments",   tournamentRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/notifications", notificationRoutes);

// Convenience alias matching the frontend mock
app.use("/api/live-scores", (req, res, next) => {
  req.url = "/live" + (req.url === "/" ? "" : req.url);
  tournamentRoutes(req, res, next);
});

// ─── Health Check ───────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 fallback ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Start Server ───────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Tables synchronized");

    app.listen(PORT, () => {
      console.log(`\n🏟️  Kridaverse API running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
