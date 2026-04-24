# TableOrders Agent Instructions

## Project Overview
TableOrders is a mobile-first restaurant table management and order processing app.
It is built for fast front-of-house use on a narrow/mobile viewport, with active
orders stored locally and menu/paid-bill data synced through Directus.

## Stack
- React 18 + Vite
- TypeScript/TSX mixed with a small amount of JS/JSX
- TanStack Query for server state
- React Context for app/table/menu/split state
- Directus REST API for menu data and paid bills
- Inline style objects in `src/styles/appStyles.js`

## Commands
```bash
npm install
npm run dev
npm run build
npm run preview
npm run deploy
```

Notes:
- `npm run dev` starts Vite.
- `npm run build` is the default verification command for code changes.
- `npm run deploy` builds and publishes `dist` to GitHub Pages through
  `gh-pages`.

## Architecture Map
- `src/App.tsx` wires view routing, providers, and the query client.
- `src/contexts/AppContext.tsx` owns global UI state and paid-bill actions.
- `src/contexts/TableContext.tsx` owns table/order state and table swap logic.
- `src/contexts/MenuContext.tsx` loads Directus menu data with local fallback.
- `src/contexts/SplitContext.tsx` owns the split-payment state machine.
- `src/services/directusMenu.ts` reads menu data from Directus.
- `src/services/directusBills.ts` reads/writes bills and bill items in Directus.
- `src/data/constants.js` contains static table/menu fallback/config data.
- `src/styles/appStyles.js` contains the shared `S` style object.

## Important Behaviors
- The main views are `tables`, `order`, `ticket`, `split`, `splitConfirm`,
  `splitDone`, `close`, and `dailySales`.
- Active orders persist in localStorage; paid bills persist in Directus.
- Menu data is loaded from Directus, with `constants.js` as fallback.
- Sent order batches are locked and shown as batch history.
- Long-pressing a table activates table swap mode.
- Table closing writes a paid bill to Directus.
- Clearing daily sales should soft-delete by setting `cleared_at`, not hard-delete.
- Bill edit mode is local until completion; cancel should restore the snapshot.

## Development Rules
- Keep the app mobile-first and touch-friendly.
- Preserve the existing context/service boundaries unless a request clearly needs
  a broader refactor.
- Prefer small, direct changes over new abstractions.
- Use the existing inline style system in `appStyles.js`; do not introduce a CSS
  framework unless explicitly requested.
- Keep Directus operations inspectable and conservative. Do not touch secrets,
  credentials, auth config, or production data without explicit approval.
- Do not hard-delete bill data.
- Ask before installing dependencies, committing, pushing, or deploying.
- If a task requires syncing with remote `main`, ask for approval before running
  networked git commands in restricted environments.

## Verification
- Run `npm run build` after source changes when feasible.
- For UI changes, inspect the affected mobile viewport behavior. The target
  experience is a compact phone-width workflow, not a desktop dashboard.
- If Directus is unavailable, verify that fallback/local behavior still works.

## Deployment
Deployment is GitHub Pages based:
```bash
git pull origin main
npm run build
git add .
git commit -m "..."
git push origin main
npm run deploy
```

Only perform commit, push, or deploy steps when the user explicitly asks for
them.
