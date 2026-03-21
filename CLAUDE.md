# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Naphta is a static single-page web app that displays random book highlights/quotes with smooth animations. Zero dependencies, no build system, no package manager.

## Running Locally

Serve the root directory with any HTTP server (needed for the `fetch` of `highlights.json`):

```
python3 -m http.server 8000
# or
npx serve .
```

There are no build, lint, test, or format commands.

## Architecture

The entire application lives in `index.html` — a single file with embedded CSS and JavaScript. No frameworks or libraries.

- **`index.html`** — App entry point with all markup, styles, and logic inline
- **`highlights.json`** — Data file containing an array of highlight objects with fields: `book`, `author`, `text`, `location`, `date`, and optionally `page`
- **`IMG_7884.jpg`** — Reference image asset

### Key JavaScript functions (in `index.html`)

- `formatAuthor(raw)` — Converts author strings from `"Last,First;Last2,First2"` format to `"First Last & First2 Last2"`
- `show(h)` — Renders a highlight with fade-in/slide animation using CSS class toggling
- `random()` — Picks and displays a random highlight from the loaded data

### Interaction

Users cycle through random highlights via click, spacebar, or right arrow key. Highlights fade in with a CSS opacity + translateY transition.

### Styling

Dark theme (#0a0a0a background). Typography uses Google Fonts: Cormorant Garamond for quotes, DM Sans for metadata. Responsive with `clamp()` sizing and a 600px mobile breakpoint.
