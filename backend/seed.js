// ─── Seed Script ─────────────────────────────────────────────────────
// Run with: npm run seed
// Seeds the database with demo users, tournaments, and notifications.

import bcrypt from "bcryptjs";
import sequelize from "./db.js";
import { User, Tournament, Notification } from "./models.js";

const now = new Date();

async function seed() {
  await sequelize.sync({ force: true });
  console.log("🗑️  Database wiped & recreated");

  // ── Users ──────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash("admin123", 10);
  const userPass  = await bcrypt.hash("user123", 10);

  const admin = await User.create({
    username: "admin",
    email:    "admin@kridaverse.com",
    password: adminPass,
    branch:   "CSE",
    year:     4,
    role:     "admin",
  });

  const user1 = await User.create({
    username: "shannu",
    email:    "shannu@kridaverse.com",
    password: userPass,
    branch:   "CSE",
    year:     3,
    role:     "user",
  });

  console.log("👤 Users seeded (admin@kridaverse.com / admin123, shannu@kridaverse.com / user123)");

  // ── Tournaments ────────────────────────────────────────────────────
  const tournaments = [
    {
      sport: "cricket", teamA: "CSE Titans", teamB: "IT Strikers",
      scoreA: 142, scoreB: 118, status: "live",
      venue: "Outdoor Practice Facility", referee: "R. Sharma",
      scheduledAt: new Date(now.getTime() - 3600_000),
      stats: JSON.stringify({ wicketsA: 4, wicketsB: 7, oversA: 15, oversB: 14 }),
      log: JSON.stringify([
        { t: now.getTime() - 60_000, text: "Boundary by CSE Titans" },
        { t: now.getTime() - 300_000, text: "Wicket! IT Strikers 6 down" },
      ]),
    },
    {
      sport: "football", teamA: "ECE United", teamB: "CSE FC",
      scoreA: 2, scoreB: 1, status: "live",
      venue: "Athletic Arena", referee: "M. Patel",
      scheduledAt: new Date(now.getTime() - 1800_000),
      stats: JSON.stringify({ possessionA: 58, possessionB: 42, shotsA: 11, shotsB: 6 }),
      log: JSON.stringify([{ t: now.getTime() - 120_000, text: "Goal — ECE United (73')" }]),
    },
    {
      sport: "basketball", teamA: "IT Blazers", teamB: "ECE Kings",
      scoreA: 68, scoreB: 71, status: "live",
      venue: "Multi-Sports Arena", referee: "K. Rao",
      scheduledAt: new Date(now.getTime() - 900_000),
      stats: JSON.stringify({ foulsA: 8, foulsB: 11, assistsA: 14, assistsB: 12 }),
      log: JSON.stringify([{ t: now.getTime() - 30_000, text: "3-pointer by ECE Kings" }]),
    },
    {
      sport: "kabaddi", teamA: "Raiders", teamB: "Defenders",
      scoreA: 0, scoreB: 0, status: "upcoming",
      venue: "Multi-Sports Arena",
      scheduledAt: new Date(now.getTime() + 3600_000 * 3),
      stats: JSON.stringify({}), log: JSON.stringify([]),
    },
    {
      sport: "volleyball", teamA: "Spikers", teamB: "Blockers",
      scoreA: 3, scoreB: 1, status: "completed",
      venue: "Multi-Sports Arena",
      scheduledAt: new Date(now.getTime() - 86400_000),
      stats: JSON.stringify({}), log: JSON.stringify([]),
    },
    {
      sport: "hockey", teamA: "Chargers", teamB: "Falcons",
      scoreA: 0, scoreB: 0, status: "upcoming",
      venue: "Athletic Arena",
      scheduledAt: new Date(now.getTime() + 86400_000),
      stats: JSON.stringify({}), log: JSON.stringify([]),
    },
  ];

  await Tournament.bulkCreate(tournaments);
  console.log(`🏆 ${tournaments.length} tournaments seeded`);

  // ── Notifications ──────────────────────────────────────────────────
  await Notification.bulkCreate([
    { content: "Welcome to Kridaverse 2026! Registrations are now open.", type: "success" },
    { content: "Cricket finals rescheduled to July 20th.", type: "warning" },
    { content: "New sport added: Hockey. Register your teams now!", type: "info" },
  ]);
  console.log("📢 3 notifications seeded");

  console.log("\n✅ Seed complete!\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
