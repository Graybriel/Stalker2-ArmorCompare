<!-- 
=============================================================================
SYNC IMPACT REPORT - Constitution v1.0.0
=============================================================================

**Version Change**: Initial (from template) → v1.0.0

**Principles Established** (5 total):
1. Data-Driven Design (sourced from armor.json)
2. Modular JavaScript Architecture (app.js, compare.js, upgrades.js)
3. Accessible & Responsive UI (desktop + mobile, no framework lock-in)
4. User-First Feature Development (prioritized by player value)
5. Quality & Browser Compatibility (manual testing, performance gates)

**New Sections Added**:
- Data & Configuration (armor.json schema requirements)
- Development Workflow (5-step data-first process)
- Governance (amendment procedure, semantic versioning)

**Templates Status**:
- ✅ plan-template.md: Aligns with Principle IV & V (no changes needed; Constitution Check gates apply)
- ✅ spec-template.md: Aligns with Principle IV (user-first approach compatible)
- ✅ tasks-template.md: Aligns with Principles II & III (modular task organization)
- ℹ️ agent-file-template.md: Generic; no constitution-specific changes required
- ℹ️ checklist-template.md: Generic; no constitution-specific changes required

**Outstanding TODOs**: None (all placeholders filled)

**Ratification**: 2026-01-28 (initial adoption)

=============================================================================
-->

# Stalker2-ArmorCompare Constitution

## Core Principles

### I. Data-Driven Design
All armor comparison data MUST be sourced from structured JSON data files (armor.json, armor_full.json). UI updates are driven by data transformations, not manual DOM manipulation. Any armor balancing decisions or new armor additions require corresponding data file updates before UI implementation.

### II. Modular JavaScript Architecture
JavaScript code is organized into focused modules by concern: app.js (initialization), compare.js (comparison logic), upgrades.js (upgrade system). Each module maintains a single responsibility and exposes clear interfaces. Cross-module communication uses event delegation or explicit function calls—no global state pollution.

### III. Accessible & Responsive UI
All comparison features MUST be usable on desktop and mobile viewports. Armor comparison tables, filters, and sorting maintain accessibility standards. Visual comparisons are accompanied by numeric displays for clarity. No CSS framework lock-in; custom styles in styles.css must be maintainable and performant.

### IV. User-First Feature Development
Features are prioritized by user value: armor comparison (primary), filtering/sorting (secondary), upgrade tracking (tertiary). No feature is added without clear justification from player use cases. Complexity is justified—avoid feature creep and maintain simplicity in UI/UX.

### V. Quality & Browser Compatibility
Code changes must not break existing armor comparison functionality. Testing is manual on common browsers (Chrome, Firefox, Edge). Performance regressions (>100ms additional load time) are unacceptable. Data transformation logic is verified against live armor.json before deployment.

## Data & Configuration

All armor metadata is stored in `data/armor.json` with the following required fields per armor entry:
- `Id`, `DisplayName`, `Type` (chest, head, full body)
- Protection values: thermal, electric, chemical, radiation, psi, physical
- Physical properties: weight, Cost
- Upgrade metadata: `UpgradeList`, `Upgrades` array

New armor additions or stat changes MUST be reflected in the data file first; UI displays are derived from this source.

## Development Workflow

1. **Changes start with data**: New armor or balance updates modify `data/armor.json`.
2. **UI logic updates follow**: Comparison, filtering, or display logic in js/ modules.
3. **Styling comes last**: CSS refinements in `css/styles.css` only after logic is stable.
4. **Testing is manual & iterative**: Player-facing comparisons verified by hand; edge cases (extreme stats, many upgrades) tested on multiple screens.
5. **Commits reference specific armor or features**: e.g., "feat: add Brummbar Exoskeleton comparison", "fix: sort upgrades by slot availability".

## Governance

This Constitution is the source of truth for Stalker2-ArmorCompare development practices. All feature requests, bug fixes, and optimizations are evaluated against these principles before implementation. Deviations require explicit amendment of this document with justification.

Amendment process:
- Proposed changes MUST document the principle(s) being modified.
- Rationale MUST explain why the change improves project quality or user experience.
- Version increments follow semantic versioning: MAJOR (principle removal/redefinition), MINOR (new principle or expanded guidance), PATCH (clarifications/typo fixes).

**Version**: 1.0.0 | **Ratified**: 2026-01-28 | **Last Amended**: 2026-01-28
