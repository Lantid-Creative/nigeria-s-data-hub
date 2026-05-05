/**
 * Stylised SVG choropleth of Nigeria's 6 geo-political zones.
 * Mock — for visual storytelling only. aria-hidden by default.
 */
type Props = {
  className?: string;
  highlight?: "NW" | "NC" | "NE" | "SW" | "SS" | "SE";
  ariaLabel?: string;
};

const ZONES = [
  // Approximate zone polygons within a 500x420 viewbox abstract silhouette
  { id: "NW", label: "North-West", path: "M85,140 L160,90 L240,100 L240,200 L150,220 L80,200 Z", score: 58 },
  { id: "NC", label: "North-Central", path: "M240,100 L330,110 L330,210 L240,200 Z", score: 64 },
  { id: "NE", label: "North-East", path: "M330,110 L410,140 L420,210 L330,210 Z", score: 52 },
  { id: "SW", label: "South-West", path: "M80,200 L150,220 L210,240 L200,320 L130,300 Z", score: 71 },
  { id: "SS", label: "South-South", path: "M210,240 L300,240 L300,330 L200,320 Z", score: 67 },
  { id: "SE", label: "South-East", path: "M300,240 L380,230 L380,300 L300,330 Z", score: 69 },
] as const;

function colorFor(score: number) {
  // green ramp using primary token via opacity
  if (score >= 70) return "oklch(0.45 0.13 155 / 0.85)";
  if (score >= 65) return "oklch(0.45 0.13 155 / 0.65)";
  if (score >= 60) return "oklch(0.45 0.13 155 / 0.45)";
  if (score >= 55) return "oklch(0.45 0.13 155 / 0.30)";
  return "oklch(0.45 0.13 155 / 0.18)";
}

export function NigeriaMap({ className, highlight, ariaLabel }: Props) {
  return (
    <svg
      viewBox="0 0 500 420"
      className={className}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <defs>
        <filter id="zsoft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      {/* outer silhouette */}
      <path
        d="M80,200 L85,140 L160,90 L240,100 L330,110 L410,140 L420,210 L380,300 L300,330 L200,320 L130,300 Z"
        fill="oklch(0.45 0.13 155 / 0.04)"
        stroke="oklch(0.45 0.13 155 / 0.35)"
        strokeWidth="1.2"
      />
      {ZONES.map((z) => {
        const isHi = highlight === z.id;
        return (
          <g key={z.id} filter="url(#zsoft)">
            <path
              d={z.path}
              fill={colorFor(z.score)}
              stroke={isHi ? "oklch(0.78 0.16 80)" : "oklch(0.45 0.13 155 / 0.5)"}
              strokeWidth={isHi ? 2 : 0.8}
            />
          </g>
        );
      })}
      {/* labels */}
      {ZONES.map((z) => {
        const c = centroid(z.path);
        return (
          <g key={z.id + "lbl"}>
            <text
              x={c.x}
              y={c.y}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="white"
              style={{ paintOrder: "stroke", stroke: "oklch(0.25 0.05 155 / 0.5)", strokeWidth: 2 }}
            >
              {z.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function centroid(d: string) {
  const pts = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  let x = 0, y = 0, n = 0;
  for (let i = 0; i < pts.length; i += 2) { x += pts[i]; y += pts[i + 1]; n++; }
  return { x: x / n, y: y / n };
}
