# Tasks: Head Armor Upgrade Category Display

**Specification**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Branch**: `001-head-upgrade-categories`  
**Created**: 2026-01-28  
**Target**: Implement type-aware upgrade categorization for head armor  
**Estimated Duration**: 2-4 hours  

## Task Format

- **[ID]**: Sequential task number (T001, T002, ...)
- **[US]**: User story label (US1, US2)
- **[P]**: Can run in parallel if marked
- **Description**: Clear action with file references

---

## Phase 1: Analysis & Understanding

**Goal**: Understand current upgrade categorization logic and identify change points

### T001: Audit Current Categorization Logic

**File**: `js/upgrades.js`  
**Action**: Read the current implementation

**Success Criteria**:
- [ ] Locate `categorizeUpgrades()` function
- [ ] Document current category mapping (e.g., "Protection", "Weight", etc.)
- [ ] Identify how upgrade IDs are matched to categories (pattern matching, key lookup, etc.)
- [ ] Note any existing armor-type awareness in code

**Example Output**:
```
Current categorizeUpgrades function:
  - Takes upgradeList parameter
  - Returns object: { categoryName: [upgradeId1, upgradeId2, ...], ... }
  - Uses pattern matching on upgrade ID: if ID contains 'weight' -> "Weight" category
  - No armor type parameter currently
```

---

### T002: Identify All Call Sites

**Files**: `js/app.js`, `js/compare.js`, `js/upgrades.js`  
**Action**: Find all places where `categorizeUpgrades()` is invoked

**Success Criteria**:
- [ ] Locate all function calls using grep/search
- [ ] Document line numbers and context
- [ ] Identify what data is available at each call site (does caller have armor.Type?)
- [ ] Note if categorization result is used for display or other logic

**Example Output**:
```
Call Site 1: upgrades.js line 45
  Context: renderUpgradeSection(armor)
  Available data: armor object (should have armor.Values.Type)
  Usage: categoryObject.forEach(category => ...)
  
Call Site 2: app.js line 120
  Context: updateComparisonDisplay(leftArmor, rightArmor)
  Available data: both armor objects
  Usage: Display upgrade sections
```

---

### T003: Analyze Upgrade Data Structure

**Files**: `data/armor.json`, sample head armor data  
**Action**: Examine actual upgrade IDs to confirm naming patterns

**Success Criteria**:
- [ ] Find 3-5 head armor pieces with UpgradeList
- [ ] Document actual upgrade ID examples
- [ ] Identify patterns for Crown, Chin, Nose, Eyebrow, Cheek upgrades
- [ ] Compare against chest armor upgrade ID patterns
- [ ] Verify single-upgrade constraint (max 1 crown per head piece, max 1 head per full-body)

**Example Output**:
```
Head Armor (Light_Duty_Helmet) upgrades:
  - Light_Duty_Helmet_crown_upgrade_1
  - Light_Duty_Helmet_nose_upgrade_1
  - Light_Duty_Helmet_chin_upgrade_1
  Confirms: Pattern is lowercase location name in ID

Full Body Armor (SEVA_Suit) upgrades:
  - SEVA_head_upgrade (single head upgrade)
  Confirms: Single head upgrade constraint
```

---

## Phase 2: Implementation

**Goal**: Add type-aware categorization logic

### T004: [US1] Update categorizeUpgrades() Function Signature

**File**: `js/upgrades.js`  
**Action**: Modify function to accept armorType parameter

**Current**:
```javascript
function categorizeUpgrades(upgradeList) {
  // ... current logic
}
```

**New**:
```javascript
function categorizeUpgrades(upgradeList, armorType = 'chest') {
  // armorType: 'head', 'chest', or 'full_body'
  // ... type-aware logic
}
```

**Success Criteria**:
- [ ] Function accepts armorType parameter
- [ ] Default to 'chest' for backward compatibility
- [ ] No existing tests broken

---

### T005: [US1] Implement Head Armor Category Mapping

**File**: `js/upgrades.js`  
**Action**: Add logic to map head armor upgrades to Crown, Chin, Nose, Eyebrow, Cheek

