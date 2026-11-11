"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  CHAKRA_LABELS,
  DOSHA_LABELS,
  ELEMENT_LABELS,
  GUNA_LABELS,
  KOSHA_LABELS,
  POSITION_LABELS,
  SUITABILITY_LABELS,
  TYPE_LABELS,
  VAYU_LABELS,
  type PoseDetails,
} from "@/lib/details";
import type { Pose } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

export const SHEET_SECTIONS = [
  ["apercu", "Aperçu"],
  ["guidage", "Guidage"],
  ["etapes", "Étapes"],
  ["bienfaits", "Bienfaits"],
  ["precautions", "Précautions"],
  ["adaptations", "Adaptations"],
  ["liens", "Postures liées"],
  ["reperes", "Repères"],
] as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-2 border-t border-line pt-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

const List = ({ items, ordered }: { items?: string[]; ordered?: boolean }) =>
  items?.length ? (
    ordered ? (
      <ol className="list-decimal space-y-1 pl-5 text-sm">{items.map((t, i) => <li key={i}>{t}</li>)}</ol>
    ) : (
      <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    )
  ) : null;

function Row({ label, children }: { label: string; children: ReactNode }) {
  if (children == null || children === "" || (Array.isArray(children) && !children.length)) return null;
  return (
    <tr className="border-b border-line align-top">
      <th className="w-40 py-1.5 pr-3 text-left font-medium text-muted">{label}</th>
      <td className="py-1.5">{children}</td>
    </tr>
  );
}

const labels = <T extends string>(values: T[] | undefined, map: Record<T, string>) =>
  values?.length ? values.map((v) => map[v] ?? v).join(", ") : null;

