---
description: "Task list for Armor Comparison System implementation with multi-piece support"
---

# Tasks: Armor Comparison System (Multi-Piece Support)

**Input**: Design documents from `.specify/memory/` (plan.md, spec.md, constitution.md)  
**Prerequisites**: All design docs present ✅  
**Target**: MVP (User Stories 1–4) with multi-piece armor support  
**Estimated Duration**: 4–6 days (core MVP with comparison), 1–2 days (P3 calculator)

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, etc.)
- **ID**: Sequential task number (T001, T002, ...)
- **Description**: Clear action with exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation

- [ ] T001 Verify armor.json schema completeness—ensure all armor entries contain required fields: `Id`, `DisplayName`, `Type`, `weight`, `Cost`, `slots`, `thermal`, `electric`, `chemical`, `radiation`, `psi`, `physical`
- [ ] T002 Create `.specify/memory/data-model.md` documenting armor entity schema and relationships (armor → upgrades, armor sets)
- [ ] T003 Audit `index.html` for semantic HTML5 structure; add ARIA labels for accessibility
- [ ] T004 Set up CSS reset and base styles in `css/styles.css` (typography, box model, responsive breakpoints: 320px, 768px, 1024px)
- [ ] T005 Create app.js bootstrap function: load armor.json via fetch, parse JSON, prepare data structures for comparison logic

---

## Phase 2: Core Comparison UI (US3)

**Goal**: Build the comparison view that displays multi-piece armor sets side-by-side

**Independent Test**: App loads → armor selection UI allows picking head+chest → comparison panel displays both pieces with independent stat rows → labels show piece type

**Implementation Order**:

- [ ] T006 [P] [US3] Build comparison panel HTML structure in `index.html`: two-column layout for armor sets, each column displays armor pieces vertically, header with piece type labels
- [ ] T007 [P] [US3] Create comparison panel styling in `css/styles.css`: column alignment, stat row styling, piece type labels, highlight styling for stat differences
- [ ] T008 [US3] Create armor set model in `app.js`: object structure to hold single piece (full body) or multi-piece (head + chest) with combined stats
- [ ] T009 [US3] Implement `compare.js` function `createArmorSet(piecesArray)`: accepts Head and/or Chest armor objects, returns set object with combined stats
- [ ] T010 [US3] Implement `compare.js` function `calculateCombinedStats(armorPieces)`: sums protection values from multiple pieces in a set
- [ ] T011 [P] [US3] Add armor selector UI to `index.html`: dropdown/selector for Head piece, dropdown for Chest piece, "Create Comparison" button
- [ ] T012 [US3] Implement armor piece selector logic in `app.js`: populate selectors with available armor by type, allow user to choose Head + Chest combination
- [ ] T013 [US3] Implement `renderComparisonPanel(armorSets)` in `compare.js`: display two armor sets side-by-side with each piece's stats and labels
- [ ] T014 [US3] Add armor set selection to comparison: allow user to select first set (Head+Chest or Full Body) and second set, then render comparison
---

## Phase 3: Type Filtering (US2)

**Goal**: Filter armor by type to help users select pieces for their sets

**Independent Test**: Load app → click "Filter: Head" → armor list shows only head pieces → select a head piece + filter "Chest" → shows chest pieces → compare both

**Implementation Order**:

- [ ] T017 [P] [US2] Add filter control buttons to `index.html`: "All", "Head", "Chest", "Full Body" with clear visual state for active filter
- [ ] T018 [P] [US2] Style filter buttons in `css/styles.css`: button states (active, hover, disabled), padding for touch targets (≥44px), clear affordance
- [ ] T019 [US2] Create filter logic in `compare.js`: function `filterArmorByType(armorArray, type)` returns subset matching type or all if type=null
- [ ] T020 [US2] Implement filter button click handler in `app.js`: attach event listeners, call filter function, update armor selector dropdowns
- [ ] T021 [US2] Test filter toggling: click each filter button, verify armor selector updates, verify correct pieces available for selection
- [ ] T022 [US2] Test filter state UX: verify button visual feedback (highlight/underline) shows which filter is active

---

## Phase 4: Upgrade Display per Piece (US4)

**Goal**: Display each armor piece's upgrade slots and categories independently in comparison

**Independent Test**: Load app → create Head+Chest vs Full Body comparison → Head section shows "Slots: 1", Chest section shows "Slots: 2", Full Body shows "Slots: 3" → each section has independent upgrade list

**Implementation Order**:

- [ ] T023 [P] [US4] Add upgrade sections to comparison panel HTML in `index.html`: one upgrade section per armor piece, labeled with piece type and slot count
- [ ] T024 [P] [US4] Style upgrade sections in `css/styles.css`: layout for multiple upgrade sections per column, category grouping, slot count labels
- [ ] T025 [US4] Create upgrade categorization logic in `upgrades.js`: function `categorizeUpgrades(upgradeList)` returns object like `{ "Protection": [...], "Weight": [...], "Container": [...] }`
- [ ] T026 [US4] Implement upgrade display in `upgrades.js`: function `renderUpgradeSection(armorPiece)` returns HTML for piece type label, slot count, and categorized upgrade list
- [ ] T027 [US4] Add upgrade rendering to comparison panel: for each piece in sets, call renderUpgradeSection and display in comparison view
- [ ] T028 [US4] Test upgrade display in comparison: verify each piece shows correct slot count, verify upgrades categorized correctly, verify piece type labels visible
- [ ] T029 [US4] Test multi-piece upgrade display: Head+Chest should show two independent upgrade sections; Full Body should show one
- [ ] T030 [US4] Test upgrade categorization: verify Protection upgrades grouped, Weight Reduction grouped, Containers grouped

