import { buildFigure, type FigureDef } from "@/lib/figure";

const fill = {
  skin: "var(--fig-skin)",
  skinFar: "var(--fig-skin-far)",
  pants: "var(--fig-pants)",
  pantsFar: "var(--fig-pants-far)",
  top: "var(--fig-top)",
  hair: "var(--fig-hair)",
} as const;

/** Draws the articulated mannequin for a pose. Colours come from CSS variables so it follows the theme. */
export function PoseFigure({ def, title, className }: { def: FigureDef; title?: string; className?: string }) {
  const g = buildFigure(def);
  const [vx, vy, vw, vh] = g.viewBox;
  return (
    <svg
      viewBox={`${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {!def.noMat && (
        <rect
          x={g.matX[0]}
          y={g.groundY}
          width={g.matX[1] - g.matX[0]}
          height={3.2}
          rx={1.6}
          fill="var(--fig-mat)"
        />
      )}
      {g.shapes.map((s, i) =>
        s.kind === "circle" ? (
          <circle key={i} cx={s.c[0].toFixed(1)} cy={s.c[1].toFixed(1)} r={s.r} fill={fill[s.paint]} />
        ) : (
          <polygon key={i} points={s.points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} fill={fill[s.paint]} />
        ),
      )}
    </svg>
  );
}
