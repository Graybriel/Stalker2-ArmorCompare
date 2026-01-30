# Feature Specification: Armor Comparison System

**Project**: Stalker2-ArmorCompare  
**Created**: 2026-01-28  
**Status**: Active  

## User Scenarios & Testing

### User Story 1 - Core Armor Comparison (Priority: P1)

As a STALKER 2 player, I want to see all available armor sets displayed in a table with all protection stats visible so I can quickly compare which armor best suits my playstyle.

**Why this priority**: This is the foundational feature. Without a working comparison table, the tool is unusable. All other features build on this.

**Independent Test**: Load the app → armor table displays with all 60+ armors → all protection columns visible and numeric → user can visually scan across a row to understand an armor's strengths/weaknesses.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** index.html renders, **Then** a table displays all armor entries from armor.json with columns: Name, Type, Weight, Cost, Physical, Thermal, Electric, Chemical, Radiation, PSI
2. **Given** armor.json contains 60+ entries, **When** the table renders, **Then** all entries appear without truncation or errors
3. **Given** an armor has a protection value of 0 or null, **When** rendered in the table, **Then** it displays as "0" or "—" (not blank)
4. **Given** the table is on desktop (1024px+), **When** scrolling right, **Then** all columns remain visible and readable

---

### User Story 2 - Armor Type Filtering (Priority: P1)

As a STALKER 2 player, I want to filter armor by type (chest, head, full body) so I can focus on the armor slot I want to upgrade.

**Why this priority**: Players often search for specific armor slots. This is critical for usability without it, comparing 60+ armors is overwhelming.

**Independent Test**: Load the app → click "Show only: Chest" → table updates to show only chest armors (e.g., Leather Jacket, Debut Suit) → other types hidden → filter can be toggled off.

**Acceptance Scenarios**:

1. **Given** filter controls are present, **When** user clicks "Chest" filter, **Then** only armor with Type="chest" displays in the table
2. **Given** user has filtered to Chest, **When** user clicks "Full Body" filter, **Then** only full body armors display
3. **Given** filters are active, **When** user clicks "Clear Filters", **Then** all armor types display again
4. **Given** a filter is active, **When** the app reloads, **Then** the filter is cleared (no persistence required)

---

### User Story 3 - Side-by-Side Armor Comparison (Priority: P1)

As a STALKER 2 player, I want to select armor sets and see their stats side-by-side in a dedicated comparison view so I can make a final decision between my top choices. A set can be a single piece (Helmet, Chest, Full Body) or a combination (Head + Chest). When comparing, each piece displays independently with its own stats and upgrades.

**Why this priority**: This is the foundational feature, and the reason for the application. Multi-piece loadouts are critical for realistic armor evaluation.

**Independent Test**: Load app → select Head armor (Light Duty Helmet) + Chest armor (Zorya Suit) → select another set (SEVA Full Body) → comparison view shows Head and Chest pieces separately in left column, SEVA in right column → each piece has independent upgrade section → user can see combined protection values.

**Acceptance Scenarios**:

1. **Given** user selects a single armor piece, **When** added to comparison, **Then** it appears as one entry in the comparison side
2. **Given** user selects a Head + Chest combo, **When** added to comparison, **Then** each piece (Head and Chest) appears as a separate entry in the comparison side
3. **Given** two armor sets are compared (e.g., Head+Chest vs Full Body), **When** comparison view displays, **Then** all stat values align vertically for easy comparison, with labels showing piece type (Head/Chest/Full Body)
4. **Given** an armor piece is in comparison, **When** stat values differ between sides, **Then** the higher value is highlighted or marked (e.g., green for advantage, red for disadvantage)
5. **Given** comparison side has multiple pieces (Head + Chest), **When** displayed, **Then** each piece shows its own upgrade section with independent upgrade slots and available upgrades
6. **Given** user is in compare mode, **When** user clicks "Add More", **Then** they can add additional armor sets (limit 2-3 loadouts total for readability)
7. **Given** compare panel is open, **When** user clicks "Clear Compare", **Then** all selected armors are deselected and panel resets

---

<!--
### User Story 3 - Armor Sorting (Priority: P1)

As a STALKER 2 player, I want to sort armor by weight, cost, or protection values so I can find the lightest, cheapest, or most protective options quickly.

**Why this priority**: Sorting is essential for comparing options within a type (e.g., "show me all chest armor sorted by weight"). This enables informed decision-making.

**Independent Test**: Load the app → click "Sort by Weight" → table re-sorts with lightest armor at top → click again → reverses to heaviest at top.

**Acceptance Scenarios**:

