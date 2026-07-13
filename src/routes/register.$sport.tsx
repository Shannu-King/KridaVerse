import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/register/$sport")({ component: RegisterSport });

function RegisterSport() {
  const { sport } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/sports", search: { sport, register: "true" } });
  }, [sport, navigate]);

  return (
    <div className="flex h-screen items-center justify-center text-sm text-white/40 bg-[#0a0b12] uppercase tracking-widest animate-pulse">
      Redirecting to registration console...
    </div>
  );
}