"use client";

import { Activity, AlertTriangle, BarChart3, CheckCircle2, Crown, Flame, Hexagon, LineChart, Scale, Sparkle, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CHAKRA_COLORS, CHAKRA_SHORT, ZONE_LABELS, type FlowAnalysis, type Zone } from "@/lib/analytics";
import { CHAKRA_LABELS } from "@/lib/details";
import { formatDuration } from "@/lib/duration";
import { CATEGORY_LABELS, LEVEL_LABELS, type Category, type Level, type Pose } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

interface Props {
  analysis: FlowAnalysis;
  targetMinutes: number;
  poseOf: (itemId: string) => Pose | undefined;
  onHighlight: (ids: string[] | null) => void;
  onClose: () => void;
}

const LEVEL_COLOR: Record<Level, string> = { debutant: "var(--accent)", intermediaire: "var(--gold)", avance: "var(--clay)" };

function Card({ icon, title, subtitle, actions, children }: { icon: ReactNode; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <header className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="leading-tight font-bold">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: { id: T; icon: ReactNode; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-full bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          aria-label={o.label}
          title={o.label}
          onClick={() => onChange(o.id)}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition ${value === o.id ? "bg-accent text-surface" : "text-muted"}`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

export function AnalyticsPanel({ analysis: a, targetMinutes, poseOf, onHighlight, onClose }: Props) {
  const [curveMode, setCurveMode] = useState<"courbe" | "barres">("courbe");
  const [chakraMode, setChakraMode] = useState<"radar" | "barres">("radar");
  const hl = (ids: string[] | null) => () => onHighlight(ids);
  const idsWhere = (test: (p: Pose) => boolean) => a.curve.map((c) => c.itemId).filter((id) => {
    const p = poseOf(id);
    return p ? test(p) : false;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <h2 className="font-display text-xl font-semibold">Analyse du cours</h2>
        <button className="icon-btn ml-auto" onClick={onClose} aria-label="Fermer l'analyse">
          <X size={18} />
        </button>
      </div>
      {a.count === 0 ? (
        <p className="p-6 text-center text-sm text-muted">Ajoute des postures pour voir l&apos;analyse de ton cours.</p>
      ) : (
        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4" onMouseLeave={() => onHighlight(null)}>
          <div className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface py-3 text-center">
            <Kpi value={String(a.count)} label="Postures" />
            <Kpi
              value={formatDuration(a.total)}
              label={`sur ${targetMinutes} min`}
              tone={a.total > targetMinutes * 66 ? "text-danger" : a.total < targetMinutes * 48 ? "text-gold" : undefined}
            />
            <Kpi value={a.avgLevel.toFixed(1)} label="Niveau moyen" />
          </div>

          <Card icon={<Sparkle size={16} />} title="Conseils" subtitle="Survole un conseil pour voir les postures concernées">
            <ul className="space-y-1.5">
              {a.insights.map((ins, i) => (
                <li
                  key={i}
                  onMouseEnter={hl(ins.itemIds ?? null)}
                  className={`flex gap-2 rounded-xl px-2.5 py-2 text-sm ${ins.tone === "ok" ? "bg-accent-soft/70" : "bg-clay-soft/70"}`}
                >
                  {ins.tone === "ok" ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  ) : (
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-clay" />
                  )}
                  {ins.text}
                </li>
              ))}
            </ul>
          </Card>

          {a.peak?.pose && (
            <Card
              icon={<Crown size={16} />}
              title="Posture pic"
              subtitle="Le sommet d'intensité du cours"
              actions={<span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold">#{a.peak.index + 1} / {a.count}</span>}
            >
              <div className="flex items-center gap-3" onMouseEnter={hl([a.peak.item.id])}>
                <PoseThumb pose={a.peak.pose} size={72} className="rounded-xl" />
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight font-semibold">{a.peak.pose.nameFr}</p>
                  <p className="truncate text-xs text-muted italic">{a.peak.pose.sanskrit}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-surface" style={{ background: LEVEL_COLOR[a.peak.pose.level] }}>
                      {LEVEL_LABELS[a.peak.pose.level]}
                    </span>
                    {a.peak.pose.categories.slice(0, 3).map((c) => (
                      <span key={c} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold">
                        {CATEGORY_LABELS[c]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card
            icon={<Activity size={16} />}
            title="Dynamique"
            subtitle={curveMode === "courbe" ? "Intensité au fil du cours" : "Temps passé par niveau"}
            actions={
              <Toggle
                value={curveMode}
                onChange={setCurveMode}
                options={[
                  { id: "courbe", icon: <LineChart size={14} />, label: "Courbe" },
                  { id: "barres", icon: <BarChart3 size={14} />, label: "Barres" },
                ]}
              />
            }
          >
            {curveMode === "courbe" ? (
              <IntensityCurve analysis={a} onHover={(id) => onHighlight(id ? [id] : null)} />
            ) : (
              <div className="space-y-2">
                <div className="flex h-3 overflow-hidden rounded-full">
                  {a.levels.map((l) =>
                    l.seconds ? <div key={l.level} style={{ flex: l.seconds, background: LEVEL_COLOR[l.level] }} /> : null,
                  )}
                </div>
                {a.levels.map((l) => (
                  <Bar
                    key={l.level}
                    label={LEVEL_LABELS[l.level]}
                    value={l.seconds / (a.total || 1)}
                    color={LEVEL_COLOR[l.level]}
                    right={`${l.count} · ${formatDuration(Math.round(l.seconds))}`}
                    onEnter={hl(idsWhere((p) => p.level === l.level))}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card icon={<Scale size={16} />} title="Équilibre des côtés" subtitle="Temps à gauche et à droite">
            <SideBalance analysis={a} onEnter={(ids) => onHighlight(ids)} />
          </Card>

          <Card icon={<Flame size={16} />} title="Zones sollicitées" subtitle="Estimation d'après les familles de postures">
            <div className="flex items-center gap-4">
              <BodyMap zones={a.zones} />
              <ul className="min-w-0 flex-1 space-y-1.5">
                {a.zones.slice(0, 6).map((z) => (
                  <Bar key={z.zone} label={ZONE_LABELS[z.zone]} value={z.score} color="var(--clay)" right={`${Math.round(z.score * 100)} %`} compact />
                ))}
              </ul>
            </div>
          </Card>

          <Card icon={<BarChart3 size={16} />} title="Familles de postures" subtitle="Temps passé par famille">
            <div className="space-y-1.5">
              {a.categories.slice(0, 8).map((c) => (
                <Bar
                  key={c.category}
                  label={CATEGORY_LABELS[c.category as Category]}
                  value={c.seconds / (a.categories[0]?.seconds || 1)}
                  color="var(--accent)"
                  right={formatDuration(Math.round(c.seconds))}
                  onEnter={hl(idsWhere((p) => p.categories.includes(c.category)))}
                />
              ))}
            </div>
          </Card>

          <Card
            icon={<Hexagon size={16} />}
            title="Chakras"
            subtitle="Repères traditionnels indicatifs"
            actions={
              <Toggle
                value={chakraMode}
                onChange={setChakraMode}
                options={[
                  { id: "radar", icon: <Hexagon size={14} />, label: "Radar" },
                  { id: "barres", icon: <BarChart3 size={14} />, label: "Barres" },
                ]}
              />
            }
          >
            {chakraMode === "radar" ? (
              <ChakraRadar chakras={a.chakras} />
            ) : (
              <div className="space-y-1.5">
                {a.chakras.map((c) => (
                  <Bar
                    key={c.chakra}
                    label={CHAKRA_SHORT[c.chakra]}
                    value={c.seconds / (Math.max(...a.chakras.map((x) => x.seconds)) || 1)}
                    color={CHAKRA_COLORS[c.chakra]}
                    right={formatDuration(Math.round(c.seconds))}
                  />
                ))}
              </div>
            )}
          </Card>
          <p className="px-1 pb-2 text-[11px] text-muted">
            Intensité, zones et chakras sont des repères calculés à partir des familles et du niveau des postures, pas des mesures.
          </p>
        </div>
      )}
    </div>
  );
}

function Kpi({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <div className="px-2">
      <p className={`font-display text-2xl font-semibold ${tone ?? ""}`}>{value}</p>
      <p className="text-[10px] font-bold tracking-wider text-muted uppercase">{label}</p>
    </div>
  );
}

function Bar({
  label,
  value,
  color,
  right,
  onEnter,
  compact,
}: {
  label: string;
  value: number;
  color: string;
  right: string;
  onEnter?: () => void;
  compact?: boolean;
}) {
  return (
    <div onMouseEnter={onEnter} className={`grid items-center gap-2 text-xs ${compact ? "grid-cols-[1fr_2.5rem]" : "grid-cols-[6.5rem_1fr_4.5rem]"}`}>
      {compact ? (
        <div className="min-w-0">
          <div className="mb-0.5 truncate font-semibold">{label}</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, value * 100)}%`, background: color }} />
          </div>
        </div>
      ) : (
        <>
          <span className="truncate font-semibold">{label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, value * 100)}%`, background: color }} />
          </div>
        </>
      )}
      <span className="text-right text-muted tabular-nums">{right}</span>
    </div>
  );
}

function IntensityCurve({ analysis: a, onHover }: { analysis: FlowAnalysis; onHover: (itemId: string | null) => void }) {
  const W = 320;
  const H = 120;
  const pad = 6;
  const total = a.total || 1;
  const x = (t: number) => pad + (t / total) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - 1) / 4) * (H - pad * 2 - 14);
  const pts = a.curve.map((c) => [x(c.start + c.seconds / 2), y(c.intensity)] as const);
  if (!pts.length) return null;
  // Smooth curve through points (Catmull-Rom → Bézier).
  const path = pts
    .map(([px, py], i) => {
      if (i === 0) return `M ${px} ${py}`;
      const [x0, y0] = pts[i - 2] ?? pts[i - 1];
      const [x1, y1] = pts[i - 1];
      const [x3, y3] = pts[i + 1] ?? [px, py];
      const c1 = [x1 + (px - x0) / 6, y1 + (py - y0) / 6];
      const c2 = [px - (x3 - x1) / 6, py - (y3 - y1) / 6];
      return `C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${px} ${py}`;
    })
    .join(" ");
  const area = `${path} L ${pts.at(-1)![0]} ${H - pad} L ${pts[0][0]} ${H - pad} Z`;
  const peakIdx = a.peak ? a.curve.findIndex((c) => c.itemId === a.peak!.item.id) : -1;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Courbe d'intensité du cours">
        <defs>
          <linearGradient id="intensity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--clay)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[1, 2, 3, 4, 5].map((v) => (
          <line key={v} x1={pad} x2={W - pad} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="2 4" />
        ))}
        <path d={area} fill="url(#intensity-fill)" />
        <path d={path} fill="none" stroke="var(--clay)" strokeWidth="2.5" strokeLinecap="round" />
        {a.curve.map((c, i) => (
          <rect
            key={c.itemId}
            x={x(c.start)}
            y={0}
            width={Math.max(2, x(c.start + c.seconds) - x(c.start))}
            height={H}
            fill="transparent"
            onMouseEnter={() => onHover(c.itemId)}
          >
            <title>{`${i + 1}. intensité ${c.intensity.toFixed(1)} / 5`}</title>
          </rect>
        ))}
        {peakIdx >= 0 && (
          <g pointerEvents="none">
            <circle cx={pts[peakIdx][0]} cy={pts[peakIdx][1]} r="5" fill="var(--gold)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] font-semibold text-muted">
        <span>Début</span>
        <span>{formatDuration(a.total)}</span>
      </div>
    </div>
  );
}

function SideBalance({ analysis: a, onEnter }: { analysis: FlowAnalysis; onEnter: (ids: string[] | null) => void }) {
  const lr = a.sides.left + a.sides.right || 1;
  const leftPct = Math.round((a.sides.left / lr) * 100);
  return (
    <div className="space-y-2.5">
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-2">
        <div style={{ width: `${leftPct}%`, background: "var(--lilac)" }} />
        <div style={{ width: `${100 - leftPct}%`, background: "var(--clay)" }} />
      </div>
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-lilac">Gauche {leftPct} % · {formatDuration(Math.round(a.sides.left))}</span>
        <span className="text-clay">
          {formatDuration(Math.round(a.sides.right))} · {100 - leftPct} % Droite
        </span>
      </div>
      <p className="text-xs text-muted">
        Face / sans côté : {formatDuration(Math.round(a.sides.none))} · Des deux côtés : {formatDuration(Math.round(a.sides.both))}
      </p>
      {a.unmatched.length > 0 && (
        <ul className="space-y-1">
          {a.unmatched.map((u) => (
            <li key={u.pose.id} onMouseEnter={() => onEnter(u.itemIds)} className="flex items-center gap-2 rounded-xl bg-clay-soft/70 px-2.5 py-1.5 text-xs">
              <AlertTriangle size={14} className="text-clay" />
              <span className="flex-1 font-semibold">{u.pose.nameFr}</span>
              <span>
                G {u.left} · D {u.right}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Silhouettes schématiques face/dos, zones colorées selon la sollicitation estimée. */
function BodyMap({ zones }: { zones: FlowAnalysis["zones"] }) {
  const score = Object.fromEntries(zones.map((z) => [z.zone, z.score])) as Record<Zone, number>;
  const fill = (z: Zone) => ({ fill: "var(--clay)", fillOpacity: 0.08 + (score[z] ?? 0) * 0.85 });
  const base = { fill: "var(--surface-2)" };
  const figure = (back: boolean, dx: number) => (
    <g transform={`translate(${dx} 0)`}>
      <circle cx="30" cy="11" r="8" {...base} />
      <rect x="27" y="18" width="6" height="5" rx="2" {...base} />
      <ellipse cx="17" cy="27" rx="7" ry="5" style={fill("epaules")} />
      <ellipse cx="43" cy="27" rx="7" ry="5" style={fill("epaules")} />
      {back ? (
        <rect x="20" y="24" width="20" height="34" rx="6" style={fill("dos")} />
      ) : (
        <>
          <rect x="20" y="24" width="20" height="14" rx="5" style={fill("poitrine")} />
          <rect x="21.5" y="39" width="17" height="19" rx="5" style={fill("abdos")} />
        </>
      )}
      <rect x="9" y="30" width="7" height="34" rx="3.5" style={fill("bras")} />
      <rect x="44" y="30" width="7" height="34" rx="3.5" style={fill("bras")} />
      <rect x="19.5" y="58" width="21" height="11" rx="5" style={fill(back ? "fessiers" : "hanches")} />
      <rect x="20" y="70" width="9" height="26" rx="4.5" style={fill(back ? "ischios" : "cuisses")} />
      <rect x="31" y="70" width="9" height="26" rx="4.5" style={fill(back ? "ischios" : "cuisses")} />
      <rect x="20.5" y="98" width="8" height="20" rx="4" style={fill("mollets")} />
      <rect x="31.5" y="98" width="8" height="20" rx="4" style={fill("mollets")} />
      <text x="30" y="128" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--muted)">
        {back ? "Dos" : "Face"}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 124 132" className="w-32 shrink-0" role="img" aria-label="Carte des zones sollicitées">
      {figure(false, 0)}
      {figure(true, 64)}
    </svg>
  );
}

function ChakraRadar({ chakras }: { chakras: FlowAnalysis["chakras"] }) {
  const size = 220;
  const c = size / 2;
  const r = 78;
  const max = Math.max(...chakras.map((x) => x.seconds)) || 1;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / chakras.length;
  const point = (i: number, v: number) => [c + Math.cos(angle(i)) * r * v, c + Math.sin(angle(i)) * r * v];
  const shape = chakras.map((x, i) => point(i, 0.08 + (x.seconds / max) * 0.92).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[260px]" role="img" aria-label="Radar des chakras">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={chakras.map((_, i) => point(i, k).join(",")).join(" ")} fill="none" stroke="var(--line)" />
      ))}
      {chakras.map((_, i) => {
        const [px, py] = point(i, 1);
        return <line key={i} x1={c} y1={c} x2={px} y2={py} stroke="var(--line)" />;
      })}
      <polygon points={shape} fill="var(--lilac)" fillOpacity="0.25" stroke="var(--lilac)" strokeWidth="2" strokeLinejoin="round" />
      {chakras.map((x, i) => {
        const [px, py] = point(i, 0.08 + (x.seconds / max) * 0.92);
        const [lx, ly] = point(i, 1.2);
        return (
          <g key={x.chakra}>
            <circle cx={px} cy={py} r="4.5" fill={CHAKRA_COLORS[x.chakra]} stroke="var(--surface)" strokeWidth="1.5" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fontWeight="700" fill="var(--muted)">
              {CHAKRA_SHORT[x.chakra]}
            </text>
            <title>{CHAKRA_LABELS[x.chakra]}</title>
          </g>
        );
      })}
    </svg>
  );
}