---

## Phase 5: Mobile Responsiveness

**Goal**: Make comparison panel and controls usable on 320px+ mobile viewports

**Independent Test**: Open app on mobile (320px width) → armor selectors work, comparison displays in single column, each piece readable, upgrades scrollable

**Implementation Order**:

- [ ] T031 [P] Add responsive viewport meta tag to `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] T032 [P] Implement mobile breakpoints in `css/styles.css` (320px, 768px, 1024px) with media queries
- [ ] T033 Refactor comparison layout for mobile: on ≤768px, display as single-column stack (piece on top, other piece below) instead of side-by-side
- [ ] T034 Adjust font sizes and spacing for mobile: reduce padding/font on ≤768px without sacrificing readability (min 12px font for stats)
- [ ] T035 [P] Make armor selector dropdowns touch-friendly on mobile: buttons ≥44px × 44px, adequate spacing (≥8px margin)
- [ ] T036 Optimize upgrade sections for mobile: make upgrade list scrollable if long, collapse categories if needed for ≤480px viewport
- [ ] T037 Test mobile viewport at 320px: verify no horizontal overflow, selectors work, comparison readable, upgrades accessible
- [ ] T038 Test mobile viewport at 768px: verify tablet layout smooth, all sections visible or easily scrollable
- [ ] T039 Test touch interactions: verify buttons respond to touch, no hover-dependent UX, swiping/scrolling smooth

---

## Phase 6: Integration & Polish (Cross-Cutting)

**Goal**: Ensure all features work together cohesively; fix edge cases and UX issues

**Implementation Order**:

- [ ] T040 [P] End-to-end test flow: Load app → filter by Head → select head + chest → compare against full body → verify all features work, no state conflicts
- [ ] T041 [P] Error handling: test with malformed armor.json (missing fields, null values) → app should not crash, display helpful error
- [ ] T042 [P] Performance audit: measure initial load time, comparison render time (target <100ms), memory usage
- [ ] T043 [P] Accessibility audit: keyboard navigation, ARIA labels, color contrast (WCAG AA)
- [ ] T044 Browser compatibility test: test on Chrome, Firefox, Edge (latest); verify all features work
- [ ] T045 Data validation: audit armor.json for missing fields, inconsistent types, out-of-range values
- [ ] T046 Code review: review app.js, compare.js, upgrades.js for quality, modularity, no global state
- [ ] T047 Update README.md: usage guide, supported browsers, data format
- [ ] T048 Update quickstart.md: multi-piece comparison workflow, upgrade display example

---

## Phase 7: Future Enhancements (P3, Out of MVP Scope)

*These tasks are documented for reference but NOT part of MVP delivery*

- [ ] T049 [US5] Upgrade impact calculator: parse Upgrades array for stat modifications, show tooltips on hover
- [ ] T050 [US5] Upgrade chain validation: detect prerequisites (RequiredUpgradePrototypeSIDs), warn user
- [ ] T051 Export feature: add "Export Comparison" button for CSV/JSON export

---

## Dependency Graph

```
T001–T005 (Phase 1 Setup)
    ↓
T006–T016 (Phase 2 US3: Comparison UI)
    ↓
T017–T022 (Phase 3 US2: Filtering) — can run after Phase 2 selectors exist
    ↓
T023–T030 (Phase 4 US4: Upgrade Display) — depends on Phase 2 comparison structure
    ↓
T031–T039 (Phase 5 Mobile) — can run parallel with Phases 3–4 (CSS updates)
    ↓
T040–T048 (Phase 6 Integration & Polish) — runs after all features complete
```

## Parallel Execution Examples

**After T005 (app bootstrap exists)**:
- T006–T016 (Comparison UI structure) can start immediately

**After T016 (comparison renders)**:
- T017–T022 (Filtering) can start
- T023–T030 (Upgrade display) can start
- T031–T039 (Mobile CSS) can run in parallel with filtering/upgrades

**Optimal workflow**:
1. Complete T001–T005 (setup) — 2 hours
2. Complete T006–T016 (comparison core) — 3 hours
3. Run T017–T022 (filtering) in parallel with T023–T030 (upgrades) — 4 hours
4. Run T031–T039 (mobile) during/after phases 3–4 — 2 hours
5. Final integration T040–T048 — 3 hours

**Total Sequential**: ~14 hours  
**Total Parallel** (optimized): ~10 hours (2 developers)

---

## Test Criteria by Story (MVP Completeness)

| Story | Must Pass |
|-------|-----------|
| US1 | Armor selector exists, allows Head/Chest/Full Body selection |
| US2 | Comparison panel displays 2 sets side-by-side, each piece labeled |
| US2 | Multi-piece sets show all pieces with independent stat rows |
| US2 | Stat differences highlighted (green/red) for easy comparison |
| US3 | Filter buttons work, armor selectors update for filtered type |
| US4 | Each piece in comparison shows upgrade slots and categories |
| US4 | Head and Chest each show independent upgrade sections |
| Mobile | 320px viewport shows readable comparison, selectors work |
| Mobile | Upgrades scrollable if long, touch-friendly controls |

**MVP Definition**: All user stories 1–4 complete with multi-piece support + T040–T048 (integration & polish)

---

**Version**: 2.0.0 (Multi-Piece Support) | **Last Updated**: 2026-01-28 | **Status**: Ready for Implementation

