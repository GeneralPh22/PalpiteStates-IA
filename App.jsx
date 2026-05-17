import { useEffect, useRef, useState } from "react";

import { claude } from "./services/claude";
import { safeJSON } from "./utils/safeJSON";
import {
  isLiveS,
  pick,
  rand,
  randF,
  todayPT
} from "./utils/helpers";

function createStats(name) {
  return {
    name,
    goals_per_game: randF(1.0, 2.8),
    shots_per_game: randF(9, 18),
    corners_per_game: randF(3.5, 8),
    fouls_per_game: randF(9, 16),
    possession: rand(40, 65),
    xG: randF(0.8, 2.7),
    form: Array.from({ length: 5 }, () =>
      pick(["W", "D", "L"])
    )
  };
}

function buildMatch(raw, idx) {
  const home = raw.home || "Time A";
  const away = raw.away || "Time B";

  const status = raw.status || "NS";

  const live = isLiveS(status);

  const goals = raw.score || [0, 0];

  return {
    id: raw.id || idx + 1,
    league: raw.league || "Liga",
    home,
    away,
    status,
    elapsed: raw.elapsed || 0,
    isLive: live,
    goals,
    score: `${goals[0]} - ${goals[1]}`,
    homeStats: createStats(home),
    awayStats: createStats(away),
    goalProbability: rand(15, 90)
  };
}

export default function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  async function fetchMatches() {
    try {
      setLoading(true);
      setError("");

      const response = await claude({
        apiKey,
        system:
          "Você é um analista esportivo. Responda apenas JSON válido.",
        user: `
Retorne jogos de futebol reais de hoje.

Formato:
{
  "matches": [
    {
      "id": 1,
      "league": "Premier League",
      "home": "Arsenal",
      "away": "Chelsea",
      "status": "NS",
      "elapsed": 0,
      "score": [0,0]
    }
  ]
}
        `,
        maxTokens: 1500
      });

      const parsed = safeJSON(response);

      const finalMatches = (parsed.matches || []).map(
        (m, i) => buildMatch(m, i)
      );

      setMatches(finalMatches);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao buscar partidas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();

    intervalRef.current = setInterval(() => {
      setMatches((prev) =>
        prev.map((m) => {
          if (!m.isLive) return m;

          const nextMinute = Math.min(m.elapsed + 1, 90);

          return {
            ...m,
            elapsed: nextMinute,
            goalProbability: rand(15, 95)
          };
        })
      );
    }, 15000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08111f",
        color: "white",
        padding: 20
      }}
    >
      <h1 style={{ marginBottom: 20 }}>
        ⚽ Palpite Stats IA
      </h1>

      {loading && <p>Carregando jogos...</p>}

      {error && (
        <div
          style={{
            background: "#5b1c1c",
            padding: 10,
            borderRadius: 8,
            marginBottom: 20
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 15
        }}
      >
        {matches.map((match) => (
          <div
            key={match.id}
            style={{
              background: "#101b2d",
              borderRadius: 12,
              padding: 20
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10
              }}
            >
              <span>{match.league}</span>

              {match.isLive ? (
                <span>🔴 {match.elapsed}'</span>
              ) : (
                <span>{match.status}</span>
              )}
            </div>

            <h2>
              {match.home} {match.score} {match.away}
            </h2>

            <div style={{ marginTop: 15 }}>
              <strong>
                Probabilidade de gol:
              </strong>{" "}
              {match.goalProbability}%
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 30,
          opacity: 0.6
        }}
      >
        {todayPT()}
      </div>
    </div>
  );
}
