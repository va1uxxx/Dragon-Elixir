# Dragon Elixir

Cinematic, 3D, scroll-driven promotional site for the fictional "Dragon Elixir" energy drink. Built for GitHub Pages as a static site (no build step). Vendored Three.js, GSAP, ScrollTrigger, and Lenis for offline reliability.

**Live:** [va1uxxx.github.io/Dragon-Elixir](https://va1uxxx.github.io/Dragon-Elixir/)

## Features
- WebGL hero dragon eye with embers
- Interactive 3D can (drag to rotate, scroll to tilt)
- Pinned cinematic film section (uses the provided `assets/neegy.mp4`)
- Scroll-triggered reveals, splits, counters, and section rail
- Satirical nutrition/label panel rendered to canvas
- Magnetic buttons, custom cursor, smooth scroll
- Responsive across desktop/tablet/mobile
- Reduced-motion aware
- Fictional product + explicit satire/disclaimer

## Tech
- HTML/CSS/JS, Three.js (ES modules, vendored)
- GSAP + ScrollTrigger + Lenis (vendored)
- Self-hosted fonts

## Development
Serve locally from repo root:
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000/`.

## Disclaimer
This is a fictional, satirical product. Not for human consumption. Do not consume arsenic.
