"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { PoseDetails } from "@/lib/details";
import { format, useLabels, useMessages } from "@/lib/i18n";
import { joinLabels } from "@/lib/labels";
import type { Pose } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

const M = {
  fr: {
    sections: {
      apercu: "Aperçu", guidage: "Guidage", etapes: "Étapes", bienfaits: "Bienfaits", precautions: "Précautions",
      adaptations: "Adaptations", variantes: "Variantes", liens: "Postures liées", reperes: "Repères",
    },
    sanskrit: "Sanskrit", meaning: "Sens du nom", otherNames: "Autres noms", position: "Position", positions: "Positions du corps",
    type: "Type", shape: "Forme", hold: "Tenue habituelle", popularity: "Popularité", rank: "n° {n} du catalogue",
    cuesShort: "Consignes courtes", cuesDetailed: "Consignes détaillées", breath: "Respiration", mistakes: "Erreurs fréquentes",
    entry: "Entrer dans la posture", during: "Pendant la tenue", exit: "Sortir de la posture",
    zones: "Zones travaillées", therapeutic: "En accompagnement de", stretched: "Muscles étirés", strengthened: "Muscles renforcés",
    pregnancy: "Grossesse", seniors: "Seniors", children: "Enfants", note: "Remarque", audiences: "Public",
    disclaimer: "Indications générales, à adapter à chaque élève ; elles ne remplacent pas un avis médical.",
    props: "Accessoires", equipment: "Matériel / pratique", tags: "Catégories",
    variantOf: "Variante de", variantsOf: "{n} variante(s) de cette posture", showAll: "Voir toutes les variantes ({n})",
    preparatory: "Pour préparer", counter: "Pour compenser / relâcher", variations: "Variantes conseillées", progressions: "Pour progresser",
    before: "Souvent juste avant", after: "Souvent juste après",
    chakras: "Chakras", doshas: "Doshas", elements: "Éléments", gunas: "Gunas", vayus: "Vayus", koshas: "Koshas",
    meridians: "Méridiens", styles: "Styles",
    tradition: "Associations issues des traditions du yoga et de l'ayurveda, variables selon les écoles.",
  },
  en: {
    sections: {
      apercu: "Overview", guidage: "Cueing", etapes: "Steps", bienfaits: "Benefits", precautions: "Precautions",
      adaptations: "Adaptations", variantes: "Variations", liens: "Related poses", reperes: "Traditions",
    },
    sanskrit: "Sanskrit", meaning: "Meaning", otherNames: "Other names", position: "Position", positions: "Body positions",
    type: "Type", shape: "Shape", hold: "Usual hold", popularity: "Popularity", rank: "#{n} in the catalogue",
    cuesShort: "Short cues", cuesDetailed: "Detailed cues", breath: "Breath", mistakes: "Common mistakes",
    entry: "Coming into the pose", during: "While holding", exit: "Coming out",
    zones: "Areas worked", therapeutic: "Supportive for", stretched: "Muscles stretched", strengthened: "Muscles strengthened",
    pregnancy: "Pregnancy", seniors: "Seniors", children: "Children", note: "Note", audiences: "Audience",
    disclaimer: "General guidance, to adapt to each student; it does not replace medical advice.",
    props: "Props", equipment: "Equipment / practice", tags: "Categories",
    variantOf: "Variation of", variantsOf: "{n} variation(s) of this pose", showAll: "Show all variations ({n})",
    preparatory: "To prepare", counter: "To counter / release", variations: "Suggested variations", progressions: "To progress",
    before: "Often just before", after: "Often just after",
    chakras: "Chakras", doshas: "Doshas", elements: "Elements", gunas: "Gunas", vayus: "Vayus", koshas: "Koshas",
    meridians: "Meridians", styles: "Styles",
    tradition: "Associations from yoga and ayurvedic traditions; they vary between schools.",
  },
  es: {
    sections: {
      apercu: "Resumen", guidage: "Indicaciones", etapes: "Pasos", bienfaits: "Beneficios", precautions: "Precauciones",
      adaptations: "Adaptaciones", variantes: "Variantes", liens: "Posturas relacionadas", reperes: "Tradición",
    },
    sanskrit: "Sánscrito", meaning: "Significado", otherNames: "Otros nombres", position: "Posición", positions: "Posiciones del cuerpo",
    type: "Tipo", shape: "Forma", hold: "Permanencia habitual", popularity: "Popularidad", rank: "n.º {n} del catálogo",
    cuesShort: "Indicaciones breves", cuesDetailed: "Indicaciones detalladas", breath: "Respiración", mistakes: "Errores frecuentes",
    entry: "Entrar en la postura", during: "Durante la permanencia", exit: "Salir de la postura",
    zones: "Zonas trabajadas", therapeutic: "Como apoyo en", stretched: "Músculos estirados", strengthened: "Músculos fortalecidos",
    pregnancy: "Embarazo", seniors: "Mayores", children: "Niños", note: "Nota", audiences: "Público",
    disclaimer: "Indicaciones generales, a adaptar a cada alumno; no sustituyen una opinión médica.",
    props: "Accesorios", equipment: "Material / práctica", tags: "Categorías",
    variantOf: "Variante de", variantsOf: "{n} variante(s) de esta postura", showAll: "Ver todas las variantes ({n})",
    preparatory: "Para preparar", counter: "Para compensar / soltar", variations: "Variantes sugeridas", progressions: "Para progresar",
    before: "A menudo justo antes", after: "A menudo justo después",
    chakras: "Chakras", doshas: "Doshas", elements: "Elementos", gunas: "Gunas", vayus: "Vayus", koshas: "Koshas",
    meridians: "Meridianos", styles: "Estilos",
    tradition: "Asociaciones procedentes de las tradiciones del yoga y del ayurveda, variables según las escuelas.",
  },
};

