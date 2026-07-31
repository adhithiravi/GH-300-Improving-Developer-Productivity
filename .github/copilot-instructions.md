# Kids Lunch Planner Guidelines

## Project Structure
- This repository is a small full-stack TypeScript application.
- Frontend lives in client/ and uses React with Vite.
- Backend lives in server/ and uses Express.
- Lunch API routes are mounted at /api/lunches.

## Coding Style
- Prefer small, focused changes over broad refactors.
- Match the existing TypeScript style and naming already present in the touched file.
- Avoid adding dependencies unless they solve a clear problem that cannot be handled cleanly with the current stack.
- Keep code straightforward and beginner-readable.

## API and Validation
- Validate server request bodies explicitly at the route boundary.
- Return clear 400 responses with field-level validation details for invalid input.
- Preserve existing API response shapes unless the task explicitly asks to change them.
- If client and server share the same shape repeatedly, consider a shared type, but do not introduce a shared package unless the duplication becomes real.

## State and Data
- Assume in-memory storage is acceptable unless the task explicitly calls for persistence.
- Do not introduce a database, auth, or background jobs by default.

## Frontend Conventions
- Keep components small and easy to follow.
- Prefer local component state unless multiple components truly need shared state.
- Preserve the existing app flow before introducing abstractions.

## Verification
- For full-project verification, use: npm run build
- For type-focused verification, use: npm run typecheck
- If changing only the client, prefer the client build or typecheck first when appropriate.
- If changing only the server, prefer the server build first when appropriate.

## Collaboration
- Explain assumptions before making structural changes.
- Call out tradeoffs when introducing shared types, new folders, or new dependencies.