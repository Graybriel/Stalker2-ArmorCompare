# Specification Update: Multi-Piece Armor Comparison

**Date**: 2026-01-28  
**Status**: Approved  
**Impact**: Major feature revision → new MVP scope

---

## Summary of Changes

The specification has been updated to prioritize **multi-piece armor comparison** as the core MVP feature. This reflects the real use case where STALKER 2 players assemble loadouts with individual Head and Chest pieces, rather than comparing single armor pieces in isolation.

---

## What Changed

### Feature Prioritization (Before → After)

| Before | After |
|--------|-------|
| P1: Core table display | P1: Multi-piece comparison |
| P1: Filtering + Sorting | P1: Filtering (supporting comparison) |
| P3: Side-by-side comparison | P1: Upgrade display per piece |
| P2: Upgrade visibility | P3: Upgrade calculator |

### User Stories Affected

**User Story 3 - REFOCUSED** (was "side-by-side comparison")
- **Now**: "Select armor sets (single piece OR Head+Chest combo) and see side-by-side with each piece's stats and upgrades independently"
- **Before**: Just single pieces side-by-side

**User Story 4 - ELEVATED TO P1** (was "User Story 5 - Upgrade Slot Visibility, P2")
- **Now**: "Upgrade slots per piece displayed independently in comparison view"
- **Before**: Optional P2 feature for tables

### Task Structure

- **Before**: 8 phases (table → filter → sort → mobile → upgrades → integration + future)
- **After**: 7 phases (setup → comparison core → filtering → upgrades per piece → mobile → integration + future)
- **Total Tasks**: 53 → 51 (consolidated sorting into comparison workflow)
- **Estimated Effort**: 18 hours → 10-14 hours optimized with parallelization

### Data Model Impact

**New Concept**: "Armor Set"
- Single piece set: `{ type: "full_body", pieces: [armorObject] }`
- Multi-piece set: `{ type: "loadout", pieces: [headArmorObject, chestArmorObject] }`

Each set displays in comparison view with:
- All stat values (combined for multi-piece)
- Each piece labeled with type (Head/Chest/Full Body)
- Independent upgrade section per piece

---

## Rationale

1. **User Value**: Players don't think "Leather Jacket vs SEVA" in isolation. They think "Light Duty Helmet + Zorya Suit vs SEVA Full Body"
2. **Realistic Loadouts**: Head+Chest combos are standard mid-game progression; comparison should support this
3. **MVP Scope**: Comparison + filtering is more valuable than table sorting; eliminates sorting task from MVP
4. **Technical Simplicity**: Multi-piece logic is straightforward (sum stats, label pieces); calculator is complex (P3)

---

## Files Updated

- ✅ [spec.md](spec.md) - User stories 1–4 revised, priorities updated
- ✅ [plan.md](plan.md) - Development priorities restructured
- ✅ [tasks.md](tasks.md) - Phase structure redone, 51 tasks (T001–T051)
- ⏳ [quickstart.md] - Should be updated with multi-piece examples
- ⏳ [README.md] - Should reference new MVP scope

---

## Implementation Impact

### What Developers Should Know

1. **Armor Set Object** replaces single "armor" concept in comparison
2. **Combined Stats** calculated by summing protection values from all pieces in set
3. **Piece Labels** critical for UX ("Head: Light Duty Helmet", "Chest: Zorya Suit")
4. **Independent Upgrades** each piece's UpgradeList displayed separately
5. **No Sorting Table** — sorting removed from MVP to focus on comparison

### Examples: Old vs New User Flow

**OLD (Single Piece Comparison)**
```
1. Load app → table of 60+ armors
2. Click "Sort by Weight"
3. Filter "Chest only"
4. Click "Compare" on 2 chest pieces
5. See side-by-side stats
```

**NEW (Multi-Piece Comparison)**
```
1. Load app → armor selectors (Head + Chest dropdowns)
2. Filter "Head" type → select "Light Duty Helmet"
3. Filter "Chest" type → select "Zorya Suit"
4. Create first set (Head + Chest)
5. Select second set as "SEVA Full Body"
6. See comparison:
   - Left: Head (Slots: 1) + Chest (Slots: 2) = combined stats
   - Right: Full Body (Slots: 3) = single piece stats
7. Each piece shows own upgrade list
```

---

## Test Criteria Updates

| Criterion | Status |
|-----------|--------|
| Multi-piece sets selectable | NEW (core) |
| Combined stats calculated | NEW (core) |
| Piece type labels visible | NEW (core) |
| Independent upgrade sections | NEW (core) |
| Stat difference highlighting | RETAINED |
| Mobile responsive | RETAINED |
| Filter by type | RETAINED (simplified) |
| Sorting | REMOVED (out of MVP) |

---

## Timeline Impact

- **Before**: 18 hours (table → filter → sort → mobile → upgrades → polish)
- **After**: 10-14 hours optimized (remove sorting, parallelize phases)
- **Benefit**: MVP ships faster, with more impactful comparison feature

---

## Next Steps

1. ✅ Specification updated
2. ⏳ Update [quickstart.md](quickstart.md) with multi-piece examples
3. ⏳ Update [README.md](README.md) with new MVP scope
4. ⏳ Developers start Phase 1 (T001–T005)
5. ⏳ Track progress using updated [tasks.md](tasks.md)

---

**Version**: 2.0.0 | **Status**: Ready for Development | **Approved By**: Project Lead
