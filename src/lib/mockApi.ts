// Mock in-memory API mirroring http://localhost:5000. Swap fetch calls to hit the real base URL later.

export const API_BASE = "http://localhost:5000";

export type Sport = "cricket" | "football" | "kabaddi" | "volleyball" | "basketball" | "hockey";

export const SPORT_META: Record<Sport, { label: string; min: number; max: number; color: string; emoji: string }> = {
  cricket:    { label: "Cricket",    min: 11, max: 15, color: "#6ea8ff", emoji: "🏏" },
  football:   { label: "Football",   min: 7,  max: 16, color: "#35e6a4", emoji: "⚽" },
  kabaddi:    { label: "Kabaddi",    min: 7,  max: 12, color: "#ff3b5c", emoji: "🤼" },
  volleyball: { label: "Volleyball", min: 6,  max: 12, color: "#f5c451", emoji: "🏐" },
  basketball: { label: "Basketball", min: 5,  max: 10, color: "#ff8a4c", emoji: "🏀" },
  hockey:     { label: "Hockey",     min: 11, max: 16, color: "#c084fc", emoji: "🏑" },
};

export type Match = {
  id: string;
  sport: Sport;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: "upcoming" | "live" | "completed";
  venue: string;
  scheduledAt: number;
  referee?: string;
  stats?: Record<string, number>;
  log: { t: number; text: string }[];
};

const now = Date.now();

let matches: Match[] = [
  {
    id: "m1", sport: "cricket", teamA: "CSE Titans", teamB: "IT Strikers",
    scoreA: 142, scoreB: 118, status: "live", venue: "Outdoor Practice Facility",
    scheduledAt: now - 3600_000, referee: "R. Sharma",
    stats: { wicketsA: 4, wicketsB: 7, oversA: 15, oversB: 14 },
    log: [{ t: now - 60_000, text: "Boundary by CSE Titans" }, { t: now - 300_000, text: "Wicket! IT Strikers 6 down" }],
  },
  {
    id: "m2", sport: "football", teamA: "ECE United", teamB: "CSE FC",
    scoreA: 2, scoreB: 1, status: "live", venue: "Athletic Arena",
    scheduledAt: now - 1800_000, referee: "M. Patel",
    stats: { possessionA: 58, possessionB: 42, shotsA: 11, shotsB: 6 },
    log: [{ t: now - 120_000, text: "Goal — ECE United (73')" }],
  },
  {
    id: "m3", sport: "basketball", teamA: "IT Blazers", teamB: "ECE Kings",
    scoreA: 68, scoreB: 71, status: "live", venue: "Multi-Sports Arena",
    scheduledAt: now - 900_000, referee: "K. Rao",
    stats: { foulsA: 8, foulsB: 11, assistsA: 14, assistsB: 12 },
    log: [{ t: now - 30_000, text: "3-pointer by ECE Kings" }],
  },
  {
    id: "m4", sport: "kabaddi", teamA: "Raiders", teamB: "Defenders",
    scoreA: 0, scoreB: 0, status: "upcoming", venue: "Multi-Sports Arena",
    scheduledAt: now + 3600_000 * 3, log: [],
  },
  {
    id: "m5", sport: "volleyball", teamA: "Spikers", teamB: "Blockers",
    scoreA: 3, scoreB: 1, status: "completed", venue: "Multi-Sports Arena",
    scheduledAt: now - 86400_000, log: [],
  },
  {
    id: "m6", sport: "hockey", teamA: "Chargers", teamB: "Falcons",
    scoreA: 0, scoreB: 0, status: "upcoming", venue: "Athletic Arena",
    scheduledAt: now + 86400_000, log: [],
  },
];

// Simulate live tick
if (typeof window !== "undefined") {
  setInterval(() => {
    matches = matches.map((m) => {
      if (m.status !== "live") return m;
      if (Math.random() > 0.6) {
        const side = Math.random() > 0.5 ? "A" : "B";
        const inc = m.sport === "cricket" ? [1, 2, 4, 6][Math.floor(Math.random() * 4)]
          : m.sport === "basketball" ? [2, 3][Math.floor(Math.random() * 2)] : 1;
        return {
          ...m,
          scoreA: side === "A" ? m.scoreA + inc : m.scoreA,
          scoreB: side === "B" ? m.scoreB + inc : m.scoreB,
          log: [{ t: Date.now(), text: `+${inc} for ${side === "A" ? m.teamA : m.teamB}` }, ...m.log].slice(0, 12),
        };
      }
      return m;
    });
    window.dispatchEvent(new CustomEvent("kv:tick"));
  }, 5000);
}

export const mockApi = {
  listMatches: async () => [...matches],
  liveScores: async () => matches.filter((m) => m.status === "live"),
  addMatch: async (m: Omit<Match, "id" | "log">) => {
    const nm: Match = { ...m, id: crypto.randomUUID(), log: [] };
    matches = [nm, ...matches];
    return nm;
  },
  updateMatch: async (id: string, patch: Partial<Match>) => {
    matches = matches.map((m) => (m.id === id ? { ...m, ...patch } : m));
    return matches.find((m) => m.id === id)!;
  },
  deleteMatch: async (id: string) => {
    matches = matches.filter((m) => m.id !== id);
  },
};
