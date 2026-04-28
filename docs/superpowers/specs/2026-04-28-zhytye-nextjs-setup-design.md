# Житездатність — Next.js Project Setup Design

**Date:** 2026-04-28  
**Status:** Approved

## Overview

Convert the single JSX file `zhytezdatnist-simulator (2).jsx` into a proper Next.js 14 project with node_modules, Tailwind CSS, and a secure backend proxy for the Anthropic API.

## Architecture

Next.js 14 with App Router. JavaScript (no TypeScript). Tailwind CSS for styling. The Anthropic API key lives only on the server — never exposed to the browser.

## File Structure

```
zhytye/
├── app/
│   ├── layout.jsx                    # Root layout: fonts, metadata, Tailwind globals
│   ├── page.jsx                      # Home page — renders ZhyteSimulator
│   ├── globals.css                   # Tailwind base styles (@tailwind directives)
│   └── api/
│       └── generate-events/
│           └── route.js              # POST handler: proxies to Anthropic API
├── components/
│   └── ZhyteSimulator.jsx            # Main simulator component (renamed from original)
├── .env.local                        # ANTHROPIC_API_KEY (gitignored)
├── .gitignore
├── next.config.js
├── package.json
└── tailwind.config.js
```

## Key Changes to Existing Code

### API Security Fix
The original `generateEvents()` called `api.anthropic.com` directly from the browser with no API key header (would fail). The fix:

- `ZhyteSimulator.jsx`: `generateEvents()` fetches `/api/generate-events` (internal Next.js route) via POST, sending the prompt in the body.
- `app/api/generate-events/route.js`: reads `process.env.ANTHROPIC_API_KEY`, forwards the request to Anthropic, returns the parsed events array. The key never leaves the server.

### Component Rename
`zhytezdatnist-simulator (2).jsx` → `components/ZhyteSimulator.jsx`  
Remove the `export default` App name ambiguity — component is named `ZhyteSimulator`.

### Layout
`app/layout.jsx` imports `globals.css` and sets `<html lang="uk">` with appropriate metadata (title, description in Ukrainian).

## Dependencies

```json
{
  "next": "^14",
  "react": "^18",
  "react-dom": "^18",
  "lucide-react": "latest"
}
```

Dev dependencies: `tailwindcss`, `postcss`, `autoprefixer`

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

Stored in `.env.local` — never committed to git.

## Implementation Steps

1. Initialize Next.js project in `/Users/romkravets/Documents/GitHub/zhytye` (no new subdirectory — set up in place)
2. Install dependencies
3. Configure Tailwind CSS
4. Create `app/api/generate-events/route.js` (Anthropic proxy)
5. Move and adapt component to `components/ZhyteSimulator.jsx`
6. Create `app/layout.jsx` and `app/page.jsx`
7. Create `.env.local` template and `.gitignore`
8. Verify `npm run dev` works

## Success Criteria

- `npm run dev` starts the app without errors
- Setup screen renders correctly
- AI event generation works (requires valid `ANTHROPIC_API_KEY` in `.env.local`)
- No API key visible in browser network requests