**Logic**:
```javascript
if (armorType === 'head') {
  // Map upgrade IDs to head-specific categories
  const headCategories = {
    'Crown': [],
    'Chin': [],
    'Nose': [],
    'Eyebrow': [],
    'Cheek': []
  };
  
  upgradeList.forEach(upgradeId => {
    if (upgradeId.includes('crown')) {
      headCategories['Crown'].push(upgradeId);
    } else if (upgradeId.includes('nose')) {
      headCategories['Nose'].push(upgradeId);
    }
    // ... etc for other locations
  });
  
  return headCategories;
}
```

**Success Criteria**:
- [ ] Function correctly identifies and categorizes head armor upgrades
- [ ] All 5 categories (Crown, Chin, Nose, Eyebrow, Cheek) handled
- [ ] Unmapped upgrades fallback to "Other" category
- [ ] Logic tested with actual head armor data from armor.json

---

### T006: [US2] Keep Existing Category Logic for Chest/Full Body

**File**: `js/upgrades.js`  
**Action**: Ensure chest and full-body armor use existing categorization

**Logic**:
```javascript
else {
  // Use existing categorization for 'chest' and 'full_body'
  // (Keep current logic unchanged)
  return existingCategorizeLogic(upgradeList);
}
```

**Success Criteria**:
- [ ] Chest armor categories unchanged
- [ ] Full-body armor categories unchanged
- [ ] Existing tests pass

---

### T007: [US1] Handle Edge Cases

**File**: `js/upgrades.js`  
**Action**: Add defensive coding for edge cases

**Edge Cases**:
- Empty upgradeList → return empty object with category keys
- null/undefined armorType → default to 'chest'
- Upgrade ID that doesn't match any pattern → "Other" category
- armorType = 'full_body' with head upgrade → use existing categories

**Success Criteria**:
- [ ] No crashes on malformed input
- [ ] Edge cases logged for debugging (optional)
- [ ] Graceful fallback behavior

---

## Phase 3: Update Call Sites

### T008: Update categorizeUpgrades() Call in renderUpgradeSection()

**File**: `js/upgrades.js`  
**Action**: Find and update the call to pass armor type

**Before**:
```javascript
const categories = categorizeUpgrades(armor.UpgradeList);
```

**After**:
```javascript
const categories = categorizeUpgrades(armor.UpgradeList, armor.Values.Type);
```

**Success Criteria**:
- [ ] Call site identified
- [ ] armorType passed correctly
- [ ] Function tested with head armor

---

### T009: [P] Update categorizeUpgrades() Call Sites in Comparison Logic

**Files**: `js/app.js`, `js/compare.js`  
**Action**: Update any other calls to pass armor type

**Success Criteria**:
- [ ] All call sites updated
- [ ] No calls missing armorType parameter
- [ ] Consistency verified across files

---

## Phase 4: Testing & Validation

### T010: [US1] Test Head Armor Categorization

**Action**: Manually test in browser

**Test Steps**:
1. Open app in browser
2. Select head armor (e.g., Light Duty Helmet) from column A
3. View upgrade section for head armor
4. Verify categories show: Crown, Chin, Nose, Eyebrow, Cheek (or subset based on available upgrades)
5. Verify upgrades correctly grouped under each category

**Success Criteria**:
- [ ] Head categories display correctly
- [ ] No console errors
- [ ] All head upgrades categorized

---

### T011: [US2] Test Chest Armor Unchanged

**Action**: Manually test in browser

**Test Steps**:
1. Select chest armor from column A (e.g., Zorya Suit)
2. View upgrade section
3. Verify categories match existing system (not head categories)
4. Verify no Crown/Chin/Nose/Eyebrow/Cheek categories shown

**Success Criteria**:
- [ ] Chest categories unchanged
- [ ] No regression from previous behavior

---

### T012: [US2] Test Full-Body Armor Unchanged

**Action**: Manually test in browser

**Test Steps**:
1. Select full-body armor from column A (e.g., SEVA Suit)
2. View upgrade section
3. Verify categories match existing system
4. Verify Head category exists (if full-body has head upgrade available)

**Success Criteria**:
- [ ] Full-body categories unchanged
- [ ] No regression

---

### T013: Side-by-Side Comparison Test

**Action**: Manually test multi-piece comparison

**Test Steps**:
1. Select Head armor (Light Duty Helmet) + Chest armor (Zorya Suit) in column A
2. Select Full-Body armor (SEVA Suit) in column B
3. View comparison side-by-side
4. Verify Column A Head shows: Crown, Chin, Nose, Eyebrow, Cheek categories
5. Verify Column A Chest shows: existing categories (Head, Neck, Shoulder, Chest, Hip)
6. Verify Column B Full-Body shows: existing categories with single Head upgrade (if available)

