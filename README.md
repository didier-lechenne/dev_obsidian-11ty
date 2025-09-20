# Obsidian 11ty Plugin

Un plugin Obsidian qui permet d'utiliser des shortcodes 11ty (Eleventy) directement dans vos notes Markdown et de les prévisualiser en temps réel.

## Fonctionnalités

### Types de shortcodes supportés

- **image** - Images avec options de style avancées
- **grid** - Grilles d'images avec mise en page personnalisée
- **video** - Vidéos avec contrôles et poster
- **figure** - Figures avec légendes
- **imagenote** - Images flottantes avec annotations


### Syntaxes supportées

1. **Syntaxe 11ty classique** (dans code blocks `11ty`)
```11ty
{% image "image.jpg", {width: 300, col: 2} %}
```

2. **Code blocks spécifiques** (Live Preview)
```image
"image.jpg", {width: 300, caption: "Ma légende"}
```

3. **Shortcodes inline** (Reading View)
```
Du texte avec {% image "image.jpg" %} une image intégrée
```

## Installation

1. Utiliser BRAT


## Utilisation

### Options disponibles

Toutes les options CSS de 11ty sont supportées :

```javascript
{
  width: 3,                     // Largeur
  col: 2,                       // Position dans la grille
  printCol: 1,                  // Position impression
  printWidth: 1,                // Largeur impression
  printRow: 2,                  // Ligne impression
  printHeight: 3,               // Hauteur impression
  alignSelf: "bottom",          // Alignement vertical
  imgX: 0,                      // Position X de l'image
  imgY: 0,                      // Position Y de l'image
  imgW: 0,                      // Largeur de l'image
  page: "full",                 // Page complète
  caption: "**Ma légende**",    // Légende (Markdown supporté)
  class: "myClass",            // Classes CSS
  poster: "./images/poster.jpg"          // Poster pour vidéos
}
```

### Exemples

#### Image simple
```
    ```11ty
    {% image "photos/paysage.jpg", {width: 12, caption: "**Ma légende**"} %}
    ```
```

#### Grille d'images
```
    ```grid
    {% grid "photos/paysage.jpg", {width: 12, caption: "**Ma légende**"} %}
    ```
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

