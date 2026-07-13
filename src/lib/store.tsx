import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = {
  username: string;
  email: string;
  branch: string;
  year: string;
  token: string;
  isAdmin?: boolean;
};

export type Broadcast = { id: string; message: string; createdAt: number };

type AppState = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  broadcasts: Broadcast[];
  pushBroadcast: (message: string) => void;
  removeBroadcast: (id: string) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kv_user");
      if (raw) setUser(JSON.parse(raw));
      const b = localStorage.getItem("kv_broadcasts");
      if (b) setBroadcasts(JSON.parse(b));
    } catch {}
  }, []);

  const login = (u: User) => {
    setUser(u);
    try { localStorage.setItem("kv_user", JSON.stringify(u)); } catch {}
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem("kv_user"); } catch {}
  };
  const pushBroadcast = (message: string) => {
    const n = { id: crypto.randomUUID(), message, createdAt: Date.now() };
    const next = [n, ...broadcasts].slice(0, 20);
    setBroadcasts(next);
    try { localStorage.setItem("kv_broadcasts", JSON.stringify(next)); } catch {}
  };
  const removeBroadcast = (id: string) => {
    const next = broadcasts.filter((b) => b.id !== id);
    setBroadcasts(next);
    try { localStorage.setItem("kv_broadcasts", JSON.stringify(next)); } catch {}
  };

  return (
    <Ctx.Provider value={{ user, login, logout, broadcasts, pushBroadcast, removeBroadcast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
