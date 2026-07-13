import { Router } from "express";
import { Tournament } from "../models.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ─── Helper: parse JSON fields safely ────────────────────────────────
function formatTournament(t) {
  const plain = t.toJSON();
  try { plain.stats = JSON.parse(plain.stats); } catch { plain.stats = {}; }
  try { plain.log   = JSON.parse(plain.log);   } catch { plain.log   = []; }
  return plain;
}

// ─── GET /api/tournaments ────────────────────────────────────────────
// Public: list all tournaments, optionally filter by ?sport= and ?status=
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.sport)  where.sport  = req.query.sport;
    if (req.query.status) where.status = req.query.status;

    const rows = await Tournament.findAll({ where, order: [["scheduledAt", "ASC"]] });
    return res.json(rows.map(formatTournament));
  } catch (err) {
    console.error("List tournaments error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tournaments/live ───────────────────────────────────────
// Public: convenience endpoint for live matches only
router.get("/live", async (req, res) => {
  try {
    const rows = await Tournament.findAll({
      where: { status: "live" },
      order: [["scheduledAt", "ASC"]],
    });
    return res.json(rows.map(formatTournament));
  } catch (err) {
    console.error("Live scores error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tournaments/:id ────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const t = await Tournament.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: "Tournament not found" });
    return res.json(formatTournament(t));
  } catch (err) {
    console.error("Get tournament error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/tournaments (Admin) ───────────────────────────────────
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { sport, teamA, teamB, venue, referee, scheduledAt, status } = req.body;

    if (!sport || !teamA || !teamB) {
      return res.status(400).json({ error: "sport, teamA, and teamB are required" });
    }

    const t = await Tournament.create({
      sport,
      teamA,
      teamB,
      venue:       venue || "Main Arena",
      referee:     referee || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      status:      status || "upcoming",
      stats:       JSON.stringify(req.body.stats || {}),
      log:         JSON.stringify([]),
    });

    return res.status(201).json(formatTournament(t));
  } catch (err) {
    console.error("Create tournament error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/tournaments/:id (Admin) ────────────────────────────────
// Used to update scores, status, stats, log, etc.
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const t = await Tournament.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: "Tournament not found" });

    const updates = { ...req.body };

    // Stringify JSON fields if they are objects
    if (updates.stats && typeof updates.stats === "object") {
      updates.stats = JSON.stringify(updates.stats);
    }
    if (updates.log && Array.isArray(updates.log)) {
      updates.log = JSON.stringify(updates.log);
    }
    if (updates.scheduledAt) {
      updates.scheduledAt = new Date(updates.scheduledAt);
    }

    await t.update(updates);
    return res.json(formatTournament(t));
  } catch (err) {
    console.error("Update tournament error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/tournaments/:id (Admin) ─────────────────────────────
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const t = await Tournament.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: "Tournament not found" });
    await t.destroy();
    return res.json({ message: "Tournament deleted" });
  } catch (err) {
    console.error("Delete tournament error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
