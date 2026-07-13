import { Router } from "express";
import { Notification } from "../models.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ─── GET /api/notifications ──────────────────────────────────────────
// Public: return all active notifications (newest first)
router.get("/", async (_req, res) => {
  try {
    const rows = await Notification.findAll({ order: [["createdAt", "DESC"]] });
    return res.json(rows);
  } catch (err) {
    console.error("List notifications error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/notifications (Admin) ─────────────────────────────────
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const notif = await Notification.create({
      content,
      type: type || "info",
    });

    return res.status(201).json(notif);
  } catch (err) {
    console.error("Create notification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/notifications/:id (Admin) ──────────────────────────────
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ error: "Notification not found" });

    await notif.update(req.body);
    return res.json(notif);
  } catch (err) {
    console.error("Update notification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/notifications/:id (Admin) ───────────────────────────
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ error: "Notification not found" });

    await notif.destroy();
    return res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
