import { DataTypes } from "sequelize";
import sequelize from "./db.js";

// ─── User ────────────────────────────────────────────────────────────
export const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  branch:   { type: DataTypes.STRING, allowNull: true },          // CSE, IT, ECE
  year:     { type: DataTypes.INTEGER, allowNull: true },          // 1-4
  role:     { type: DataTypes.STRING, defaultValue: "user" },      // user | admin
});

// ─── Tournament / Fixture ────────────────────────────────────────────
export const Tournament = sequelize.define("Tournament", {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sport:       { type: DataTypes.STRING, allowNull: false },       // cricket, football, etc.
  teamA:       { type: DataTypes.STRING, allowNull: false },
  teamB:       { type: DataTypes.STRING, allowNull: false },
  scoreA:      { type: DataTypes.INTEGER, defaultValue: 0 },
  scoreB:      { type: DataTypes.INTEGER, defaultValue: 0 },
  status:      { type: DataTypes.STRING, defaultValue: "upcoming" }, // upcoming | live | completed
  venue:       { type: DataTypes.STRING, defaultValue: "Main Arena" },
  referee:     { type: DataTypes.STRING, allowNull: true },
  scheduledAt: { type: DataTypes.DATE, allowNull: true },
  stats:       { type: DataTypes.TEXT, defaultValue: "{}" },       // JSON string
  log:         { type: DataTypes.TEXT, defaultValue: "[]" },       // JSON array of { t, text }
});

// ─── Team Registration ───────────────────────────────────────────────
export const Registration = sequelize.define("Registration", {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sport:    { type: DataTypes.STRING, allowNull: false },
  teamName: { type: DataTypes.STRING, allowNull: false },
  branch:   { type: DataTypes.STRING, allowNull: false },
  year:     { type: DataTypes.INTEGER, allowNull: false },
  members:  { type: DataTypes.TEXT, allowNull: false },            // JSON array of names
  userId:   { type: DataTypes.UUID, allowNull: true },             // FK to User
});

// ─── Notification / Broadcast ────────────────────────────────────────
export const Notification = sequelize.define("Notification", {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  type:    { type: DataTypes.STRING, defaultValue: "info" },       // info | warning | success
});

// ─── Associations ────────────────────────────────────────────────────
User.hasMany(Registration, { foreignKey: "userId", as: "registrations" });
Registration.belongsTo(User, { foreignKey: "userId", as: "captain" });
