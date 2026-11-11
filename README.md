# Flow Creator

Préparer ses cours de yoga : bibliothèque de postures, constructeur de séquences, plans de cours et fiches imprimables.
Web app installable (PWA), tout en français, données stockées localement dans le navigateur.

## Lancer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start   # version de production
```

## Fonctionnalités

- **Postures** (`/postures`) : catalogue intégré de 440+ postures (une figurine par posture) (nom français, sanskrit, anglais, catégories, niveau, bienfaits, précautions). Recherche sans accents en FR/sanskrit/EN, filtres par niveau et catégorie. Création de postures perso, photo par posture, notes personnelles.
- **Constructeur de flow** (`/cours/[id]`) : bibliothèque illustrée à gauche, flow en cartes à droite, barre d'outils (nom, style, niveau, durée estimée / visée, nombre de postures). Sections, glisser-déposer entre sections, durée en respirations ou secondes, côté, consigne par posture, durée estimée (1 respiration ≈ 5 s, voir `src/lib/duration.ts`).
  - **Générer** (`src/lib/generator.ts`) : séquence complète construite par règles (pas d'IA) selon style, niveau, durée et focus.
  - **Modèles** (`src/lib/templates.ts`) : cours prêts à l'emploi et salutations au soleil.
  - **Suggérer la suite** : contre-postures après un effort, même famille sinon.
- **Impression / PDF** (`/cours/[id]/imprimer`) : fiche numérotée, images et consignes optionnelles, via l'impression du navigateur.
- **Sauvegarde** : export/import JSON depuis l'accueil.

## Catalogue

Un fichier par famille dans `src/lib/catalog/` (`debout`, `genoux`, `assises`, `allongees`, `inversions`, `yin`) et les figurines correspondantes dans `figures-<famille>.ts`.

```bash
npm run check:catalog                       # ids/noms uniques, figurine présente, catégories valides
npm run figures -- debout .cache/debout.html  # planche de vérification visuelle d'une famille (ou "all")
```

## Illustrations

Ordre d'affichage d'une posture : photo ajoutée par la prof (dans l'app) → illustration `public/poses/<id>.png` → figurine générée → initiales.

1. `npm run export:poses` → `exports/postures.csv` / `.json` : liste complète avec le nom de fichier attendu et un prompt prêt à l'emploi (personnage original, style commun).
2. Générer les images (ex. ChatGPT) et les déposer dans `public/poses/` sous le nom exact `<id>.png` (ou `.webp`, `.jpg`, `.svg`).
3. `npm run images` (lancé aussi automatiquement avant `dev` et `build`) recense les fichiers ; `npm run check:catalog` signale un fichier mal nommé et affiche la couverture.

## Données

| Quoi | Où |
|---|---|
| Cours, postures perso, notes | `localStorage` (clé `flow-creator`, via zustand) |
| Photos de postures | IndexedDB (redimensionnées à 900 px, WebP) |

Les données restent dans le navigateur de l'appareil. Les photos ne sont **pas** incluses dans l'export JSON.

## Contenu

Les textes du catalogue (`src/lib/catalog/`) ont été rédigés pour ce projet. Les contre-indications sont indicatives et à relire par une enseignante. Aucune image ni aucun texte de Tummee ou de FLOW n'est repris.

Figurines : mannequin SVG articulé dessiné par l'app (`src/lib/figure.ts`, `src/components/PoseFigure.tsx`), angles définis par posture dans `src/lib/catalog/figures-*.ts`. Une photo ajoutée par la prof remplace la figurine.

## Pistes

- Synchronisation multi-appareils (Supabase ou équivalent).
- Générateur par IA (nécessite un serveur et une clé API) et lien de partage pour les élèves.
- Service worker pour le hors-ligne.