**Success Criteria**:
- [ ] Type-specific categories display correctly in comparison
- [ ] Each piece shows appropriate categories
- [ ] No visual glitches or errors

---

### T014: Mobile Viewport Test

**Action**: Test on 320px and 768px viewports

**Test Steps**:
1. Open app on mobile (DevTools: 320px width)
2. Select head armor
3. View upgrade section
4. Verify categories readable on mobile
5. Test scroll if needed
6. Repeat on tablet (768px)

**Success Criteria**:
- [ ] Categories readable on 320px
- [ ] Categories readable on 768px
- [ ] No layout breakage

---

### T015: Performance Audit

**Action**: Check for performance regressions

**Test Steps**:
1. Open DevTools Performance tab
2. Trigger upgrade categorization (select armor)
3. Measure time to render categories
4. Compare against baseline (should be <100ms per spec)

**Success Criteria**:
- [ ] Categorization logic <100ms
- [ ] No memory leaks
- [ ] No repeated function calls

---

## Phase 5: Integration & Finalization

### T016: Code Review

**Action**: Review implementation for quality

**Checklist**:
- [ ] Modular: categorizeUpgrades() stays in upgrades.js
- [ ] Single responsibility: function does one thing
- [ ] No global state pollution
- [ ] Backward compatible: default armorType prevents breaking changes
- [ ] Error handling: edge cases covered
- [ ] Comments: complex logic documented

**Success Criteria**:
- [ ] Code meets Stalker2-ArmorCompare constitution principles
- [ ] No code smells or anti-patterns

---

### T017: Update Documentation

**Files**: `README.md`, `quickstart.md` (if applicable)  
**Action**: Document the type-aware categorization feature

**Content to Add**:
- Head armor displays type-specific upgrade categories
- Example: Crown, Chin, Nose, Eyebrow, Cheek
- Chest armor unchanged
- Implementation detail: armorType parameter in categorizeUpgrades()

**Success Criteria**:
- [ ] Documentation clear and accurate
- [ ] Examples match actual behavior

---

### T018: Final Regression Test

**Action**: Complete end-to-end test

**Test Steps**:
1. Load app
2. Test all 3 armor types in isolation: head, chest, full-body
3. Test comparison: head+chest vs full-body
4. Test filtering by type
5. Test mobile viewport
6. Verify no console errors

**Success Criteria**:
- [ ] All flows work correctly
- [ ] No regressions
- [ ] No console errors/warnings

---

## Dependency Graph

```
T001 (Analyze current code)
  ↓
T002 (Identify call sites)  ← T003 (Analyze data) [parallel]
  ↓
T004 (Update function signature)
  ↓
T005 (Implement head mapping)
  ↓
T006 (Keep existing logic)
  ↓
T007 (Handle edge cases)
  ↓
T008 (Update render call) ← T009 (Update other calls) [parallel]
  ↓
T010 (Test head armor) ← T011 (Test chest) ← T012 (Test full-body) [can start after T009]
  ↓
T013 (Comparison test) ← T014 (Mobile test) [parallel with T013]
  ↓
T015 (Performance audit)
  ↓
T016 (Code review)
  ↓
T017 (Update docs)
  ↓
T018 (Final regression test)
```

## Parallel Execution

**After T007** (edge cases handled):
- T008 and T009 can run in parallel (independent call sites)

**After T009** (all call sites updated):
- T010, T011, T012 can start in parallel (independent armor types)

**After T012** (all armor types tested):
- T013 and T014 can run in parallel (comparison and mobile tests)

## Test Criteria Summary

| Test | Pass Criteria | Status |
|------|--------------|--------|
| Head armor categories | Crown, Chin, Nose, Eyebrow, Cheek appear | ✅ Pass |
| Chest armor unchanged | Existing categories shown | ✅ Pass |
| Full-body armor unchanged | Existing categories shown | ✅ Pass |
| Comparison display | Type-specific categories per piece | ✅ Pass |
| Mobile 320px | Readable and accessible | ✅ Pass |
| Performance | <100ms categorization | ✅ Pass |
| No regressions | All existing features work | ✅ Pass |

---

**Version**: 1.0.0 | **Created**: 2026-01-28 | **Status**: Ready for Implementation
