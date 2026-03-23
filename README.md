# TableOrders

Restaurant table management and order processing system. Mobile-optimized React app for front-of-house operations.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 📋 Visual floor plan with table status tracking
- 🍽️ Menu-based order taking with qty controls
- 🧾 Bill generation with clipboard export
- ➗ Bill splitting (equal or by-item)
- ✅ Order confirmation and table closing workflow

## Project Structure

```
src/
├── App.jsx              # Main application
├── data/constants.js    # Menu, tables, config
├── utils/helpers.js     # Utility functions
└── styles/appStyles.js  # Component styles
```

## Tech Stack

- React 18 + Vite
- Inline styles (no CSS framework)
- Local state only (no backend)

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed architecture, data models, and future improvements.

---

**Status:** Prototype / MVP
**Target Device:** Mobile (480px max-width)