1. **Given** a sort control exists for each column, **When** user clicks "Weight", **Then** table sorts by weight ascending (lightest first)
2. **Given** table is sorted by weight ascending, **When** user clicks "Weight" again, **Then** table sorts descending (heaviest first)
3. **Given** user sorts by "Physical Protection", **When** table re-sorts, **Then** armor is ordered by physical value from lowest to highest
4. **Given** multiple sort columns exist, **When** user clicks a new sort column, **Then** the new column becomes the sort key (only one sort active at a time)

---

### User Story 4 - Responsive Mobile Design (Priority: P2)

As a STALKER 2 player using a mobile device, I want the armor comparison table to be usable on a 320px-wide phone so I can check armor stats on the go.

**Why this priority**: Players may want quick reference on mobile; responsive design expands accessibility without development overhead.

**Independent Test**: Open app on mobile (320px viewport) → table displays horizontally scrollable with key columns visible → protection stats remain readable (not overlapped).

**Acceptance Scenarios**:

1. **Given** viewport is 320px wide (mobile), **When** page loads, **Then** table displays without horizontal overflow beyond viewport
2. **Given** mobile viewport, **When** user scrolls left/right, **Then** armor name column remains visible as reference, or sticks to left side
3. **Given** mobile viewport, **When** user views a row of armor, **Then** all protection values are readable (font size ≥12px, no text truncation)
4. **Given** mobile viewport, **When** filter/sort controls are present, **Then** they are touch-friendly (buttons ≥44px tall/wide) and accessible

---
-->
### User Story 4 - Upgrade Slot Visibility in Comparison (Priority: P1)

As a STALKER 2 player comparing multiple armor pieces, I want to see each piece's upgrade slots and available upgrades displayed independently so I can evaluate the full potential of my loadout.

**Why this priority**: Upgrades are central to armor value. When comparing multi-piece loadouts (Head + Chest), each piece must show independent upgrade potential. This is critical for P1 comparison feature.

**Independent Test**: Load app → select Head armor (Light Duty Helmet) + Chest (Zorya Suit) → in comparison view, Head section shows "Head Slots: 1" with available upgrades, Chest section shows "Chest Slots: 2" with available upgrades.

**Acceptance Scenarios**:

1. **Given** an armor piece in comparison has UpgradeList, **When** displayed, **Then** it shows "Upgrade Slots: N" and lists available upgrade IDs
2. **Given** an armor piece has UpgradeList with 5+ entries, **When** displayed, **Then** upgrades are grouped by category (Protection, Weight Reduction, Containers, etc.)
3. **Given** user compares Head + Chest combo against Full Body suit, **When** comparison displays, **Then** Head shows its upgrade section, Chest shows its independent upgrade section, and Full Body shows its upgrade section
4. **Given** multiple armor pieces are in comparison, **When** displayed, **Then** each piece's upgrade section is clearly labeled with piece type (Head/Chest/Full Body) and slot count
5. **Given** an armor piece has 0 upgrades, **When** displayed, **Then** it shows "No upgrades available" (not blank or error)
6. **Given** user hovers over an upgrade in the upgrade section, **When** displayed, **Then** a tooltip shows upgrade name and any stat modifications (P3 feature)

---

### User Story 5 - Upgrade Impact Calculator (Priority: P3)

As a STALKER 2 player, I want to see how much each upgrade improves an armor's stats so I can plan which upgrades to prioritize.

**Why this priority**: Useful for advanced players but not critical for MVP. This requires parsing the Upgrades array and calculating stat deltas, which is complex.

**Independent Test**: Load app → select SEVA Suit → expand upgrades → hover over "PSY_Upgrade_1" → tooltip shows "PSY: +10.0" and new total PSY value (40.0 instead of 30.0).

**Acceptance Scenarios**:

1. **Given** an armor has upgrades with stat modifications, **When** user hovers over an upgrade, **Then** a tooltip shows the stat changes (e.g., "+5 Physical, +2 Thermal")
2. **Given** user views an upgrade, **When** the upgrade modifies multiple stats, **Then** all affected stats are listed in the tooltip
3. **Given** user selects an upgrade, **When** the armor's total stats are recalculated in a preview, **Then** the updated totals are shown without applying the upgrade permanently
4. **Given** user applies multiple upgrades, **When** the total stats update, **Then** cumulative bonuses are correctly summed

---

## Feature Scope Summary

| Feature | Priority | Complexity | Status |
|---------|----------|-----------|--------|
| Core comparison table | P1 | Low | Foundation |
| Type filtering | P1 | Low | Required |
| Side-by-side comparison (single & multi-piece) | P1 | Medium | Required |
| Upgrade slot visibility per piece | P1 | Medium | Required |
| Mobile responsiveness | P2 | Low | Required |
| Upgrade impact calculator | P3 | High | Future |

**MVP Scope**: User Stories 1–4 (comparison with multi-piece support, filtering, upgrades)  
**MVP+**: All MVP + P3 calculator  
**Full**: MVP+ + future enhancements

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-28
