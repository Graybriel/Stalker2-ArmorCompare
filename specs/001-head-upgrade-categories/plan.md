# Implementation Plan: Head Armor Upgrade Category Display

**Feature Branch**: `001-head-upgrade-categories`  
**Created**: 2026-01-28  
**Status**: Active  
**Specification**: [spec.md](spec.md)

## Overview

This feature adds type-specific upgrade category headers for head armor pieces. Instead of generic category names, head armor displays anatomically-specific location names (Crown, Nose, Forehead, Eyebrow, Cheek). Chest armor and full-body armor remain unchanged with their existing category systems.

**Scope**: Modify upgrade categorization and display logic to be armor-type aware  
**Impact**: Affects `js/upgrades.js` only; no HTML or CSS changes needed  
**Complexity**: Low (primarily logic refactoring)  
**Estimated Effort**: 2-4 hours

## Technical Approach

### 1. Identify Current Upgrade Categories

Current system (from project code):
- Upgrades are grouped by category in `upgrades.js`
- Categories include: Protection, Weight, Containers, etc.
- No armor-type awareness currently

### 2. Add Type-Aware Categorization

New logic:
- Accept `armorType` parameter in categorization function
- Map upgrade IDs to armor-type-specific category names
- Head armor: Crown, Nose, Forehead, Eyebrow, Cheek
- Chest/Full-Body: Keep existing categories (Head, Neck, Shoulder, Chest, Hip, etc.)

### 3. Update Display Logic

For each armor piece in comparison:
- Pass armor Type to upgrade rendering function
- Apply type-specific category names based on armor Type
- Ensure visual labels accurately reflect the armor piece

### 4. Regression Testing

Verify:
- Head armor displays with new categories ✓
- Chest armor unchanged ✓
- Full-body armor unchanged ✓
- Upgrades categorized correctly ✓

## Category Mapping

### HEAD ARMOR
| Upgrade ID Pattern | Category Name |
|-------------------|---------------|
| *crown* | Crown |
| *nose* | Nose |
| *forehead* | Forehead |
| *eyebrow* | Eyebrow |
| *cheek* | Cheek |

### CHEST/FULL BODY ARMOR
| Upgrade ID Pattern | Category Name |
|-------------------|---------------|
| *head* (full-body only) | Head |
| *neck* | Neck |
| *shoulder* | Shoulder |
| *chest* | Chest |
| *hip* | Hip |
| (existing patterns) | (existing categories) |

## File Changes

### `js/upgrades.js`

**Changes**:
1. Update `categorizeUpgrades()` function signature to accept `armorType` parameter
2. Implement type-aware pattern matching for upgrade ID categorization
3. Return category object with type-specific keys

**Current Function** (example):
```javascript
function categorizeUpgrades(upgradeList) {
  // Returns { "Protection": [...], "Weight": [...], ... }
}
```

**New Function**:
```javascript
function categorizeUpgrades(upgradeList, armorType) {
  // Returns categories based on armorType
  // Head armor: { "Crown": [...], "Nose": [...], ... }
  // Other armor: { "Head": [...], "Neck": [...], ... } (existing)
}
```

3. Update any code that calls `categorizeUpgrades()` to pass the armor type

### `js/app.js` or `js/compare.js`

**Changes**:
1. Identify where `categorizeUpgrades()` is called
2. Update call sites to pass armor piece's `Type` field
3. Example: `categorizeUpgrades(upgrades, armor.Values.Type)`

### No Changes Required
- `index.html` (DOM structure unchanged)
- `css/styles.css` (styling unchanged)
- `data/armor.json` (data unchanged)

## Implementation Steps

### Step 1: Analyze Current Code
- [ ] Read `js/upgrades.js` to understand categorization logic
- [ ] Identify all calls to `categorizeUpgrades()`
- [ ] Understand upgrade ID format in data

### Step 2: Implement Type-Aware Categorization
- [ ] Modify `categorizeUpgrades()` to accept `armorType` parameter
- [ ] Implement head armor category mapping (Crown, Nose, Forehead, Eyebrow, Cheek)
- [ ] Keep existing category logic as fallback for non-head armor
- [ ] Test function with sample head armor data

### Step 3: Update Call Sites
- [ ] Find all calls to `categorizeUpgrades()`
- [ ] Update calls to pass armor Type: `categorizeUpgrades(list, armorType)`
- [ ] Verify no undefined armorType passed

### Step 4: Test Changes
- [ ] Load app in browser
- [ ] Select head armor and view upgrade categories
- [ ] Verify Crown, Nose, Forehead, Eyebrow, Cheek headers appear
- [ ] Select chest armor and verify no crown/head category appears
- [ ] Select full-body armor and verify Head category appears (if present)
- [ ] Verify all upgrades categorized correctly

### Step 5: Regression Testing
- [ ] Test chest armor comparison (should be unchanged)
- [ ] Test full-body armor comparison (should be unchanged)
- [ ] Test side-by-side comparison of head + chest (each with correct categories)
- [ ] Test mobile viewport (responsive display intact)

### Step 6: Code Review
- [ ] Verify no global state changes
- [ ] Check modularity (logic stays in upgrades.js)
- [ ] Ensure no performance regression
- [ ] Verify edge cases handled (missing upgrades, empty categories, etc.)

## Success Criteria

✅ **SC-001**: Head armor displays with Crown, Nose, Forehead, Eyebrow, Cheek category headers  
✅ **SC-002**: Chest armor displays with existing category headers (no head category)  
✅ **SC-003**: Full-body armor displays with single Head category (if upgrade exists)  
✅ **SC-004**: All upgrades categorized correctly in each piece  
✅ **SC-005**: Side-by-side comparison shows type-specific categories for each piece  
✅ **SC-006**: No regression in existing comparison functionality  

## Rollback Plan

If issues arise:
1. Revert changes to `upgrades.js` function signature
2. Remove `armorType` parameter from call sites
3. Use existing categorization logic (no type-awareness)

## Dependencies

- No external dependencies required
- No data schema changes needed
- Works with existing armor.json structure

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-28 | **Status**: Ready for Implementation