const plural = (template: string, n: number) => format(template.replace(/\((\w+)\)/g, n > 1 ? "$1" : ""), { n });

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
      <th className="w-44 py-1.5 pr-3 text-left font-medium text-muted">{label}</th>
      <td className="py-1.5">{children}</td>
    </tr>
  );
}

function PoseCard({ pose, extra }: { pose: Pose; extra?: string }) {
  return (
    <Link href={`/postures/${pose.id}`} className="block rounded-lg border border-line p-1 text-xs hover:border-accent">
      <PoseThumb pose={pose} />
      <span className="mt-1 line-clamp-2 block font-medium">{pose.name}</span>
      {extra && <span className="block text-muted">{extra}</span>}
    </Link>
  );
}

function PoseLinks({ ids, poseMap, pct }: { ids?: string[]; poseMap: Map<string, Pose>; pct?: Map<string, number> }) {
  if (!ids?.length) return <p className="text-sm text-muted">—</p>;
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {ids.map((id) => {
        const p = poseMap.get(id);
        if (!p) return null;
        return (
          <li key={id}>
            <PoseCard pose={p} extra={pct?.has(id) ? `${pct.get(id)} %` : undefined} />
          </li>
        );
      })}
    </ul>
  );
}

/** Variations of a base pose: the most used first, folded beyond the first rows. */
function Variants({ ids, poseMap }: { ids: string[]; poseMap: Map<string, Pose> }) {
  const t = useMessages(M);
  const [all, setAll] = useState(false);
  const sorted = ids
    .map((id) => poseMap.get(id))
    .filter((p): p is Pose => Boolean(p))
    .sort((a, b) => (a.details?.popularityRank ?? Infinity) - (b.details?.popularityRank ?? Infinity));
  const shown = all ? sorted : sorted.slice(0, 15);
  return (
    <>
      <p className="text-sm text-muted">{plural(t.variantsOf, sorted.length)}</p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {shown.map((p) => (
          <li key={p.id}>
            <PoseCard pose={p} />
          </li>
        ))}
      </ul>
      {sorted.length > shown.length && (
        <button className="btn" onClick={() => setAll(true)}>
          {format(t.showAll, { n: sorted.length })}
        </button>
      )}
    </>
  );
}

const hasAny = (d: PoseDetails, keys: (keyof PoseDetails)[]) =>
  keys.some((k) => {
    const v = d[k];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "" && !(typeof v === "object" && !Object.values(v).some(Boolean));
  });

