# Obsidian 11ty Plugin

Un plugin Obsidian qui permet d'utiliser des shortcodes 11ty (Eleventy) directement dans vos notes Markdown et de les prévisualiser en temps réel.

## Installation via BRAT

1. Installez [BRAT](https://github.com/TfTHacker/obsidian42-brat) depuis la communauté des plugins
2. Dans BRAT, ajoutez le repository : `didier-lechenne/dev_obsidian-11ty`
3. Activez le plugin dans Paramètres → Plugins communautaires

## Fonctionnalités

### Code blocks supportés

| Syntaxe | Description |
|---|---|
| ` ```11ty ` | Bloc générique pour tous les shortcodes 11ty |
| ` ```image ` | Image |
| ` ```video ` | Vidéo |
| ` ```figure ` | Figure avec légende |
| ` ```imagenote ` | Image flottante avec annotation |

### Composants disponibles dans un bloc `11ty`

- **columnGrid** — grille de mise en page (12 colonnes)
- **sc-gallery** — galerie d'images
- **textCol** — texte en colonnes
- **imagenote** — image flottante en marge

### Commandes

- **Toggle grid markers** — affiche/masque les repères de grille (Ctrl+P → "Toggle grid markers")

## Syntaxe

### Bloc 11ty générique
```
```11ty
{% image "image.jpg", {width: 6, caption: "**Ma légende**"} %}
```
```

### Bloc spécifique (Live Preview)
```
```image
"image.jpg", {width: 6, caption: "Ma légende"}
```
```

## Options

```javascript
{
  width: 6,                     // Largeur (colonnes)
  col: 1,                       // Position (colonne de départ)
  alignSelf: "start",           // Alignement vertical : start | center | end
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
