# ullr Developer Portal (Static)

Static HTML/CSS/JS implementation of a developer portal.

## Included templates

- Homepage: `index.html`
- Documentation hub: `docs/index.html`
- Guide article template: `docs/guides/first-app.html`
- API reference template: `docs/api/authentication.html`

## Run locally

Use any static server. Two options:

```bash
cd /Users/sac63/ullr-dev-portal
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Design direction

- Discovery-first homepage with capability cards, updates, and quickstarts
- Documentation shell with sidebar, breadcrumbs, and in-page table of contents
- Shared design tokens in `assets/css/styles.css`
- Small interaction script in `assets/js/main.js` (mobile menu + active nav)

## Next steps

1. Replace placeholder links and copy with real ullr product content.
2. Add JSON-based client-side search index.
3. Add syntax highlighting for code blocks.
4. Add accessibility and Lighthouse checks in CI.
# vigilant-pancake
