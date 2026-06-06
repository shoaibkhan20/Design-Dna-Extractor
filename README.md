# Design DNA Extractor — Chrome Extension

Extract any website's complete design system into an AI-ready `SKILL.md` file. Give it to your agent to recreate the design for your own business.

## What it extracts

| Category | Details |
|---|---|
| **Color palette** | All colors by role (dark/accent/light), luminance values |
| **Typography** | Font families, type scale, weights, letter-spacing, text transforms |
| **Spacing system** | Padding, margin, gap, border-radius values |
| **Layout** | Max widths, grid columns, sticky nav, sidebar detection |
| **Visual effects** | Glassmorphism, 3D transforms, parallax, video bg, WebGL, gradients |
| **Image frames** | Object-fit, aspect-ratio, filters, border-radius, transforms |
| **UI components** | Nav bar, primary button, card, form input styles |
| **Section map** | Background colors and padding per page section |

## Installation (Chrome)

1. Download / unzip this folder
2. Open Chrome → go to `chrome://extensions/`
3. Enable **Developer mode** (toggle, top right)
4. Click **Load unpacked**
5. Select this folder
6. The 🧬 icon appears in your toolbar

## Usage

1. Go to any website you want to copy the design from
2. Click the 🧬 extension icon
3. Click **Extract Design DNA**
4. Wait ~2 seconds for extraction
5. **Download .md** → save the file
6. Give the `.md` file to your AI agent with this prompt:

```
Use the attached design-dna.md file as your design system reference.
Build me a [landing page / SaaS site / portfolio] for my business: [YOUR BUSINESS].
My content: [YOUR CONTENT].
Follow all colors, typography, spacing, and component styles from the file exactly.
Replace all placeholder content with mine.
```

## Output format

The generated `.md` file is structured as a SKILL.md-compatible design document:

- Color palette with hex values and roles
- Full typography system
- Spacing tokens
- Layout structure
- Effects and 3D techniques
- Component specs (nav, buttons, cards, inputs)
- Agent prompt instructions at the bottom

## Important notes

- **Design inspiration only** — do not copy logos, images, or proprietary brand assets
- Some effects (WebGL, canvas) are detected but not fully extractable via CSS — the file notes their presence so your agent knows to implement them
- Works best on sites that use traditional CSS (not canvas-only or heavily obfuscated)
- For best results, let the page fully load before extracting

## Privacy

This extension runs entirely locally. No data is sent anywhere — extraction happens in your browser and the `.md` file is saved to your device.
