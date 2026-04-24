# Docs And AGENTS Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track the currently untracked `2026-04-23` docs in git and replace `AGENTS.md` with a current-state architecture guide for the modular app.

**Architecture:** Keep this pass documentation-only. Add the missing plan/spec files to version control as-is, then rewrite `AGENTS.md` so it points to the current `src/`-based runtime and treats old non-runtime files only as pending cleanup for a later plan.

**Tech Stack:** Markdown, git

---

## File Structure

- Modify: `AGENTS.md`
  - Replace outdated monolith/source-of-truth guidance with current architecture guidance
- Track: `docs/superpowers/plans/2026-04-23-*.md`
  - Preserve existing planning docs in git
- Track: `docs/superpowers/specs/2026-04-23-*.md`
  - Preserve existing design docs in git

### Task 1: Rewrite AGENTS.md for the current architecture

**Files:**
- Modify: `AGENTS.md`
- Test: `git diff -- AGENTS.md`

- [ ] **Step 1: Replace `AGENTS.md` with current-state guidance**

Write `AGENTS.md` so it covers:

```md
# AGENTS.md

## Project Identity

- Project: `Gladius-RPG`
- Type: browser-based text RPG / turn-based combat game
- Current primary stack: Parcel + React 19 + TypeScript
- Current UI language: Traditional Chinese

## Current Runtime Source Of Truth

- Active app entry: `src/main.tsx`
- Root app shell: `src/App.tsx`
- Main game composition: `src/game/GameApp.tsx`
- Current gameplay state orchestration: `src/game/useGameState.ts`

Do not treat old standalone files as the active runtime architecture.

## Current Architecture Summary

The active application is now a modular `src/`-based app.

### Main directories

- `src/game/` - game state, domain systems, data tables, persistence, and app-facing types
- `src/features/` - feature-level UI such as dungeon, battle, inventory, shop, quests, arena, tavern, and mercenary flows
- `src/components/` - reusable presentation components
- `src/layout/` - shared layout pieces
- `src/styles/` - shared global styling and tokens

### Important files

- `src/game/appTypes.ts` - current broad app-facing runtime type bridge
- `src/game/game.css` - active game stylesheet moved out of the removed legacy surface
- `src/game/systems/*` - framework-independent gameplay logic
- `src/game/data/*` - structured gameplay content and constants

## Working Rules

- Prefer changing the modular app under `src/`
- Preserve gameplay behavior unless a plan explicitly changes it
- Keep domain/system logic out of React components when possible
- Treat persistence compatibility carefully when changing player or inventory shapes

## Verification Commands

- `npm run typecheck`
- `npm test`
- `npm run build`

## Legacy Surface Policy

There are still historical non-runtime files in the repository, including older standalone snapshots and other leftover artifacts from earlier phases.

- They are not the active architecture.
- They should be treated as pending cleanup input for a later dedicated plan.
- Do not reintroduce them as the source of truth while working on the current app.

## Near-Term Cleanup Note

The next cleanup phase may remove obsolete legacy files such as old standalone `html`, `jsx`, and other archival artifacts once their remaining value is reviewed.
```

- [ ] **Step 2: Review the AGENTS diff**

Run: `git diff -- AGENTS.md`
Expected: shows a documentation-only rewrite reflecting the current modular app and no code changes

### Task 2: Track all currently untracked 2026-04-23 docs

**Files:**
- Track: `docs/superpowers/plans/2026-04-23-combat-and-progression-balance.md`
- Track: `docs/superpowers/plans/2026-04-23-mercenary-dungeon-balance.md`
- Track: `docs/superpowers/plans/2026-04-23-minimal-runnable-migration.md`
- Track: `docs/superpowers/plans/2026-04-23-modular-rebuild-foundation.md`
- Track: `docs/superpowers/plans/2026-04-23-phased-pure-systems-extraction.md`
- Track: `docs/superpowers/plans/2026-04-23-shop-sell-thresholds.md`
- Track: `docs/superpowers/plans/2026-04-23-tavern-and-recovery.md`
- Track: `docs/superpowers/plans/2026-04-23-tavern-bounties-and-story-rewards.md`
- Track: `docs/superpowers/plans/2026-04-23-upstream-feature-absorption-overview.md`
- Track: `docs/superpowers/plans/2026-04-23-upstream-ui-text-and-footer.md`
- Track: `docs/superpowers/specs/2026-04-23-combat-and-progression-balance-design.md`
- Track: `docs/superpowers/specs/2026-04-23-mercenary-dungeon-balance-design.md`
- Track: `docs/superpowers/specs/2026-04-23-modular-rebuild-foundation-design.md`
- Track: `docs/superpowers/specs/2026-04-23-phased-pure-systems-extraction-design.md`
- Track: `docs/superpowers/specs/2026-04-23-shop-sell-thresholds-design.md`
- Track: `docs/superpowers/specs/2026-04-23-tavern-and-recovery-design.md`
- Track: `docs/superpowers/specs/2026-04-23-tavern-bounties-and-story-rewards-design.md`
- Track: `docs/superpowers/specs/2026-04-23-upstream-feature-absorption-overview-design.md`
- Track: `docs/superpowers/specs/2026-04-23-upstream-ui-text-and-footer-design.md`
- Test: `git status --short --branch`

- [ ] **Step 1: Leave the docs content unchanged and add them to git tracking**

Run:

```bash
git add docs/superpowers/plans/2026-04-23-*.md docs/superpowers/specs/2026-04-23-*.md AGENTS.md
```

Expected: the listed docs and `AGENTS.md` move from untracked/modified into the index

- [ ] **Step 2: Verify the tracked set before commit**

Run: `git status --short --branch`
Expected: shows staged `2026-04-23` docs plus staged `AGENTS.md`, with no unrelated file edits introduced by this task

### Task 3: Commit and verify the documentation alignment change

**Files:**
- Commit: `AGENTS.md`
- Commit: tracked `docs/superpowers/plans/2026-04-23-*.md`
- Commit: tracked `docs/superpowers/specs/2026-04-23-*.md`
- Test: `git status --short --branch`

- [ ] **Step 1: Create the commit**

Run:

```bash
git commit -m "docs: align project guidance with current app"
```

Expected: commit succeeds and records the docs plus `AGENTS.md`

- [ ] **Step 2: Verify the working tree after commit**

Run: `git status --short --branch`
Expected: branch remains on `main`, the documentation changes are committed, and no new code behavior changes were introduced by this pass
