import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { NigeriaGridMap } from "./NigeriaGridMap";

/**
 * Real GeoJSON choropleth of Nigeria's 36 states + FCT.
 * Fetches a public Nigeria states GeoJSON at runtime and projects with a
 * simple equirectangular projection. Falls back to NigeriaGridMap on error.
 */

const SOURCES = [
  "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/nigeria-states.geojson",
  "https://raw.githubusercontent.com/iamspruce/nigeria-geojson-data/main/nigeria.geojson",
];

// Map common GeoJSON state name strings to our 2-letter codes.
const NAME_TO_CODE: Record<string, string> = {
  abia: "AB", adamawa: "AD", "akwa ibom": "AK", anambra: "AN", bauchi: "BA",
  bayelsa: "BY", benue: "BE", borno: "BO", "cross river": "CR", delta: "DE",
  ebonyi: "EB", edo: "ED", ekiti: "EK", enugu: "EN", gombe: "GO",
  imo: "IM", jigawa: "JI", kaduna: "KD", kano: "KN", katsina: "KT",
  kebbi: "KE", kogi: "KO", kwara: "KW", lagos: "LA", nasarawa: "NA",
  niger: "NI", ogun: "OG", ondo: "ON", osun: "OS", oyo: "OY",
  plateau: "PL", rivers: "RI", sokoto: "SO", taraba: "TA", yobe: "YO",
  zamfara: "ZA", "federal capital territory": "FC", fct: "FC", abuja: "FC",
};

function tone(v: number) {
  if (v >= 75) return "oklch(0.55 0.15 155 / 0.95)";
  if (v >= 60) return "oklch(0.62 0.13 155 / 0.85)";
  if (v >= 50) return "oklch(0.78 0.16 80 / 0.85)";
  if (v >= 40) return "oklch(0.72 0.16 50 / 0.85)";
  return "oklch(0.55 0.20 25 / 0.85)";
}

type Ring = [number, number][];

function ringsFromGeometry(geom: any): Ring[] {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates as Ring[];
  if (geom.type === "MultiPolygon") return (geom.coordinates as Ring[][]).flat();
  return [];
}

export function NigeriaChoropleth({ scores }: { scores: any[] }) {
  const [geo, setGeo] = useState<any | null>(null);
  const [err, setErr] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const url of SOURCES) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
          const j = await r.json();
          if (!cancelled) setGeo(j);
          return;
        } catch { /* try next */ }
      }
      if (!cancelled) setErr(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const byCode = useMemo(() => new Map(scores.map((s: any) => [s.state_code, s])), [scores]);

  const projected = useMemo(() => {
    if (!geo?.features) return null;
    // bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const f of geo.features) {
      for (const ring of ringsFromGeometry(f.geometry)) {
        for (const [x, y] of ring) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    const W = 800, H = 520, pad = 12;
    const sx = (W - pad * 2) / (maxX - minX);
    const sy = (H - pad * 2) / (maxY - minY);
    const s = Math.min(sx, sy);
    const ox = pad + ((W - pad * 2) - (maxX - minX) * s) / 2;
    const oy = pad + ((H - pad * 2) - (maxY - minY) * s) / 2;
    const project = ([x, y]: [number, number]) =>
      [ox + (x - minX) * s, oy + (maxY - y) * s] as [number, number];

    const features = geo.features.map((f: any, i: number) => {
      const nameRaw =
        f.properties?.name ||
        f.properties?.NAME_1 ||
        f.properties?.admin1Name ||
        f.properties?.state ||
        "";
      const key = String(nameRaw).toLowerCase().trim();
      const code = NAME_TO_CODE[key] || NAME_TO_CODE[key.replace(/ state$/, "")] || null;
      const rings = ringsFromGeometry(f.geometry);
      const d = rings
        .map((ring) =>
          ring.map((p, idx) => {
            const [x, y] = project(p as [number, number]);
            return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
          }).join("") + "Z"
        ).join(" ");
      // centroid (mean of first ring)
      let cx = 0, cy = 0, n = 0;
      for (const p of rings[0] ?? []) {
        const [x, y] = project(p as [number, number]);
        cx += x; cy += y; n++;
      }
      return { id: code ?? `f${i}`, code, name: nameRaw, d, cx: n ? cx / n : 0, cy: n ? cy / n : 0 };
    });
    return { W, H, features };
  }, [geo]);

  if (err) return <NigeriaGridMap scores={scores} />;
  if (!projected) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full overflow-hidden rounded-md border bg-[oklch(0.98_0.01_155)]">
        <svg viewBox={`0 0 ${projected.W} ${projected.H}`} className="h-auto w-full">
          {projected.features.map((f) => {
            const s: any = f.code ? byCode.get(f.code) : null;
            const v = s ? Math.round(Number(s.resilience_index ?? 0)) : 0;
            const fill = s ? tone(v) : "oklch(0.92 0.01 155 / 0.7)";
            const isHover = hover === f.id;
            const inner = (
              <path
                d={f.d}
                fill={fill}
                stroke={isHover ? "oklch(0.25 0.05 155)" : "oklch(0.45 0.05 155 / 0.55)"}
                strokeWidth={isHover ? 1.4 : 0.5}
                onMouseEnter={() => setHover(f.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: f.code ? "pointer" : "default", transition: "stroke-width .15s" }}
              />
            );
            return (
              <g key={f.id}>
                {f.code ? <Link to="/ngf/states">{inner}</Link> : inner}
              </g>
            );
          })}
          {projected.features.map((f) => f.code && (
            <text
              key={`l-${f.id}`}
              x={f.cx} y={f.cy}
              textAnchor="middle"
              fontSize="9" fontWeight={600}
              fill="white"
              style={{ paintOrder: "stroke", stroke: "oklch(0.25 0.05 155 / 0.7)", strokeWidth: 2.2, pointerEvents: "none" }}
            >{f.code}</text>
          ))}
        </svg>
        {hover && (() => {
          const f = projected.features.find((x) => x.id === hover);
          if (!f) return null;
          const s: any = f.code ? byCode.get(f.code) : null;
          const v = s ? Math.round(Number(s.resilience_index ?? 0)) : null;
          return (
            <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-foreground/95 px-2 py-1 text-xs text-background shadow">
              {f.name}{v != null ? ` · SNRI ${v}` : ""}
            </div>
          );
        })()}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ background: tone(80) }} /> ≥75</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ background: tone(65) }} /> 60–74</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ background: tone(55) }} /> 50–59</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ background: tone(45) }} /> 40–49</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ background: tone(30) }} /> &lt;40</span>
      </div>
    </div>
  );
}
