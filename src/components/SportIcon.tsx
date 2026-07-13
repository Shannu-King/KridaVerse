import React from "react";
import type { Sport } from "@/lib/mockApi";

interface SportIconProps {
  sport: Sport;
  className?: string;
}

export function SportIcon({ sport, className = "h-12 w-12" }: SportIconProps) {
  switch (sport) {
    case "cricket":
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="cricketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ea8ff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <radialGradient id="ballShine" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ff8a9e" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </radialGradient>
          </defs>
          {/* Bat Handle */}
          <path
            d="M38 12 L44 6 C45.5 4.5 48 4.5 49.5 6 C51 7.5 51 10 49.5 11.5 L43.5 17.5 Z"
            fill="url(#cricketGrad)"
            opacity="0.8"
          />
          {/* Bat Body */}
          <path
            d="M16 44 L38 22 L42 26 L20 48 Z"
            fill="url(#cricketGrad)"
          />
          {/* Bat Grip detail */}
          <line x1="41" y1="9" x2="46" y2="14" stroke="#0d0e15" strokeWidth="1.5" />
          <line x1="43" y1="11" x2="48" y2="16" stroke="#0d0e15" strokeWidth="1.5" />
          {/* Flat Bottom of Bat */}
          <path d="M16 44 C15 45 15.5 47 17 48 L20 48 Z" fill="url(#cricketGrad)" />
          {/* Ball */}
          <circle cx="20" cy="24" r="7" fill="url(#ballShine)" />
          <path
            d="M15 24 C 18 27, 22 27, 25 24"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="1.5 1"
            opacity="0.6"
          />
        </svg>
      );

    case "football":
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="footballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#35e6a4" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" stroke="url(#footballGrad)" strokeWidth="2.5" />
          {/* Pentagonal panels */}
          <polygon
            points="32,22 39,27 36,36 28,36 25,27"
            fill="url(#footballGrad)"
            opacity="0.85"
          />
          {/* Panel seam lines */}
          <path
            d="M32 22 L32 4 M39 27 L56 21 M36 36 L49 49 M28 36 L15 49 M25 27 L8 21"
            stroke="url(#footballGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Outer panel edge lines */}
          <path
            d="M32 4 L46 9 L56 21 L52 36 L49 49 L32 58 L15 49 L12 36 L8 21 L18 9 Z"
            stroke="url(#footballGrad)"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      );

    case "kabaddi":
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="kabaddiGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="kabaddiGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          {/* Left Dynamic Grappler / Claw */}
          <path
            d="M12 24 C14 16, 26 12, 32 20 C28 24, 20 26, 16 32 C12 38, 16 46, 26 44"
            stroke="url(#kabaddiGrad1)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right Dynamic Grappler / Claw */}
          <path
            d="M52 40 C50 48, 38 52, 32 44 C36 40, 44 38, 48 32 C52 26, 48 18, 38 20"
            stroke="url(#kabaddiGrad2)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Interlocking contact sparkles */}
          <path d="M30 28 L34 36 M34 28 L30 36" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="32" r="2.5" fill="#ffffff" />
        </svg>
      );

    case "volleyball":
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="volleyballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5c451" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" stroke="url(#volleyballGrad)" strokeWidth="2.5" />
          {/* Panel sections (Volleyball swirls) */}
          <path
            d="M12 20 C 24 28, 40 28, 52 20"
            stroke="url(#volleyballGrad)"
            strokeWidth="2"
          />
          <path
            d="M12 44 C 24 36, 40 36, 52 44"
            stroke="url(#volleyballGrad)"
            strokeWidth="2"
          />
          <path
            d="M20 12 C 28 24, 28 40, 20 52"
            stroke="url(#volleyballGrad)"
            strokeWidth="2"
          />
          <path
            d="M44 12 C 36 24, 36 40, 44 52"
            stroke="url(#volleyballGrad)"
            strokeWidth="2"
          />
          <path
            d="M6 32 C 18 32, 46 32, 58 32"
            stroke="url(#volleyballGrad)"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </svg>
      );

    case "basketball":
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="basketballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8a4c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" stroke="url(#basketballGrad)" strokeWidth="2.5" />
          {/* Rib Lines */}
          <path
            d="M32 4 L32 60"
            stroke="url(#basketballGrad)"
            strokeWidth="2"
          />
          <path
            d="M4 32 L60 32"
            stroke="url(#basketballGrad)"
            strokeWidth="2"
          />
          {/* Curved Side Seams */}
          <path
            d="M12 14 C 24 24, 24 40, 12 50"
            stroke="url(#basketballGrad)"
            strokeWidth="2"
          />
          <path
            d="M52 14 C 40 24, 40 40, 52 50"
            stroke="url(#basketballGrad)"
            strokeWidth="2"
          />
        </svg>
      );

    case "hockey":
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="hockeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          {/* Sticks */}
          <path
            d="M44 6 L20 46 C 18 50, 14 52, 9 49 C 4 46, 5 40, 8 38 L14 36"
            stroke="url(#hockeyGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Grips details */}
          <line x1="41" y1="10" x2="45" y2="7" stroke="#0d0e15" strokeWidth="1.5" />
          <line x1="39" y1="13" x2="43" y2="10" stroke="#0d0e15" strokeWidth="1.5" />
          {/* Puck/Ball */}
          <circle cx="23" cy="49" r="4.5" fill="url(#hockeyGrad)" />
          <circle cx="21.5" cy="47.5" r="1" fill="#ffffff" opacity="0.6" />
        </svg>
      );

    default:
      return null;
  }
}
