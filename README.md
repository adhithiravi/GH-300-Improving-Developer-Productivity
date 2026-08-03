# Kids Lunch Planner

A small full-stack TypeScript application for planning kids' lunches. The frontend is built with React + Vite, and the backend is an Express API.

## Project Structure

- `client/` — React + Vite frontend
- `server/` — Express + TypeScript backend
  - Lunch routes mounted at `/api/lunches`
  - Pantry routes mounted at `/api/pantry`

## Prerequisites

- Node.js (v18 or later recommended)
- npm

## Installation

Install dependencies for the root, client, and server:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

## Running the App

### Development (client + server together)

From the repo root, this runs both the client and server concurrently:

```bash
npm run dev
```

- Client (Vite dev server): http://localhost:5173
- Server (Express API): http://localhost:5050

### Running client or server individually

```bash
npm run client   # starts only the Vite dev server
npm run server   # starts only the Express server (via tsx watch)
```

## Building for Production

Build both the server and client:

```bash
npm run build
```

Start the built server:

```bash
npm start
```

## Verification

- Full project: `npm run build`
- Type checking only: `npm run typecheck`

## API Health Check

Once the server is running, verify it's up with:

```bash
curl http://localhost:5050/api/health
```