function PoseLinks({ ids, poseMap }: { ids?: string[]; poseMap: Map<string, Pose> }) {
  if (!ids?.length) return <p className="text-sm text-muted">—</p>;
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {ids.map((id) => {
        const p = poseMap.get(id);
        if (!p) return null;
        return (
          <li key={id}>
            <Link href={`/postures/${id}`} className="block rounded-lg border border-line p-1 text-xs hover:border-accent">
              <PoseThumb pose={p} />
              <span className="mt-1 block truncate font-medium">{p.nameFr}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const hasAny = (d: PoseDetails, keys: (keyof PoseDetails)[]) =>
  keys.some((k) => {
    const v = d[k];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "" && !(typeof v === "object" && !Object.values(v).some(Boolean));
  });

/** Read-only pose sheet, sectioned like a reference page. Empty sections are hidden. */
export function PoseSheet({ pose, poseMap }: { pose: Pose; poseMap: Map<string, Pose> }) {
  const d = pose.details ?? {};
  const s = d.steps ?? {};
  const a = d.audience ?? {};
  return (
    <div className="space-y-5">
      <nav className="no-print sticky top-[53px] z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-background/95 px-4 py-2 text-sm backdrop-blur">
        {SHEET_SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full px-3 py-1 whitespace-nowrap text-muted hover:bg-accent-soft hover:text-foreground">
            {label}
          </a>
        ))}
      </nav>

      <Section id="apercu" title="Aperçu">
        <p>{d.summary || pose.description}</p>
        {d.summary && pose.description && <p className="text-sm text-muted">{pose.description}</p>}
        <table className="w-full text-sm">
          <tbody>
            <Row label="Sanskrit">
              {[d.sanskritIast || pose.sanskrit, d.pronunciation && `(${d.pronunciation})`].filter(Boolean).join(" ")}
            </Row>
            <Row label="Sens du nom">{d.sanskritMeaning}</Row>
            <Row label="Autres noms">{d.otherNames?.join(", ")}</Row>
            <Row label="Position">{d.position && POSITION_LABELS[d.position]}</Row>
            <Row label="Type">{labels(d.types, TYPE_LABELS)}</Row>
            <Row label="Tenue habituelle">{d.typicalHold}</Row>
          </tbody>
        </table>
      </Section>

      {hasAny(d, ["cuesShort", "cuesDetailed", "breath", "commonMistakes"]) && (
        <Section id="guidage" title="Guidage">
          {d.cuesShort?.length ? (
            <>
              <h3 className="font-semibold">Consignes courtes</h3>
              <List items={d.cuesShort} />
            </>
          ) : null}
          {d.cuesDetailed?.length ? (
            <>
              <h3 className="font-semibold">Consignes détaillées</h3>
              <ul className="space-y-1 text-sm">
                {d.cuesDetailed.map((c, i) => (
                  <li key={i}>
                    <strong>{c.zone} :</strong> {c.cue}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {d.breath && (
            <p className="text-sm">
              <strong>Respiration :</strong> {d.breath}
            </p>
          )}
          {d.commonMistakes?.length ? (
            <>
              <h3 className="font-semibold">Erreurs fréquentes</h3>
              <List items={d.commonMistakes} />
            </>
          ) : null}
        </Section>
      )}

      {hasAny(d, ["steps"]) && (s.entry?.length || s.hold?.length || s.exit?.length) ? (
        <Section id="etapes" title="Étapes">
          {s.entry?.length ? (<><h3 className="font-semibold">Entrer dans la posture</h3><List items={s.entry} ordered /></>) : null}
          {s.hold?.length ? (<><h3 className="font-semibold">Pendant la tenue</h3><List items={s.hold} /></>) : null}
          {s.exit?.length ? (<><h3 className="font-semibold">Sortir de la posture</h3><List items={s.exit} ordered /></>) : null}
        </Section>
      ) : null}

      <Section id="bienfaits" title="Bienfaits">
        <List items={pose.benefits} />
        {d.benefitsDetailed?.map((b, i) => (
          <p key={i} className="text-sm">
            <strong>{b.theme} :</strong> {b.text}
          </p>
        ))}
        {d.therapeutic?.length ? (
          <>
            <h3 className="font-semibold">En accompagnement de</h3>
            <List items={d.therapeutic} />
          </>
        ) : null}
        {d.muscles && (d.muscles.stretched?.length || d.muscles.strengthened?.length) ? (
          <table className="w-full text-sm">
            <tbody>
              <Row label="Muscles étirés">{d.muscles.stretched?.join(", ")}</Row>
              <Row label="Muscles renforcés">{d.muscles.strengthened?.join(", ")}</Row>
            </tbody>
          </table>
        ) : null}
      </Section>

      <Section id="precautions" title="Précautions">
        <List items={pose.contraindications} />
        {d.precautions && <p className="text-sm">{d.precautions}</p>}
        {(a.pregnancy || a.seniors || a.children || a.note) && (
          <table className="w-full text-sm">
            <tbody>
              <Row label="Grossesse">{a.pregnancy && SUITABILITY_LABELS[a.pregnancy]}</Row>
              <Row label="Seniors">{a.seniors && SUITABILITY_LABELS[a.seniors]}</Row>
              <Row label="Enfants">{a.children && SUITABILITY_LABELS[a.children]}</Row>
              <Row label="Remarque">{a.note}</Row>
            </tbody>
          </table>
        )}
        <p className="text-xs text-muted">Indications générales, à adapter à chaque élève ; elles ne remplacent pas un avis médical.</p>
      </Section>

      {hasAny(d, ["modifications", "props"]) && (
        <Section id="adaptations" title="Adaptations">
          <List items={d.modifications} />
          {d.props?.length ? <p className="text-sm"><strong>Accessoires :</strong> {d.props.join(", ")}</p> : null}
        </Section>
      )}

      {hasAny(d, ["preparatory", "counterPoses", "variations", "progressions"]) && (
        <Section id="liens" title="Postures liées">
          {d.preparatory?.length ? (<><h3 className="font-semibold">Pour préparer</h3><PoseLinks ids={d.preparatory} poseMap={poseMap} /></>) : null}
          {d.counterPoses?.length ? (<><h3 className="font-semibold">Pour compenser / relâcher</h3><PoseLinks ids={d.counterPoses} poseMap={poseMap} /></>) : null}
          {d.variations?.length ? (<><h3 className="font-semibold">Variantes</h3><PoseLinks ids={d.variations} poseMap={poseMap} /></>) : null}
          {d.progressions?.length ? (<><h3 className="font-semibold">Pour progresser</h3><PoseLinks ids={d.progressions} poseMap={poseMap} /></>) : null}
        </Section>
      )}

      {hasAny(d, ["chakras", "doshas", "elements", "gunas", "vayus", "koshas", "meridians", "styles"]) && (
        <Section id="reperes" title="Repères traditionnels">
          <table className="w-full text-sm">
            <tbody>
              <Row label="Chakras">{labels(d.chakras, CHAKRA_LABELS)}</Row>
              <Row label="Doshas">{labels(d.doshas, DOSHA_LABELS)}</Row>
              <Row label="Éléments">{labels(d.elements, ELEMENT_LABELS)}</Row>
              <Row label="Gunas">{labels(d.gunas, GUNA_LABELS)}</Row>
              <Row label="Vayus">{labels(d.vayus, VAYU_LABELS)}</Row>
              <Row label="Koshas">{labels(d.koshas, KOSHA_LABELS)}</Row>
              <Row label="Méridiens">{d.meridians?.join(", ")}</Row>
              <Row label="Styles">{d.styles?.join(", ")}</Row>
            </tbody>
          </table>
          <p className="text-xs text-muted">Associations issues des traditions du yoga et de l&apos;ayurveda, variables selon les écoles.</p>
        </Section>
      )}
    </div>
  );
}

/** How complete a sheet is, to show what is left to fill in. */
export function sheetCompleteness(d: PoseDetails | undefined): number {
  if (!d) return 0;
  const keys: (keyof PoseDetails)[] = [
    "summary", "pronunciation", "position", "types", "typicalHold", "steps", "cuesShort", "cuesDetailed", "breath",
    "commonMistakes", "benefitsDetailed", "precautions", "modifications", "props", "audience", "muscles",
    "preparatory", "counterPoses", "variations", "progressions", "chakras",
  ];
  return Math.round((keys.filter((k) => hasAny(d, [k])).length / keys.length) * 100);
}
