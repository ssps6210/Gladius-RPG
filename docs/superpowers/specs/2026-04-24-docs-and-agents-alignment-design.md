# Docs And AGENTS Alignment Design

**Goal:** Bring the currently untracked `2026-04-23` planning/spec documents into git and rewrite `AGENTS.md` so it describes the current modular app architecture instead of the old monolithic legacy runtime.

## Scope

This pass includes only:

- staging and committing the currently untracked `docs/superpowers/plans/2026-04-23-*.md`
- staging and committing the currently untracked `docs/superpowers/specs/2026-04-23-*.md`
- replacing `AGENTS.md` with a current-state architecture guide

This pass explicitly does **not** include deleting or refactoring old `html` / `jsx` / `java` / `txt` files.

## AGENTS.md Direction

`AGENTS.md` should now describe:

- the current runtime as the Parcel + React 19 + TypeScript app under `src/`
- `src/main.tsx` / `src/App.tsx` / `src/game/GameApp.tsx` as the active app path
- the current module boundaries under `src/game`, `src/features`, `src/components`, `src/layout`, and `src/styles`
- verification commands (`npm run typecheck`, `npm test`, `npm run build`)
- legacy non-runtime files only as a pending cleanup surface for a later plan

It should remove the old detailed narrative about `index.html` and other legacy snapshots being the current source of truth.

## Success Criteria

- all currently untracked `2026-04-23` docs are tracked in git
- `AGENTS.md` reflects the current app architecture
- `AGENTS.md` mentions legacy files only as pending cleanup, not as the active architecture
- no code behavior changes are introduced
