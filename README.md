# Obsidian 11ty Plugin

Un plugin Obsidian qui permet d'utiliser des shortcodes 11ty (Eleventy) directement dans vos notes Markdown et de les prévisualiser en temps réel.

## Installation via BRAT

1. Installez [BRAT](https://github.com/TfTHacker/obsidian42-brat) depuis la communauté des plugins
2. Dans BRAT, ajoutez le repository : `didier-lechenne/dev_obsidian-11ty`
3. Activez le plugin dans Paramètres → Plugins communautaires

## Fonctionnalités

### Code block

Utiliser le bloc ` ```11ty ` pour tous les shortcodes.

### Composants disponibles dans un bloc `11ty`

- **columnGrid** — grille de mise en page (12 colonnes)
- **sc-gallery** — galerie d'images
- **textCol** — texte en colonnes
- **imagenote** — image flottante en marge

### Commandes

- **Toggle grid markers** — affiche/masque les repères de grille (Ctrl+P → "Toggle grid markers")

## Syntaxe

```
```11ty
{% image "image.jpg", {width: 6, caption: "**Ma légende**"} %}
```
```

## Options

```javascript
{
  // Mise en page écran
  width: 6,                     // Largeur (colonnes) → --width
  col: 1,                       // Position (colonne de départ) → --col
  cols: 2,                      // Nb colonnes (textCol) → --grid-col
  colGap: "2rem",               // Espacement colonnes → --grid-col-gutter
  alignSelf: "start",           // Alignement vertical : start | center | end
  fill: "auto",                 // Remplissage colonnes (textCol) → --col-fill

  // Mise en page impression (pagedjs)
  printCol: 1,                  // Position colonne impression → --print-col
  printWidth: 6,                // Largeur impression → --print-width
  printRow: 1,                  // Ligne impression → --print-row
  printHeight: 3,               // Hauteur impression → --print-height

  // Contenu
  caption: "**Légende**",       // Légende (Markdown supporté)
  class: "myClass",             // Classes CSS supplémentaires
  poster: "poster.jpg"          // Poster pour vidéos
}
```

## Structure du projet

```
src/
├── main.ts                     # Point d'entrée du plugin
├── types.ts                    # Interfaces TypeScript
└── utils/
    ├── constants.ts            # Constantes et templates
    ├── helpers.ts              # Fonctions utilitaires
    ├── shortcode-processor.ts  # Processeur principal
    └── shortcode-renderer.ts   # Moteur de rendu
```

## Compatibilité

- Obsidian 0.15.0+