/** Read-only pose sheet, sectioned like a reference page. Empty sections are hidden. */
export function PoseSheet({ pose, poseMap }: { pose: Pose; poseMap: Map<string, Pose> }) {
  const t = useMessages(M);
  const L = useLabels();
  const d = pose.details ?? {};
  const s = d.steps ?? {};
  const a = d.audience ?? {};
  const base = pose.variantOf ? poseMap.get(pose.variantOf) : undefined;
  const hasVariants = Boolean(pose.variants?.length || base);
  // Only sections that render: the menu must not point to anchors that are absent.
  const present: Record<keyof typeof t.sections, boolean> = {
    apercu: true,
    guidage: hasAny(d, ["cuesShort", "cuesDetailed", "breath", "commonMistakes"]),
    etapes: Boolean(s.entry?.length || s.hold?.length || s.exit?.length),
    bienfaits: true,
    precautions: true,
    adaptations: hasAny(d, ["modifications", "props", "equipment"]),
    variantes: hasVariants,
    liens: hasAny(d, ["preparatory", "counterPoses", "variations", "progressions", "oftenBefore", "oftenAfter"]),
    reperes: hasAny(d, ["chakras", "doshas", "elements", "gunas", "vayus", "koshas", "meridians", "styles"]),
  };
  const visible = (Object.entries(t.sections) as [keyof typeof t.sections, string][]).filter(([id]) => present[id]);
  const pctOf = (xs?: { id: string; pct: number }[]) => new Map((xs ?? []).map((x) => [x.id, x.pct]));

  return (
    <div className="space-y-5">
      <nav className="no-print sticky top-[53px] z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-background/95 px-4 py-2 text-sm backdrop-blur">
        {visible.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full px-3 py-1 whitespace-nowrap text-muted hover:bg-accent-soft hover:text-foreground">
            {label}
          </a>
        ))}
      </nav>

      <Section id="apercu" title={t.sections.apercu}>
        <p>{d.summary || pose.description}</p>
        {d.summary && pose.description && d.summary !== pose.description && <p className="text-sm text-muted">{pose.description}</p>}
        <table className="w-full text-sm">
          <tbody>
            <Row label={t.sanskrit}>
              {[d.sanskritIast || pose.sanskrit, d.pronunciation && `(${d.pronunciation})`].filter(Boolean).join(" ")}
            </Row>
            <Row label={t.meaning}>{d.sanskritMeaning}</Row>
            <Row label={t.otherNames}>{d.otherNames?.join(", ")}</Row>
            <Row label={t.position}>{d.position && L.position[d.position]}</Row>
            <Row label={t.positions}>{joinLabels(d.bodyPositions, L.bodyPosition)}</Row>
            <Row label={t.type}>{joinLabels(d.types, L.type)}</Row>
            <Row label={t.shape}>{joinLabels(d.shapes, L.shape)}</Row>
            <Row label={t.tags}>{joinLabels(d.tags, L.tag)}</Row>
            <Row label={t.hold}>{d.typicalHold}</Row>
            <Row label={t.popularity}>{d.popularityRank ? format(t.rank, { n: d.popularityRank }) : null}</Row>
          </tbody>
        </table>
      </Section>

      {hasAny(d, ["cuesShort", "cuesDetailed", "breath", "commonMistakes"]) && (
        <Section id="guidage" title={t.sections.guidage}>
          {d.cuesShort?.length ? (<><h3 className="font-semibold">{t.cuesShort}</h3><List items={d.cuesShort} /></>) : null}
          {d.cuesDetailed?.length ? (
            <>
              <h3 className="font-semibold">{t.cuesDetailed}</h3>
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
              <strong>{t.breath} :</strong> {d.breath}
            </p>
          )}
          {d.commonMistakes?.length ? (<><h3 className="font-semibold">{t.mistakes}</h3><List items={d.commonMistakes} /></>) : null}
        </Section>
      )}

      {s.entry?.length || s.hold?.length || s.exit?.length ? (
        <Section id="etapes" title={t.sections.etapes}>
          {s.entry?.length ? (<><h3 className="font-semibold">{t.entry}</h3><List items={s.entry} ordered /></>) : null}
          {s.hold?.length ? (<><h3 className="font-semibold">{t.during}</h3><List items={s.hold} /></>) : null}
          {s.exit?.length ? (<><h3 className="font-semibold">{t.exit}</h3><List items={s.exit} ordered /></>) : null}
        </Section>
      ) : null}

      <Section id="bienfaits" title={t.sections.bienfaits}>
        <List items={pose.benefits} />
        {d.benefitsDetailed?.map((b, i) => (
          <p key={i} className="text-sm">
            <strong>{b.theme} :</strong> {b.text}
          </p>
        ))}
        <table className="w-full text-sm">
          <tbody>
            <Row label={t.zones}>{joinLabels(d.zones, L.zone)}</Row>
            <Row label={t.stretched}>{d.muscles?.stretched?.join(", ")}</Row>
            <Row label={t.strengthened}>{d.muscles?.strengthened?.join(", ")}</Row>
          </tbody>
        </table>
        {d.therapeutic?.length ? (<><h3 className="font-semibold">{t.therapeutic}</h3><List items={d.therapeutic} /></>) : null}
      </Section>

      <Section id="precautions" title={t.sections.precautions}>
        <List items={pose.contraindications} />
        {d.precautions && <p className="text-sm">{d.precautions}</p>}
        <table className="w-full text-sm">
          <tbody>
            <Row label={t.audiences}>{joinLabels(d.audiences, L.audience)}</Row>
            <Row label={t.pregnancy}>{a.pregnancy && L.suitability[a.pregnancy]}</Row>
            <Row label={t.seniors}>{a.seniors && L.suitability[a.seniors]}</Row>
            <Row label={t.children}>{a.children && L.suitability[a.children]}</Row>
            <Row label={t.note}>{a.note}</Row>
          </tbody>
        </table>
        <p className="text-xs text-muted">{t.disclaimer}</p>
      </Section>

      {hasAny(d, ["modifications", "props", "equipment"]) && (
        <Section id="adaptations" title={t.sections.adaptations}>
          <List items={d.modifications} />
          <table className="w-full text-sm">
            <tbody>
              <Row label={t.props}>{d.props?.join(", ")}</Row>
              <Row label={t.equipment}>{joinLabels(d.equipment, L.prop)}</Row>
            </tbody>
          </table>
        </Section>
      )}

      {hasVariants && (
        <Section id="variantes" title={t.sections.variantes}>
          {base && (
            <>
              <h3 className="font-semibold">{t.variantOf}</h3>
              <div className="w-28">
                <PoseCard pose={base} />
              </div>
            </>
          )}
          {pose.variants?.length ? <Variants ids={pose.variants} poseMap={poseMap} /> : null}
        </Section>
      )}

      {hasAny(d, ["preparatory", "counterPoses", "variations", "progressions", "oftenBefore", "oftenAfter"]) && (
        <Section id="liens" title={t.sections.liens}>
          {d.preparatory?.length ? (<><h3 className="font-semibold">{t.preparatory}</h3><PoseLinks ids={d.preparatory} poseMap={poseMap} /></>) : null}
          {d.counterPoses?.length ? (<><h3 className="font-semibold">{t.counter}</h3><PoseLinks ids={d.counterPoses} poseMap={poseMap} /></>) : null}
          {d.variations?.length ? (<><h3 className="font-semibold">{t.variations}</h3><PoseLinks ids={d.variations} poseMap={poseMap} /></>) : null}
          {d.progressions?.length ? (<><h3 className="font-semibold">{t.progressions}</h3><PoseLinks ids={d.progressions} poseMap={poseMap} /></>) : null}
          {d.oftenBefore?.length ? (
            <><h3 className="font-semibold">{t.before}</h3><PoseLinks ids={d.oftenBefore.map((x) => x.id)} pct={pctOf(d.oftenBefore)} poseMap={poseMap} /></>
          ) : null}
          {d.oftenAfter?.length ? (
            <><h3 className="font-semibold">{t.after}</h3><PoseLinks ids={d.oftenAfter.map((x) => x.id)} pct={pctOf(d.oftenAfter)} poseMap={poseMap} /></>
          ) : null}
        </Section>
      )}

      {hasAny(d, ["chakras", "doshas", "elements", "gunas", "vayus", "koshas", "meridians", "styles"]) && (
        <Section id="reperes" title={t.sections.reperes}>
          <table className="w-full text-sm">
            <tbody>
              <Row label={t.chakras}>{joinLabels(d.chakras, L.chakra)}</Row>
              <Row label={t.doshas}>{joinLabels(d.doshas, L.dosha)}</Row>
              <Row label={t.elements}>{joinLabels(d.elements, L.element)}</Row>
              <Row label={t.gunas}>{joinLabels(d.gunas, L.guna)}</Row>
              <Row label={t.vayus}>{joinLabels(d.vayus, L.vayu)}</Row>
              <Row label={t.koshas}>{joinLabels(d.koshas, L.kosha)}</Row>
              <Row label={t.meridians}>{d.meridians?.join(", ")}</Row>
              <Row label={t.styles}>{d.styles?.join(", ")}</Row>
            </tbody>
          </table>
          <p className="text-xs text-muted">{t.tradition}</p>
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
