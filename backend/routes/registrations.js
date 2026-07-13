import { Router } from "express";
import { Registration, User } from "../models.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Sport-specific player limits
const PLAYER_LIMITS = {
  cricket:    { min: 11, max: 15 },
  football:   { min: 7,  max: 16 },
  kabaddi:    { min: 7,  max: 12 },
  volleyball: { min: 6,  max: 12 },
  throwball:  { min: 6,  max: 12 },
  basketball: { min: 5,  max: 10 },
  hockey:     { min: 11, max: 16 },
};

// ─── GET /api/registrations ──────────────────────────────────────────
// Admin: list all. User: list own registrations.
router.get("/", authenticate, async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { userId: req.user.id };
    const rows = await Registration.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "captain", attributes: ["id", "username", "email"] }],
    });

    const result = rows.map((r) => {
      const plain = r.toJSON();
      try { plain.members = JSON.parse(plain.members); } catch { plain.members = []; }
      return plain;
    });

    return res.json(result);
  } catch (err) {
    console.error("List registrations error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/registrations ─────────────────────────────────────────
router.post("/", authenticate, async (req, res) => {
  try {
    const { sport, teamName, branch, year, members } = req.body;

    if (!sport || !teamName || !branch || !year || !members) {
      return res.status(400).json({ error: "sport, teamName, branch, year, and members are required" });
    }

    const sportKey = sport.toLowerCase();
    const limits = PLAYER_LIMITS[sportKey] || { min: 1, max: 15 };
    const memberList = Array.isArray(members) ? members : JSON.parse(members);

    if (memberList.length < limits.min) {
      return res.status(400).json({
        error: `Minimum ${limits.min} players required for ${sport}`,
      });
    }
    if (memberList.length > limits.max) {
      return res.status(400).json({
        error: `Maximum ${limits.max} players allowed for ${sport}`,
      });
    }

    const reg = await Registration.create({
      sport: sportKey,
      teamName,
      branch,
      year,
      members: JSON.stringify(memberList),
      userId: req.user.id,
    });

    const plain = reg.toJSON();
    plain.members = memberList;

    return res.status(201).json(plain);
  } catch (err) {
    console.error("Create registration error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/registrations/:id (Admin) ───────────────────────────
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const reg = await Registration.findByPk(req.params.id);
    if (!reg) return res.status(404).json({ error: "Registration not found" });
    await reg.destroy();
    return res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error("Delete registration error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
