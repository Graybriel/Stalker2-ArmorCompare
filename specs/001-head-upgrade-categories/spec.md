# Feature Specification: Head Armor Upgrade Category Display

**Feature Branch**: `001-head-upgrade-categories`  
**Created**: 2026-01-28  
**Status**: Draft  
**Input**: User description: "armor type of 'head' has different categories for it's upgrades. When displaying head upgrades the section headers should reflect the different names. Instead of head, neck, shoulder, chest, hip for it's upgrades, they are: crown, nose, forehead, eyebrow, cheek. The actual upgrades themselves are the same for all armor pieces, ie 10% in thermal protection"

## User Scenarios & Testing

### User Story 1 - Display Type-Specific Upgrade Categories (Priority: P1)

As a STALKER 2 player comparing head armor, I want to see upgrade section headers that reflect the specific body location being protected (crown, nose, forehead, eyebrow, cheek) instead of generic labels, so I can understand which part of my head each upgrade protects and make informed equipment decisions.

**Why this priority**: Players comparing armor need accurate information about what each upgrade protects. Head armor has anatomically-specific upgrade categories that differ from chest/body armor. Displaying incorrect or generic labels creates confusion and reduces decision-making clarity.

**Independent Test**: Load app → select head armor (e.g., Light Duty Helmet) → view upgrade section → section headers display "Crown", "Nose", "Forehead", "Eyebrow", "Cheek" instead of generic labels → each category shows the correct protection value (e.g., "10% thermal protection") → test passes without requiring chest armor comparison.

**Acceptance Scenarios**:

1. **Given** head armor is selected and displayed, **When** upgrade section renders, **Then** category headers show head-specific location names: Crown, Nose, Forehead, Eyebrow, Cheek
2. **Given** head armor upgrade categories are displayed, **When** each category is rendered, **Then** the protection values (thermal, physical, etc.) are correctly associated with the location name
3. **Given** head armor is compared against chest or full-body armor, **When** displayed side-by-side, **Then** head section shows head-specific headers (Crown, Nose, etc.) and chest/body section shows its own category headers (not head categories)
4. **Given** a full-body suit is displayed, **When** its upgrade section renders, **Then** the "Head" category displays a single upgrade (or "No upgrade" if empty), not multiple head upgrades
5. **Given** a head armor piece has an upgrade that provides thermal protection, **When** displayed under its category, **Then** the category header and protection type accurately reflect the upgrade (e.g., under "Crown" showing thermal value)

---

### User Story 2 - Maintain Existing Chest/Body Armor Categories (Priority: P1)

As a STALKER 2 player comparing chest or full-body armor, I want upgrade section headers to remain unchanged from current implementation so that existing comparison workflows continue to function without disruption.

**Why this priority**: This is the complementary requirement that ensures non-head armor displays correctly. Without this, fixing head categories might break chest/body armor display. This ensures type-specific categorization applies only where needed.

**Independent Test**: Load app → select chest armor (e.g., Zorya Suit) or full-body armor (e.g., SEVA Suit) → view upgrade section → section headers display using existing category system (Head, Neck, Shoulder, Chest, Hip, etc.) → test passes confirming no regression in chest/body armor display.

**Acceptance Scenarios**:

1. **Given** chest or full-body armor is displayed, **When** upgrade section renders, **Then** category headers use the existing system (not head-specific location names)
2. **Given** chest armor is selected alone (without head armor), **When** displayed, **Then** upgrade categories show the same headers as before this feature was implemented
3. **Given** full-body armor is selected, **When** displayed, **Then** it uses chest/body category headers (not head-specific categories)
4. **Given** chest armor is updated for any reason, **When** displayed, **Then** its upgrade categories remain unchanged and functional

---

### Edge Cases

- What happens when chest armor is displayed? → Chest armor has no crown/head upgrades; chest pieces display only their actual upgrade categories (no crown section shown)
- What happens when a full-body suit has no head upgrade available? → Display "Head: (no upgrade)" or similar placeholder
- What if armor.json data structure changes and no longer includes category information? → System should gracefully fall back to generic labels or display raw upgrade IDs

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST categorize head armor upgrades using head-specific location names (Crown, Nose, Forehead, Eyebrow, Cheek) instead of generic body area names
- **FR-002**: System MUST display upgrade category headers that match the armor type: head armor uses location names, full-body armor shows "Head" category with max 1 upgrade, chest armor has no head category
- **FR-003**: System MUST display crown upgrades under the "Crown" header when head armor is shown; each head armor piece has at most one crown upgrade available
- **FR-004**: System MUST display the single "Head" upgrade available on full-body suits under the "Head" category header
- **FR-005**: System MUST NOT display head/crown upgrade sections for chest armor pieces
- **FR-006**: System MUST associate protection values (thermal, physical, etc.) with the correct category header for display to the player
- **FR-007**: System MUST not affect non-head armor category display when implementing head-specific categories
- **FR-008**: System MUST maintain existing armor comparison functionality for all armor types (no regressions in current features)

### Key Entities

- **Armor Piece**: Represents a single armor item with Type (head, chest, full_body), UpgradeList, and category display rules
- **Upgrade Category**: A grouped section of upgrades based on armor type:
  - Head armor categories: Crown, Nose, Forehead, Eyebrow, Cheek
  - Chest/Body armor categories: Head, Neck, Shoulder, Chest, Hip (existing system)
- **Upgrade**: Individual upgrade item within a category, containing ID, name, and protection values

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: When head armor is selected and displayed, 100% of upgrade category headers use head-specific location names (Crown, Nose, Forehead, Eyebrow, Cheek) instead of generic labels
- **SC-002**: When chest armor is displayed, 0% of head/crown upgrade sections appear (chest has no crown/head upgrades)
- **SC-003**: When full-body armor is displayed, the "Head" category shows at most 1 upgrade (limited to single head upgrade per suit)
- **SC-004**: When head armor is compared side-by-side with full-body armor, head section shows head-specific headers (Crown, Nose, etc.) and full-body section shows single "Head" upgrade under its category
- **SC-005**: All head armor pieces in armor.json can be displayed with upgrades categorized correctly without errors
- **SC-006**: No existing comparison workflows are disrupted; chest/body armor comparison continues to function as before

---

## Assumptions

- **Head armor upgrades**: Each head armor piece has at most one crown upgrade available (not multiple per category)
- **Full-body armor upgrades**: Full-body suits have at most one "Head" upgrade available (not multiple)
- **Chest armor constraints**: Chest armor pieces have no crown/head upgrade slots whatsoever
- **Upgrade data**: The five head-armor location categories (Crown, Nose, Forehead, Eyebrow, Cheek) are fixed and complete for head armor
- **Existing chest/body categories**: Non-head armor continues using the existing category system with no changes
- **No data schema modifications**: armor.json structure remains unchanged; categorization logic is determined by armor Type field
